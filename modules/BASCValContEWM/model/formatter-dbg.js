sap.ui.define([], function() {
    "use strict";
    return {
        date: function(sDate) {
            var date = eval('new ' + sDate.replace(/\//gi, ''));
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        },

        showPuerta: function(PuertaDif, PuertaEmbarq) {
            return (typeof PuertaDif !== "boolean" && PuertaDif != "") ? PuertaDif : PuertaEmbarq;
        },

        enabledCheckbox: function(StatusCl) {
            return (StatusCl == "T") ? true : false;
        },

        colorStatus: function(sEstado) {
            switch (sEstado) {
                case "T":
                    return 7;
                case "E":
                    return 2;
                default:
                    return 3;
            }
        },

        nombreStatus: function(sEstado) {
            switch (sEstado) {
                case "T":
                    return 'Terminado';
                case "E":
                    return 'Pendiente';
                case "O":
                    return 'Observado';
                default:
                    return 'Pendiente';
            }
        },


    };
});