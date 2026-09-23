sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject",
    "sap/m/MessageToast"
], function(Controller, formatter, JSONModel, MensajesObject, MessageToast) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.ImprimirEtiquetaPalletTag.controller.Index", {

        formatter: formatter,
        dataBus: {},
        _Fragmento: false,
        _FragmentoAyuda: false,

        onAfterRendering: function() {},

        onInit: async function() {
            // Se crea la suscripción al canal
            var oView = this.getView();
            var bus = sap.ui.getCore().getEventBus();
            await bus.subscribe("splitApp", "ImprimirEtiquetaPalletTagView", this._busSuscribe, this);

            try {
                var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0001_SRV/");
                oView.setModel(oData, "ZEWM_0001");
                var oData2 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0025_SRV/"); //+CML @Reimpresión Palletag
                oView.setModel(oData2, "ZEWM_0025");                                                    //+CML @Reimpresión Palletag
            } catch (error) {
                MensajesObject._MensajeError("Ocurrio un error al cargar el odata");
            }

            oView.setModel( new JSONModel({}), "mCampos")
            this.onAbrirFragmento("ModalInicial");
        },

        /**
         * @param {String} sUrl 
         * @param {Array} aFilters 
         */
        _Read: async function(sUrl = "", aFilters = []) {
            var oView = this.getView();
            var oDataService = oView.getModel("ZEWM_0001");
            return new Promise(resolve => {
                oDataService.read(sUrl, {
                    filters: aFilters,
                    "success": function(response, header) {
                        resolve(response.results);
                    },
                    "error": function(response) {
                        resolve([]);
                    }
                });
            });
        },

        _Post: async function(oUrl, oJson = {}) {
            var oView = this.getView();

            var odataService = oView.getModel("ZEWM_0025");

            return new Promise((resolve, reject) => {
                odataService.create(oUrl, oJson, {
                    success: async function(oResponse, oHeader) {
                        try {
                            var obj = JSON.parse(oHeader.headers["sap-message"]);
                            var severity = obj.severity;
                            var message = obj.message;
                            if(severity == "error"){
                                await MensajesObject._MensajeError( message );
                                resolve( false );
                            } else {
                                await MensajesObject._MensajeExito( message );
                            }
                        } catch (error) {
                            await MensajesObject._MensajeError("Ocurrió un error procesando la respuesta");
                            resolve(false);
                        }
                        if (oResponse) {
                            resolve(oResponse);
                        } else {
                            resolve(false);
                        }
                    },
                    error: function(oError, oHeader) {
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
                            //
                        }
                        resolve(false);
                    }
                });
            });
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
            return true;
        },

        onPressInicion: function() {
            try {
                this.dataBus.oView.oController.onPressInicion();
                this.getView().destroy();
            } catch (error) {
                debugger
                this.getView().destroy();
            }
        },

        onCerrarModal: function() {
            this._Fragmento.close();
            this._Fragmento.destroy();
            delete this._Fragmento;
            this.onPressInicion();
        },

        onCerrarFragmentoAyuda: function() {
            try {
                this._FragmentoAyuda.close();
            } catch (error) {
                //
            }
            this._FragmentoAyuda.destroy();
            delete this._FragmentoAyuda;
        },

        onAbrirAyudaBusquedaGrupoImpresora: async function(oEvent) {
            var sNombre = "AyudaGrupoImpresora";
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var oParent = oSource.getParent();
            var oFields = oParent.getFields();
            var oInput = oFields[0];

         //   var sUrl = "/ImpresoraSet";
              var sUrl = "/Grupo_ImpresorasSet";
            
            oSource.setBusy(true);
            oInput.setBusy(true);
           const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
           let afilters =[new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)]
            var oResponse = await this._Read(sUrl,afilters);
            // var oResponse = await this._Read(sUrl);
            var oModel = new JSONModel(oResponse);
            oSource.setBusy(false);
            oInput.setBusy(false);

            this._InputSeleccionadoMatchcode = oInput;
            var nombre_fragmento = "AvocadoProyecto.AvocadoProyecto.modules.ImprimirEtiquetaPalletTag.fragments." + sNombre;

            if (!this._FragmentoAyuda) {
                try {
                    this._FragmentoAyuda = sap.ui.xmlfragment(nombre_fragmento, this);
                    oView.addDependent(this._FragmentoAyuda);
                } catch (e) {
                    debugger
                    //mensaje error
                    return;
                }
            }

            this._FragmentoAyuda.open();
            this._FragmentoAyuda.setModel( oModel );
        },

        onAgregarValorAyudaImpresora: function(oEvent) {
            var sTitle = oEvent.getParameter("selectedItem").getTitle();
            this._InputSeleccionadoMatchcode.setValue( sTitle );
            this.onCerrarFragmentoAyuda();
        },

        onAbrirFragmento: function(sNombre) {
            var oView = this.getView();
            var nombre_fragmento = "AvocadoProyecto.AvocadoProyecto.modules.ImprimirEtiquetaPalletTag.fragments." + sNombre;

            if (!this._Fragmento) {
                try {
                    this._Fragmento = sap.ui.xmlfragment(nombre_fragmento, this);
                    oView.addDependent(this._Fragmento);
                } catch (e) {
                    debugger
                    //mensaje error
                    return;
                }
            }

            this._Fragmento.open();
        },

        onGuardar: async function() {
          //Inicio SCH
          const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
          // Fin SCH
            var oView = this.getView();
            var oModel = oView.getModel("mCampos");

            if(!oModel.getProperty("/Pallet")){
                MensajesObject._MensajeError("Debe ingresar un número de pallet");
                return;
            }

            if(!oModel.getProperty("/Impresora")){
                MensajesObject._MensajeError("Debe ingresar un grupo de impresora");
                return;
            }

            var sUrl = "/ImpresionSet";
            var obj  = {
                "Pallet": oModel.getProperty("/Pallet"),
                "Impresora": oModel.getProperty("/Impresora"),
                "I_WERKS": sCentro  //SCH
            }

            this._Fragmento.setBusy(true);
            var response = await this._Post(sUrl, obj);
            this._Fragmento.setBusy(false);
            
            if(response) {
                this.onPressInicion();
            }
        }
    });
});