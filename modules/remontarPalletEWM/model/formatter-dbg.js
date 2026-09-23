sap.ui.define([], function() {
    "use strict";
    return {
        date: function(sDate) {
            var date = eval('new ' + sDate.replace(/\//gi, ''));
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        },

        formatDate: function(sDate) {
            var anio = sDate.substring(0, 4);
            var mes = sDate.substring(4, 6);
            var dia = sDate.substring(6, 8);

            if (Number(anio) == 0 || Number(mes) == 0 || Number(dia) == 0) return "";

            return `${dia}.${mes}.${anio}`;
        },

        calcularCantidadCajasEnPaleta: function(sMaxPaleta, sCajasFaltantes) {
            var max_paleta = Number(sMaxPaleta);
            max_paleta = isNaN(max_paleta) ? 0 : max_paleta;

            var cajas_faltantes = Number(sCajasFaltantes);
            cajas_faltantes = isNaN(cajas_faltantes) ? 0 : cajas_faltantes;

            return max_paleta - cajas_faltantes;
        }
    };
});