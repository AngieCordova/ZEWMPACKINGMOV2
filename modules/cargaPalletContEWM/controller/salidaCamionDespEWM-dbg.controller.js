sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/layout/VerticalLayout",
    "sap/m/Label",
], function(MessageBox, Controller, formatter, Dialog, DialogType, Button, ButtonType, Text, HorizontalLayout, VerticalLayout, Label) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.cargaPalletContEWM.controller.salidaCamionDespEWM", {

        formatter: formatter,
        dataBus: {},
        scope: {},

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "salidaCamionDespEWMView", this._busSuscribe, this);

            //var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0010_SRV", { defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put, "useBatch": false });
            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0010_SRV", { "useBatch": false });
            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelDetail, "camiones");

            this.scope.filtroSalida = "Mostrar sin salidas";
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.getView().getModel("scope").refresh();

            this.onLoadCamiones();
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onLoadCamiones: function() {
            sap.ui.core.BusyIndicator.show(0);
            this.getView().byId("txtSearchOrdenes").setValue("");
            var othat = this;
            var oModelService = this.getView().getModel('service');
            /// GE 25-11-2024
            
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oFilter = new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro);
            var oFiltros = [                
                oFilter
            ];
            ///GE 25-11-2024 ///
            oModelService.read("/ContenedoresSet", {
            	filters: oFiltros,
                success: function(result, response) {
                    /*
                    var i = 0;
                    while (i < result.results.length) {
                        if (result.results[i].Estado == "") {
                            result.results.splice(i, 1);
                        } else {
                            ++i;
                        }
                    }
                    */
                    var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.getView().setModel(oModel, "camiones");
                    othat.scope.filtroSalida = "Mostrar sin salidas";
                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");
                    othat.getView().getModel("scope").refresh();
                    othat.handleFilterSalida();
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(error) {
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "camiones");
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        handleFilterOrdenes: function(event) {
            var othat = this;
            var sSearch = event.getSource().getValue().toString();
            var oBinding = this.getView().byId("idCamionesTable").getBinding("items");
            if (sSearch === "") {
                var oFilter = [
                    new sap.ui.model.Filter([
                        new sap.ui.model.Filter("Estado", function(sEstado) {
                            if (othat.scope.filtroSalida !== "Mostrar solo salidas") {
                                return (sEstado.toUpperCase() === "ORGANIZADO") ? true : false;
                            } else {
                                return (sEstado.toUpperCase() !== "ORGANIZADO") ? true : false;
                            }
                        })
                    ], true)
                ];
                oBinding.filter(oFilter);
                return;
            }
            var oFilter = [
                new sap.ui.model.Filter([
                    new sap.ui.model.Filter("IdPedido", function(sIdPedido) {
                        return (sIdPedido || "").toUpperCase().indexOf(sSearch.toUpperCase()) > -1;
                    }),
                    new sap.ui.model.Filter("IdContenedor", function(sIdContenedor) {
                        return (sIdContenedor || "").toUpperCase().indexOf(sSearch.toUpperCase()) > -1;
                    })
                    /*,
                                        new sap.ui.model.Filter("IdTransporte", function(sIdTransporte) {
                                            return (sIdTransporte || "").toUpperCase().indexOf(sSearch.toUpperCase()) > -1;
                                        })*/
                ], false),
                new sap.ui.model.Filter([
                    new sap.ui.model.Filter("Estado", function(sEstado) {
                        if (othat.scope.filtroSalida !== "Mostrar solo salidas") {
                            return (sEstado.toUpperCase() === "ORGANIZADO") ? true : false;
                        } else {
                            return (sEstado.toUpperCase() !== "ORGANIZADO") ? true : false;
                        }
                    })
                ], true)
            ];
            oBinding.filter(oFilter);
        },

        handleFilterSalida: function() {
            var othat = this;
            othat.getView().byId("txtSearchOrdenes").setValue("");
            var oBinding = this.getView().byId("idCamionesTable").getBinding("items");
            var oFilter = [
                new sap.ui.model.Filter([
                    new sap.ui.model.Filter("Estado", function(sEstado) {
                        if (othat.scope.filtroSalida == "Mostrar solo salidas") {
                            return (sEstado.toUpperCase() === "ORGANIZADO") ? true : false;
                        } else {
                            return (sEstado.toUpperCase() !== "ORGANIZADO") ? true : false;
                        }
                    })
                ], false)
            ];
            oBinding.filter(oFilter);
            if (othat.scope.filtroSalida == "Mostrar solo salidas") {
                othat.scope.filtroSalida = "Mostrar sin salidas";
            } else {
                othat.scope.filtroSalida = "Mostrar solo salidas";
            }
            var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
            othat.getView().setModel(oModelScope, "scope");
            othat.getView().getModel("scope").refresh();
        },

        onReporteCamionShow: function(event) {
            this._getDialogReporteCamion().open();
            var oContext = event.getSource().getBindingContext('camiones');
            this.scope.IdPedido = oContext.getProperty('IdPedido');
            this.scope.Conductor = oContext.getProperty('Condutor');
            this.scope.Licencia = oContext.getProperty('Licencia');
            this.scope.IdEmpresa = oContext.getProperty('IdEmpresa');
            this.scope.Empresa = oContext.getProperty('Empresa');
            this.scope.Placa = oContext.getProperty('Placa');
            this.scope.Puerta = oContext.getProperty('Puerta');
            this.scope.IdTransporte = oContext.getProperty('IdTransporte');
            this.scope.Estado = oContext.getProperty('Estado');
            this.scope.NroOrden = oContext.getProperty('NroOrden');
            this.scope.IdViaje = oContext.getProperty('IdViaje');
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.getView().getModel("scope").refresh();
        },

        onSalidaCamion: function(sZonaFull) {            
            if (this.scope.Estado != "Cargado") {
                sap.m.MessageToast.show("No se puede dar salida a un Camión con estado " + this.scope.Estado);
                return;
            }
            var othat = this;
            var msg;
            var titleWin;
            var textButton;
            if(sZonaFull === "X"){
            	msg = "¿Desea dar Ingreso a Zona Full?";
                titleWin = "Ingreso a Zona Full";
                textButton ="Ingreso Full";
            }
            else {
            	msg = "¿Desea dar Salida al Camión?";
                titleWin = "Salida de Camión";
                textButton ="Dar Salida";
            }
            
            var oApproveDialog = new Dialog({
                type: DialogType.Message,
                title: titleWin, //"Salida de Camión",
                content: new Text({ text: msg }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text:  textButton, //'Dar Salida',
                    press: function() {
                        othat._onSalidaCamion(sZonaFull);
                        oApproveDialog.close();
                    }
                }),
                endButton: new Button({
                    text: 'Cancelar',
                    press: function() {
                        oApproveDialog.close();
                    }
                }),
                afterClose: function() {
                    oApproveDialog.destroy();
                }
            });
            oApproveDialog.open();
        },

        _onSalidaCamion: function(sZonaFull) {
            sap.ui.core.BusyIndicator.show(0);
            //var oModelService = this.getView().getModel('service');
            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0010_SRV", { defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put, "useBatch": false });
            var othat = this;
            var data = {};
            data.IdPedido = this.scope.IdPedido;
            data.IdTransporte = this.scope.IdTransporte;
            data.IsZonaFull = sZonaFull;
            oModelService.update("/ContenedorSet(IdPedido='" + data.IdPedido + "',IdTransporte='" + data.IdTransporte + "')", data, {
                success: async function(oResponse, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    var msgError = othat._processErrorOdata(oResponse);
                    if (msgError != "") {
                        MessageBox.error(
                            msgError, {
                                styleClass: "sapUiSizeCompact",
                                onClose: function(oAction) {}
                            }
                        );
                    } else {
                        othat.onCloseDialogReporteCamion();
                    }
                },
                error: function(oError, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    var msgError = othat._processErrorOdata(oError);
                    MessageBox.error(
                        msgError, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function(oAction) {}
                        }
                    );
                }
            });
        },

        _getDialogReporteCamion: function() {
            if (!this.oDialogReporteCamion) {
                this.oDialogReporteCamion = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.cargaPalletContEWM.fragments.reporteCamion', this);
                this.getView().addDependent(this.oDialogReporteCamion);
            }
            return this.oDialogReporteCamion;
        },

        onCloseDialogReporteCamion: function() {
            this._getDialogReporteCamion().close();
        },

        onAfterCloseDialogReporteCamion: function() {
            this.onLoadCamiones();
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
                                    if (msgReturn != "") { return msgReturn; }
                                }
                            }
                        }
                        if (obj.error.message) {
                            return obj.error.message.value
                        }
                    }
                }
                if (error.message) {
                    return error.message.value
                }
            }
            return "";
        }

    });
});