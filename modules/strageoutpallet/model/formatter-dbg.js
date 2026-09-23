sap.ui.define([], function() {
    "use strict";
    return {
        date: function(sDate) {
            var date = eval('new ' + sDate.replace(/\//gi, ''));
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        },

        concatenateStrings: function(value_uno, value_dos) {
            if (value_uno == value_dos) {
                return value_uno;
            }

            if (!value_dos) return value_uno;

            //Inicio-SCH
            var length = value_dos.toString().length; /* Largo del número */ 
            var zero = "0"; /* String de cero */                         
            value_dos = (zero.repeat(20 - length)) + value_dos.toString();
           //Fin-SCH
            
            return `${value_uno} / ${value_dos}`;
        },

        concatenarOrdenViaje: function(value_uno, value_dos) {
            if (value_uno && value_dos) {
                return `${value_uno} - ${value_dos}`;
            }

            if (value_uno) {
                return value_uno
            }

            if (value_dos) {
                return value_dos
            }
        }
    };
});