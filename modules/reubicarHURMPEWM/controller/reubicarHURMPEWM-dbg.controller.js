sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
], function(MessageBox, Controller, formatter) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.reubicarHURMPEWM.controller.reubicarHURMPEWM", {

        formatter: formatter,
        dataBus: {},
        scope: {
            "inpScanHU": "",
            "inpDestinoHU": "",
            "btnReubicar": false
        },
        ReubicarHU: [],
        HUReubicado: [],
        oView: new Object(),
        idMasterDialog: "reubicarHURMPEWMView",

        initDialog: function(othat) {
            this.oView = othat;
        },

        onCreateMasterDialog: function() {
            this.onInit();
        },

        onAfterCloseMasterDialog: function() {
            //se limpia los datos y se destruye el dialog
            this.oView.getView().setModel(null, "ReubicarHU");
            this.oView.getView().setModel(null, "HUReubicado");
            this.oView.getView().setModel(null, "scope");
            this.oView.closeSplitDialogRouter(this.idMasterDialog, function() {
                console.log('cerrado');
            });
        },

        onCloseMasterDialog: function() {
            this.oView._Fragmento[this.idMasterDialog].close();
        },

        onInit: function() {
            /*
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "reubicarHURMPEWMView", this._busSuscribe, this);
            */
            let othat = this;

            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0021_SRV", { "useBatch": false });
            othat.oView.getView().setModel(oModelService, "service");

            othat._cleanAll(true);
        },

        /*
        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.oView.getView().destroy();
        },
        */

        onScanHU: function() {
            let othat = this;

            if (othat.scope.inpScanHU === "") {
                return;
            }

            sap.ui.core.BusyIndicator.show(0);

            var oModelService = othat.oView.getView().getModel('service');

            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;

            // oModelService.read("/ObtenerDatosDeUbicacionSet('" + othat.scope.inpScanHU + "')", {
            oModelService.read(`/ObtenerDatosDeUbicacionSet(I_HUIDENT='${othat.scope.inpScanHU}',I_WERKS='${sCentro}')`, {
                //DG - Fin
                success: function(result, response) {
                    sap.ui.core.BusyIndicator.hide();

                    var msgError = othat._processErrorOdata(result);

                    if (msgError != "") {
                        MessageBox.error(msgError, {
                            onClose: function() {
                                othat._cleanInpScanHU(true);
                            },
                            styleClass: "sapUiSizeCompact"
                        });
                        return;
                    }

                    if (result.I_HUIDENT === undefined) {
                        sap.m.MessageToast.show("No se encuentra el HU");
                        othat._cleanInpScanHU(true);
                        return;
                    }

                    if (othat.ReubicarHU.length > 2) {
                        sap.m.MessageToast.show("Solo se permite reubicar un máximo de 3 HUs");
                        othat._cleanInpScanHU(false);
                        othat._cleaninpDestinoHU(true);
                        return;
                    }

                    if (result.HASTA_TRES != "X" && othat.ReubicarHU.length > 0) {
                        sap.m.MessageToast.show("El HU no puede ser reubicado junto a otros materiales");
                        othat._cleanInpScanHU(true);
                        return;
                    }

                    if (othat.ReubicarHU[0] && othat.ReubicarHU[0].HASTA_TRES != "X") {
                        sap.m.MessageToast.show("El HU no puede ser reubicado junto a otros materiales");
                        othat._cleanInpScanHU(false);
                        othat._cleaninpDestinoHU(true);
                        return;
                    }

                    var oFinded = othat.ReubicarHU.find(function(val) {
                        if (val.I_HUIDENT == result.I_HUIDENT) {
                            return val;
                        }
                    });

                    if (oFinded !== undefined) {
                        sap.m.MessageToast.show("El HU ya existe en el listado a reubicar");
                        othat._cleanInpScanHU(true);
                        return;
                    }

                    let oHUAdd = JSON.parse(JSON.stringify(result));

                    delete oHUAdd.__metadata;

                    if (oHUAdd.FUNDO_DESCRIP == "") {
                        oHUAdd.FUNDO_DESCRIP = oHUAdd.FUNDO;
                    }

                    othat.ReubicarHU.push(oHUAdd);
                    othat.scope.btnReubicar = (othat.ReubicarHU.length > 0) ? true : false;

                    if (othat.HUReubicado.length > 0) {
                        othat.HUReubicado = [];
                    }

                    othat._reloadModelsTables();

                    if (othat.ReubicarHU.length > 2) {
                        othat._cleanInpScanHU(false);
                        othat._cleaninpDestinoHU(true);
                    } else if (othat.ReubicarHU[0] && othat.ReubicarHU[0].HASTA_TRES != "X") {
                        othat._cleanInpScanHU(false);
                        othat._cleaninpDestinoHU(true);
                    } else {
                        othat._cleanInpScanHU(true);
                    }
                },
                error: function(error) {
                    sap.ui.core.BusyIndicator.hide();

                    var msgError = othat._processErrorOdata(error);

                    if (msgError != "") {
                        MessageBox.error(msgError, {
                            onClose: function() {
                                othat._cleanInpScanHU(true);
                            },
                            styleClass: "sapUiSizeCompact"
                        });
                    }
                }
            });
        },

        onDeleteReubicarHU: function(event) {
            var deleteRecord = parseInt(event.getSource().getBindingContext("ReubicarHU").getPath().replace("/", ""));

            let othat = this;

            othat.ReubicarHU.splice(deleteRecord, 1);
            othat._reloadModelsTables();

            othat.scope.btnReubicar = (othat.ReubicarHU.length > 0) ? true : false;
            othat._cleanInpScanHU(false);
        },

        onReubicar: async function() {
            //SCH - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //SCH - Inicio

            let othat = this;

            if (othat.ReubicarHU.length <= 0) {
                return;
            }

            if (othat.scope.inpDestinoHU === "") {
                return;
            }

            sap.ui.core.BusyIndicator.show(0);

            let arrPromises = [];
            const oModelService = othat.oView.getView().getModel('service');

            othat.ReubicarHU.forEach(function(element) {
                let dataSend = {};

                //dataSend.I_HUIDENT = element.I_HUIDENT;
                dataSend.I_HUIDENT = element.HUIDENT;
                dataSend.I_LGNUM = element.LGNUM;
                dataSend.I_LGTYP = element.LGTYP;
                dataSend.I_UBICACION_ORIGEN = element.LGPLA;
                dataSend.I_UBICACION_DESTINO = othat.scope.inpDestinoHU;
                dataSend.I_CAT = element.CAT;
                dataSend.I_WERKS = sCentro; //SCH

                let dataShowTable = {};
                dataShowTable.I_HUIDENT = element.I_HUIDENT;
                dataShowTable.MAKTX = element.MAKTX;
                dataShowTable.I_UBICACION_ORIGEN = element.LGPLA;
                dataShowTable.I_UBICACION_DESTINO = othat.scope.inpDestinoHU;

                arrPromises.push(_ => new Promise((resolve, reject) => {
                    oModelService.create("/ReubicarHUSet", dataSend, {
                        success: async function(oResponse, oHeader) {
                            let data = JSON.parse(JSON.stringify(dataShowTable));
                            let msgError = othat._processErrorOdata(oResponse);

                            if (msgError != "") {
                                data.msgResponse = msgError;
                                data.msgStatus = "Error";
                                data.colorScheme = 3;
                            } else if (oResponse.responseText) {
                                var obj = JSON.parse(oResponse.responseText);

                                if (obj.error !== undefined) {
                                    data.msgResponse = obj.error.message.value;
                                    data.msgStatus = "Error";
                                }

                                data.colorScheme = 3;
                            } else {
                                data.msgResponse = "Reubicado correctamente";
                                data.msgStatus = "Correcto";
                                data.colorScheme = 5;
                            }

                            resolve(data);
                        },
                        error: function(oError) {
                            var data = JSON.parse(JSON.stringify(dataShowTable));
                            let msgError = othat._processErrorOdata(oError);

                            if (msgError != "") {
                                data.msgResponse = msgError;
                                data.msgStatus = "Error";
                                data.colorScheme = 3;
                            } else if (oError.responseText) {
                                var obj = JSON.parse(oError.responseText);

                                if (obj.error !== undefined) {
                                    data.msgResponse = obj.error.message.value;
                                    data.msgStatus = "Error";
                                }

                                data.colorScheme = 3;
                            }

                            resolve(data);
                        }
                    });
                }));
            });

            let responses = [];

            for (let promise of arrPromises) {
                responses.push(await promise());
            }

            responses.forEach(element => {
                if (element) {
                    othat.HUReubicado.push(element);
                }
            });

            sap.ui.core.BusyIndicator.hide();

            othat._cleanAll(false);
        },

        _cleanAll: function(cleanReubicado = true) {
            let othat = this;

            othat.scope = {
                "inpScanHU": "",
                "inpDestinoHU": "",
                "btnReubicar": false
            };

            othat.ReubicarHU = [];

            if (cleanReubicado) {
                othat.HUReubicado = [];
            }

            othat._reloadModelsTables();
            othat._cleanInpScanHU(true);
        },

        _cleanInpScanHU: function(focus = true) {
            let othat = this;

            othat.scope.inpScanHU = "";
            othat.oView.getView().setModel(new sap.ui.model.json.JSONModel(othat.scope), "scope");

            if (focus) {
                setTimeout(function() {
                    othat.oView.getView().byId("inpScanHU").focus();
                }, 500);
            }
        },

        _cleaninpDestinoHU: function(focus = true) {
            let othat = this;

            othat.scope.inpDestinoHU = "";
            othat.oView.getView().setModel(new sap.ui.model.json.JSONModel(othat.scope), "scope");

            if (focus) {
                setTimeout(function() {
                    othat.oView.getView().byId("inpDestinoHU").focus();
                }, 500);
            }
        },

        _reloadModelsTables: function() {
            let othat = this;

            othat.oView.getView().setModel(new sap.ui.model.json.JSONModel(othat.ReubicarHU), "ReubicarHU");
            othat.oView.getView().getModel("ReubicarHU").refresh();

            othat.oView.getView().setModel(new sap.ui.model.json.JSONModel(othat.HUReubicado), "HUReubicado");
            othat.oView.getView().getModel("HUReubicado").refresh();
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