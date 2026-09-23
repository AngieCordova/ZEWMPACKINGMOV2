sap.ui.define([], function() {
    "use strict";
    return {
        date: function(sDate) {
            var date = eval('new ' + sDate.replace(/\//gi, ''));
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        },

        concatenateStrings: function(value_uno, value_dos) {
            return `${value_uno}\n${value_dos}`;
        },

        colorTiempoEnfriamiento: function(sValue) {
            try {
                if(!sValue) return "SINCOLOR"; //"VERDE";                
                var valor = sValue.split(" ")[0];
                valor = Number(valor);
                valor = isNaN(valor) ? 0 : valor;

                return valor < 2.3 ? "VERDE" : "ROJO";               
            } catch (error) {
                return "ROJO";                
            }
        },
        //REQ012 - Ajustes Semaforización
        sinCerosIzq: function(sValue){        	
            var is_nan = isNaN(sValue);
           
            if(!is_nan) {
            	//return Number(sValue);
            	return String(BigInt(sValue));  // SCH-Proyecto Guatemala
            }
            else {
            	return sValue;
            }
        }
        
    };
});