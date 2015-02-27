var data = [],
    error = {},
    originalData = [],  //copy of original data will be stored here in case any sort/filter operations are done so we can reset easily
    //define default sort orders for each property here
    //setting as "-" means it will be sorted ASC by default (because click handler will flip this setting before sorting)
    //setting as "" means it will be sorted DESC by default
    sortOrders = {
        "query": "-",
        "queryTime": "",
        "datetime": "-",
        "user": "-",
        "host": "-",
        "rowsExamined": "",
        "rowsSent": ""
    };

/*
 * populate the results table using handlebars
 * @param array data - array of objects from ajax or sorted elsewhere
 */
function populateResults(data)
{
    if (data.length === 0) {
        return;
    }

    var template = $("#results-template").html(),
        target = $("#results-container");

    var formatResults = Handlebars.compile(template);
    var formattedResults = formatResults(data);

    target.html("").append(formattedResults);

}

/*
 * dynamic search function
 * used as callback to object.sort
 * @param string property - property to sort by - if prefixed with "-" then sorting is done in reverse order
 */
function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    };
}


/*
 * jQuery event handlers
 */
$(document).ready(function() {

    /*
     * AJAX post the form to SILEX
     */
    $("#uploadForm").submit(function submitForm(e) {

        e.preventDefault();

        data = [];

        var form = $(this);

        //form data must be stored in a FormData object for files to upload
        var formData = new FormData(form[0]);

        $.ajax({
            url: form.attr("action"),
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function ajaxSuccess(response)
            {
                //handle 400 error
                if (response.message) {
                    return alertify.error(response.message);
                }
                alertify.success("Success!");

                //make two copies of data
                data = originalData = response;

                //populate results table
                populateResults(data);
            }, error: function ajaxError(jqXHR)
            {
                error = JSON.parse(jqXHR.responseText);
                alertify.error("Error:" + error.message);
            }
        });

        alertify.log("Attempting to parse...");

    });


    /*
     * click handlers for table headers (sorts table by data)
     */
    $(document).on("click", ".sort", function (e) {

        e.preventDefault();

        if (data.length === 0) return;

        //get property to sort on
        var property = $(this).data("property");

        //get most recent sort order for this property, if set
        //if not set it to blank
        sortOrders[property] = sortOrders[property] || "";

        //change sort order (spoofing toggle behaviour)
        if (sortOrders[property] === "-") {
            sortOrders[property] = "";
        } else if (sortOrders[property] === "") {
            sortOrders[property] = "-";
        }

        data.sort(dynamicSort(sortOrders[property] + property));

        populateResults(data);
    });

});