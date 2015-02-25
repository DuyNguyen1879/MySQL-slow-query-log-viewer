# MySQL slow query log viewer  

This is a simple tool for parsing a MySQL slow query log and presenting it in a nice, easy-to-read format.  

The tool uses my own PHP library gumbercules/mysqlslow to do the heavy lifting. I wrote this tool to meet two needs:  
* I was fed up of having to read the raw data from MySQL's logs
* I wanted to learn a few tools for myself

Thus, this tool uses in various places the following tools that I have not used before:  
* HandlebarsJS
* GulpJS
* Silex


# Requirements

* PHP (I wrote this tool & the underlying lib on v5.5 - it may work on lower versions but I haven't tested).
* Composer (for installing dependencies)
* A web browser (duh)


# Usage

Easy peasy. Download/clone this repository & navigate to the root directory. Install composer dependencies:

```
composer install
```

Change directory to the "app" directory and spin-up PHP's built-in web server:

```
php -S localhost:8080
```

Obviously you can change the above to match your own host/port requirements. You could of course also drop this tool 
into a hosted environment, but I haven't tested that (I know from experience that IIS may not play nicely with Silex's
 routing out of the box).  
   
Finally, navigate to http://localhost:8080 (or whatever applies) and have at it.


# Contributing

I don't really expect anyone to even see this tool let alone use it, but if you have found it and want to contribute 
then please feel free to fork and submit PRs. Please see the list of issues on Github if you're really keen!  
You will need bower, npm and Gulp if you want to change the front-end stuff.


# Contact
@garethellis on Twitter <3