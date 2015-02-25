Handlebars.registerHelper("everyOther", function (index, amount, scope) {
    if ( ++index % amount )
        return scope.inverse(this);
    else
        return scope.fn(this);
});
