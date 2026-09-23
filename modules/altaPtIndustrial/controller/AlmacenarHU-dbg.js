sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function(JSONModel, MensajesObject) {
    "use strict";

    return {

        _UbicacionValidad: false,

        onAbrirAlmacenarHU: async function(oEvent) {
            var oView = this.getView();

            try {
                oView.getModel("mAlmacenarHU").setData({});
                oView.getModel("mListaHU").setData([]);
                oView.getModel("mListaHUEscaneadas").setData([]);
                oView.getModel("mCantidadesHU").setData({ "disponibles": 0, "preparadas": 0 });
            } catch (e) {
                oView.setModel(new JSONModel({}), "mAlmacenarHU");
                oView.setModel(new JSONModel([]), "mListaHU");
                oView.setModel(new JSONModel([]), "mListaHUEscaneadas");
                oView.setModel(new JSONModel({ "disponibles": 0, "preparadas": 0 }), "mCantidadesHU");
            }

            var sNombre = "AlmacenarHU";
            var sPath = "AvocadoProyecto.AvocadoProyecto.modules.altaPtIndustrial.fragments.";
            var sPathCompleto = sPath + sNombre;

            try {
                if (!this._Fragmento[sNombre]) {
                    this._Fragmento[sNombre] = sap.ui.xmlfragment(sPathCompleto, this);
                    oView.addDependent(this._Fragmento[sNombre]);
                }
            } catch (e) {
                debugger
            }

            oView.getModel("mBusy").setProperty("/iniciar", true);

            await this.recuperarAlmacenesOrigen();

            oView.getModel("mBusy").setProperty("/iniciar", false);

            this._Fragmento[sNombre].open();
        },

        recuperarAlmacenesOrigen: async function() {
            var oView = this.getView();
            var oData = oView.getModel("ZEWM_0011");
            //SCH - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oFiltros = new Array(  
                            new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)                    
                            );
            //SCH-Fin
            
            var oResponse = await new Promise(resolve => {
                oData.read("/AlmacenarTipoAlmacenesOrigenSet", {
                	//SCH - Inicio
                	filters: oFiltros,
                	//SCH-Fin
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

            oView.setModel(new JSONModel(oResponse), "mAyudaAlmacenesDestino");
            return true;
        },

        onBuscarListaHuEscanearAlmacenamiento: async function() {
        	//SCH-Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //SCH-Fin
            var oView = this.getView();
            var oModelFiltros = oView.getModel("mAlmacenarHU")
            var oData = oView.getModel("ZEWM_0011");

            var sIdAlmacenOrigen = oModelFiltros.getProperty("/IdTipoAlmacen");

            if (!sIdAlmacenOrigen) {
                MensajesObject._MensajeAdvertencia("Falta el campo clave 'Almacen'");
                return;
            }

            oView.getModel("mBusy").setProperty("/iniciar", true);

            var oFiltros = new Array(
                new sap.ui.model.Filter("IdTipoAlmacen", sap.ui.model.FilterOperator.EQ, sIdAlmacenOrigen),
                new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)
            );

            var oResponse = await new Promise(resolve => {
                oData.read("/AlmacenarUnidadesDeManipulacionSet", {
                    filters: oFiltros,
                    "success": function(response, header) {
                        var oResponse = [];
                        try {
                            oResponse = response.results;
                        } catch (e) {
                            debugger
                            oResponse = [];
                        }
                        resolve(oResponse);
                    },
                    "error": function(error) {
                        resolve([]);
                    }
                });
            });

            oView.getModel("mBusy").setProperty("/iniciar", false);

            if (oResponse.length > 0) {
                oResponse.forEach(r => {
                    r.HUEscaneadas = Number(r.IdPalletV2);
                });
                oView.getModel("mCantidadesHU").setProperty("/disponibles", oResponse.length);
                oView.getModel("mCantidadesHU").refresh(true);
            } else {
                await MensajesObject._MensajeAdvertencia("No se encontraron HUs Disponibles");
            }

            oView.getModel("mListaHU").setData(oResponse);
            return true;
        },

        onValidarUbicacionEscaneada: async function(oEvent) {
        	//SCH-Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //SCH-Fin
        	var oView = this.getView();
            var oData = oView.getModel("ZEWM_0011");
            var oModelFiltros = oView.getModel("mAlmacenarHU");
            // var oSource = oEvent.getSource();

            var sIdUbicacion = oModelFiltros.getProperty("/EscanearUbicacion");
            var sIdTipoAlmacen = oModelFiltros.getProperty("/IdTipoAlmacen");

            if (!sIdUbicacion) {
                MensajesObject._MensajeAdvertencia("Debe ingresar una ubicación");
                return;
            }

            if (!sIdTipoAlmacen) {
                MensajesObject._MensajeAdvertencia("Debe ingresar un almacen");
                return;
            }

            var oJson = {
                "IdUbicacion": sIdUbicacion,
                "IdTipoAlmacen": sIdTipoAlmacen,
              //SCH-Inicio
                "I_WERKS": sCentro
              //SCH-Fin  
            }

            var sType = "PUT";
            var sUrl = `/sap/opu/odata/sap/ZEWM_0011_SRV/AlmacenarUbicacionSet(IdUbicacion='${sIdUbicacion}')`;
            var oToken = oData.getHeaders()["x-csrf-token"];

            oView.getModel("mBusy").setProperty("/iniciar", true);

            var oResponse = await new Promise(resolve => {
                $.ajax({
                    type: sType,
                    url: sUrl,
                    data: JSON.stringify(oJson),
                    dataType: 'json',
                    async: true,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        "X-Requested-With": "XMLHttpRequest",
                        "DataServiceVersion": "2.0",
                        "X-CSRF-Token": oToken
                    },
                    success: function(data, header) {
                        resolve(true);
                    },
                    error: function(data, header) {
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
                        resolve(false);
                    }
                });
            });

            oView.getModel("mBusy").setProperty("/iniciar", false);

            this._UbicacionValidad = oResponse;
            return oResponse;
        },

        onPasarEscaneoUbicacion: function() {
            var oView = this.getView();
            var oModel = oView.getModel("mListaHU");
            var oModelFiltros = oView.getModel("mAlmacenarHU");
            var oModelPreparados = oView.getModel("mListaHUEscaneadas");

            if (oModelPreparados.getData().length == 2) {
                sap.m.MessageToast.show("Maximo HU escaneadas posibles.");
                return;
            }

            var sIdEscaneado = oModelFiltros.getProperty("/EscanearHU");

            if (!sIdEscaneado) {
                MensajesObject._MensajeAdvertencia("Debe ingresar un HU a escanear");
                return;
            }

            var oListaDisponibles = oModel.getData();
            var nIndexExistente = oListaDisponibles.findIndex(h => h.IdPalletToBeScaned == String(sIdEscaneado).trim());

            if (nIndexExistente >= 0) {
                sap.ui.getCore().byId("input-escanear_ubicacion_almacenar_hu").focus();
            } else {
                MensajesObject._MensajeAdvertencia("El código escaneado no se encuentra en la lista de HUs disponibles");
            }
        },

        onEntrarHuEscaneada: async function() {
            var oView = this.getView();
            var oModel = oView.getModel("mListaHU");
            var oModelFiltros = oView.getModel("mAlmacenarHU");
            var oModelPreparados = oView.getModel("mListaHUEscaneadas");

            var sIdEscaneado = oModelFiltros.getProperty("/EscanearHU");
            sIdEscaneado = String(sIdEscaneado).trim();
            var sUbicacionDestino = oModelFiltros.getProperty("/EscanearUbicacion");

            if (!sIdEscaneado) {
                MensajesObject._MensajeAdvertencia("Debe ingresar un HU a escanear");
                return;
            }

            if (!sUbicacionDestino) {
                MensajesObject._MensajeAdvertencia("Debe ingresar una ubicación");
                return;
            }

            // if (!this._UbicacionValidad) {
            var oResponse = await this.onValidarUbicacionEscaneada();
            if (!oResponse) return;
            // }

            if (oModelPreparados.getData().length == 2) {
                sap.m.MessageToast.show("Maximo HU escaneadas posibles.");
                return;
            }

            var oListaDisponibles = oModel.getData();

            var nIndexEliminar = oListaDisponibles.findIndex(h => h.IdPalletToBeScaned == sIdEscaneado); //SCH-15.04.2025
           // let aPreparadas=oListaDisponibles.filter(h => h.IdPalletToBeScaned == sIdEscaneado);           //SCH-15.04.2025

            if (nIndexEliminar >= 0) {                                                                  //SCH-15.04.2025
                var oHUEscaneado = oListaDisponibles[nIndexEliminar];                                   //SCH-15.04.2025
            //if (aPreparadas.length >= 0) {                                                                //SCH-15.04.2025
                var oAux = new Object();                                                                //SCH-15.04.2025
                Object.assign(oAux, oHUEscaneado);                                                      //SCH-15.04.2025

                oListaDisponibles.splice(nIndexEliminar, 1);                                           //SCH-15.04.2025
            	//oListaDisponibles =oListaDisponibles.filter(h => h.IdPalletToBeScaned !== sIdEscaneado); //SCH-15.04.2025
            	oModel.setData(oListaDisponibles);
                oModel.refresh(true);

                if (sUbicacionDestino) {                                          //SCH-15.04.2025
                     oAux.Mostrar = sIdEscaneado + " - " + sUbicacionDestino;     //SCH-15.04.2025
                     oAux.UbicacionEscaneada = sUbicacionDestino;                 //SCH-15.04.2025
                  } else {                                                        //SCH-15.04.2025
                     oAux.Mostrar = sIdEscaneado;                                 //SCH-15.04.2025
                     oAux.UbicacionEscaneada = "";                                //SCH-15.04.2025
                 }                                                                //SCH-15.04.2025

                oModelPreparados.getData().push(oAux);                                                //SCH-15.04.2025
               // oModelPreparados.setData(oModelPreparados.getData().concat(aPreparadas));               //SCH-15.04.2025
                oModelPreparados.refresh(true);

                try {
                    var oModel = oView.getModel("mCantidadesHU");
                    var nDisponibles = oModel.getProperty("/disponibles");
                    var nPreparadas = oModel.getProperty("/preparadas");
                    nDisponibles--;                                                                  //SCH-15.04.2025
                    nPreparadas++;                                                                   //SCH-15.04.2025
                    //nDisponibles= nDisponibles - aPreparadas.length;                                   //SCH-15.04.2025
                    //nPreparadas = nPreparadas + aPreparadas.length ;                                   //SCH-15.04.2025
                    oModel.setProperty("/disponibles", nDisponibles);
                    oModel.setProperty("/preparadas", nPreparadas);
                    oModel.refresh(true);
                } catch (e) {
                    debugger;
                }

                oModelFiltros.setProperty("/EscanearHU", "");
                oModelFiltros.setProperty("/EscanearUbicacion", "");
                this._UbicacionValidad = false;

                sap.ui.getCore().byId("input-escanear_hu_almacenar_hu").focus();
            } else {
                MensajesObject._MensajeAdvertencia("El código escaneado no se encuentra en la lista de HUs disponibles");
            }
        },

        onEliminarHUPreparadoAlmacenamiento: function(oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mListaHUEscaneadas");
            var oListaDisponibles = oModel.getData();
            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("mListaHUEscaneadas");
            var oElement = oBinding.getObject();
            var sPath = oBinding.getPath();
            var nIndex = sPath.split("/").pop();

            var oAux = new Object();
            Object.assign(oAux, oElement);

            oListaDisponibles.splice(nIndex, 1);
            oModel.setData(oListaDisponibles);
            oModel.refresh(true);

            var oModelDisponibles = oView.getModel("mListaHU");
            oModelDisponibles.getData().push(oAux);
            oModelDisponibles.refresh(true);

            try {
                var oModel = oView.getModel("mCantidadesHU");
                var nDisponibles = oModel.getProperty("/disponibles");
                var nPreparadas = oModel.getProperty("/preparadas");
                nDisponibles++;
                nPreparadas--;
                oModel.setProperty("/disponibles", nDisponibles);
                oModel.setProperty("/preparadas", nPreparadas);
                oModel.refresh(true);
            } catch (e) {
                debugger;
            }
        },

        onGuardarAlmacenamientoHU: async function() {        	
            var oView = this.getView();
            var oModelCantidades = oView.getModel("mCantidadesHU");
            var oModelFiltros = oView.getModel("mAlmacenarHU");
            var oModelListaEscaneadas = oView.getModel("mListaHUEscaneadas");
            var oLista = oModelListaEscaneadas.getData();

            oView.getModel("mBusy").setProperty("/iniciar", true);

            var sMensajeSuccess = "";

            var sUrl = "/AlmacenarUdmEnUbicacionSet";

            var oPrimerRequestElement = oLista[0];

            if (oPrimerRequestElement) {
                let oJson = {
                    "IdGuidParent": oPrimerRequestElement.IdGuidParent,
                    "IdGuidStock": oPrimerRequestElement.IdGuidStock,
                    "IdTipoAlmacen": oPrimerRequestElement.IdTipoAlmacen,
                    "IdUbicacion": oPrimerRequestElement.UbicacionEscaneada,
                    "IdPallet": oPrimerRequestElement.IdPallet,
                    "IdTarea": "",
                    "IdAlmacen": oPrimerRequestElement.IdAlmacen
                }

                let oResponse = await this.almacenarHURequest(sUrl, oJson);

                if (oResponse) {
                    sMensajeSuccess += oResponse;
                    let sHU = oPrimerRequestElement.IdPalletToBeScaned;

                    let nIndex = oLista.findIndex(e => e.IdPalletToBeScaned == sHU);
                    if (nIndex >= 0) {
                        oLista.splice(nIndex, 1);
                    }
                }
            }



            var oSegundoRequestElement = oLista[0];

            if (oSegundoRequestElement) {
                var oJson = {
                    "IdGuidParent": oSegundoRequestElement.IdGuidParent,
                    "IdGuidStock": oSegundoRequestElement.IdGuidStock,
                    "IdTipoAlmacen": oSegundoRequestElement.IdTipoAlmacen,
                    "IdUbicacion": oSegundoRequestElement.UbicacionEscaneada,
                    "IdPallet": oSegundoRequestElement.IdPallet,
                    "IdTarea": "",
                    "IdAlmacen": oSegundoRequestElement.IdAlmacen
                }

                let oResponse = await this.almacenarHURequest(sUrl, oJson);

                if (oResponse) {
                    sMensajeSuccess += "\n" + oResponse;
                    let sHU = oSegundoRequestElement.IdPalletToBeScaned;

                    let nIndex = oLista.findIndex(e => e.IdPalletToBeScaned == sHU);
                    if (nIndex >= 0) {
                        oLista.splice(nIndex, 1);
                    }
                }
            }
            
            await this.onBuscarListaHuEscanearAlmacenamiento();  //SCH
            oView.getModel("mBusy").setProperty("/iniciar", false);

            if (!sMensajeSuccess) return;

            sap.m.MessageBox.success(sMensajeSuccess, {
                title: "Se proceso el almacenamiento"
            });

            oModelListaEscaneadas.setData(oLista);
            oModelListaEscaneadas.refresh(true);

            oModelCantidades.setProperty("/preparadas", 0);
            oModelCantidades.refresh(true);
            
        },

        almacenarHURequest: function(sUrl, oJson) {
            var oView = this.getView();
            var oData = oView.getModel("ZEWM_0011");
            return new Promise(resolve => {
                oData.create(sUrl, oJson, {
                    "success": async function(response, header) {
                        resolve("Tarea de Alm. EWM " + response.IdTarea);
                    },
                    "error": async function(response) {
                        MensajesObject._TratarError(response);
                        resolve(false);
                    }
                });
            });
        }

    }
});