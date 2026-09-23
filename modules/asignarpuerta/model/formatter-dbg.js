sap.ui.define([], function() {
    "use strict";
    return {
        date: function(sDate) {
            var date = eval('new ' + sDate.replace(/\//gi, ''));
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        },

        concatenateStrings: function(value_uno, value_dos) {
            return `${value_uno}\n${value_dos}`;
        }
    };
});