sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
], function(MessageBox, Controller, formatter) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.trasladarHusEWM.controller.trasladarHusEWM", {

        formatter: formatter,
        dataBus: {},
        scope: {
            "btnTrasladarHU": true,
            "LgplaNueva": ""
        },
        trasladarHU: [],
        HUTrasladado: [],

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "trasladarHusEWMDetailView", this._busSuscribe, this);

            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0004_SRV", { "useBatch": false });
            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelDetail, "detail");

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");

            this.onLoadDetail();
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onLoadDetail: function() {
            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin            
            sap.ui.core.BusyIndicator.show(0);
            this.getView().byId("txtSearchHU").setValue("");
            var othat = this;
            var oModelService = this.getView().getModel('service');
            oModelService.read("/GuiaRemisionSet", {
                urlParameters: { "$expand": "NavHUV2" },
                //DG - Inicio
                filters: [new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, sCentro)],
                //DG - Fin                
                success: function(result, response) {
                    var oModel = new sap.ui.model.json.JSONModel(result.results);
                    othat.getView().setModel(oModel, "detail");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(error) {
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "detail");
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        handleFilterHU: function(event) {
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
                test: function(oValue) {
                    return (oValue.indexOf(sSearch) >= 0);
                }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "NavHUV2",
                test: function(oValue) {
                    if (oValue.results.find(function(val) {
                            return (val.Exidv.indexOf(sSearch) >= 0) || (val.Exidv2.indexOf(sSearch) >= 0);
                        }) !== undefined) {
                        return true;
                    }
                }
            }));
            var oFilter = new sap.ui.model.Filter(aFilters, false);
            oBinding.filter(oFilter);
        },

        onShowTrasladar: function(event) {
            var othat = this;
            this._getDialogTrasladarHU().open();
            var oContext = event.getSource().getBindingContext('detail');
            var aNav = oContext.getProperty('NavHUV2').results;
            var oModel = new sap.ui.model.json.JSONModel(JSON.parse(JSON.stringify(aNav)));
            oModel.getData().map(function(obj) {
                obj.visible = true;
                obj.ModuloDescr = oContext.getProperty('ModuloDescr');
                return obj;
            });
            this.getView().setModel(oModel, "listMaterials");
            this.scope.btnTrasladarHU = false;
            this.scope.LgplaNueva = "";
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
                setTimeout(function() { othat.getView().byId("inpScanHU").setValue('').focus(); }, 800);
            }
            if (this.getView().byId("inpDestinoHU")) {
                this.getView().byId("inpDestinoHU").setValue('');
            }
        },

        onSelectTrasladarHU: function(Exidv2, Exidv) {
            this._ScanHU((Exidv2 !== "") ? Exidv2 : Exidv);
        },

        onScanHU: function() {
            var sHU = this.getView().byId("inpScanHU").getValue().toString();
            this._ScanHU(sHU);
        },

        _ScanHU: function(sHU) {
            if (sHU === "") return;
            var othat = this;
            if (this.trasladarHU.length > 2) {
                sap.m.MessageToast.show("Solo se permite un máximo de 3 HUs en el mismo traslado");
                this.getView().byId("inpDestinoHU").setValue('').focus();
                return;
            }
            var oModel = this.getView().getModel("listMaterials");
            var msgAlert = "";
            var oFinded = oModel.getData().find(function(val) {
                if ((val.Exidv == sHU || val.Exidv2 == sHU) && val.visible) {
                    if (othat.trasladarHU.length > 0) {
                        if (!val.HastaTres) {
                            msgAlert = "El HU no puede ser trasladado junto a otros materiales";
                            return;
                        } else {
                            val.visible = false;
                            return val;
                        }
                    } else {
                        val.visible = false;
                        return val;
                    }
                }
            });
            if (oFinded === undefined) {
                sap.m.MessageToast.show(msgAlert != "" ? msgAlert : "No se encuentra el HU");
                if (msgAlert == "") {
                    this.getView().byId("inpScanHU").setValue('').focus();
                } else {
                    this.getView().byId("inpDestinoHU").setValue('').focus();
                }
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
            this.scope.btnTrasladarHU = (this.trasladarHU.length > 0) ? true : false;
            this.getView().getModel("scope").refresh();
            if (this.trasladarHU.length > 2) {
                this.getView().byId("inpDestinoHU").setValue('').focus();
            } else if (!oFinded.HastaTres) {
                this.getView().byId("inpDestinoHU").setValue('').focus();
            } else {
                this.getView().byId("inpScanHU").setValue('').focus();
            }
        },

        onDeleteTrasladarHU: function(event) {
            var deleteRecord = parseInt(event.getSource().getBindingContext("trasladarHU").getPath().replace("/", ""));
            var othat = this;
            var oModel = this.getView().getModel("listMaterials");
            oModel.getData().find(function(val) {
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
            this.scope.btnTrasladarHU = (this.trasladarHU.length > 0) ? true : false;
            this.getView().getModel("scope").refresh();
        },

        _TrasladarHU: function(index) {
            var othat = this;
            if (!this.trasladarHU[index]) {
                this.trasladarHU = [];
                var oModelTrasladarHU = new sap.ui.model.json.JSONModel(this.trasladarHU);
                this.getView().setModel(oModelTrasladarHU, "trasladarHU");
                this.getView().getModel("trasladarHU").refresh();
                var oModelHUTrasladado = new sap.ui.model.json.JSONModel(this.HUTrasladado);
                this.getView().setModel(oModelHUTrasladado, "HUTrasladado");
                this.getView().getModel("HUTrasladado").refresh();
                this.scope.btnTrasladarHU = (this.trasladarHU.length > 0) ? true : false;
                this.scope.LgplaNueva = "";
                this.getView().getModel("scope").refresh();
                sap.ui.core.BusyIndicator.hide();
                this.getView().byId("inpDestinoHU").setValue('');
                try {
                    var msg = "";
                    for (var i = (this.HUTrasladado.length - index); i < this.HUTrasladado.length; i++) {
                        msg = msg + "HU " + this.HUTrasladado[i].Exidv + " (" + this.HUTrasladado[i].Exidv2 + ")" + " : " + this.HUTrasladado[i].msgResponse + "\r\n";
                    }

                    for (var i = (othat.HUTrasladado.length - index); i < othat.HUTrasladado.length; i++) {
                        var oModel = othat.getView().getModel("listMaterials");
                        var oFinded = oModel.getData().find(function(val) {
                            if ((val.Exidv == othat.HUTrasladado[i].Exidv || val.Exidv2 == othat.HUTrasladado[i].Exidv2) && othat.HUTrasladado[i].msgStatus == "Error") {
                                val.visible = true;
                                return val;
                            }
                        });
                    }
                    othat.getView().getModel("listMaterials").refresh();

                    MessageBox.information(
                        msg, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function(oAction) {}
                        }
                    );
                } catch (error) {
                    console.error(error);
                }
                setTimeout(function() { othat.getView().byId("inpScanHU").setValue('').focus(); }, 400);
                return;
            }
            var oEntry = JSON.parse(JSON.stringify(this.trasladarHU[index]));
            oEntry.Lgpla = this.scope.LgplaNueva;
            delete oEntry.__metadata;
            delete oEntry.ModuloDescr;
            var oModelService = this.getView().getModel('service');
            oModelService.create("/HUV2Set", oEntry, {
                success: async function(oResponse, oHeader) {
                    var data = JSON.parse(JSON.stringify(oEntry));
                    if (oResponse.responseText) {
                        var obj = JSON.parse(oResponse.responseText);
                        if (obj.error !== undefined) {
                            data.msgResponse = obj.error.message.value;
                            data.msgStatus = "Error";
                        }
                        data.colorScheme = 3;
                    } else {
                        data.msgResponse = "Trasladado correctamente";
                        data.msgStatus = "Correcto";
                        data.colorScheme = 5;
                    }
                    othat.HUTrasladado.push(data);
                    var ind = index + 1;
                    othat._TrasladarHU(ind);
                },
                error: function(oError, oHeader) {
                    var data = JSON.parse(JSON.stringify(oEntry));
                    if (oError.responseText) {
                        var obj = JSON.parse(oError.responseText);
                        if (obj.error !== undefined) {
                            data.msgResponse = obj.error.message.value;
                            data.msgStatus = "Error";
                        }
                        data.colorScheme = 3;
                    }
                    othat.HUTrasladado.push(data);
                    var ind = index + 1;
                    othat._TrasladarHU(ind);
                }
            });
        },

        _TrasladarHUv2: function() {
            var othat = this;
            let dataSend = {};
            var oEntry = JSON.parse(JSON.stringify(this.trasladarHU));
            oEntry.map(function(obj) {
                delete obj.__metadata;
                delete obj.ModuloDescr;
                obj.Lgpla = othat.scope.LgplaNueva;
                return obj;
            });
            dataSend.NavHUV2_Deep = oEntry;
            var oModelService = this.getView().getModel('service');
            oModelService.create("/GuiaRemisionSet", dataSend, {
                success: async function(oResponse, oHeader) {
                    oEntry.forEach(function(obj) {
                        var data = JSON.parse(JSON.stringify(obj));
                        if (oResponse.responseText) {
                            var obj = JSON.parse(oResponse.responseText);
                            if (obj.error !== undefined) {
                                data.msgResponse = "";
                                obj.error.innererror.errordetails.find(function(item) {
                                    if (item.message.indexOf(data.Exidv) !== -1) {
                                        data.msgResponse = item.message;
                                    }
                                });
                                data.msgResponse = (data.msgResponse == "") ? obj.error.message.value : data.msgResponse;
                                data.msgStatus = "Error";
                                data.colorScheme = 3;
                            }
                        } else if (oResponse.NavHUV2_Deep) {
                            oResponse.NavHUV2_Deep.results.find(function(item) {
                                if (item.Exidv == data.Exidv && item.Exidv2 == data.Exidv2) {
                                    if (item.Aenam == "OK") {
                                        data.msgResponse = "Trasladado correctamente";
                                        data.msgStatus = "Correcto";
                                        data.colorScheme = 5;
                                    } else {
                                        data.msgResponse = "Surgió un error en el traslado";
                                        data.msgStatus = "Error";
                                        data.colorScheme = 3;
                                    }
                                    return item;
                                }
                            });
                        } else {
                            data.msgResponse = "Surgió un error en el traslado";
                            data.msgStatus = "Error";
                            data.colorScheme = 3;
                        }
                        othat.HUTrasladado.push(data);
                    });
                    othat._TrasladarHUv2Show();
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(oError, oHeader) {
                    oEntry.forEach(function(obj) {
                        var data = JSON.parse(JSON.stringify(obj));
                        if (oError.responseText) {
                            var obj = JSON.parse(oError.responseText);
                            if (obj.error !== undefined) {
                                data.msgResponse = "";
                                obj.error.innererror.errordetails.find(function(item) {
                                    if (item.message.indexOf(data.Exidv) !== -1) {
                                        data.msgResponse = item.message;
                                    }
                                });
                                data.msgResponse = (data.msgResponse == "") ? obj.error.message.value : data.msgResponse;
                                data.msgStatus = "Error";
                                data.colorScheme = 3;
                            }
                        } else if (oError.NavHUV2_Deep) {
                            oError.NavHUV2_Deep.results.find(function(item) {
                                if (item.Exidv == data.Exidv && item.Exidv2 == data.Exidv2) {
                                    if (item.Aenam == "OK") {
                                        data.msgResponse = "Trasladado correctamente";
                                        data.msgStatus = "Correcto";
                                        data.colorScheme = 5;
                                    } else {
                                        data.msgResponse = "Surgió un error en el traslado";
                                        data.msgStatus = "Error";
                                        data.colorScheme = 3;
                                    }
                                    return item;
                                }
                            });
                        } else {
                            data.msgResponse = "Surgió un error en el traslado";
                            data.msgStatus = "Error";
                            data.colorScheme = 3;
                        }
                        othat.HUTrasladado.push(data);
                    });
                    othat._TrasladarHUv2Show();
                    sap.ui.core.BusyIndicator.hide();
                }
            });

        },

        _TrasladarHUv2Show: function() {
            let othat = this;
            let index = othat.trasladarHU.length;
            othat.trasladarHU = [];
            var oModelTrasladarHU = new sap.ui.model.json.JSONModel(othat.trasladarHU);
            othat.getView().setModel(oModelTrasladarHU, "trasladarHU");
            othat.getView().getModel("trasladarHU").refresh();
            var oModelHUTrasladado = new sap.ui.model.json.JSONModel(othat.HUTrasladado);
            othat.getView().setModel(oModelHUTrasladado, "HUTrasladado");
            othat.getView().getModel("HUTrasladado").refresh();
            othat.scope.btnTrasladarHU = (othat.trasladarHU.length > 0) ? true : false;
            othat.scope.LgplaNueva = "";
            othat.getView().getModel("scope").refresh();
            othat.getView().byId("inpDestinoHU").setValue('');
            try {
                var msg = "";
                for (var i = (othat.HUTrasladado.length - index); i < othat.HUTrasladado.length; i++) {
                    msg = msg + "HU " + othat.HUTrasladado[i].Exidv + " (" + othat.HUTrasladado[i].Exidv2 + ")" + " : " + othat.HUTrasladado[i].msgResponse + "\r\n";
                }

                for (var i = (othat.HUTrasladado.length - index); i < othat.HUTrasladado.length; i++) {
                    var oModel = othat.getView().getModel("listMaterials");
                    var oFinded = oModel.getData().find(function(val) {
                        if ((val.Exidv == othat.HUTrasladado[i].Exidv || val.Exidv2 == othat.HUTrasladado[i].Exidv2) && othat.HUTrasladado[i].msgStatus == "Error") {
                            val.visible = true;
                            return val;
                        }
                    });
                }
                othat.getView().getModel("listMaterials").refresh();

                MessageBox.information(
                    msg, {
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oAction) {}
                    }
                );
            } catch (error) {
                console.error(error);
            }
            setTimeout(function() { othat.getView().byId("inpScanHU").setValue('').focus(); }, 400);
        },

        onTrasladarHU: function() {
            let othat = this;
            if (this.trasladarHU.length <= 0) return;
            if (this.getView().byId("inpDestinoHU").getValue().toString() === "") {
                sap.m.MessageToast.show("Es necesario el Destino HU");
                othat.getView().byId("inpDestinoHU").setValue('').focus();
                return;
            }
            sap.ui.core.BusyIndicator.show(0);

            this._TrasladarHUv2();
            //this._TrasladarHU(0);
        },

        _getDialogTrasladarHU: function() {
            if (!this.oDialogTrasladarHU) {
                this.oDialogTrasladarHU = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.trasladarHusEWM.fragments.trasladarHU', this);
                this.getView().addDependent(this.oDialogTrasladarHU);
            }
            return this.oDialogTrasladarHU;
        },

        onCloseDialogTrasladarHU: function() {
            this._getDialogTrasladarHU().close();
        },

        onAfterCloseDialogTrasladarHU: function() {
            this.onLoadDetail();
        }

    });
});