sap.ui.define([], function() {
    "use strict";
    return {
        getEstadoHoraInicio: function(sHora, sFecha) {
            try {
                var campos_vacios = !sHora && !sFecha;

                if (campos_vacios) {
                    return "Pendiente";
                } else {
                    try {
                        var hora = sHora.substring(0,2);
                        var minuto = sHora.substring(2,4);
                        var segundo = sHora.substring(4,6);
                        return `${hora}:${minuto}:${segundo}`;
                    } catch (error) {
                        return "";
                    }
                }
            } catch (error) {
                return "ERROR";
            }
        },

        getPresionadoBotonInicio: function(sHora, sFecha) {
            try {
                var response = false;
                var campos_completos = sHora && sFecha;

                if (campos_completos) response = true;

                return response;
            } catch (error) {
                return false;
            }
        }
    };
});