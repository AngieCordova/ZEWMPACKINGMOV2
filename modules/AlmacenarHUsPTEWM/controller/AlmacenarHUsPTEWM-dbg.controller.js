sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter"
], function (MessageBox, Controller, formatter) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.AlmacenarHUsPTEWM.controller.AlmacenarHUsPTEWM", {

        formatter: formatter,
        dataBus: {},
        scope: {
            "btnTrasladarHU": true,
            "msgInfoHUs": "",
            "totalTareasPallets": 0,
            "btnPalletCHEP": false, //8000024143
            "exidv2": "",//8000024143
        },
        trasladarHU: [],
        HUTrasladado: [],
        oPalletCHEP: [],  //8000024143

        onInit: function () {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "AlmacenarHUsPTEWMDetailView", this._busSuscribe, this);

            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0014_SRV", { "useBatch": false });
            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelDetail, "detail");

            //INI //8000024143
            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0026_SRV", { "useBatch": false });
            this.getView().setModel(oModelService, "service2");

            //FIN //8000024143

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
            sap.ui.core.BusyIndicator.show(0);
            this.getView().byId("txtSearchHU").setValue("");
            var othat = this;
            this.scope.totalTareasPallets = 0;
            var oModelService = this.getView().getModel('service');

            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin

            oModelService.read("/MoverPaletsSet", {
                //DG - Inicio
                filters: [new sap.ui.model.Filter("IWerks", sap.ui.model.FilterOperator.EQ, sCentro)],
                //DG - Fin
                urlParameters: { "$expand": "HUSet" },
                success: function (result, response) {
                    var oModel = new sap.ui.model.json.JSONModel(result);

                    //SCH-Inicio
                    var zero = "0";

                    oModel.oData.results.forEach(valor => {
                        var length = valor.Exidv2.toString().length;
                        valor.Exidv2 = (zero.repeat(20 - length)) + valor.Exidv2;

                        valor.HUSet.results.forEach(valores => {
                            var length_2 = valores.Exidv2.toString().length;
                            valores.Exidv2 = (zero.repeat(20 - length_2)) + valores.Exidv2;
                        });
                    });
                    //SCH-Fin

                    oModel.setSizeLimit(result.results.length);
                    othat.getView().setModel(oModel, "detail");
                    othat.scope.totalTareasPallets = result.__count;

                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");

                    sap.ui.core.BusyIndicator.hide();
                },
                error: function (error) {
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "detail");

                    console.log(error);

                    othat.scope.totalTareasPallets = 0;

                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");

                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        handleFilterHU: function (event) {
            var sSearch = event.getSource().getValue().toString().toUpperCase();
            var oBinding = this.getView().byId("idHUTable").getBinding("items");

            if (sSearch === "") {
                oBinding.filter([]);
                this.scope.totalTareasPallets = oBinding.aIndices.length;

                var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
                this.getView().setModel(oModelScope, "scope");

                return;
            }

            var aFilters = [];

            aFilters.push(new sap.ui.model.Filter({
                path: "Item",
                test: function (oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "Exidv2",
                test: function (oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "TipoPal",
                test: function (oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "OrdenViaje",
                test: function (oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "Envase",
                test: function (oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "Exportador",
                test: function (oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "Categoria",
                test: function (oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "Destino",
                test: function (oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            aFilters.push(new sap.ui.model.Filter({
                path: "Cajas",
                test: function (oValue) {
                    return oValue.toString().toUpperCase().indexOf(sSearch) >= 0;
                }
            }));

            var oFilter = new sap.ui.model.Filter(aFilters, false);
            oBinding.filter(oFilter);

            this.scope.totalTareasPallets = oBinding.aIndices.length;

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
        },

        onShowHUs: function (event) {
            var othat = this;

            //SCH - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //SCH - Fin

            // 8000024143-Pallet CHEP
            var oModelService = othat.getView().getModel('service');

            //SCH - Inicio
            //SCH  oModelService.read("/AutorizacionCHEPSet('X')", {
            oModelService.read("/AutorizacionCHEPSet(I_USER='X',I_WERKS='" + sCentro + "')", {
                //SCH - Fin
                success: function (result, response) {
                    var ind_habilitado = result.O_HABILITADO;
                    othat.scope.btnPalletCHEP = ind_habilitado === 'X' ? true : false;

                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");

                    debugger;
                },
                error: function (error) {
                    console.log(error);
                }
            });
            // 8000024143-Pallet CHEP

            this._getDialogTrasladarHU().open();

            var oContext = event.getSource().getBindingContext('detail');
            this.scope.dataDetail = JSON.parse(JSON.stringify(oContext.getObject()));
            this.scope.msgInfoHUs = "";

            var aNav = oContext.getProperty('HUSet').results;
            var oModel = new sap.ui.model.json.JSONModel(JSON.parse(JSON.stringify(aNav)));

            oModel.getData().map(function (obj) {
                if (obj.Inhalt != "") {
                    othat.scope.msgInfoHUs = obj.Inhalt;
                }
                return obj;
            });

            this.getView().setModel(oModel, "listMaterials");

            this.scope.exidv2 = aNav[0].Exidv2; // 8000024143-Pallet CHEP
            this.scope.btnTrasladarHU = true;

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");

            //clean fragment
            if (this.getView().byId("inpScanHU")) {
                setTimeout(function () {
                    othat.getView().byId("inpScanHU").setValue('').focus();
                }, 800);
            }
        },

        //INI 8000024143-Pallet CHEP
        onShowPalletCHEP: function (event) {
            var othat = this;

            this._getDialogPalletCHEP().open();
            othat.oPalletCHEP = [];

            var exidv2 = othat.scope.exidv2;
            var oModelService = othat.getView().getModel('service2');

            oModelService.read("/PalletCHEPSet('" + exidv2 + "')", {
                success: function (result, response) {
                    var tipo_paleta = result.TIPO_PALETA;
                    var id2 = result.ID2;
                    var ind_chep = result.IND_PALLET_CHEP;

                    othat.oPalletCHEP.push({
                        "ID2": id2,
                        "TIPO_PALETA": tipo_paleta,
                        "IND_PALLET_CHEP": ind_chep
                    });

                    var oModelPalletCHEP = new sap.ui.model.json.JSONModel(othat.oPalletCHEP);
                    othat.getView().setModel(oModelPalletCHEP, "palletCHEP");
                },
                error: function (error) {
                    console.log(error);
                }
            });
        },

        _getDialogPalletCHEP: function () {
            if (!this.getDialogPalletCHEP) {
                this.getDialogPalletCHEP = sap.ui.xmlfragment(
                    this.getView().getId(),
                    'AvocadoProyecto.AvocadoProyecto.modules.AlmacenarHUsPTEWM.fragments.palletCHEP',
                    this
                );
                this.getView().addDependent(this.getDialogPalletCHEP);
            }

            return this.getDialogPalletCHEP;
        },

        onCloseDialogPalletCHEP: function () {
            this._getDialogPalletCHEP().close();
        },

        onGuardarPalletCHEP: function () {
            var othat = this;
            var mensaje_exito = "Se modificó correctamente campo Gr.un.manip.3 en HU " + this.scope.exidv2;

            var oTabla = this.getView().byId("tablePCHEP");
            var aItems = oTabla.getItems();

            //Solo va a haber una línea
            var oItem = aItems[0];
            var aCeldas = oItem.getCells();
            var oCeldaCheckbox = aCeldas[2];

            //Obtener el valor
            var sSeleccionada = "";

            if (oCeldaCheckbox.getSelected()) {
                sSeleccionada = "X";
            }

            var oJson = {
                "ID2": this.scope.exidv2,
                "TIPO_PALETA": "",
                "IND_PALLET_CHEP": sSeleccionada
            };

            var oModelService = this.getView().getModel('service2');

            oModelService.create("/GuardarPalletCHEPSet", oJson, {
                success: async function (oResponse, oHeader) {
                    sap.ui.core.BusyIndicator.hide();

                    var msgError = othat._processErrorOdata(oResponse);

                    if (msgError != "") {
                        MessageBox.error(msgError, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function (oAction) {
                                othat.onCloseDialogTrasladarHU();
                            }
                        });
                    } else {
                        MessageBox.success(mensaje_exito, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function (oAction) {
                                othat.onCloseDialogPalletCHEP();
                            }
                        });
                    }
                },
                error: function (oError, oHeader) {
                    sap.ui.core.BusyIndicator.hide();

                    var msgError = othat._processErrorOdata(oError);

                    MessageBox.error(msgError, {
                        styleClass: "sapUiSizeCompact",
                        onClose: function (oAction) {
                            othat.onCloseDialogPalletCHEP();
                        }
                    });
                }
            });
        },

        //FIN 8000042143-Pallet CHEP

        onScanHU: function () {
            //INI TKT 8000022166 - Restricción aceptación de saldos
            //04.04.2025-SCH-Validar solo si es centro 1401 y cultivo <> 'PA'
            var sCultivo = "  ";
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;

            var sHU2 = this.getView().byId("inpScanHU").getValue().toString();

            if (this.scope.dataDetail.HUSet.results.find(function (val) {
                return (val.Exidv == sHU2) || (val.Exidv2 == sHU2);
            }) == undefined) {
                sap.m.MessageToast.show("No se encuentra el HU escaneado");
                return;
            } else {
                //Obtiene el cultivo de la primera posición
                this.scope.dataDetail.HUSet.results.some(valor => {
                    sCultivo = valor.Matnr.substring(3, 5);
                    return true;
                });
            }

            if (this.scope.dataDetail.TipoPal == 'SALDO' &&
                sCentro == '1401' &&
                sCultivo == 'PA') {
                sap.m.MessageToast.show("IMPOSIBLE ACEPTAR SALDOS EN EWM");
            } else {
                this.onTrasladarHU();
            }
        },

        //INI TKT 8000022166 - Restricción aceptación de saldos
        onEvaluaTrasladoHU: function () {
            //04.04.2025-SCH-Validar solo si es centro 1401 y cultivo <> 'PA'
            var sCultivo = "  ";
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var sHU = this.getView().byId("inpScanHU").getValue().toString();

            if (this.scope.dataDetail.HUSet.results.find(function (val) {
                return (val.Exidv == sHU) || (val.Exidv2 == sHU);
            }) == undefined) {
                sap.m.MessageToast.show("No se encuentra el HU escaneado");
                return;
            } else {
                //Obtiene el cultivo de la primera posición
                this.scope.dataDetail.HUSet.results.some(valor => {
                    sCultivo = valor.Matnr.substring(3, 5);
                    return true;
                });
            }

            if (this.scope.dataDetail.TipoPal == 'SALDO' &&
                sCentro == '1401' &&
                sCultivo == 'PA') {
                sap.m.MessageToast.show("IMPOSIBLE ACEPTAR SALDOS EN EWM");
            } else {
                this.onTrasladarHU();
            }
        },
        //FIN TKT 8000022166 - Restricción aceptación de saldos

        onTrasladarHU: function () {
            sap.ui.core.BusyIndicator.show(0);

            var othat = this;
            var data = {};
            var HUSet = [];

            data = JSON.parse(JSON.stringify(this.scope.dataDetail));
            HUSet = JSON.parse(JSON.stringify(data.HUSet.results));

            delete data.__metadata;
            delete data.HUSet;

            data.HUSet = HUSet;

            for (var index = 0; index < data.HUSet.length; index++) {
                data.HUSet[index].FechaProd = null;
                delete data.HUSet[index].__metadata;
            }

            var oModelService = this.getView().getModel('service');

            oModelService.create("/MoverPaletsSet", data, {
                success: async function (oResponse, oHeader) {
                    sap.ui.core.BusyIndicator.hide();

                    var msgError = othat._processErrorOdata(oResponse);

                    if (msgError != "") {
                        MessageBox.error(msgError, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function (oAction) {
                                othat.onCloseDialogTrasladarHU();
                            }
                        });
                    } else {
                        MessageBox.success("Se ha realizado el traslado correctamente", {
                            styleClass: "sapUiSizeCompact",
                            onClose: function (oAction) {
                                othat.onCloseDialogTrasladarHU();
                            }
                        });
                    }
                },
                error: function (oError, oHeader) {
                    sap.ui.core.BusyIndicator.hide();

                    var msgError = othat._processErrorOdata(oError);

                    MessageBox.error(msgError, {
                        styleClass: "sapUiSizeCompact",
                        onClose: function (oAction) {
                            othat.onCloseDialogTrasladarHU();
                        }
                    });
                }
            });
        },

        _getDialogTrasladarHU: function () {
            if (!this.oDialogTrasladarHU) {
                this.oDialogTrasladarHU = sap.ui.xmlfragment(
                    this.getView().getId(),
                    'AvocadoProyecto.AvocadoProyecto.modules.AlmacenarHUsPTEWM.fragments.trasladarHU',
                    this
                );
                this.getView().addDependent(this.oDialogTrasladarHU);
            }

            return this.oDialogTrasladarHU;
        },

        onCloseDialogTrasladarHU: function () {
            this._getDialogTrasladarHU().close();
        },

        onAfterCloseDialogTrasladarHU: function () {
            this.onLoadDetail();
        },

        _processErrorOdata: function (error) {
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