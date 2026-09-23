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
            return (val == 'DE') ? 'Derecho' : 'Izquierdo';
        },

        fechaCosecha: function(val) {
            if (val.trim() == "") return "";
            return val.substr(6, 2) + "-" + val.substr(4, 2) + "-" + val.substr(0, 4);
        },

        horasRecepcion: function(val) {
            if (val.trim() == "") return "";

            let fecha = val.split(" ")[0].split(".");
            let horas = val.split(" ")[1].split(":");
            let dateRec = new Date(new Date(fecha[2].trim(), parseInt(fecha[1].trim()) - 1, fecha[0].trim(), horas[0].trim(), horas[1].trim(), horas[2].trim(), 0).toUTCString());

            var hoy = new Date(new Date().toUTCString());
            var diff = (hoy.getTime() - dateRec.getTime());
            /*
            console.log(val);
            console.log(dateRec);
            console.log(hoy);
            console.log(Math.round(diff / (1000 * 60 * 60)));
            console.log("----------------------------------");
            */
            return Math.round(diff / (1000 * 60 * 60));
        },

        visibleHorasRecepcion: function(val) {
            if (val.trim() == "") return false;
            return true;
        },

    };
});