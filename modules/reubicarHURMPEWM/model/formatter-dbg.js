sap.ui.define([], function() {
    "use strict";
    return {
        date: function(sDate) {
            var date = eval('new ' + sDate.replace(/\//gi, ''));
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        },

        formatDate: function(sDate) {
            try {
                var anio = sDate.substring(0, 4);
                var mes = sDate.substring(4, 6);
                var dia = sDate.substring(6, 8);
                if (Number(anio) == 0 || Number(mes) == 0 || Number(dia) == 0) return "";
                return `${dia}/${mes}/${anio}`;
            } catch (error) {
                return "";
            }
        },

        formatHora: function(sHora) {
            if (sHora == "") return "";
            try {
                var hora = sHora.substring(0, 2);
                var min = sHora.substring(2, 4);
                var seg = sHora.substring(4, 6);
                //if (Number(hora) == 0 || Number(min) == 0 || Number(seg) == 0) return "";
                return `${hora}:${min}:${seg}`;
            } catch (error) {
                return "";
            }
        },

        txtMsgInfoHUs: function(msg) {
            return (msg != "") ? "Comentario: " + msg : "";
        },

        visibleMsgInfoHUs: function(msg) {
            return (msg != "") ? true : false;
        },

        parseInt: function(msg) {
            return parseInt(msg);
        },

        concatenateStrings: function(value_uno, value_dos) {
            return `${value_uno}\n${value_dos}`;
        },

    };
});