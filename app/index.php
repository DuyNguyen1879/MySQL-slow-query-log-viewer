<?php
require_once __DIR__.'/../vendor/autoload.php';

use Silex\Provider\TwigServiceProvider;

use Symfony\Component\HttpFoundation\Request;
use Gumbercules\MysqlSlow\LogFileReader;

date_default_timezone_set("Europe/London");

$app = new Silex\Application();
$app['debug'] = true;

$app->register(new TwigServiceProvider(), array(
    'twig.path' => array(__DIR__.'/views')
));

$app->get('/', function (Request $request) use ($app) {
    return $app['twig']->render('index.twig.html', []);
});

$app->post("/parse", function (Request $request) use ($app) {

    if (empty($_FILES)) {
       return $app->json(["message" => "You must upload a file."], 400);
    }

    $error = ["message" => null];

    $file = $request->files->get("file");

    $filename = $file->getClientOriginalName();

    try {
        $dir = __DIR__ . "/tmp/";
        $file->move($dir, $filename);
    } catch (Exception $e) {
        $error["message"] = $e->getMessage();
        return $app->json($error, 500);
    }

    try {
        $reader = new LogFileReader($dir . $filename);

        $entries = $reader->parseFile();

        $logEntries = [];

        foreach ($entries as $entry) {
            $logEntries[] = [
                "host" => $entry->getHost(),
                "user" => $entry->getUser(),
                "datetime" => $entry->getDatetime()->format("Y-m-d H:i:s"),
                "queryTime" => $entry->getQueryTime(),
                "lockTime" => $entry->getLockTime(),
                "rowsSent" => $entry->getRowsSent(),
                "rowsExamined" => $entry->getRowsExamined(),
                "query" => $entry->getQuery()
            ];
        }

        deleteUploadedFile($dir . $filename);
        return $app->json($logEntries);
    } catch (Exception $e) {
        deleteUploadedFile($dir . $filename);
        $error["message"] = $e->getMessage();
        return $app->json($error, 400);
    }

});

//clean up uploaded file
function deleteUploadedFile($file) {
    if (file_exists($file)) @unlink($file);
}

$app->run();