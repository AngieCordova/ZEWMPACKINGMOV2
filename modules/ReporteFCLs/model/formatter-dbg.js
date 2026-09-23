sap.ui.define([], function() {
    "use strict";
    return {
        date: function(sDate) {
            var date = eval('new ' + sDate.replace(/\//gi, ''));
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        },
        IdPallet: function(sId, SId2) {
            return (sId != "") ? sId : SId2;
        },
        colorLabel: function(sEstado) {
            switch (sEstado) {
                case "Pendiente":
                    return 7;
                case "Cargado":
                    return 3;
                case "Cargando":
                    return 8;
                default:
                    return 1;
            }
        },
        visibleUnPick: function(sEstado) {
            switch (sEstado) {
                case "Pendiente":
                    return false;
                case "Cargado":
                    return true;
                case "Cargando":
                    return true;
                default:
                    return false;
            }
        },
        visibleBtnPosicion: function(edicion, estado) {
            if (!edicion) return false;
            if (estado == "Ocupado") return false;
            return true;
        },
        textBtnPosicion: function(estado) {
            if (estado == "Libre") return "Bloquear";
            if (estado == "Bloqueado") return "Des-Bloquear";
            return "";
        },
        typeBtnPosicion: function(estado) {
            if (estado == "Libre") return "Reject";
            if (estado == "Bloqueado") return "Emphasized";
            return "Emphasized";
        },
        printPalletData: function(sId, SId2) {
            if (sId == "" && SId2 == "") return "";
            return (sId != "") ? "Paleta: " + sId : "Paleta: " + SId2;
        },

        visibleIfExist: function(sId, SId2) {
            if (sId != "" || SId2 != "") return true;
            return false;
        },

    };
});