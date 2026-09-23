sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function(Controller, formatter, JSONModel, MensajesObject) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.asignarcontenedor.controller.Index", {

        formatter: formatter,
        dataBus: {},

        onInit: async function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "AsignarContenedorIndexView", this._busSuscribe, this);

            var oView = this.getView();
            var oTable = oView.byId("table-pedidos_despacho");

            var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0005_SRV");

            oTable.setBusyIndicatorDelay(100);
            oTable.setBusy(true);
            /// GE 26-11-2024
            
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oFilter = new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro);
            var oFiltros = [                
                oFilter
            ];
            ///GE 26-11-2024 ///
            var oResponse = await new Promise(resolve => {
            	
                oData.read("/PedidosSet", {
                	filters: oFiltros,
                    "success": function(response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": async function(error) {
                        resolve([]);
                    }
                });
            });

            oTable.setBusy(false);

            oView.setModel(oData, "ZEWM_0005");

            oView.setModel(new JSONModel(oResponse), "mListaContenedoresAsignar");

            var oData2 = new sap.ui.model.odata.v2.ODataModel("/sap/bc/ZPPWS_DESP_IND/G_CEN_LIST/P01/P02/P03/P04/P05/P06/P07/P08");
             sap.ui.getCore().setModel(oModel, "centrov2");

             var oResponse = await new Promise(resolve => {
                oData.read("/PedidosSet", {
                    "success": function(response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": async function(error) {
                        resolve([]);
                    }
                });
            });
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },
        onprueba: function(oEvent) {
        var texto5 = "/sap/bc/ZPPWS_DESP_IND/G_CEN_LIST/P01/P02/P03/P04/P05/P06/P07/P08";
        var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
        console.log(oModelC);
         oModelC.attachRequestCompleted(function () {
        try {
          var myParamZ = oThis.getView().getModel("STGR");
          var cont = oModelC.getProperty("/ITAB");
          console.log(cont);

        } catch (err) {

        }
      }.bind(this));
        },
        onFiltrarTabla: function(oEvent) {
            var oSource = oEvent.getSource();
            var oValue = oSource.getValue();

            var oFiltros = new Array(
                new sap.ui.model.Filter("IdPedido", sap.ui.model.FilterOperator.Contains, oValue),
                new sap.ui.model.Filter("Cliente", sap.ui.model.FilterOperator.Contains, oValue),
                new sap.ui.model.Filter("Destino", sap.ui.model.FilterOperator.Contains, oValue),
                new sap.ui.model.Filter("Zona", sap.ui.model.FilterOperator.Contains, oValue),
                new sap.ui.model.Filter("Estado", sap.ui.model.FilterOperator.Contains, oValue),
                new sap.ui.model.Filter("NroOrden", sap.ui.model.FilterOperator.Contains, oValue),
                new sap.ui.model.Filter("NroViaje", sap.ui.model.FilterOperator.Contains, oValue)
            );

            var oTable = this.getView().byId("table-pedidos_despacho");
            var binding = oTable.getBinding("items");
            binding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },

        onSelectItem: async function(oEvent) {
            var oModelOdata = this.getView().getModel("ZEWM_0005");

            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("mListaContenedoresAsignar");
            var object = oBinding.getObject();

            // if (object.Estado == "Pendiente") {
            //     var oMensajeError = "Seleccione un pedido con estado diferente a pendiente";

            //     MensajesObject._MensajeError(oMensajeError);
            //     return;
            // };


            var oViewId = "SeleccionTransporteContenedoresView";
            var oPathView = "AvocadoProyecto.AvocadoProyecto.modules.asignarcontenedor.view.SeleccionTransporteContenedores";
            this.dataBus.oView.oController.onSplitRouter(oViewId, oPathView, 18);
            this.getView().destroy();

            var oNextView = sap.ui.getCore().byId(oViewId);
            oNextView.setModel(new JSONModel(object), "CABECERA");
            var oTablaContenedores = oNextView.byId("table-contendedores_sin_asignar");
            /*
            oTablaContenedores.setBusyIndicatorDelay(1)
            oTablaContenedores.setBusy(true);
            var oFiltros = new Array(
                new sap.ui.model.Filter("IdPedido", sap.ui.model.FilterOperator.EQ, object.IdPedido)
            );
            var oResponse = await new Promise(resolve => {
                oModelOdata.read("/TransportesSet", {
                    filters: oFiltros,
                    "success": function(response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": async function(error) {
                        resolve([]);
                    }
                });
            });
            oTablaContenedores.setBusy(false);
            */

            oNextView.setModel(oModelOdata, "ZEWM_0005");

            var oContenedorAsignado = new Array();

            var objAux = new Object();
            Object.assign(objAux, object);

            if (objAux.IdContenedor) {
                objAux.Estado = "X";
                oContenedorAsignado.push(objAux);
            }

            var oContenedoresSinAsignar = new Array();
            /*
            oResponse.forEach(contenedor => {
                //if (contenedor.Estado) {
                //    oContenedorAsignado.push(contenedor);
                //} else {
                oContenedoresSinAsignar.push(contenedor);
                // }
            });
            */
            oNextView.getModel("CONTENEDORES_SIN_ASIGNAR").setData(oContenedoresSinAsignar);
            oNextView.getModel("CONTENEDORES_ASIGNADOS").setData(oContenedorAsignado);

            oNextView.getModel("CONTENEDORES_SIN_ASIGNAR").refresh(true);
            oNextView.getModel("CONTENEDORES_ASIGNADOS").refresh(true);

            if (oContenedorAsignado.length > 0) {
                oNextView.getController().habilitacionBotonesAgregarContenedor(false);
            } else if (oContenedoresSinAsignar.length > 0) {
                oNextView.getController().habilitacionBotonesAgregarContenedor(true);
            }
            oNextView.getController().handleCleanFilterContSinAsig()
        }
    });
});