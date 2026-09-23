sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function(Controller, formatter, JSONModel, MensajesObject) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.MapaZonaFullContenedoresEWM.controller.Index", {

        formatter: formatter,
        dataBus: {},
        scope: {},
        detail: [],

        onAfterRendering: function() {},

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "MapaContenedoresFullEWMView", this._busSuscribe, this);

            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0020_SRV", { "useBatch": false });
            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelDetail, "detail");

            var oFiltros = [{ "value": "ZF" }, { "value": "ZF2" }, { "value": "ZF3" }];
            this.getView().setModel(new JSONModel(oFiltros), "mFiltros");

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onSelectUbicacion: function(sUbicacion) {
            sap.ui.core.BusyIndicator.show(0);
            var othat = this;

            othat.detail = [];
            var oModelData = new sap.ui.model.json.JSONModel(othat.detail);
            othat.getView().setModel(oModelData, "detail");

            this.scope.ubicacion = sUbicacion;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");

            // var sUrl = "/ZonaContenedoresSet";
            var sUrl = "/ZonaContenedoresV2Set";
            
            /// GE 21-11-2024
            
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oFilter = new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro);
            
            var oFiltros = [
                new sap.ui.model.Filter("IZona", sap.ui.model.FilterOperator.EQ, sUbicacion),
                oFilter
            ];
            ///GE 21-11-2024 ///
            // var oFiltros = [
            //     new sap.ui.model.Filter("I_ZONA", sap.ui.model.FilterOperator.EQ, sUbicacion)
            // ];

            var oModelService = this.getView().getModel('service');
            oModelService.read(sUrl, {
                filters: oFiltros,
                success: function(result, response) {
                    result.results.forEach(function(fila) {
                        let found = othat.detail.find(val => val.nameFILA == fila.Fila);
                        if (found) {
                            found.row.push(fila);
                        } else {
                            let objtmp = { 'nameFILA': fila.Fila, 'row': [] };
                            objtmp.row.push(fila);
                            othat.detail.push(objtmp);
                        }
                    });
                    var oModelData = new sap.ui.model.json.JSONModel(othat.detail);
                    othat.getView().setModel(oModelData, "detail");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(error) {
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        onShowUbicacion: function(sFILA, sUBICACION) {
            this._getDialog().open();
            const foundFILA = this.detail.find(val => val.nameFILA == sFILA);
            const found = foundFILA.row.find(val => val.Ubicacion == sUBICACION);
            var oModel = new sap.ui.model.json.JSONModel(JSON.parse(JSON.stringify(found)));
            this.getView().setModel(oModel, "dialogData");
        },

        _getDialog: function() {
            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.MapaZonaFullContenedoresEWM.fragments.AsignarModal', this);
                this.getView().addDependent(this.oDialog);
            }
            return this.oDialog;
        },

        onCloseDialog: function() {
            this._getDialog().close();
        },

        onAfterCloseDialog: function() {}

    });
});