sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
], function(MessageBox, Controller, formatter) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.AlmacenarHUsPTEWM.controller.TrasladarHUsPTEWM", {

        formatter: formatter,
        dataBus: {},
        scope: {
            "btnTrasladarHU": true,
            "btnEscanearHU": true,
            "totalPorTrasladarHUs": 0,
            "totalTrasladadoHUs": 0,
        },
        HUTrasladar: {},
        HUTrasladado: [],

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "TrasladarHUsPTEWMDetailView", this._busSuscribe, this);

            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0014_SRV", { "useBatch": false });
            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelDetail, "listHus");

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");

            this.onLoadPorTrasladar();
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onLoadPorTrasladar: function() {
            sap.ui.core.BusyIndicator.show(0);
            this.getView().byId("txtSearchPorTrasladar").setValue("");
            this.getView().byId("txtSearchTrasladado").setValue("");

            var othat = this;

            this.scope.totalPorTrasladarHUs = 0;
            this.scope.totalTrasladadoHUs = 0;
            this.scope.btnTrasladarHU = false;
            this.scope.btnEscanearHU = true;

            this.HUTrasladado = [];

            var oModelHUTrasladado = new sap.ui.model.json.JSONModel(this.HUTrasladado);
            this.getView().setModel(oModelHUTrasladado, "HUTrasladado");

            var oModelService = this.getView().getModel('service');
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks; // Centro GE 2-12-2024
            var filters = [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)]; // Centro GE 2-12-2024

            oModelService.read("/UbicarPtSet", {
                filters: filters, // Centro GE 2-12-2024
                urlParameters: { "$expand": "UbicacionHuSet" },
                success: function(result, response) {
                    result.results.map(function(obj) {
                        obj.visible = true;
                        return obj;
                    });

                    var oModel = new sap.ui.model.json.JSONModel(result);

                    //SCH-Inicio
                    var zero = "0";

                    oModel.oData.results.forEach(valor => {
                        var length = valor.HuidentH.toString().length;
                        valor.HuidentH = (zero.repeat(20 - length)) + valor.HuidentH;
                    });
                    //SCH-Fin

                    othat.getView().setModel(oModel, "listHus");
                    othat.scope.totalPorTrasladarHUs = result.__count;

                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");

                    sap.ui.core.BusyIndicator.hide();

                    setTimeout(function() {
                        othat.getView().byId("inpScanHU").setValue('').focus();
                    }, 500);
                },
                error: function(error) {
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "listHus");

                    console.log(error);

                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");

                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        handleFilterPorTrasladar: function(event) {
            var sSearch = event.getSource().getValue().toString().toUpperCase();
            var oBinding = this.getView().byId("idHUPorTrasladarTable").getBinding("items");

            if (sSearch === "") {
                oBinding.filter([]);

                //this.scope.totalPorTrasladarHUs = oBinding.aIndices.length;
                var oModel = this.getView().getModel("listHus");
                var valNum = 0;

                var oFinded = oModel.getData().results.find(function(val) {
                    if (val.visible) {
                        valNum++;
                    }
                });

                this.scope.totalPorTrasladarHUs = valNum;

                var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
                this.getView().setModel(oModelScope, "scope");

                return;
            }

            var aFilters = [];

            aFilters.push(new sap.ui.model.Filter({
                path: "HuidentH",
                test: function(oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "Envase",
                test: function(oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "ZzViaje",
                test: function(oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "ZzNumorden",
                test: function(oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "Exportador",
                test: function(oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "TipoPal",
                test: function(oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            var oFilter = new sap.ui.model.Filter(aFilters, false);
            oBinding.filter(oFilter);

            this.scope.totalPorTrasladarHUs = oBinding.aIndices.length;

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
        },

        handleFilterTrasladado: function(event) {
            var sSearch = event.getSource().getValue().toString().toUpperCase();
            var oBinding = this.getView().byId("idHUTrasladadoTable").getBinding("items");

            if (sSearch === "") {
                oBinding.filter([]);
                this.scope.totalTrasladadoHUs = oBinding.aIndices.length;

                var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
                this.getView().setModel(oModelScope, "scope");

                return;
            }

            var aFilters = [];

            aFilters.push(new sap.ui.model.Filter({
                path: "HuidentH",
                test: function(oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "ZzViaje",
                test: function(oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "ZzNumorden",
                test: function(oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "LgplaNueva",
                test: function(oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "msgResponse",
                test: function(oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "msgStatus",
                test: function(oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            var oFilter = new sap.ui.model.Filter(aFilters, false);
            oBinding.filter(oFilter);

            this.scope.totalTrasladadoHUs = oBinding.aIndices.length;

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
        },

        onSelectTrasladarHU: function(HuidentH, HuidentP) {
            this.getView().byId("inpScanHU").setValue((HuidentH !== "") ? HuidentH : HuidentP);
            this._ScanHU((HuidentH !== "") ? HuidentH : HuidentP);
        },

        onScanHU: function() {
            this._ScanHU(this.getView().byId("inpScanHU").getValue().toString());
        },

        _ScanHU: function(sHU) {
            if (sHU == "") return;

            var othat = this;
            var oModel = this.getView().getModel("listHus");

            var oFinded = oModel.getData().results.find(function(val) {
                if ((val.HuidentH == sHU || val.HuidentP == sHU) && val.visible) {
                    val.visible = false;
                    return val;
                }
            });

            if (oFinded === undefined) {
                sap.m.MessageToast.show("No se encuentra el HU");
                this.getView().byId("inpScanHU").setValue('').focus();
                return;
            }

            this.getView().getModel("listHus").refresh();

            this.HUTrasladar = JSON.parse(JSON.stringify(oFinded));

            delete this.HUTrasladar.__metadata;
            delete this.HUTrasladar.visible;

            this.scope.btnTrasladarHU = true;
            this.scope.btnEscanearHU = false;

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");

            setTimeout(function() {
                othat.getView().byId("inpDestinoHU").setValue('').focus();
            }, 400);
        },

        onTrasladarHU: function() {
            if (this.HUTrasladar.length <= 0) return;
            if (this.getView().byId("inpDestinoHU").getValue().toString() === "") return;

            sap.ui.core.BusyIndicator.show(0);

            var othat = this;

            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin

            this.HUTrasladar.UbicacionHuSet.results.map(function(obj) {
                delete obj.__metadata;

                obj.LgplaNueva = othat.getView().byId("inpDestinoHU").getValue().toString();

                //DG - Inicio
                obj.I_WERKS = sCentro;
                //DG - Fin

                return obj;
            });

            var dataSend = {};
            dataSend = JSON.parse(JSON.stringify(othat.HUTrasladar));

            delete dataSend.UbicacionHuSet;

            dataSend.UbicacionHuSet = othat.HUTrasladar.UbicacionHuSet.results;
            dataSend.UbicacionHuSet[0].TipoPal = dataSend.TipoPal; //SCH-Fase 2

            var oModelService = this.getView().getModel('service');

            dataSend.Hsdat = dataSend.Hsdat.replace('.000Z', '');

            oModelService.create("/UbicarPtSet", dataSend, {
                success: async function(oResponse, oHeader) {
                    sap.ui.core.BusyIndicator.hide();

                    var msgError = othat._processErrorOdata(oResponse);
                    var dataTrasladado = JSON.parse(JSON.stringify(othat.HUTrasladar));

                    if (msgError != "") {
                        dataTrasladado.msgResponse = msgError;
                        dataTrasladado.msgStatus = "Error";
                        dataTrasladado.colorScheme = 3;
                        dataTrasladado.LgplaNueva = othat.getView().byId("inpDestinoHU").getValue().toString();

                        MessageBox.error(msgError, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function(oAction) {}
                        });

                        var oModel = othat.getView().getModel("listHus");

                        var oFinded = oModel.getData().results.find(function(val) {
                            if (val.HuidentH == dataTrasladado.HuidentH && val.HuidentP == dataTrasladado.HuidentP && !val.visible) {
                                val.visible = true;
                                return val;
                            }
                        });

                        othat.getView().getModel("listHus").refresh();
                    } else {
                        dataTrasladado.msgResponse = "Se ha realizado el Traslado correctamente";
                        dataTrasladado.msgStatus = "Correcto";
                        dataTrasladado.colorScheme = 5;
                        dataTrasladado.LgplaNueva = othat.getView().byId("inpDestinoHU").getValue().toString();
                    }

                    othat.scope.btnTrasladarHU = false;
                    othat.scope.btnEscanearHU = true;

                    othat.getView().byId("inpScanHU").setValue('');
                    othat.getView().byId("inpDestinoHU").setValue('');

                    othat.HUTrasladado.push(dataTrasladado);

                    var oModelHUTrasladado = new sap.ui.model.json.JSONModel(othat.HUTrasladado);
                    othat.getView().setModel(oModelHUTrasladado, "HUTrasladado");

                    try {
                        var oModel = othat.getView().getModel("listHus");
                        var valNum = 0;

                        var oFinded = oModel.getData().results.find(function(val) {
                            if (val.visible) {
                                valNum++;
                            }
                        });

                        othat.scope.totalPorTrasladarHUs = valNum;

                        var oBindingTrasladado = othat.getView().byId("idHUTrasladadoTable").getBinding("items");
                        othat.scope.totalTrasladadoHUs = oBindingTrasladado.aIndices.length;
                    } catch (error) {
                        console.error(error);
                    }

                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");

                    setTimeout(function() {
                        othat.getView().byId("inpScanHU").setValue('').focus();
                    }, 400);
                },
                error: function(oError, oHeader) {
                    sap.ui.core.BusyIndicator.hide();

                    var msgError = othat._processErrorOdata(oError);
                    var dataTrasladado = JSON.parse(JSON.stringify(othat.HUTrasladar));

                    dataTrasladado.msgResponse = msgError;
                    dataTrasladado.msgStatus = "Error";
                    dataTrasladado.colorScheme = 3;
                    dataTrasladado.LgplaNueva = othat.getView().byId("inpDestinoHU").getValue().toString();

                    MessageBox.error(msgError, {
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oAction) {}
                    });

                    var oModel = othat.getView().getModel("listHus");

                    var oFinded = oModel.getData().results.find(function(val) {
                        if (val.HuidentH == dataTrasladado.HuidentH && val.HuidentP == dataTrasladado.HuidentP && !val.visible) {
                            val.visible = true;
                            return val;
                        }
                    });

                    othat.getView().getModel("listHus").refresh();

                    othat.scope.btnTrasladarHU = false;
                    othat.scope.btnEscanearHU = true;

                    othat.getView().byId("inpScanHU").setValue('');
                    othat.getView().byId("inpDestinoHU").setValue('');

                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");

                    othat.HUTrasladado.push(dataTrasladado);

                    var oModelHUTrasladado = new sap.ui.model.json.JSONModel(othat.HUTrasladado);
                    othat.getView().setModel(oModelHUTrasladado, "HUTrasladado");

                    try {
                        var oModel = othat.getView().getModel("listHus");
                        var valNum = 0;

                        var oFinded = oModel.getData().results.find(function(val) {
                            if (val.visible) {
                                valNum++;
                            }
                        });

                        othat.scope.totalPorTrasladarHUs = valNum;

                        var oBindingTrasladado = othat.getView().byId("idHUTrasladadoTable").getBinding("items");
                        othat.scope.totalTrasladadoHUs = oBindingTrasladado.aIndices.length;
                    } catch (error) {
                        console.error(error);
                    }

                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");

                    setTimeout(function() {
                        othat.getView().byId("inpScanHU").setValue('').focus();
                    }, 400);
                }
            });
        },

        _processErrorOdata: function(error) {
            if (error) {
                if (error.responseText) {
                    var obj = JSON.parse(error.responseText);

                    if (obj.error !== undefined) {
                        if (obj.error.innererror) {
                            if (obj.error.innererror.errordetails) {
                                if (obj.error.innererror.errordetails.length > 0) {
                                    var msgReturn = "";

                                    for (var index = 0; index < obj.error.innererror.errordetails.length; index++) {
                                        if (obj.error.innererror.errordetails[index].message &&
                                            obj.error.innererror.errordetails[index].code != "/IWBEP/CX_MGW_TECH_EXCEPTION") {

                                            if (msgReturn != "") {
                                                msgReturn = msgReturn + "\r\n";
                                            }

                                            msgReturn = msgReturn + obj.error.innererror.errordetails[index].message;
                                        }
                                    }

                                    if (msgReturn != "") {
                                        return msgReturn;
                                    }
                                }
                            }
                        }

                        if (obj.error.message) {
                            return obj.error.message.value;
                        }
                    }
                }

                if (error.message) {
                    return error.message.value;
                }
            }

            return "";
        }

    });
});