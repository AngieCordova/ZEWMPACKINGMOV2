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

        izqDer: function(val) {
            return (val == 'IZ') ? 'Izquierdo' : 'Derecho';
        },

        getFecha: function(val) {
            try {
                var anio = val.substring(0,4);
                var mes = val.substring(4,6);
                var dia = val.substring(6,8);

                return `${dia}.${mes}.${anio}`;
            } catch (error) {
                return "00.00.0000";
            }
        },

        getCantidadCajas: function(val) {
            try {
                var value = Number(val);
                value = isNaN(value) ? 0 : value;
                return value;
            } catch (error) {
                return 0;
            }
        },
        //REQ012 - Ajustes Semaforización
        getDiasAlmacenamiento: function(val) {
        	//val--> formato AAAAMMDD 
        	if (val == null) return "";
            if (val.trim() == "") return "";
            
            let dateRec = new Date(val.substring(0,4) + "." + val.substring(4,6) + "." + val.substring(6,8));
                        
            var hoy = new Date(new Date().toUTCString());
                        
            var diff = (hoy - dateRec);
            return (Math.round(diff / (1000 * 60 * 60 * 24)) - 1);            
        },

    };
});