sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function(Controller, formatter, JSONModel, MensajesObject) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.remontarPalletEWM.controller.ListaPalletsRemontar", {

        formatter: formatter,
        dataBus: {},
        // _valores_originales: new Object(),

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "ListaPalletsRemontarView", this._busSuscribe, this);

            var oView = this.getView();

            oView.setModel(new JSONModel([]), "mListaPreparados");

            var oTable = oView.byId("table-lista_pallets_remontar");

            oTable.attachUpdateFinished((oEvent) => {
                var oSource = oEvent.getSource();
                var oItems = oSource.getItems();
                oItems.forEach(item => {
                    var oCells = item.getCells();
                    var oInput = oCells[9];
                    var oBindingObject = oInput.getBindingContext("mLista").getObject();
                    oBindingObject.CANTIDAD_PALLET_ORIGINAL = oBindingObject.CAJAS_PALLET;
                    oBindingObject.CJ_FALTANTES_ORIGINAL = oBindingObject.CJ_FALTANTES;
                    oInput.setEnabled(false);
                });
            });
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            var oViewId = "RemontarPalletsIndexView";
            var oPathView = "AvocadoProyecto.AvocadoProyecto.modules.remontarPalletEWM.view.Index";
            this.dataBus.oView.oController.onSplitRouter(oViewId, oPathView, 47);
            this.getView().destroy();
        },

        onSelectPalletRemontar: function(oEvent) {
            var oSource = oEvent.getSource();
            var oSelected = oSource.getSelected();
            var oFila = oSource.getParent();
            var oCells = oFila.getCells();
            var oInputCantidad = oCells[9];

            oInputCantidad.setEnabled(oSelected);
        },

        onFiltrarTabla: function(oEvent) {
            var oView = this.getView();
            var oTable = oView.byId("table-lista_pallets_remontar");
            var oSource = oEvent.getSource();
            var sValue = oSource.getValue();

            var oFiltros = new Array(
                new sap.ui.model.Filter("NRO_PALLET", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("PROD_DESCR", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("KUNNR", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("NAME_ORG1", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("MODULO", sap.ui.model.FilterOperator.Contains, sValue)
            );

            var oBinding = oTable.getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },

        noSuperaMaximo: function(oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mLista");
            var oSource = oEvent.getSource();
            var oParent = oSource.getParent();
            var oCells = oParent.getCells();

            var oIndexTextBoxCajasFaltantes = oCells.length - 3;
            var oTextBoxCajasFaltantes = oCells[oIndexTextBoxCajasFaltantes];

            // var oTextCajasFaltantes = oCells[9];
            var oBinding = oSource.getBindingContext("mLista");
            var oPosicion = oBinding.getObject();
            var sValue = oSource.getValue();
            var nValueIngresado = Number(sValue);

            oPosicion.CAJAS_PALLET = oPosicion.CANTIDAD_PALLET_ORIGINAL;
            oPosicion.CJ_FALTANTES = oPosicion.CJ_FALTANTES_ORIGINAL;
            // oTextCajasFaltantes.setText(oPosicion.CAJAS_PALLET);
            // oTextBoxCajasFaltantes.setText(oPosicion.CAJAS_PALLET);
            oTextBoxCajasFaltantes.setText(oPosicion.CJ_FALTANTES);

            if (isNaN(nValueIngresado)) {
                oSource.setValue(0);
                oPosicion.CJ_FUSIONAR = 0;
                return;
            }

            if (nValueIngresado == 0) {
                oSource.setValue(0);
                return;
            }

            var nMaxPaletas = Number(oPosicion.MAX_PALLETS);
            // var nCajasFaltantes = Number(oPosicion.CAJAS_PALLET);
            var nCajasEnPallet = Number(oPosicion.CAJAS_PALLET);
            var nCajasFaltantes = Number(oPosicion.CJ_FALTANTES);
            // var nResultado = nCajasFaltantes - nValueIngresado;
            // var nCajasEnPallet = nCajasEnPallet + nValueIngresado;
            var nResultado = nCajasEnPallet - nValueIngresado;
            var nCajasEnPallet = nCajasFaltantes + nValueIngresado;

            if (nResultado < 0) {
                var nMax = Number(oPosicion.CANTIDAD_PALLET_ORIGINAL) + Number(oPosicion.CJ_FALTANTES_ORIGINAL);
                oPosicion.CJ_FALTANTES = nMax;
                oPosicion.CAJAS_PALLET = 0;
                // oPosicion.CJ_FALTANTES = 0;
                // oPosicion.CAJAS_PALLET = nMax;
                oTextBoxCajasFaltantes.setText(nMax);
                // nValueIngresado = oPosicion.CJ_FALTANTES_ORIGINAL; // oPosicion.CANTIDAD_PALLET_ORIGINAL;
                nValueIngresado = oPosicion.CANTIDAD_PALLET_ORIGINAL; // oPosicion.CANTIDAD_PALLET_ORIGINAL;
                oSource.setValue(nValueIngresado);
                oPosicion.CJ_FUSIONAR = nValueIngresado;
                return;
            }

            // oPosicion.CJ_FALTANTES = nResultado;
            oPosicion.CJ_FALTANTES = nCajasEnPallet;
            oPosicion.CAJAS_PALLET = nResultado;
            // oPosicion.CAJAS_PALLET = nCajasEnPallet;
            // oPosicion.CAJAS_PALLET = nResultado;
            // oTextCajasFaltantes.setText(nCajasEnPallet); //(nResultado);
            oTextBoxCajasFaltantes.setText(nCajasEnPallet); //(nResultado);
            oSource.setValue(nValueIngresado);
            oPosicion.CJ_FUSIONAR = nValueIngresado;
        },

        onRemontarPallets: function() {
            var oView = this.getView();
            var oModel = oView.getModel("mLista");
            var oModelPreparados = oView.getModel("mListaPreparados");
            var oListaPallets = oModel.getData();
            var oTable = oView.byId("table-lista_pallets_remontar");
            var oItems = oTable.getItems();

            var oArraysRemontar = new Array();

            oItems.forEach(item => {
                var oCells = item.getCells();
                var oCheckbox = oCells[0];
                var oInput = oCells[9];
                var oBindingObject = oInput.getBindingContext("mLista").getObject();

                var bSelected = oCheckbox.getSelected();
                var sValue = oInput.getValue();
                if (bSelected && sValue != "" && sValue != 0 && sValue != "0") {
                    oArraysRemontar.push(oBindingObject);
                }
                oCheckbox.setSelected(false);
                oInput.setEnabled(false);
                oInput.setValue("");
            });

            oArraysRemontar.forEach(pallet => {
                var oIndex = oListaPallets.findIndex(p => p.VENUM == pallet.VENUM);
                oListaPallets.splice(oIndex, 1);
            });

            var oListaPreparados = oModelPreparados.getData();
            oListaPreparados.forEach(p => {
                oArraysRemontar.push(p);
            });

            oModelPreparados.setData(oArraysRemontar);
            oTable.getBinding("items").refresh(true);
            oModel.refresh(true);
        },

        onGuardarPalletsRemontar: function() {
            var oView = this.getView();
            var oModelOdata = oView.getModel("ZEWM_0034");
            var oModelCabecera = oView.getModel("CABECERA");
            var oCabecera = oModelCabecera.getData();
            var oTable = oView.byId("table-lista_pallets_preparados_remontar");
            var oItems = oTable.getItems();

            var oJson = {
                "N_REMONTE_CAB": [{
                    "VENUM": oCabecera.VENUM,
                    "VEPOS": oCabecera.VENUM , // no se usa este campo, pero se debe pasar un valor
                    "NRO_PALLET": oCabecera.NRO_PALLET,
                    "MATNR": oCabecera.MATNR,
                    "CHARG": "", //no llega tampoco
                    "CAJAS_PALLET": String(oCabecera.CAJAS_PALLET),
                    "VEMEH": oCabecera.VEMEH,
                    "MAX_PALLETS": String(oCabecera.MAX_PALLETS),
                    "CJ_FALTANTES": String(oCabecera.CJ_FALTANTES),
                    "CJ_FUSIONAR": "0" // esto porque si cada posicion tiene sus cajas y su maximo de pallet
                }],
                "N_REMONTE_PALLET": []
            }

            oItems.forEach(item => {
                var oCells = item.getCells();
                var oElement = oCells[0];
                var oBinding = oElement.getBindingContext("mListaPreparados");
                var oPosicion = oBinding.getObject();
                var obj = {
                    "VENUM": oPosicion.VENUM,
                    "VEPOS": oPosicion.VEPOS,
                    "NRO_PALLET": oPosicion.NRO_PALLET,
                    "MATNR": oPosicion.MATNR,
                    "CHARG": oPosicion.CHARG,
                    "CAJAS_PALLET": String(oPosicion.CAJAS_PALLET),
                    "VEMEH": oPosicion.VEMEH,
                    "MAX_PALLETS": String(oPosicion.MAX_PALLETS),
                    "CJ_FALTANTES": String(oPosicion.CJ_FALTANTES),
                    "CJ_FUSIONAR": String(oPosicion.CJ_FUSIONAR)
                }

                oJson.N_REMONTE_PALLET.push(obj);
            });

            const THAT = this;

            sap.ui.core.BusyIndicator.show();

            oModelOdata.create("/RealizarRemontePalletSet", oJson, {
                "success": async function(response, header) {
                    sap.ui.core.BusyIndicator.hide();
                    var sMessage = "";
                    try {
                        sMessage = JSON.parse(header.headers["sap-message"]).message
                    } catch (e) {
                        sMessage = "Se realizó el remonte de Pallet correctamente";
                    }
                    await MensajesObject._MensajeExito(sMessage);
                    THAT.onPressInicion();
                },
                "error": function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    try {
                        if (oError.responseText) {
                            var oErrorJson = JSON.parse(oError.responseText);
                            var oErrorObject = oErrorJson.error;
                            if (oErrorObject) {
                                var oMessage = "";
                                var oInnerError = oErrorObject.innererror;

                                if (oInnerError) {
                                    var oDetallesErrores = oInnerError.errordetails;
                                    if (oDetallesErrores.length > 0) {
                                        oDetallesErrores.forEach(detalle => {
                                            oMessage += '- ' + detalle.message + '\n';
                                        });
                                    }
                                }

                                if (!oMessage) {
                                    var oErrorMessage = oErrorObject.message;
                                    if (oErrorMessage) {
                                        oMessage += '- ' + oErrorMessage.value + '\n';
                                    }
                                }

                                MensajesObject._MensajeError(oMessage);
                            }
                        }
                    } catch (e) {
                        MensajesObject._MensajeError("Ha ocurrido un error");
                    }
                }
            });
        }
    });
});