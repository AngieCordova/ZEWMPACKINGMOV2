sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
], function(MessageBox, Controller, formatter) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.stageModMMPPPrd.controller.stageModMMPPPrd", {

        formatter: formatter,
        dataBus: {},
        scope: {
            "btnTrasladar": true,
            "bloqueoScan": false
        },

        trasladarStock: [],
        HUTrasladado: [],

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "stageModMMPPPrdDetailView", this._busSuscribe, this);

            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0009_SRV", { "useBatch": false });
            //var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0009_SRV");
            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelDetail, "guias");

            this.onLoadGuias();
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onLoadGuias: function () {
            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin                        
            sap.ui.core.BusyIndicator.show(0);
            this.getView().byId("txtSearchGuia").setValue("");
            var othat = this;
            var oModelService = this.getView().getModel('service');
            oModelService.read("/ReporteGuiaSet", {
                //DG - Inicio
                filters: [new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, sCentro)],
                //DG - Fin                   
                success: function (result, response) {
                    var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.getView().setModel(oModel, "guias");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function (error) {
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "guias");
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        handleFilterGuia: function(event) {
            var sSearch = event.getSource().getValue().toString();
            var oBinding = this.getView().byId("idGuiaTable").getBinding("items");
            if (sSearch === "") {
                oBinding.filter([]);
                return;
            }
            var oFilter = [
                new sap.ui.model.Filter([
                    new sap.ui.model.Filter("Guia", function(sGuia) {
                        return (sGuia || "").toUpperCase().indexOf(sSearch.toUpperCase()) > -1;
                    }),
                    new sap.ui.model.Filter("Vbeln", function(sVbeln) {
                        return (sVbeln || "").toUpperCase().indexOf(sSearch.toUpperCase()) > -1;
                    })
                ], false)
            ];
            oBinding.filter(oFilter);
        },

        onRehabilitarView: function() {
            this.dataBus.oView.oController.onSplitRouter('rehabilitarMMPPPrdDetailView', 'AvocadoProyecto.AvocadoProyecto.modules.stageModMMPPPrd.view.rehabilitarMMPPPrd', '20');
            this.getView().destroy();
        },

        onReporteStockShow: function(event) {
            this._getDialogReporteStock().open();
            sap.ui.core.BusyIndicator.show(0);
            var oContext = event.getSource().getBindingContext('guias');
            var oModelService = this.getView().getModel('service');
            var othat = this;
            var oModel = new sap.ui.model.json.JSONModel();
            othat.getView().setModel(oModel, "pallets");

            this.scope.btnTrasladar = false;
            this.scope.bloqueoScan = false;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            //SCH - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //SCH - Fin
            oModelService.read("/ReporteStockSet", {  
                filters: [new sap.ui.model.Filter("Guia", sap.ui.model.FilterOperator.EQ, oContext.getProperty('Guia')),
                    new sap.ui.model.Filter("ModuloDescr", sap.ui.model.FilterOperator.EQ, oContext.getProperty('Modulo')),
                    new sap.ui.model.Filter("Variedad", sap.ui.model.FilterOperator.EQ, oContext.getProperty('Variedad').substring(0,2)), //SCH agregar substring(0,2)
                  //SCH - Inicio                    
                    new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, sCentro),
                  //SCH - Fin
                ],
                success: function(result, response) {
                    result.results.map(function(obj) {
                        obj.visible = true;
                        while (obj.Exidv.length < 20) {
                            obj.Exidv = '0' + obj.Exidv;
                        }
                        return obj;
                    });
                    var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.getView().setModel(oModel, "pallets");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(error) {
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });

            this.trasladarStock = [];
            var oModelTrasladarStock = new sap.ui.model.json.JSONModel(this.trasladarStock);
            this.getView().setModel(oModelTrasladarStock, "trasladarStock");
            this.HUTrasladado = [];
            var oModelHUTrasladado = new sap.ui.model.json.JSONModel(this.HUTrasladado);
            this.getView().setModel(oModelHUTrasladado, "HUTrasladado");
            if (this.getView().byId("inpScanStock")) {
                setTimeout(function() { othat.getView().byId("inpScanStock").setValue('').focus(); }, 800);
            }
        },

        onSelectTrasladarStock: function(sHU) {
            this._ScanStock(sHU);
        },

        onScanStock: function() {
            var sHU = this.getView().byId("inpScanStock").getValue().toString();
            this._ScanStock(sHU);
        },

        _ScanStock: function(sHU) {
            //if (this.scope.bloqueoScan) return;
            //this.scope.bloqueoScan = true;
            if (sHU === "") return;
            var othat = this;
            var oModel = this.getView().getModel("pallets");
            var msgError = "";
            //sap.ui.core.BusyIndicator.show(0);
            var cantStock = 0;
            var cantMaxStock = 1000;
            var oFinded = oModel.getData().results.find(function(val) {
                if (val.CodExt == sHU && val.visible) {
                    if (othat.trasladarStock.length > 0) {
                        cantStock = othat.trasladarStock.length;
                        cantMaxStock = 1000;
                        othat.trasladarStock.find(function(val2) {
                            if (parseInt(val2.CantidadScan) < cantMaxStock) {
                                cantMaxStock = parseInt(val2.CantidadScan);
                            }
                        });
                        //console.log("cantStock: " + cantStock + " | cantMaxStock: " + cantMaxStock + " | val.CantidadScan: " + val.CantidadScan);
                        if (cantStock < cantMaxStock && cantStock < val.CantidadScan) {
                            cantStock = 1 + cantStock;
                            cantMaxStock = (val.CantidadScan <= cantMaxStock) ? val.CantidadScan : cantMaxStock;
                            return val;
                        } else {
                            cantMaxStock = (val.CantidadScan <= cantMaxStock) ? val.CantidadScan : cantMaxStock;
                            msgError = "El HU no puede ser trasladado, se ha completado el número máximo para trasladar";
                            return null;
                        }
                    } else {
                        cantStock = 1;
                        cantMaxStock = (val.CantidadScan <= cantMaxStock) ? val.CantidadScan : cantMaxStock;
                        return val;
                    }
                }
            });
            //console.log("cantStock" + cantStock);
            //console.log("cantMaxStock" + cantMaxStock);
            if (oFinded === undefined) {
                //sap.ui.core.BusyIndicator.hide();
                //othat.scope.bloqueoScan = false;
                sap.m.MessageToast.show((msgError === "") ? "No se encuentra el HU" : msgError);
                this.getView().byId("inpScanStock").setValue('').focus();
                return;
            }
            var oHUAdd = JSON.parse(JSON.stringify(oFinded));
            delete oHUAdd.__metadata;
            delete oHUAdd.visible;
            oFinded.visible = false;
            othat.getView().getModel("pallets").refresh();
            othat.trasladarStock.push(oHUAdd);
            othat.getView().getModel("trasladarStock").refresh();
            othat.getView().byId("inpScanStock").setValue('').focus();
            othat.scope.btnTrasladar = (othat.trasladarStock.length > 0) ? true : false;
            othat.getView().getModel("scope").refresh();
            //othat.scope.bloqueoScan = false;
            if (cantStock >= cantMaxStock) {
                othat.onTrasladarTrasladarStock();
            }
            /*
            var oModelService = this.getView().getModel('service');
            */
            /*
                        while (oHUAdd.Exidv.length < 20) {
                            oHUAdd.Exidv = '0' + oHUAdd.Exidv;
                        }
            */
            /*
            oModelService.create("/BloquearHUSet", { "Exidv": oHUAdd.Exidv }, {
                success: async function(oResponse, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    othat.scope.bloqueoScan = false;
                    if (oResponse.responseText) {
                        var obj = JSON.parse(oResponse.responseText);
                        if (obj.error !== undefined) {
                            MessageBox.error(
                                obj.error.message.value, {
                                    styleClass: "sapUiSizeCompact",
                                    onClose: function(oAction) {
                                        othat.getView().byId("inpScanStock").setValue('').focus();
                                    }
                                }
                            )
                        }
                    } else {
                        oFinded.visible = false;
                        othat.getView().getModel("pallets").refresh();
                        othat.trasladarStock.push(oHUAdd);
                        othat.getView().getModel("trasladarStock").refresh();
                        othat.getView().byId("inpScanStock").setValue('').focus();
                        othat.scope.btnTrasladar = (othat.trasladarStock.length > 0) ? true : false;
                        othat.getView().getModel("scope").refresh();
                    }
                },
                error: function(oError, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    othat.scope.bloqueoScan = false;
                    if (oError.responseText) {
                        var obj = JSON.parse(oError.responseText);
                        if (obj.error !== undefined) {
                            MessageBox.error(
                                obj.error.message.value, {
                                    styleClass: "sapUiSizeCompact",
                                    onClose: function(oAction) {
                                        othat.getView().byId("inpScanStock").setValue('').focus();
                                    }
                                }
                            )
                        }
                    }
                }
            });
            */
        },

        _DesbloquearHUSetPromise: function(aHUs) {
            if (aHUs.length <= 0) return;
            var aPromises = [];
            var oModelService = this.getView().getModel('service');
            for (var index = 0; index < aHUs.length; index++) {
                aPromises.push(new Promise((resolve, reject) => {
                    /*
                    while (aHUs[index].length < 20) {
                        aHUs[index] = '0' + aHUs[index];
                    }
                    */
                    oModelService.create("/DesbloquearHUSet", { "Exidv": aHUs[index] }, {
                        success: async function(oResponse, oHeader) {
                            resolve(oResponse);
                        },
                        error: function(oError, oHeader) {
                            resolve(oError);
                        }
                    });
                }));
            }
            return aPromises;
        },

        onDeleteTrasladarStock: function(event) {
            var deleteRecord = parseInt(event.getSource().getBindingContext("trasladarStock").getPath().replace("/", ""));
            var othat = this;
            var oModelPallets = this.getView().getModel("pallets");
            oModelPallets.getData().results.find(function(val) {
                if (val.Exidv === othat.trasladarStock[deleteRecord].Exidv) {
                    val.visible = true;
                }
            });
            othat.getView().getModel("pallets").refresh();
            othat.trasladarStock.splice(deleteRecord, 1);
            othat.getView().getModel("trasladarStock").refresh();
            othat.getView().byId("inpScanStock").setValue('').focus();
            othat.scope.btnTrasladar = (othat.trasladarStock.length > 0) ? true : false;
            othat.getView().getModel("scope").refresh();
            /*
            var aPromises = this._DesbloquearHUSetPromise([othat.trasladarStock[deleteRecord].Exidv]);
            sap.ui.core.BusyIndicator.show(0);
            Promise.all(aPromises).then(oResponseP => {
                if (oResponseP[0].responseText) {
                    var obj = JSON.parse(oResponseP[0].responseText);
                    if (obj.error !== undefined) {
                        MessageBox.error(
                            obj.error.message.value, {
                                styleClass: "sapUiSizeCompact",
                                onClose: function(oAction) {}
                            }
                        )
                    }
                } else {
                    oModelPallets.getData().results.find(function(val) {
                        if (val.Exidv === othat.trasladarStock[deleteRecord].Exidv) {
                            val.visible = true;
                        }
                    });
                    othat.getView().getModel("pallets").refresh();
                    othat.trasladarStock.splice(deleteRecord, 1);
                    othat.getView().getModel("trasladarStock").refresh();
                    othat.getView().byId("inpScanStock").setValue('').focus();
                    othat.scope.btnTrasladar = (othat.trasladarStock.length > 0) ? true : false;
                    othat.getView().getModel("scope").refresh();
                }
                sap.ui.core.BusyIndicator.hide();
            });
            */
        },

        onTrasladarTrasladarStock: function() {
            if (this.trasladarStock.length <= 0) return;
            var aPromises = [];
            var oModelService = this.getView().getModel('service');
            var data = {};
            data.Guia = this.trasladarStock[0].Guia;
            data.NavReporteStock = this.trasladarStock;
            for (var index = 0; index < this.trasladarStock.length; index++) {
                this.HUTrasladado.push(JSON.parse(JSON.stringify(this.trasladarStock[index])));
            }
            aPromises.push(new Promise((resolve, reject) => {
                oModelService.create("/ReporteGuiaSet", data, {
                    success: async function(oResponse, oHeader) {
                        resolve(oResponse);
                    },
                    error: function(oError, oHeader) {
                        resolve(oError);
                    }
                });
            }));
            var msgError = "";
            var msgSuss = "";
            var othat = this;
            sap.ui.core.BusyIndicator.show(0);
            Promise.all(aPromises).then(oResponseP => {
                var responseHUTrasladado = {};
                for (var index = 0; oResponseP[index]; index++) {
                    if (oResponseP[index].responseText) {
                        var obj = JSON.parse(oResponseP[index].responseText);
                        if (obj.error !== undefined) {
                            msgError += obj.error.message.value + "\r\n";
                            responseHUTrasladado.msgResponse = obj.error.message.value;
                            responseHUTrasladado.msgStatus = "Error";
                        }
                        responseHUTrasladado.colorScheme = 3;
                    } else {
                        responseHUTrasladado.msgResponse = "Se ha realizado el Traslado correctamente";
                        responseHUTrasladado.msgStatus = "Correcto";
                        responseHUTrasladado.colorScheme = 5;
                        msgSuss = "Se ha realizado el Traslado correctamente";
                    }
                }
                for (var index = 0; index < othat.trasladarStock.length; index++) {
                    othat.HUTrasladado.find(function(val2) {
                        if (val2.CodExt == othat.trasladarStock[index].CodExt) {
                            val2.msgResponse = responseHUTrasladado.msgResponse;
                            val2.msgStatus = responseHUTrasladado.msgStatus;
                            val2.colorScheme = responseHUTrasladado.colorScheme;
                        }
                    });
                }
                sap.ui.core.BusyIndicator.hide();
                othat.trasladarStock = [];
                var oModelTrasladarStock = new sap.ui.model.json.JSONModel(othat.trasladarStock);
                othat.getView().setModel(oModelTrasladarStock, "trasladarStock");
                othat.getView().getModel("trasladarStock").refresh();
                var oModelHUTrasladado = new sap.ui.model.json.JSONModel(othat.HUTrasladado);
                othat.getView().setModel(oModelHUTrasladado, "HUTrasladado");
                othat.getView().getModel("HUTrasladado").refresh();
                othat.scope.btnTrasladar = (othat.trasladarStock.length > 0) ? true : false;
                othat.getView().getModel("scope").refresh();
                othat.getView().byId("inpScanStock").setValue('').focus();
                /*
                if (msgSuss !== "") {
                    MessageBox.success(
                        msgSuss, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function(oAction) {
                                othat.onCloseDialogReporteStock();
                                othat.onLoadGuias();
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
                */
            });
        },

        _getDialogReporteStock: function() {
            if (!this.oDialogReporteStock) {
                this.oDialogReporteStock = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.stageModMMPPPrd.fragments.reporteStockEWM', this);
                this.getView().addDependent(this.oDialogReporteStock);
            }
            return this.oDialogReporteStock;
        },

        onCloseDialogReporteStock: function() {
            this._getDialogReporteStock().close();
        },

        onAfterCloseDialogReporteStock: function() {
            var othat = this;
            /*
            if (this.trasladarStock.length > 0) {
                var aDesbloquear = [];
                var msgError = "";
                var msgSuss = "";
                for (var index = 0; index < this.trasladarStock.length; index++) {
                    aDesbloquear.push(this.trasladarStock[index].Exidv);
                }
                var aPromises = this._DesbloquearHUSetPromise(aDesbloquear);
                sap.ui.core.BusyIndicator.show(0);
                Promise.all(aPromises).then(oResponseP => {
                    for (var index = 0; oResponseP[index]; index++) {
                        if (oResponseP[index].responseText) {
                            var obj = JSON.parse(oResponseP[index].responseText);
                            if (obj.error !== undefined) {
                                msgError += obj.error.message.value + "\r\n";
                            }
                        } else {
                            msgSuss = "Se ha desbloqueado: " + othat.trasladarStock[index].Exidv + "\r\n";
                        }
                    }
                    console.log("msgError: " + msgError);
                    console.log("msgSuss: " + msgSuss);
                    sap.ui.core.BusyIndicator.hide();
                });
            }
            */
            othat.onLoadGuias();
        }

    });
});