sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
], function(MessageBox, Controller, formatter) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.stageModMMPPPrd.controller.rehabilitarMMPPPrd", {

        formatter: formatter,
        dataBus: {},
        scope: {
            "btnRehabilitar": true,
            "CodExt": "",
            "Budat": null,
            "Budat2": null
        },

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "rehabilitarMMPPPrdDetailView", this._busSuscribe, this);

            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0009_SRV", { "useBatch": false });
            this.getView().setModel(oModelService, "service");

            var oModelRehabilitar = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelRehabilitar, "rehabilitar");

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");

            this.onLoadRehabilitar();
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onSplitRouter('stageModMMPPPrdDetailView', 'AvocadoProyecto.AvocadoProyecto.modules.stageModMMPPPrd.view.stageModMMPPPrd', '20');
            this.getView().destroy();
        },

        onLoadRehabilitar: function () {
            //DG - Inicio
             const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin            
            sap.ui.core.BusyIndicator.show(0);
            var othat = this;
            this.scope.CodExt = "";
            this.scope.Budat = null;
            this.scope.Budat2 = null;
            this.getView().getModel("scope").refresh();
            var oModelService = this.getView().getModel('service');
            oModelService.read("/ReporteRehabilitarSet", {
                //DG - Inicio
                filters: [new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, sCentro)],
                //DG - Fin                
                success: function (result, response) {
                    var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.getView().setModel(oModel, "rehabilitar");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function (error) {
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "rehabilitar");
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        onRehabilitar: function() {
            var oModelRehabilitar = this.getView().getModel("rehabilitar").getData();
            var data = [];
            for (let index = 0; index < oModelRehabilitar.results.length; index++) {
                if (oModelRehabilitar.results[index].rehabilitar) {
                    var dat = JSON.parse(JSON.stringify(oModelRehabilitar.results[index]));
                    dat.Budat = dat.Budat.replace('.000Z', '')
                    delete dat.__metadata;
                    delete dat.rehabilitar;
                    data.push(dat);
                }
            }
            if (data.length <= 0) return;
            var aPromises = [];
            var oModelService = this.getView().getModel('service');
            for (var index = 0; index < data.length; index++) {
                aPromises.push(new Promise((resolve, reject) => {
                    oModelService.create("/ReporteRehabilitarSet", data[index], {
                        success: async function(oResponse, oHeader) {
                            resolve(oResponse);
                        },
                        error: function(oError, oHeader) {
                            resolve(oError);
                        }
                    });
                }));
            }
            var msgError = "";
            var msgSuss = "";
            var othat = this;
            sap.ui.core.BusyIndicator.show(0);
            Promise.all(aPromises).then(oResponseP => {
                for (var index = 0; oResponseP[index]; index++) {
                    if (oResponseP[index].responseText) {
                        var obj = JSON.parse(oResponseP[index].responseText);
                        if (obj.error !== undefined) {
                            msgError += obj.error.message.value + "\r\n";
                        }
                    } else {
                        msgSuss = "Se han habilitado las Guías seleccionadas";
                    }
                }
                sap.ui.core.BusyIndicator.hide();
                if (msgSuss !== "") {
                    MessageBox.success(
                        msgSuss, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function(oAction) {
                                othat.onLoadRehabilitar();
                            }
                        }
                    )
                }
                if (msgError !== "") {
                    MessageBox.error(
                        msgError, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function(oAction) {}
                        }
                    )
                }
            });
        },

        onShowFilter: function(event) {
            this._getDialogShowFilter().open();
            this.getView().getModel("scope").refresh();
        },

        _getDialogShowFilter: function() {
            if (!this.oDialogShowFilter) {
                this.oDialogShowFilter = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.stageModMMPPPrd.fragments.filterRehabilitar', this);
                this.getView().addDependent(this.oDialogShowFilter);
            }
            return this.oDialogShowFilter;
        },

        onCloseDialogShowFilter: function() {
            this._getDialogShowFilter().close();
        },

        onFiltrarHU: function(limpiar) {
            if (limpiar) {
                this.scope.CodExt = "";
                this.scope.Budat = null;
                this.scope.Budat2 = null;
                this.getView().getModel("scope").refresh();
            }
            this.onCloseDialogShowFilter();
            this._filterLoadRehabilitar();
        },

        _filterLoadRehabilitar: function() {
            var oBinding = this.getView().byId("idReHabilitarTable").getBinding("items");
            var othat = this;
            var aFilters = [];
            if (this.scope.CodExt !== "") {
                aFilters.push(new sap.ui.model.Filter("CodExt", sap.ui.model.FilterOperator.EQ, this.scope.CodExt));
            }
            if (this.scope.Budat !== null && this.scope.Budat2 !== null) {
                //aFilters.push(new sap.ui.model.Filter("Budat", sap.ui.model.FilterOperator.BT, this.scope.Budat, this.scope.Budat2));
                aFilters.push(new sap.ui.model.Filter({
                    path: "Budat",
                    test: function(oValue) {
                        var dateOValue = new Date(oValue);
                        var dateFilter = new Date(dateOValue.getUTCFullYear(), dateOValue.getUTCMonth(), dateOValue.getUTCDate(), dateOValue.getUTCHours(), dateOValue.getUTCMinutes(), dateOValue.getUTCSeconds());
                        if (dateFilter >= othat.scope.Budat && dateFilter <= othat.scope.Budat2) {
                            return true;
                        }
                    }
                }));
            }
            var oFilter = new sap.ui.model.Filter(aFilters, true);
            oBinding.filter(oFilter);
        }

    });
});