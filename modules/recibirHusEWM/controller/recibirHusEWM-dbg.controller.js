sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
], function (MessageBox, Controller, formatter) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.recibirHusEWM.controller.recibirHusEWM", {

        formatter: formatter,
        dataBus: {},
        scope: {
            "btnTrasladarHU": true
        },
        trasladarHU: [],
        HUTrasladado: [],

        onInit: function () {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "recibirHusEWMDetailView", this._busSuscribe, this);

            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0002_SRV", { "useBatch": false });
            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelDetail, "detail");

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");

            this.onLoadDetail();
        },

        _busSuscribe: function (channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function () {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onLoadDetail: function () {
            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin
            sap.ui.core.BusyIndicator.show(0);
            this.getView().byId("txtSearchHU").setValue("");
            var othat = this;
            var oModelService = this.getView().getModel('service');
            oModelService.read("/GuiaRemisionSet", {
                urlParameters: { "$expand": "NavHU" },
                //DG - Inicio
                filters: [new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, sCentro)],
                //DG - Fin
                success: function (result, response) {
                    var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.getView().setModel(oModel, "detail");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function (error) {
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "detail");
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        handleFilterHU: function (event) {
            var sSearch = event.getSource().getValue().toString();
            var oBinding = this.getView().byId("idHUTable").getBinding("items");
            if (sSearch === "") {
                oBinding.filter([]);
                return;
            }
            var oFilter;
            var aFilters = [];
            aFilters.push(new sap.ui.model.Filter({
                path: "Guia",
                test: function (oValue) {
                    return (oValue.indexOf(sSearch) >= 0);
                }
            }));
            /*
            aFilters.push(new sap.ui.model.Filter({
                path: "NavHU",
                test: function(oValue) {
                    if (oValue.results.find(function(val) {
                            return (val.Exidv.indexOf(sSearch) >= 0) || (val.Exidv2.indexOf(sSearch) >= 0);
                        }) !== undefined) {
                        return true;
                    }
                }
            }));
            */
            var oFilter = new sap.ui.model.Filter(aFilters, false);
            oBinding.filter(oFilter);
        },

        onShowHUs: function (event) {
            var othat = this;
            this._getDialogTrasladarHU().open();
            var oContext = event.getSource().getBindingContext('detail');
            this.scope.dataDetail = JSON.parse(JSON.stringify(oContext.getObject()));
            var aNav = oContext.getProperty('NavHU').results;
            var oModel = new sap.ui.model.json.JSONModel(JSON.parse(JSON.stringify(aNav)));
            oModel.getData().map(function (obj) {
                obj.visible = true;
                obj.ModuloDescr = oContext.getProperty('ModuloDescr');
                return obj;
            });
            this.getView().setModel(oModel, "listMaterials");
            this.scope.btnTrasladarHU = false;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            //clean fragment
            this.trasladarHU = [];
            var oModelTrasladarHU = new sap.ui.model.json.JSONModel(this.trasladarHU);
            this.getView().setModel(oModelTrasladarHU, "trasladarHU");
            this.HUTrasladado = [];
            var oModelHUTrasladado = new sap.ui.model.json.JSONModel(this.HUTrasladado);
            this.getView().setModel(oModelHUTrasladado, "HUTrasladado");
            if (this.getView().byId("inpScanHU")) {
                setTimeout(function () { othat.getView().byId("inpScanHU").setValue('').focus(); }, 800);
            }
        },

        onSelectTrasladarHU: function (Exidv2, Exidv) {
            this._ScanHU((Exidv2 !== "") ? Exidv2 : Exidv);
        },

        onScanHU: function () {
            var sHU = this.getView().byId("inpScanHU").getValue().toString();
            this._ScanHU(sHU);
        },

        _ScanHU: function (sHU) {
            if (sHU === "") return;
            var othat = this;
            var oModel = this.getView().getModel("listMaterials");
            var oFinded = oModel.getData().find(function (val) {
                if ((val.Exidv == sHU || val.Exidv2 == sHU) && val.visible) {
                    val.visible = false;
                    return val;
                }
            });
            if (oFinded === "") {
                return;
            }
            if (oFinded === undefined) {
                sap.m.MessageToast.show("No se encuentra el HU");
                this.getView().byId("inpScanHU").setValue('').focus();
                return;
            }
            this.getView().getModel("listMaterials").refresh();
            var oHUAdd = JSON.parse(JSON.stringify(oFinded));
            delete oHUAdd.__metadata;
            delete oHUAdd.visible;
            oHUAdd.Aedat = null;
            oHUAdd.Erdat = null;
            this.trasladarHU.push(oHUAdd);
            var oModelTrasladarHU = new sap.ui.model.json.JSONModel(this.trasladarHU);
            this.getView().setModel(oModelTrasladarHU, "trasladarHU");
            this.getView().getModel("trasladarHU").refresh();
            this.getView().byId("inpScanHU").setValue('').focus();
            this.scope.btnTrasladarHU = (this.trasladarHU.length === oModel.getData().length) ? true : false;
            //this.scope.btnTrasladarHU = (this.trasladarHU.length > 0) ? true : false;            
            this.getView().getModel("scope").refresh();
        },

        onDeleteTrasladarHU: function (event) {
            var deleteRecord = parseInt(event.getSource().getBindingContext("trasladarHU").getPath().replace("/", ""));
            var othat = this;
            var oModel = this.getView().getModel("listMaterials");
            oModel.getData().find(function (val) {
                if (val.Exidv === othat.trasladarHU[deleteRecord].Exidv && val.Exidv2 === othat.trasladarHU[deleteRecord].Exidv2) {
                    val.visible = true;
                }
            });
            this.getView().getModel("listMaterials").refresh();
            this.trasladarHU.splice(deleteRecord, 1);
            var oModelTrasladarHU = new sap.ui.model.json.JSONModel(this.trasladarHU);
            this.getView().setModel(oModelTrasladarHU, "trasladarHU");
            this.getView().getModel("trasladarHU").refresh();
            this.getView().byId("inpScanHU").setValue('').focus();
            this.scope.btnTrasladarHU = (this.trasladarHU.length === oModel.getData().length) ? true : false;
            //this.scope.btnTrasladarHU = (this.trasladarHU.length > 0) ? true : false;
            this.getView().getModel("scope").refresh();
        },

        onTrasladarHU: function () {
            if (this.trasladarHU.length <= 0) return;
            sap.ui.core.BusyIndicator.show(0);
            var othat = this;
            var data = {};
            data = JSON.parse(JSON.stringify(this.scope.dataDetail));
            delete data.NavHU;
            delete data.__metadata;
            data.Budat = data.Budat.replace('.000Z', '')
            data.NavHU = JSON.parse(JSON.stringify(this.trasladarHU));
            for (var index = 0; index < data.NavHU.length; index++) {
                delete data.NavHU[index].ModuloDescr;
            }
            var oModelService = this.getView().getModel('service');
            oModelService.create("/GuiaRemisionSet", data, {
                success: async function (oResponse, oHeader) {
                    var responseHUTrasladado = {};
                    if (oResponse.responseText) {
                        var obj = JSON.parse(oResponse.responseText);
                        if (obj.error !== undefined) {
                            responseHUTrasladado.msgResponse = obj.error.message.value;
                            responseHUTrasladado.msgStatus = "Error";
                        }
                        responseHUTrasladado.colorScheme = 3;
                    } else {
                        responseHUTrasladado.msgResponse = "Trasladado correctamente";
                        responseHUTrasladado.msgStatus = "Correcto";
                        responseHUTrasladado.colorScheme = 5;
                    }

                    for (var index = 0; index < othat.trasladarHU.length; index++) {
                        othat.trasladarHU[index].msgResponse = responseHUTrasladado.msgResponse;
                        othat.trasladarHU[index].msgStatus = responseHUTrasladado.msgStatus;
                        othat.trasladarHU[index].colorScheme = responseHUTrasladado.colorScheme;
                        othat.HUTrasladado.push(JSON.parse(JSON.stringify(othat.trasladarHU[index])));
                    }
                    othat.trasladarHU = [];
                    var oModelTrasladarHU = new sap.ui.model.json.JSONModel(othat.trasladarHU);
                    othat.getView().setModel(oModelTrasladarHU, "trasladarHU");
                    othat.getView().getModel("trasladarHU").refresh();
                    var oModelHUTrasladado = new sap.ui.model.json.JSONModel(othat.HUTrasladado);
                    othat.getView().setModel(oModelHUTrasladado, "HUTrasladado");
                    othat.getView().getModel("HUTrasladado").refresh();
                    othat.scope.btnTrasladarHU = (othat.trasladarHU.length > 0) ? true : false;
                    othat.getView().getModel("scope").refresh();
                    sap.ui.core.BusyIndicator.hide();
                    othat.getView().byId("inpScanHU").setValue('').focus();
                },
                error: function (oError, oHeader) {
                    var responseHUTrasladado = {};
                    if (oError.responseText) {
                        var obj = JSON.parse(oError.responseText);
                        if (obj.error !== undefined) {
                            responseHUTrasladado.msgResponse = obj.error.message.value;
                            responseHUTrasladado.msgStatus = "Error";
                        }
                        responseHUTrasladado.colorScheme = 3;
                    }
                    for (var index = 0; index < othat.trasladarHU.length; index++) {
                        othat.trasladarHU[index].msgResponse = responseHUTrasladado.msgResponse;
                        othat.trasladarHU[index].msgStatus = responseHUTrasladado.msgStatus;
                        othat.trasladarHU[index].colorScheme = responseHUTrasladado.colorScheme;
                        othat.HUTrasladado.push(JSON.parse(JSON.stringify(othat.trasladarHU[index])));
                    }
                    othat.trasladarHU = [];
                    var oModelTrasladarHU = new sap.ui.model.json.JSONModel(othat.trasladarHU);
                    othat.getView().setModel(oModelTrasladarHU, "trasladarHU");
                    othat.getView().getModel("trasladarHU").refresh();
                    var oModelHUTrasladado = new sap.ui.model.json.JSONModel(othat.HUTrasladado);
                    othat.getView().setModel(oModelHUTrasladado, "HUTrasladado");
                    othat.getView().getModel("HUTrasladado").refresh();
                    othat.scope.btnTrasladarHU = (othat.trasladarHU.length > 0) ? true : false;
                    othat.getView().getModel("scope").refresh();
                    sap.ui.core.BusyIndicator.hide();
                    othat.getView().byId("inpScanHU").setValue('').focus();
                }
            });
        },

        _getDialogTrasladarHU: function () {
            if (!this.oDialogTrasladarHU) {
                this.oDialogTrasladarHU = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.recibirHusEWM.fragments.trasladarHU', this);
                this.getView().addDependent(this.oDialogTrasladarHU);
            }
            return this.oDialogTrasladarHU;
        },

        onCloseDialogTrasladarHU: function () {
            this._getDialogTrasladarHU().close();
        },

        onAfterCloseDialogTrasladarHU: function () {
            this.onLoadDetail();
        }

    });
});