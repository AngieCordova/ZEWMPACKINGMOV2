sap.ui.define([], function () {
    "use strict";
    return {
        date: function (sDate) {
            var date = eval('new ' + sDate.replace(/\//gi, ''));
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        },

        concatenateStrings: function (value_uno, value_dos) {
            return `${value_uno}\n${value_dos}`;
        },
        statusText: function (sClass) {
            switch (sClass) {
                case "P":
                    return "Pendiente";
                case "E":
                    return "En Curso";
                case "C":
                    return "Completo";
                default:
                    return sClass;
            }
        },
        statusState: function (sClass) {
            switch (sClass) {
                case "P": return "Error";
                case "E": return "Warning";
                case "C": return "Success";
                default: return "None";
            }
        },
        labelSenasaMaga: function (sWerks) {
            return sWerks === '2401' ? 'MAGA' : 'Senasa';
        },
        horaView: function (oDate) {
            if (typeof (oDate) == "object") {
                var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "HH:mm:ss"
                });
                return oDateFormat.format(oDate);
            }
            else { return (oDate); }
        },
        fechaView: function (oDate) {
            if (typeof (oDate) == "object" && oDate instanceof Date) {
                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "dd/MM/yyyy"
                });
                return oDateFormat.format(oDate);
            } else if (typeof oDate === "string" && oDate.length === 8) {
                return oDate.substring(6, 8) + '/' + oDate.substring(4, 6) + '/' + oDate.substring(0, 4);
            }
            else { return (oDate || ''); }
        },
        fechaHoraView: function (sFecha, sHora) {
            var sFmt = '';
            if (sFecha && sFecha.length === 8) {
                sFmt = sFecha.substring(6, 8) + '/' + sFecha.substring(4, 6) + '/' + sFecha.substring(0, 4);
            }
            if (!sFmt && !sHora) return '';
            return sFmt + (sHora ? ' ' + sHora : '');
        },


    };
});
