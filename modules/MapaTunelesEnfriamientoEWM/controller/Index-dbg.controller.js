sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function(Controller, formatter, JSONModel, MensajesObject) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.MapaTunelesEnfriamientoEWM.controller.Index", {

        formatter: formatter,
        dataBus: {},
        _Fragmento: new Object(),

        onAfterRendering: function() {},

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "MapaTunelesEnfriamientoMMPPEWMView", this._busSuscribe, this);

            var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0020_SRV");

            this.getView().setModel(oData, "ZEWM_0020");

            var oFiltros = [{ "value": "T01" }, { "value": "T02" }, { "value": "T03" }, { "value": "T04" }, { "value": "T05" }, { "value": "T06" }, { "value": "T07" }, { "value": "T08" }, { "value": "T09" }, { "value": "T10" }, { "value": "T11" }, { "value": "T12" }, { "value": "T13" }, { "value": "T14" }, { "value": "T15" }, { "value": "T16" }, { "value": "T17" }, { "value": "T18" }, { "value": "T19" }, { "value": "T20" }, { "value": "T21" }, { "value": "T22" }, { "value": "T23" }, { "value": "T24" }];

            this.getView().setModel(new JSONModel(oFiltros), "mFiltros");
            this.getView().setModel(new JSONModel([]), "mDetalleVisualizacion");
            this.getView().setModel(new JSONModel([]), "mPalletSaldos"); //@SCH-roll out EWM Fase 2
        },

        onBeforeRendering: function() {
            this.getView().byId("grid_list-botones_filtros").fireSelectionChange();
        },

        onChangeFilter: async function(oEvent) {
            var oView = this.getView();
            try {
                var oData = oView.getModel("ZEWM_0020");
                var oListItem = oEvent.getParameter("listItems")
                if (oListItem) {
                    oListItem = oListItem.shift()
                    var oBinding = oListItem.getBindingContext("mFiltros");
                    var oElement = oBinding.getObject();
                    var sFilterValue = oElement.value;
                } else {
                    var sFilterValue = "T01";
                }
                const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks; // Centro GE 2-12-2024
                var obj = {
                    "ILgber": sFilterValue,
                    "DeepToTunel": [],
                    "DeepToProducto": [],
                    "PalletSaldosTunel": [],   //@SCH-roll out EWM Fase 2                   
                    "I_WERKS": sCentro  // Centro GE 2-12-2024
                }
                
                var sUrl = "/DeepMapaTunelSet";

                oView.setBusyIndicatorDelay(100);
                oView.setBusy(true);
                var oResponse = await new Promise(resolve => {
                    oData.create(sUrl, obj, {
                        "success": function(response, header) {
                            oView.setBusy(false);
                            try {
                                resolve(response);
                            } catch (e) {
                                resolve([]);
                            }
                        },
                        "error": function(error) {
                            oView.setBusy(false);
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
                            MensajesObject._MensajeError(oMensajeError);
                            resolve([]);
                        }
                    });
                });

                if(oResponse.DeepToTunel) {
                    var oArrayIzquierda = oResponse.DeepToTunel.results.filter(r => r.Zlado == "IZ");
                    var oArrayDerecha = oResponse.DeepToTunel.results.filter(r => r.Zlado != "IZ");
    
                    oView.setModel(new JSONModel(oArrayIzquierda), "mItemsIzquierda");
                    oView.setModel(new JSONModel(oArrayDerecha), "mItemsDerecha");
    
                    var oListIzquierda = oView.byId("grid_list-items_izquierda");
                    var oListDerecha = oView.byId("grid_list-items_derecha");
    
                    this.pintarItemsLista(oListIzquierda, "mItemsIzquierda");
                    this.pintarItemsLista(oListDerecha, "mItemsDerecha");

                    if(oResponse.DeepToProducto) {
                        oView.getModel("mDetalleVisualizacion").setData( oResponse.DeepToProducto.results );                        
                    }
                    
                    if(oResponse.PalletSaldosTunel) {                                                           //@SCH-roll out EWM Fase 2
                        oView.getModel("mPalletSaldos").setData( oResponse.PalletSaldosTunel.results );         //@SCH-roll out EWM Fase 2                     
                    }                                                                                      //@SCH-roll out EWM Fase 2
                    
                }
            } catch (e) {
                oView.setBusy(false);
                debugger
            }
        },

        pintarItemsLista: function(oList, sModelo) {
            try {
                var oItems = oList.getItems();

                oItems.forEach(i => {
                    i.removeStyleClass("FondoRojo");
                    i.removeStyleClass("FondoVerde");
                    var oBinding = i.getBindingContext(sModelo);
                    var oElement = oBinding.getObject();
                    var sColor = oElement.Zcolor;
                    var sColorPintar = sColor == "ROJO" ? "FondoRojo" : "FondoVerde";
                    i.addStyleClass(sColorPintar);
                });
            } catch (e) {
                debugger;
            }
        },

        onAfterRendering: function() {
            try {
                var oView = this.getView();
                var oGridList = oView.byId("grid_list-botones_filtros");
                var oItems = oGridList.getItems();
                var oPrimerItem = oItems[0];
                oGridList.setSelectedItemById(oPrimerItem.getId());
            } catch (e) {
                debugger
            }
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onPressItem: function(oEvent, sModelo) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext(sModelo);
            var oElement = oBinding.getObject();

            var sNombre = "ModalVisualizacionDetalle";
            
            if(oElement.IndSaldo.toUpperCase() == "X"){         //@SCH-roll out EWM Fase 2
            	sNombre = "ModalVisualizacionDetalleSaldos";    //@SCH-roll out EWM Fase 2
            }                                                   //@SCH-roll out EWM Fase 2

            var nombre_fragmento = "AvocadoProyecto.AvocadoProyecto.modules.MapaTunelesEnfriamientoEWM.fragments." + sNombre;

            if (!this._Fragmento[sNombre]) {
                try {
                    this._Fragmento[sNombre] = sap.ui.xmlfragment(nombre_fragmento, this);
                    oView.addDependent(this._Fragmento[sNombre]);
                } catch (e) {
                    debugger
                    //mensaje error
                    return;
                }
            }

            if(oElement.Producto.toUpperCase() == "MIX"){
                var oModelDetalles = oView.getModel("mDetalleVisualizacion");
                var oDetalles = oModelDetalles.getData().filter( d => d.Lgber == oElement.Lgber && d.Ubicacion == oElement.Ubicacion );
                sap.ui.getCore().byId("element-producto_normal").setVisible(false);
                sap.ui.getCore().byId("element-cantidad_cajas_sin_mix").setVisible(false);
                sap.ui.getCore().byId("element-producto_mix").setVisible(true);
                this._Fragmento[sNombre].setModel( new JSONModel(oDetalles), "mListaCajas");
                this._Fragmento[sNombre].getModel("mListaCajas").refresh(true);
            }
            

            if(oElement.IndSaldo.toUpperCase() == "X"){                                                                                             //@SCH-roll out EWM Fase 2
            	var oModelPalletSaldos = oView.getModel("mPalletSaldos");                                                                           //@SCH-roll out EWM Fase 2
            	var oDetallePalSaldos = oModelPalletSaldos.getData().filter( d => d.Lgber == oElement.Lgber && d.Ubicacion == oElement.Ubicacion ); //@SCH-roll out EWM Fase 2
            	this._Fragmento[sNombre].setModel( new JSONModel(oDetallePalSaldos), "mListaPalletSaldos");                                                 //@SCH-roll out EWM Fase 2
            	this._Fragmento[sNombre].getModel("mListaPalletSaldos").refresh(true);                                                              //@SCH-roll out EWM Fase 2
            }                                                                                                                                       //@SCH-roll out EWM Fase 2
            
            
            
            this._Fragmento[sNombre].setModel(new JSONModel(oElement), "mDetalle");

            this._Fragmento[sNombre].open();
        },
        
        //Inicio SCH-2025
        onCerrarFragmentoSaldos: function() {
            var sNombre = "ModalVisualizacionDetalleSaldos";
            this._Fragmento[sNombre].destroy();
            delete this._Fragmento[sNombre];
        },
      //Fin SCH-2025

        onCerrarFragmento: function() {
            var sNombre = "ModalVisualizacionDetalle";
            this._Fragmento[sNombre].destroy();
            delete this._Fragmento[sNombre];
        }

    });
});