sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "./MensajesObject",
    "sap/ui/model/json/JSONModel",
], function(Controller, formatter, MensajesObject, JSONModel) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.strageout.controller.Details", {

        formatter: formatter,
        dataBus: {},

        oVenum: "",
        oExidv: "",
        oExidv2: "",
        oPaletsxEnvase: [], //TKT 8000018866


        onInit: function() {
            // Se crea la suscripción al canal
            var othat = this;
            const oView = this.getView();
            var bus = sap.ui.getCore().getEventBus();

            bus.subscribe("splitApp", "StageOutPalletDetailsView", this._busSuscribe, this);

            $("#form_container-escanear_pallet").css("padding-bottom", "0px !important");
            $("#form_container-escanear_ubicacion").css("padding-bottom", "0px !important");

            var oInputEscanerPallet = oView.byId("input-escaner_pallet");

            var oTable = oView.byId("table-detalles_pedido");
            var oBusyModel = new JSONModel({ "iniciar": false });
            oView.setModel(oBusyModel, "mBusy");

            var oInputPendientes = oView.byId("input-pendientes_rojos");
            othat.oPaletsxEnvase = [];
            oTable.attachUpdateFinished(
                (oEvent) => {
                    oInputEscanerPallet.focus();

                    var nCantidadVerdes = 0;
                    var oSource = oEvent.getSource();
                    var oTableItems = oSource.getItems();
                    var tmpArray = [];
                    oTableItems.forEach(item => {
                        var oId = item.getId();
                        var oBinding = item.getBindingContext("ZEWM_0003");
                        var object = oBinding.getObject();
                        var oClase = "FondoVerde";

                        switch (object.Color) {
                            case "R":
                                oClase = "FondoRojo";
                                break;

                            case "A":
                                oClase = "FondoAmarillo";
                                break;

                            default:
                                nCantidadVerdes++;
                                break;
                        }

                        var oFila = $(`#${oId}`);
                        oFila.addClass(oClase);

                        // inicio TKT 8000018866
                        var ofound = othat.oPaletsxEnvase.find(item => item.TipoEnvase == object.TipoEnvase);
                        if (!ofound) {                            
                            othat.oPaletsxEnvase.push({ "TipoEnvase": object.TipoEnvase, "Contador": parseFloat(object.Contador) });
                        }                      

                    });

                    oInputPendientes.setValue(nCantidadVerdes);

                    // inicio TKT 8000018866  
                    //Ascendente por tipo de envase
                    othat.oPaletsxEnvase.sort((a, b) => (a.TipoEnvase < b.TipoEnvase) ? -1 : ((b.TipoEnvase < a.TipoEnvase) ? 1 : 0));                                        
                    var oModelTipoEnvase = new sap.ui.model.json.JSONModel(othat.oPaletsxEnvase);
                    othat.getView().setModel(oModelTipoEnvase, "LISTPALLETSXENVASES");
                    // fin TKT 8000018866  
                }



            );


            // }

        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressBack: function() {
            var oViewId = "StageOutPalletIndexView";
            var oPathView = "AvocadoProyecto.AvocadoProyecto.modules.strageoutpallet.view.Index";
            this.dataBus.oView.oController.onSplitRouter(oViewId, oPathView, 16);
            this.getView().destroy();
        },

        onChangeInputScanPallet: function(oEvent) {
            var oSource = oEvent.getSource();
            var oValue = oSource.getValue();

            // if (oValue.trim() == "") {
            //     oSource.setValueState("Error");
            // } else {
            oSource.setValueState("None");
            // }
        },

        onEnviarPalletEscaneado: async function(oEvent) {
            var oModelOdata = this.getView().getModel("ZEWM_0003");
            var oView = this.getView();
            var oTablaPedidos = oView.byId("table-detalles_pedido");

            var oTableHeader = oTablaPedidos.getHeaderToolbar();
            var oTitleControl = oTableHeader.getTitleControl();
            var oTitle = oTitleControl.getText();

            var oIdPedido = oTitle.split(" ").pop();

            var oBtnRecargarLista = oView.byId("btn-recargar_lista");
            var oBtnEscanearPallet = oView.byId("btn-escanear_pallet");
            var oInputEscanearPallet = oView.byId("input-escaner_pallet");
            var oPallet = oInputEscanearPallet.getValue();

            if (!oPallet) {
                MensajesObject._MensajeError("El numero de pallet es obligatorio.");
                oInputEscanearPallet.setValueState("Error");
                return;
            }

            oInputEscanearPallet.setValueState("None");

            var oJson = {
                "IdPedido": oIdPedido,
                "Pallet": oPallet,
                "Venum": "",
                "Exidv": "",
                "Exidv2": ""
            }

            var oSuccess = true;

            oTablaPedidos.setBusy(true);
            oInputEscanearPallet.setBusy(true);
            oBtnEscanearPallet.setBusy(true);
            oBtnRecargarLista.setBusy(true);

            const THAT = this;

            await new Promise(resolve => {
                oModelOdata.create("/UnidadDeManipulacionSet", oJson, {
                    "success": async function(data, header) {
                        try {
                            THAT.oVenum = data.Venum;
                            THAT.oExidv = data.Exidv;
                            THAT.oExidv2 = data.Exidv2;
                            oInputEscanearPallet.setValueState("Success");
                            oInputEscanearPallet.setEnabled(false);
                            oBtnEscanearPallet.setIcon("sap-icon://decline");
                            oBtnEscanearPallet.mEventRegistry.press = [];
                            oBtnEscanearPallet.attachPress(THAT.onCancelarEscaneoPallet.bind(THAT));

                            var oInputEscanerUbicacion = oView.byId("input-escaner_ubicacion");
                            var oBtnEscanearUbicacion = oView.byId("btn-escaner_ubicacion");

                            oInputEscanerUbicacion.setEnabled(true);
                            oBtnEscanearUbicacion.setEnabled(true);

                        } catch (e) {
                            oSuccess = false;
                            await MensajesObject._MensajeError("El pallet se escaneo correctamente pero hubo un error al cargar los datos.");
                        }
                        resolve();
                    },
                    "error": async function(error) {
                        oSuccess = false;
                        var oMensajeError = "Ocurrio un error en el servidor.";
                        try {
                            var oErrorJson = JSON.parse(error.responseText);
                            var oDetallesError = oErrorJson.error.innererror.errordetails;
                            if (oDetallesError.length > 0) {
                                oMensajeError = "";
                                oDetallesError.forEach(error => {
                                    if (!error.message.includes("Internal error occurred, contact your system administrator")) {
                                        oMensajeError += error.message + "\n";
                                    }
                                });
                            }
                        } catch (e) {
                            //
                        }
                        await MensajesObject._MensajeError(oMensajeError);
                        resolve();
                    }
                });
            });

            oTablaPedidos.setBusy(false);
            oInputEscanearPallet.setBusy(false);
            oBtnEscanearPallet.setBusy(false);
            oBtnRecargarLista.setBusy(false);

            if (oSuccess) {
                oTablaPedidos.getBinding("items").refresh();
                var oInputEscanearUbicacion = oView.byId("input-escaner_ubicacion");
                var oBtnEscanearUbicacion = oView.byId("btn-escaner_ubicacion");

                oBtnEscanearUbicacion.setEnabled(true);
                oInputEscanearUbicacion.setEnabled(true);
                oInputEscanearUbicacion.focus();

                var oId = oInputEscanearUbicacion.getId();
                setTimeout(() => {
                    $(`#${oId}`).focus();
                    oInputEscanearUbicacion.focus();
                }, 500);
            } else {
                oInputEscanearPallet.setValue("");
                setTimeout(() => {
                    oInputEscanearPallet.focus();
                }, 500);
            }
        },

        onCancelarEscaneoPallet: function() {
            var oView = this.getView();

            this.oVenum = "";
            this.oExidv = "";
            this.oExidv2 = "";

            var oBtnEscanearPallet = oView.byId("btn-escanear_pallet");
            var oInputEscanearPallet = oView.byId("input-escaner_pallet");

            oInputEscanearPallet.setValueState("None");
            oInputEscanearPallet.setValue("");
            oInputEscanearPallet.setEnabled(true);
            oInputEscanearPallet.fireLiveChange();

            oBtnEscanearPallet.setIcon("sap-icon://search");
            oBtnEscanearPallet.mEventRegistry.press = [];
            oBtnEscanearPallet.attachPress(this.onEnviarPalletEscaneado.bind(this));

            var oInputEscanerUbicacion = oView.byId("input-escaner_ubicacion");
            var oBtnEscanearUbicacion = oView.byId("btn-escaner_ubicacion");

            oInputEscanerUbicacion.setEnabled(false);
            oBtnEscanearUbicacion.setEnabled(false);
            oInputEscanerUbicacion.setValue("");
            oInputEscanerUbicacion.setValueState("None");

            oInputEscanearPallet.focus();
        },

        onEnviarUbicacionEscaneada: async function() {
            var oModelOdata = this.getView().getModel("ZEWM_0003");
            var oView = this.getView();

            var oTablaPedidos = oView.byId("table-detalles_pedido");
            var oTableHeader = oTablaPedidos.getHeaderToolbar();
            var oTitleControl = oTableHeader.getTitleControl();
            var oTitle = oTitleControl.getText();

            var oIdPedido = oTitle.split(" ").pop();

            var oBtnEscanearPallet = oView.byId("btn-escanear_pallet");
            var oBtnEscanearUbicacion = oView.byId("btn-escaner_ubicacion");
            var oInputEscanearUbicacion = oView.byId("input-escaner_ubicacion");
            var oUbicacion = oInputEscanearUbicacion.getValue();
            var oInputEscanearPallet = oView.byId("input-escaner_pallet");

            if (!oUbicacion) {
                MensajesObject._MensajeError("La ubicacion es obligatorio.");
                oInputEscanearUbicacion.setValueState("Error");
                return;
            }

            if (!this.oVenum && (!this.oExidv || !this.oExidv2)) {
                MensajesObject._MensajeError("El pallet no fue escaneado.");
                return;
            }

            var oJson = {
                "Pedido": oIdPedido,
                "IdUbicacion": oUbicacion,
                "Venum": this.oVenum,
                "Exidv": this.oExidv,
                "Exidv2": this.oExidv2
            }

            var oSuccess = true;

            oTablaPedidos.setBusy(true);
            oBtnEscanearUbicacion.setBusy(true);
            oInputEscanearUbicacion.setBusy(true);
            oBtnEscanearPallet.setBusy(true);

            const THAT = this;
            var oToken = oModelOdata.getHeaders()["x-csrf-token"];
            var oUrl = `/sap/opu/odata/sap/ZEWM_0003_SRV/UbicacionSet(Pedido='${oIdPedido}',IdUbicacion='${oUbicacion}')`;

            var oResponse = await new Promise(resolve => {
                $.ajax({
                    type: 'PUT',
                    url: oUrl,
                    data: JSON.stringify(oJson),
                    dataType: 'json',
                    async: false,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        "X-Requested-With": "XMLHttpRequest",
                        "DataServiceVersion": "2.0",
                        "X-CSRF-Token": oToken
                    },
                    success: function(data, header) {
                        var response = true;
                        resolve(response);
                    },
                    error: function(data, header) {
                        oTablaPedidos.setBusy(false);
                        oSuccess = false;
                        var oMensajeError = "Ocurrio un error en el servidor.";
                        try {
                            var oDetallesError = data.responseJSON.error.innererror.errordetails;
                            if (oDetallesError.length > 0) {
                                oMensajeError = "";
                                oDetallesError.forEach(error => {
                                    if (!error.message.includes("Internal error occurred, contact your system administrator")) {
                                        oMensajeError += error.message + "\n";
                                    }
                                });
                            }
                        } catch (e) {
                            //
                        }
                        MensajesObject._MensajeError(oMensajeError);
                        var response = false;
                        resolve(response);
                    }
                });
            });

            oTablaPedidos.setBusy(false);
            oBtnEscanearUbicacion.setBusy(false);
            oInputEscanearUbicacion.setBusy(false);
            oBtnEscanearPallet.setBusy(false);

            if (!oResponse) return;

            await MensajesObject._MensajeExito("Ubicación escaneada.");
            THAT.onCancelarEscaneoPallet();
            oTablaPedidos.destroyItems();
            oTablaPedidos.getBinding("items").refresh(true);

            setTimeout(() => {
                oInputEscanearPallet.focus();
            }, 100);
        },

        onRecargarLista: function() {
            var oView = this.getView();

            var oTablaPedidos = oView.byId("table-detalles_pedido");
            oTablaPedidos.destroyItems();
            oTablaPedidos.getBinding("items").refresh(true);
        },

        onDesbloquearPedido: async function(oEvent) {
            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("ZEWM_0003");
            var oPedido = oBinding.getObject();

            var sMensaje = `Desea desbloquear la HU ${oPedido.UnidadManipulacion}?`;
            var oResponse = await MensajesObject._MensajeConfirmacion(sMensaje, "warning");
            if (!oResponse) return;

            var oBusyModel = this.getView().getModel("mBusy");

            var oModelOdata = this.getView().getModel("ZEWM_0003");
            var oToken = oModelOdata.getHeaders()["x-csrf-token"];
            var oUrl = `/sap/opu/odata/sap/ZEWM_0003_SRV/UnidadDeManipulacionSet(IdPedido='${oPedido.IdPedido}',Pallet='${oPedido.UnidadManipulacion}')`;

            const THAT = this;

            oBusyModel.setProperty("/iniciar", true);

            $.ajax({
                type: 'DELETE',
                url: oUrl,
                async: false,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "X-Requested-With": "XMLHttpRequest",
                    "DataServiceVersion": "2.0",
                    "X-CSRF-Token": oToken
                },
                success: function(data, header) {
                    oBusyModel.setProperty("/iniciar", false);
                    THAT.onRecargarLista();
                    THAT.onCancelarEscaneoPallet();
                },
                error: function(data, header) {
                    oBusyModel.setProperty("/iniciar", false);
                    var sMensajeError = "Ocurrio un error en el servidor en el PEDIDO ID: " + oPedido.IdPedido;
                    try {
                        var oDetallesError = data.responseJSON.error.innererror.errordetails;
                        if (oDetallesError.length > 0) {
                            sMensajeError = "";
                            oDetallesError.forEach(error => {
                                if (!error.message.includes("Internal error occurred, contact your system administrator")) {
                                    sMensajeError += error.message + "\n";
                                }
                            });
                        }
                    } catch (e) {
                        //
                    }
                    MensajesObject._MensajeError(sMensajeError);
                }
            });
        }
    });
});