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

        txtMsgInfoHUs: function(msg) {
            return (msg != "") ? "Comentario: " + msg : "";
        },

        visibleMsgInfoHUs: function(msg) {
            return (msg != "") ? true : false;
        },

        parseInt: function(msg) {
            return parseInt(msg);
        },

        sinCerosIzq: function(sValue){        	
            var is_nan = isNaN(sValue);
           
            if(!is_nan && sValue != "" ) {
            	return Number(sValue);
            }
            else {
            	return sValue;
            }
        }

    };
});