sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject",
    "./FragmentsFunctions",
    "./CrearHU",
    "./TrasladoHU",
    "./AlmacenarHU",
    "./RemontarHU"
], function(Controller, formatter, JSONModel, MensajesObject, FragmentsFunctions, CrearHU, TrasladoHU, AlmacenarHU,RemontarHU) {
    "use strict";

    var oControllerFunctions = {
        formatter: formatter,
        dataBus: {},
        // _Fragmento: new Object(),
        // _Filtros: new Object(),

        onAfterRendering: function() {},

        onInit: async function() {
            var oView = this.getView();
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "AltaPTindustrialView", this._busSuscribe, this);

            var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0011_SRV");

            oView.setModel(oData, "ZEWM_0011");
            oView.setModel(new JSONModel([]), "mListaPrincipal");
            oView.setModel(new JSONModel([]), "mListaHUCreados");
            oView.setModel(new JSONModel({
                "iniciar": false,
            }), "mBusy");
            oView.setModel(new JSONModel({
                "IdCentro": "",
                "Guia": "",
                "IdEmpresa": "",
                "IdModulo": "",
                "IdVariedad": ""
            }), "mFiltros");
            
          //SC - Inicio
            //  oView.setBusy(true);          
            //  var oResponse = await new Promise(resolve => {
            //     oData.read("/CentrosSet", {
            //         "success": function(response, header) {
            //             try {
                        	//                resolve(response.results)
            //            } catch (e) {
            //                resolve([]);
            //            }
            //        },
            //        "error": function(response) {
            //            resolve([]);
            //        }
            //    });
            // });

            //  oView.setBusy(false);

            //oView.setModel(new JSONModel(oResponse), "mListaAyudaCentro");

            //if (oResponse.length == 1) {
            //    var oFilterModel = oView.getModel("mFiltros");
            //     oFilterModel.setProperty("/IdCentro", oResponse[0].IdCentro);
            // }
                   
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oFilterModel = oView.getModel("mFiltros");
            oFilterModel.setProperty("/IdCentro", sCentro);
            
            //MatchCode Guias - Impresoras
            oView.getModel("mBusy").setProperty("/iniciar", true);
            await this.recuperarGuia();
            await this.recuperarImpresoras ();
            oView.getModel("mBusy").setProperty("/iniciar", false);
           //SC - Fin
            
          //SCH - Inicio matchode impresora remonte  
            //  var oDataB = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0001_SRV");
            // var oResponseImpresora = await new Promise(resolve => {
            	//     oDataB.read("/Grupo_ImpresorasSet", {                    
            //        filters: [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)],                                          	                    
            //         "success": function (response, header) {
                    	//             try {
            //                resolve(response.results);
            //            } catch (e) {
            //                resolve([]);
            //            }
            //        },
            //       "error": function (response) {
            //            resolve([]);
            //        }
            //     });
            //   });

            //  oView.setModel(new JSONModel(oResponseImpresora), "mListaGrupoImpresora");
          //SCH - Fin matchode impresora remonte 
            
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        ResetFilterInputState: function(oEvent) {
            var oSource = oEvent.getSource();
            oSource.setValueState("None");
        },

        onBuscar: async function() {
            var oView = this.getView();
            var oData = oView.getModel("ZEWM_0011");
            var oFiltrosModel = oView.getModel("mFiltros");
            var oFiltrosAgregar = oFiltrosModel.getData();
            var oFiltros = new Array();

            var oInputCentro = oView.byId("input-filter_centro");
            var sValue = oInputCentro.getValue();
            if (!String(sValue).trim() || typeof sValue == "undefined") {
                MensajesObject._MensajeError("El filtro CENTRO es obligatorio");
                oInputCentro.setValueState("Error");
                return;
            }

            Object.keys(oFiltrosAgregar).forEach(key => {
                if (!oFiltrosAgregar[key]) return;
                oFiltros.push(
                    new sap.ui.model.Filter(key, sap.ui.model.FilterOperator.Contains, `${oFiltrosAgregar[key]}`)
                )
            });

            oView.setBusy(true);

            var sUrl = "/RepLotesSet";

            var oResponse = await new Promise(resolve => {
                oData.read(sUrl, {
                    filters: oFiltros,
                    "success": function(response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": function(error) {
                        var sMensajeError = "Ocurrio un error en el servidor.";
                        try {
                            var oErrorJson = JSON.parse(error.responseText);
                            var oDetallesError = oErrorJson.error.innererror.errordetails;
                            if (!oDetallesError) {
                                sMensajeError = oErrorJson.error.message.value;
                            } else if (oDetallesError.length > 0) {
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
                        resolve([]);
                    }
                });
            });

            oView.setBusy(false);

            var oModel = oView.getModel("mListaPrincipal");
            oModel.setData(oResponse);
        },
        
      //Inicio SCH-Proyecto Guatemala
        recuperarGuia: async function() {
        	const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oView = this.getView();
            var oData = oView.getModel("ZEWM_0011");
            
            var oFiltros = new Array(
                    new sap.ui.model.Filter("IdCentro", sap.ui.model.FilterOperator.EQ, sCentro)
                );

            var oResponse = await new Promise(resolve => {
                oData.read("/GuiasSet", {
                	 filters: oFiltros,
                    "success": function(response, header) {
                        var oResponse = [];
                        try {
                            oResponse = response.results;
                        } catch (e) {
                            oResponse = [];
                        }
                        resolve(oResponse);
                    },
                    "error": function(error) {
                        resolve([]);
                    }
                });
            });

            oView.setModel(new JSONModel(oResponse), "mAyudaGuias");
            return true;
        },        
      
        recuperarImpresoras: async function() {
        	const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oView = this.getView();
            var oData = oView.getModel("ZEWM_0011");
            
            var oFiltros = new Array(
                    new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)
                );

            var oResponse = await new Promise(resolve => {
                oData.read("/ImpresorasSet", {
                	 filters: oFiltros,
                    "success": function(response, header) {
                        var oResponse = [];
                        try {
                            oResponse = response.results;
                        } catch (e) {
                            oResponse = [];
                        }
                        resolve(oResponse);
                    },
                    "error": function(error) {
                        resolve([]);
                    }
                });
            });

            oView.setModel(new JSONModel(oResponse), "mAyudaImpresoras");
            return true;
        } 
        
      //Fin SCH-Proyecto Guatemala
        
        
        
    }

    var funciones = {...oControllerFunctions, ...FragmentsFunctions, ...CrearHU, ...TrasladoHU, ...AlmacenarHU,...RemontarHU }

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.altaPtIndustrial.controller.Index", funciones);
});