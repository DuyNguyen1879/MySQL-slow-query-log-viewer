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
 * filter form data
 * @param array data - array of objects from ajax/sorted/filtered
 * @param string input - input entered by user. expected format is property:search_string;another_property:search_string;
 */
function filterData(data, input) {

    if (data.length === 0) return;

    if (input === "") {
        resetFilters();
    }

    var searchFilters = input.split(":", 2);

    if (searchFilters.length === 0) {
        return alertify.error("Invalid filter string. Example valid string: 'query:SELECT'");
    }

    var property = searchFilters[0];
    var val = searchFilters[1];

    if (!sortOrders[property]) {
        return alertify.error("Invalid property name");
    }

    filteredData = [];
    for (var i in data) {
        if (data[i][property].indexOf(val) > -1) filteredData.push(data[i]);
    }

    populateResults(filteredData);

    return filteredData;

}
 
function resetFilters()
{
    populateResults(originalData);
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
     *  Handle filtering
     */

    $(document).on("submit", "#filterForm", function(e) {
        e.preventDefault();
        var filterInput = $("#filterField").val();
        data = filterData(data, filterInput);
        $("filterField").val(filterInput);
    });

    $(document).on("reset", "#filterForm", function(e) {
        e.preventDefault();
        var filterInput = $("#filterField").val("");
        populateResults(originalData);
        data = originalData;
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