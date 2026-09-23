sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "./LogicaAyudaBusqueda"
], function (MessageToast, JSONModel, LogicaAyudaBusqueda) {
    "use strict";

    return {
        onAbrirAyudaBusquedaCentro: function (oEvent) {
            this._abrirDialogoSeleccionarCentro(oEvent);
        },

        _abrirDialogoSeleccionarCentro: function (oEvent) {
            const oView = this.getView();
            const sPathFragment = "AvocadoProyecto.AvocadoProyecto.fragments.DialogSeleccionarCentro";

            if (!this._dialogoSeleccionarCentro) {
                try {
                    this._dialogoSeleccionarCentro = sap.ui.xmlfragment(sPathFragment, this);
                    this._dialogoSeleccionarCentro.onsapescape = function () { };
                    oView.addDependent(this._dialogoSeleccionarCentro);
                } catch (e) {
                    return;
                }
            }

            this._dialogoSeleccionarCentro.open();
        },

        onAceptarSeleccionarCentro: async function (oEvent) {
            // Obtener y guardar el valor seleccionado del centro
            const oInput = sap.ui.getCore().byId("idCentro");
            const aTokens = oInput.getTokens();

            // Si no se ingresó un valor, muestro el error en el campo y salgo
            if (aTokens.length <= 0) {
                oInput.setValueState(sap.ui.core.ValueState.Error);
                oInput.setValueStateText("Indique un ID de centro");
                MessageToast.show("Debe seleccionar un centro de trabajo");
                return;
            }

            this.getView().setModel(new JSONModel({
                Werks: aTokens[0].getKey(),
                Texto: aTokens[0].getText()
            }), "mModeloCentro");

            sap.ui.getCore().setModel(new JSONModel({
                Werks: aTokens[0].getKey(),
                Texto: aTokens[0].getText()
            }), "mModeloCentro");

            oInput.setValueState(sap.ui.core.ValueState.None);

            this._dialogoSeleccionarCentro.destroy();
            delete this._dialogoSeleccionarCentro;

            // Si el id del centro no es el mismo al seleccionado
            if (this._idCentro !== aTokens[0].getKey()) {
                this._idCentro = aTokens[0].getKey();

                // Obtener el id de la página detalle
                const sId = this.getSplitAppObj().getCurrentDetailPage().sId.split("-").pop();

                // Si no es la página detail, vuelvo a ella
                if (sId !== "detail") {
                    this.getSplitAppObj().getCurrentDetailPage().destroy();
                    this.onPressInicion();
                }
            }
        },

        onCerrarSeleccionarCentro: async function (oEvent) {
            this._dialogoSeleccionarCentro.destroy();
            delete this._dialogoSeleccionarCentro;
        },

        onCancelarSeleccionarCentro: async function (oEvent) {
            // Obtener el input del centro
            const oInput = sap.ui.getCore().byId("idCentro");

            // Si está seteado el centro, permitir cerrar el diálogo
            if (this._idCentro) {
                this._dialogoSeleccionarCentro.destroy();
                delete this._dialogoSeleccionarCentro;
            } else {
                oInput.setValueState(sap.ui.core.ValueState.Error);
                oInput.setValueStateText("Indique un ID de centro");
                MessageToast.show("Debe seleccionar un centro de trabajo");
            }
        },

        onCambioCentro: function (oEvent) {
            // Ya sea que el cambio se hizo por agregar o quitar un token, saco el error
            const oInput = sap.ui.getCore().byId("idCentro");
            oInput.setValueState(sap.ui.core.ValueState.None);
            oInput.setValueStateText("");
        },

        ...LogicaAyudaBusqueda
    };
});