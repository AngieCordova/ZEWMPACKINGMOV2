sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
], function(MessageBox, Controller, formatter) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.cargaPalletContEWM.controller.cargaPalletContEWM", {

        formatter: formatter,
        dataBus: {},
        scope: {
            "IdPedido": "",
            "IdTransporte": "",
            "txtEscanearPallet": "",
            "txtEscanearPuerta": "",
            "escanearPuertaTitle": "",
            "bloqueoEscanearPuerta": false,
            "bloqueoBtnSendPallet": false,
            "enableEdicionPosiones": false,
            "IdPedidoMostrar": "",
            //Inicio TKT 8000018864
            "Booking": "",
            "Exportador": "",
            "Destino": "",
            "Fecha_Despacho": "",
            "Ubicacion": "",
            //Fin TKT 8000018864
            //Inicio TKT 8000018867
            "Orden": "",
            "Viaje": "",
            "contPendiente": 0,
            "contCargado": 0,
            //Fin TKT 8000018867
        },

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "cargaPalletContEWMView", this._busSuscribe, this);

            //var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0008_SRV", { defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put, "useBatch": false });
            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0008_SRV", { "useBatch": false });

            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelDetail, "contenedores");

            this.onLoadContenedores();
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onLoadContenedores: function() {
            sap.ui.core.BusyIndicator.show(0);
            this.getView().byId("txtSearchContenedores").setValue("");
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
                    var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.getView().setModel(oModel, "contenedores");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(error) {
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "contenedores");
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        handleFilterContenedores: function(event) {
            var sSearch = event.getSource().getValue().toString();
            var oBinding = this.getView().byId("idContenedoresTable").getBinding("items");
            if (sSearch === "") {
                oBinding.filter([]);
                return;
            }
            var oFilter = [
                new sap.ui.model.Filter([
                    new sap.ui.model.Filter("IdPedido", function(sContenedor) {
                        return (sContenedor || "").toUpperCase().indexOf(sSearch.toUpperCase()) > -1;
                    })
                    /*                 ,
                                     new sap.ui.model.Filter("Vbeln", function(sVbeln) {
                                         return (sVbeln || "").toUpperCase().indexOf(sSearch.toUpperCase()) > -1;
                                     })*/
                ], false)
            ];
            oBinding.filter(oFilter);
        },

        onReportePalletsShow: function(event) {
            this._getDialogReportePallets().open();
            var oContext = event.getSource().getBindingContext('contenedores');
            var othat = this;
            var oModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModel, "pallets");
            this.scope.IdPedido = oContext.getProperty('IdPedido');
            this.scope.IdTransporte = oContext.getProperty('IdTransporte');
            this.scope.Puerta = oContext.getProperty('Puerta');
            this.scope.IdContenedor = oContext.getProperty('IdContenedor');
            this.scope.escanearPuertaTitle = oContext.getProperty('Puerta');
            this.scope.txtEscanearPallet = "";
            this.scope.txtEscanearPuerta = "";
            this.scope.bloqueoEscanearPuerta = false;
            this.scope.bloqueoBtnSendPallet = false;
            this.scope.enableEdicionPosiones = false;
            //Inicio TKT 8000018864
            this.scope.Booking = oContext.getProperty('Booking');
            this.scope.Exportador = oContext.getProperty('EXPORTADOR');
            this.scope.Destino = oContext.getProperty('DESTINO');
            this.scope.Fecha_Despacho = oContext.getProperty('FECHA_DESPACHO');
            this.scope.Ubicacion = oContext.getProperty('UBICACION');
            //Fin TKT 8000018864
            //Inicio TKT 8000018867
            this.scope.Orden = oContext.getProperty('NroOrden');
            this.scope.Viaje = oContext.getProperty('IdViaje');
            //Fin TKT 8000018867
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.onLoadPallets(true);
            this.onLoadPosiciones();
            //-!-  Comm-cbs-doc : No Ticket 8000018867 [Besmit-02092021]
            this._addStyleHead("id-cargaPalletContEWM-modal", ".bes-VBox-min-width-80 { min-width: 60% !important; }");

        },

        //-!-  Comm-cbs-doc : No Ticket 8000018867 [Besmit-02092021]
        _addStyleHead: function(id, styles) {
            var exist = document.getElementById('id-cargaPalletContEWM-modal');
            if (!exist) {
                var css = document.createElement('style');
                css.id = id;
                css.type = 'text/css';
                if (css.styleSheet)
                    css.styleSheet.cssText = styles;
                else
                    css.appendChild(document.createTextNode(styles));
                document.getElementsByTagName("head")[0].appendChild(css);
            }
        },

        onLoadPallets: function(focusEscanearPallet = false) {
            //sap.ui.core.BusyIndicator.show(0);
            var oModelService = this.getView().getModel('service');
            var othat = this;
            othat.getView().byId("tableReportCargaPallets").setBusy(true);
            oModelService.read("/PalletsSet", {
                filters: [new sap.ui.model.Filter("IdPedido", sap.ui.model.FilterOperator.EQ, othat.scope.IdPedido)],
                success: function(result, response) {
                    var oModel = new sap.ui.model.json.JSONModel(result);
                  //SCH-Inicio
                    var zero = "0";                    
                    oModel.oData.results.forEach(valor => {
	                    var length = valor.IdPalletV2.toString().length;
	                    valor.IdPalletV2 = (zero.repeat(20-length)) + valor.IdPalletV2;
                    });
                    //SCH-Fin
                    
                    othat.getView().setModel(oModel, "pallets");
                    othat.getView().byId("tableReportCargaPallets").setBusy(false);
                    //sap.ui.core.BusyIndicator.hide();
                    if (othat.getView().byId("txtEscanearPallet") && focusEscanearPallet) {
                        setTimeout(function() { othat.getView().byId("txtEscanearPallet").setValue('').focus(); }, 800);
                    }
                    //Inicio TKT 8000018867  
                    var intPendiente = 0;
                    var intCargado = 0;
                    var oPendientes = [];
                    var oCargados = [];

                    var oView = othat.getView();
                    var oModelPallets = oView.getModel("pallets");
                    var oListaPallets = oModelPallets.getData();

                    oListaPallets.results.forEach(pallet => {
                        if (pallet.Estado == 'Pendiente') {
                            oPendientes.push(pallet);
                            intPendiente = intPendiente + 1;
                        } else {
                            oCargados.push(pallet);
                        }
                    });

                    othat.scope.contPendiente = oPendientes.length; // intPendiente;
                    othat.scope.contCargado = oCargados.length; //intCargado;

                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");

                    //transformar a JsonModel Palles pendientes
                    var oModelPendientes = new sap.ui.model.json.JSONModel(oPendientes);
                    othat.getView().setModel(oModelPendientes, "palletsPendientes");

                    //transformar a JsonModel Palles cargados
                    var oModelCargados = new sap.ui.model.json.JSONModel(oCargados);
                    othat.getView().setModel(oModelCargados, "palletsCargados");
                    var a = 0;
                    //Fin TKT 8000018867
                },
                error: function(error) {
                    console.log(error);
                    //sap.ui.core.BusyIndicator.hide();
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "pallets");
                    othat.getView().byId("tableReportCargaPallets").setBusy(false);
                    if (othat.getView().byId("txtEscanearPallet") && focusEscanearPallet) {
                        setTimeout(function() { othat.getView().byId("txtEscanearPallet").setValue('').focus(); }, 800);
                    }
                }
            });
        },

        onClearPuerta: function(event) {
            this.scope.txtEscanearPuerta = "";
            this.scope.bloqueoEscanearPuerta = false;
            this.scope.bloqueoBtnSendPallet = false;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.getView().getModel("scope").refresh();
        },

        onPickPallet: function() {
            var othat = this;
            if (this.scope.txtEscanearPallet == "") return;
            var oModel = this.getView().getModel("pallets");
            var oFinded = oModel.getData().results.find(function(val) {
                if (val.Estado == "Pendiente" && (val.IdPallet == othat.scope.txtEscanearPallet || val.IdPalletV2 == othat.scope.txtEscanearPallet)) {
                    return val;
                }
            });
            if (oFinded === undefined) {
                sap.m.MessageToast.show("No se encuentra la Paleta para asignar");
                othat.getView().byId("txtEscanearPallet").setValue('').focus();
                othat.onClearPuerta();
                return;
            }
            sap.ui.core.BusyIndicator.show(0);
            //var oModelService = this.getView().getModel('service');
            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0008_SRV", { defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put, "useBatch": false });

            var data = {};
            data.IdPedido = this.scope.IdPedido;
            data.IdPallet = this.scope.txtEscanearPallet;
            oModelService.update("/PalletSet(IdPallet='" + data.IdPallet + "',IdPedido='" + data.IdPedido + "')", data, {
                success: function(oResponse, oHeader) {
                    console.log(oResponse);
                    sap.ui.core.BusyIndicator.hide();
                    var msgError = othat._processErrorOdata(oResponse);
                    if (msgError != "") {
                        MessageBox.error(
                            msgError, {
                                styleClass: "sapUiSizeCompact",
                                onClose: function(oAction) {
                                    othat.getView().byId("txtEscanearPallet").setValue('').focus();
                                    othat.onClearPuerta();
                                }
                            }
                        );
                    } else {
                        othat.onLoadPallets(false);
                        othat.onLoadPosiciones();
                        othat.scope.txtEscanearPuerta = "";
                        othat.scope.bloqueoEscanearPuerta = true;
                        othat.scope.bloqueoBtnSendPallet = true;
                        var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                        othat.getView().setModel(oModelScope, "scope");
                        othat.getView().getModel("scope").refresh();
                        setTimeout(function() { othat.getView().byId("txtEscanearPuerta").setValue('').focus(); }, 800);
                    }
                },
                error: function(oError, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    var msgError = othat._processErrorOdata(oError);
                    MessageBox.error(
                        msgError, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function(oAction) {
                                othat.getView().byId("txtEscanearPallet").setValue('').focus();
                                othat.onClearPuerta();
                            }
                        }
                    );
                }
            });
        },

        onUnPickPallet: function(IdPedido, IdPalletV1, IdPalletV2) {
            if (IdPedido == "") return;
            if (IdPalletV1 == "" && IdPalletV2 == "") return;
            var IdPallet = "";
            if (IdPalletV2 != "") IdPallet = IdPalletV2;
            if (IdPalletV1 != "") IdPallet = IdPalletV1;
            sap.ui.core.BusyIndicator.show(0);
            var oModelService = this.getView().getModel('service');
            var othat = this;
            var data = {};
            data.IdPedido = IdPedido;
            data.IdPallet = IdPallet;
            oModelService.remove("/PalletSet(IdPallet='" + data.IdPallet + "',IdPedido='" + data.IdPedido + "')", {
                IdPallet: data.IdPallet,
                IdPedido: data.IdPedido,
                success: function(oResponse, oHeader) {
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
                        othat.onClearPuerta();
                        othat.onLoadPallets(true);
                        othat.onLoadPosiciones();
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

        onPickPuertaMuelle: function() {
            if (this.scope.txtEscanearPuerta == "") return;
            sap.ui.core.BusyIndicator.show(0);
            var oModelService = this.getView().getModel('service');
            var othat = this;
            var data = {};
            data.IdPuerta = this.scope.txtEscanearPuerta;
            data.IdTransporte = this.scope.IdTransporte;
            data.IdPedido = this.scope.IdPedido;
            data.IdPallet = this.scope.txtEscanearPallet;
            oModelService.create("/UbicacionSet", data, {
                success: function(oResponse, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    var msgError = othat._processErrorOdata(oResponse);
                    if (msgError != "") {
                        MessageBox.error(
                            msgError, {
                                styleClass: "sapUiSizeCompact",
                                onClose: function(oAction) {
                                    othat.getView().byId("txtEscanearPuerta").setValue('').focus();
                                }
                            }
                        );
                    } else {
                        othat.scope.txtEscanearPallet = "";
                        othat.onClearPuerta();
                        othat.onLoadPallets(true);
                        othat.onLoadPosiciones();
                    }
                },
                error: function(oError, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    var msgError = othat._processErrorOdata(oError);
                    MessageBox.error(
                        msgError, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function(oAction) {
                                othat.getView().byId("txtEscanearPuerta").setValue('').focus();
                            }
                        }
                    );
                }
            });
        },

        onHabilitarEdicionPos: function(habilitar) {
            this.scope.enableEdicionPosiones = habilitar;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.getView().getModel("scope").refresh();
        },

        onLoadPosiciones: function() {
            //sap.ui.core.BusyIndicator.show(0);
            var oModelService = this.getView().getModel('service');
            var othat = this;
            othat.scope.IdPedidoMostrar = "";
            othat.getView().byId("tableReportBloqueoPosiciones").setBusy(true);
            oModelService.read("/PosicionesSet", {
                filters: [new sap.ui.model.Filter("IdPedido", sap.ui.model.FilterOperator.EQ, othat.scope.IdPedido)],
                success: function(result, response) {
                    var oModel = new sap.ui.model.json.JSONModel(result);

                    var i = 0;
                    var Pedidos = "";
                    var PedidoAsig = "";
                    while (i < result.results.length) {
                        if (result.results[i].IdPedidoAsign != "") {
                            if (result.results[i].IdPedidoAsign != PedidoAsig) {
                                if (PedidoAsig == "") {
                                    PedidoAsig = result.results[i].IdPedidoAsign;
                                    Pedidos = PedidoAsig;
                                } else {
                                    PedidoAsig = result.results[i].IdPedidoAsign;
                                    Pedidos = Pedidos + "-" + PedidoAsig;
                                }
                            }
                        }
                        ++i;
                    }

                    othat.scope.IdPedidoMostrar = Pedidos;

                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");
                    othat.getView().getModel("scope").refresh();

                    othat.getView().setModel(oModel, "posiciones");
                    othat.getView().byId("tableReportBloqueoPosiciones").setBusy(false);
                    //sap.ui.core.BusyIndicator.hide();
                },
                error: function(error) {
                    console.log(error);
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "posiciones");
                    othat.getView().byId("tableReportBloqueoPosiciones").setBusy(false);
                    //sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        onRevActionPosicion: function(event) {
            var index = parseInt(event.getSource().getBindingContext("posiciones").getPath().replace("/results/", "")) + 1;
            var oContext = event.getSource().getBindingContext('posiciones');
            var Correlativo = String((oContext.getProperty('Correlativo') == "") ? index : oContext.getProperty('Correlativo'));
            if (!this.scope.enableEdicionPosiones) return;
            if (oContext.getProperty('Estado') == "Libre") {
                this._BloquearPosicion(oContext.getProperty('IdPedido'), oContext.getProperty('IdTransporte'), Correlativo, oContext.getProperty('IdPallet'), oContext.getProperty('IdPalletV2'), oContext.getProperty('Estado'));
            } else {
                this._DesBloquearPosicion(oContext.getProperty('IdPedido'), oContext.getProperty('IdTransporte'), Correlativo, oContext.getProperty('IdPallet'), oContext.getProperty('IdPalletV2'), oContext.getProperty('Estado'));
            }
        },

        _BloquearPosicion: function(IdPedido, IdTransporte, Correlativo, IdPallet, IdPalletV2, Estado) {
            sap.ui.core.BusyIndicator.show(0);
            //var oModelService = this.getView().getModel('service');
            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0008_SRV", { defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put, "useBatch": false });

            var othat = this;
            var dataSend = {};
            dataSend.IdPedido = IdPedido;
            dataSend.IdTransporte = IdTransporte;
            dataSend.Correlativo = Correlativo;
            oModelService.update("/PosicionesSet(IdPedido='" + dataSend.IdPedido + "',IdTransporte='" + dataSend.IdTransporte + "',Correlativo='" + dataSend.Correlativo + "')", dataSend, {
                success: function(oResponse, oHeader) {
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
                        //othat.onHabilitarEdicionPos(false);
                        othat.onLoadPosiciones();
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

        _DesBloquearPosicion: function(IdPedido, IdTransporte, Correlativo, IdPallet, IdPalletV2, Estado) {
            sap.ui.core.BusyIndicator.show(0);
            var oModelService = this.getView().getModel('service');
            var othat = this;
            var dataSend = {};
            dataSend.IdPedido = IdPedido;
            dataSend.IdTransporte = IdTransporte;
            dataSend.Correlativo = Correlativo;
            oModelService.remove("/PosicionesSet(IdPedido='" + dataSend.IdPedido + "',IdTransporte='" + dataSend.IdTransporte + "',Correlativo='" + dataSend.Correlativo + "')", {
                IdPedido: dataSend.IdPedido,
                IdTransporte: dataSend.IdTransporte,
                Correlativo: dataSend.Correlativo,
                success: function(oResponse, oHeader) {
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
                        //othat.onHabilitarEdicionPos(false);
                        othat.onLoadPosiciones();
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

        onPrintReport: function() {
            var print_Url = $.sap.getModulePath("com", "/css/");
            var printCssUrl = print_Url + "style.css";
            var css = '<link rel="stylesheet" href=' + printCssUrl + ' type="text/css" />';
            $.each(document.styleSheets, function(index, oStyleSheet) {
                if (oStyleSheet.href) {
                    css += '<link rel="stylesheet" href=' + oStyleSheet.href + ' type="text/css" />';
                }
            });
            var hContent = '<html><head>' + css + '<style>.sapMFlexBoxFit, .sapMFlexBoxScroll {height: auto !important;} .sapMBtnBase {display: none !important;}.sapMGT.OneByOne{height: 63px !important;}.CPCEWM-GenericTilePosiciones .sapMGTHdrContent{padding: 3px !important;}</style></head><body>';
            var bodyContent = $("#cargaPalletContEWMView--iconTabBarReportePallets-content").html();
            var closeContent = '<script type="text/javascript">setTimeout(function(){ window.print(); setTimeout(function(){ window.close(); }, 500);}, 500);</script></body></html>';
            var htmlpage = hContent + bodyContent + closeContent;
            var win = window.open("", "PrintWindow");
            win.document.write(htmlpage);
            //win.print(); win.stop();
        },

        _getDialogReportePallets: function() {
            if (!this.oDialogReportePallets) {
                this.oDialogReportePallets = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.cargaPalletContEWM.fragments.reportePallets', this);
                this.getView().addDependent(this.oDialogReportePallets);
            }
            return this.oDialogReportePallets;
        },

        onCloseDialogReportePallets: function() {
            this._getDialogReportePallets().close();
        },

        onAfterCloseDialogReportePallets: function() {
            this.onLoadContenedores();
            if (this.oDialogReportePallets) {
                this._getDialogReportePallets().destroy();
                delete this.oDialogReportePallets;
            }
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
//# sourceURL=http://10.34.2.47:8192/sap/bc/ui5_ui5/sap/zewmpackingmov/modules/cargaPalletContEWM/controller/cargaPalletContEWM.controller.js?eval