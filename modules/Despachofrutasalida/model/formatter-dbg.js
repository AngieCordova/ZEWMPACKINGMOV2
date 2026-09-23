sap.ui.define([], function() {
    "use strict";
    return {
        date: function(sDate) {
            var date = eval('new ' + sDate.replace(/\//gi, ''));
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        },

        dateString: function(sDate) {
            if (sDate == undefined || sDate == null || sDate == NaN || sDate == "") return "";
            return sDate.substr(6, 2) + '/' + sDate.substr(4, 2) + '/' + sDate.substr(0, 4);
        },

        agregarClaseColorPedido: function(oEvent) {
            debugger
        }
    };
});