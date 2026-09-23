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

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.asignarOrdenZonaEWM.controller.asignarOrdenZonaEWM", {

        formatter: formatter,
        dataBus: {},
        scope: {},

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "asignarOrdenZonaEWMDetailView", this._busSuscribe, this);

            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0007_SRV", { "useBatch": false });
            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelDetail, "detail");

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
            sap.ui.core.BusyIndicator.show(0);
            this.getView().byId("txtSearchPEDIDO").setValue("");
            var othat = this;
            var oModelService = this.getView().getModel('service');
            
            /// GE 27-11-2024
            
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oFilter = new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro);
            var oFiltros = [                
                oFilter
            ];
            ///GE 27-11-2024 ///
            oModelService.read("/ObtenerPedidosSet", {
            	filters: oFiltros,
                success: function(result, response) {
                    var oModel = new sap.ui.model.json.JSONModel(result);
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

        handleFilterPedidos: function(event) {
            var sSearch = event.getSource().getValue().toString();
            var oBinding = this.getView().byId("idPedidosTable").getBinding("items");
            if (sSearch === "") {
                oBinding.filter([]);
                return;
            }
            var oFilter;
            var aFilters = [];
            aFilters.push(new sap.ui.model.Filter({
                path: "PEDIDO",
                test: function(oValue) {
                    return (oValue.indexOf(sSearch) >= 0);
                }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "ORDEN",
                test: function(oValue) {
                    return (oValue.toUpperCase().indexOf(sSearch.toUpperCase()) >= 0);
                }
            }));
            var oFilter = new sap.ui.model.Filter(aFilters, false);
            oBinding.filter(oFilter);
        },

        _sendDesasignar: function(pedido, almacen) {
            sap.ui.core.BusyIndicator.show(0);
            var oModelService = this.getView().getModel('service');
            var oThat = this;
            var oEntry = {};
            while (pedido.length < 10) {
                pedido = '0' + pedido;
            }
            oEntry.PEDIDO = pedido;
            oEntry.ALMACEN = almacen;
            oModelService.create("/DesasignarPedidoSet", oEntry, {
                success: async function(oResponse, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    if (oResponse.responseText) {
                        var obj = JSON.parse(oResponse.responseText);
                        if (obj.error !== undefined) {
                            MessageBox.error(
                                obj.error.innererror.errordetails[0].message, {
                                    styleClass: "sapUiSizeCompact",
                                    onClose: function(oAction) {}
                                }
                            )
                        }
                    } else {
                        MessageBox.success(
                            "Se ha desasignado el pedido " + pedido, {
                                styleClass: "sapUiSizeCompact",
                                onClose: function(oAction) {
                                    oThat.onCloseDialogAsignarZona();
                                    oThat.onLoadDetail();
                                }
                            }
                        )
                    }
                },
                error: function(oError, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    if (oError.responseText) {
                        var obj = JSON.parse(oError.responseText);
                        if (obj.error !== undefined) {
                            MessageBox.error(
                                obj.error.innererror.errordetails[0].message, {
                                    styleClass: "sapUiSizeCompact",
                                    onClose: function(oAction) {}
                                }
                            )
                        }
                    }
                }
            });
        },

        _desasignarSearch: function(pedido) {
            if (pedido === "") return;
            sap.ui.core.BusyIndicator.show(0);
            var oModelService = this.getView().getModel('service');
            var othat = this;
            oModelService.read("/ObtenerPedidoSet('" + pedido + "')", {
                success: function(result, response) {
                    sap.ui.core.BusyIndicator.hide();
                    if (result.PEDIDO !== "") {
                        var oApproveDialog = new Dialog({
                            type: DialogType.Message,
                            title: "Desasignar pedido " + result.PEDIDO + " de la Zona de Despacho",
                            contentWidth: "500px",
                            content: [
                                new HorizontalLayout({
                                    content: [
                                        new VerticalLayout({
                                            width: "120px",
                                            content: [
                                                new Text({ text: "Número de Pedido: " }),
                                                new Text({ text: "Almacén: " }),
                                                new Text({ text: "Zona de Despacho: " })
                                            ]
                                        }),
                                        new VerticalLayout({
                                            content: [
                                                new Text({ text: result.PEDIDO }),
                                                new Text({ text: result.ALMACEN }),
                                                new Text({ text: result.ZONA_DE_DESPACHO })
                                            ]
                                        })
                                    ]
                                })
                            ],
                            beginButton: new Button({
                                type: ButtonType.Emphasized,
                                text: 'Desasignar',
                                press: function() {
                                    othat._sendDesasignar(result.PEDIDO, result.ALMACEN);
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
                    } else {
                        MessageBox.error(
                            "El pedido " + result.I_PEDIDO + " no tiene zona de despacho asignada", {
                                styleClass: "sapUiSizeCompact",
                                onClose: function(oAction) {}
                            }
                        );
                    }
                },
                error: function(error) {
                    sap.ui.core.BusyIndicator.hide();
                    if (error.responseText) {
                        var obj = JSON.parse(error.responseText);
                        if (obj.error !== undefined) {
                            MessageBox.error(
                                obj.error.message.value, {
                                    styleClass: "sapUiSizeCompact",
                                    onClose: function(oAction) {}
                                }
                            )
                        }
                    }
                    console.log(error);
                }
            });
        },

        onDesasignar: function() {
            var othat = this;
            var oApproveDialog = new Dialog({
                type: DialogType.Message,
                title: "Pedido a Desasignar",
                content: [
                    new Label({
                        text: "No de Pedido",
                        labelFor: "numPedidoDesasignar"
                    }),
                    new sap.m.Input("numPedidoDesasignar", {
                        width: "100%",
                        placeholder: "Pedido",
                        liveChange: function(oEvent) {
                            var sText = oEvent.getParameter("value");
                            oApproveDialog.getBeginButton().setEnabled(sText.length > 0);
                        }.bind(this)
                    })
                ],
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    enabled: false,
                    text: 'Buscar pedido',
                    press: function() {
                        othat._desasignarSearch(sap.ui.getCore().byId("numPedidoDesasignar").getValue());
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

        onShowPedido: function(event) {
            this._getDialogAsignarZona().open();
            sap.ui.core.BusyIndicator.show(0);
            var oContext = event.getSource().getBindingContext('detail');
            var oModelService = this.getView().getModel('service');
            var othat = this;
            var oModel = new sap.ui.model.json.JSONModel();
            othat.getView().setModel(oModel, "zonas");

            this.scope.PEDIDO = oContext.getProperty('PEDIDO');
            this.scope.ORDEN = oContext.getProperty('ORDEN');
            this.scope.VIAJE = oContext.getProperty('VIAJE');
            this.scope.ALMACEN = oContext.getProperty('ALMACEN');
            this.scope.CLIENTE = oContext.getProperty('CLIENTE') + " - " + oContext.getProperty('CLIENTE_DESC');
            this.scope.DESTINO = oContext.getProperty('DEST1') + ", " + oContext.getProperty('DEST3') + ", " + oContext.getProperty('DEST2');
            this.scope.CANT_PALLETS = oContext.getProperty('CANT_PALLETS');
            this.scope.ZONA_DE_DESPACHO = "";
            this.scope.TIP_TRANSPORTE = oContext.getProperty('TIP_TRANSPORTE');
            
            if (oContext.getProperty('CONSOLIDADO') === "X") {            
            	this.scope.CONSOLIDADO = "SI" ;
            }
            else { 
            	this.scope.CONSOLIDADO = "NO" ;
            }
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");

            oModelService.read("/ObtenerZonasDespachoSet", {
                filters: [new sap.ui.model.Filter("ALMACEN", sap.ui.model.FilterOperator.EQ, oContext.getProperty('ALMACEN')),
                	      new sap.ui.model.Filter("PEDIDO", sap.ui.model.FilterOperator.EQ, oContext.getProperty('PEDIDO'))],
                success: function(result, response) {
                    var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.getView().setModel(oModel, "zonas");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(error) {
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        onAssignZona: function(event) {
            var oContext = event.getSource().getBindingContext('zonas');
            var oModelService = this.getView().getModel('service');
            var othat = this;
            othat.scope.ZONA_DE_DESPACHO = oContext.getProperty('ZONA_DE_DESPACHO');
            var msg = "¿Desea asignar la orden " + othat.scope.PEDIDO + " a la Zona " + othat.scope.ZONA_DE_DESPACHO + " ?";
            var oApproveDialog = new Dialog({
                type: DialogType.Message,
                title: "Asignar",
                content: new Text({ text: msg }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: 'Asignar',
                    press: function() {
                        othat._asignarOrdenAZona();
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

        _asignarOrdenAZona: function() {
            if (this.scope.ZONA_DE_DESPACHO === "") {
                sap.m.MessageToast.show("Es necesario asignar una Zona a la Orden");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);
            var oModelService = this.getView().getModel('service');
            var oThat = this;
            var oEntry = {};
            oEntry.PEDIDO = this.scope.PEDIDO;
            oEntry.ALMACEN = this.scope.ALMACEN;
            oEntry.ZONA_DE_DESPACHO = this.scope.ZONA_DE_DESPACHO;
            oModelService.create("/AsignarPedidoAZonaSet", oEntry, {
                success: async function(oResponse, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    if (oResponse.responseText) {
                        var obj = JSON.parse(oResponse.responseText);
                        if (obj.error !== undefined) {
                            MessageBox.error(
                                obj.error.message.value, {
                                    styleClass: "sapUiSizeCompact",
                                    onClose: function(oAction) {}
                                }
                            )
                        }
                    } else {
                        MessageBox.success(
                            "Se ha asignado la Orden a la Zona correctamente", {
                                styleClass: "sapUiSizeCompact",
                                onClose: function(oAction) {
                                    oThat.onCloseDialogAsignarZona();
                                    oThat.onLoadDetail();
                                }
                            }
                        )
                    }
                },
                error: function(oError, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    if (oError.responseText) {
                        var obj = JSON.parse(oError.responseText);
                        if (obj.error !== undefined) {
                            MessageBox.error(
                                obj.error.message.value, {
                                    styleClass: "sapUiSizeCompact",
                                    onClose: function(oAction) {}
                                }
                            )
                        }
                    }
                }
            });
        },

        _getDialogAsignarZona: function() {
            if (!this.oDialogAsignarZona) {
                this.oDialogAsignarZona = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.asignarOrdenZonaEWM.fragments.asignarZona', this);
                this.getView().addDependent(this.oDialogAsignarZona);
            }
            return this.oDialogAsignarZona;
        },

        onCloseDialogAsignarZona: function() {
            this._getDialogAsignarZona().close();
        }

    });
});