sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function(JSONModel, MensajesObject) {
    "use strict";

    return {

        onAbrirTrasladoHU: async function(oEvent) {
            var oView = this.getView();

            var oInputCentro = oView.byId("input-filter_centro"); //esta en la primera pantalla de filtros
            var sIdCentro = oInputCentro.getValue().trim();

            if (!sIdCentro) {
                MensajesObject._MensajeAdvertencia("Debe seleccionar primero un centro");
                return;
            }

            try {
                oView.getModel("mTrasladoHU").setData({});
                oView.getModel("mListaHUDisponiblesTraslado").setData([]);
                oView.getModel("mListaHUPreparadasTraslado").setData([]);
                oView.getModel("mCantidadesHU").setData({ "disponibles": 0, "preparadas": 0 });
            } catch (e) {
                oView.setModel(new JSONModel({}), "mTrasladoHU");
                oView.setModel(new JSONModel([]), "mListaHUDisponiblesTraslado");
                oView.setModel(new JSONModel([]), "mListaHUPreparadasTraslado");
                oView.setModel(new JSONModel({ "disponibles": 0, "preparadas": 0 }), "mCantidadesHU");
            }

            oView.getModel("mCantidadesHU").refresh(true);

            var sNombre = "TrasladoHU";
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

            await this.recuperarAlmacen();
            await this.recuperarAlmacenesDestino();

            oView.getModel("mBusy").setProperty("/iniciar", false);

            this._Fragmento[sNombre].open();
        },

        recuperarAlmacen: async function() {
            var oView = this.getView();
            var oData = oView.getModel("ZEWM_0011");

            var oInputCentro = oView.byId("input-filter_centro"); //esta en la primera pantalla de filtros
            var sIdCentro = oInputCentro.getValue().trim();

            var oFiltros = new Array(
                new sap.ui.model.Filter("IdCentro", sap.ui.model.FilterOperator.EQ, sIdCentro)
            );

            var oResponse = await new Promise(resolve => {
                oData.read("/AlmacenesSet", {
                    filters: oFiltros,
                    "success": async function(response, header) {
                        var oResolve = new Object();
                        var oResponse;
                        try {
                            oResponse = response.results;
                            oResponse = oResponse.filter(r => r.IdAlmacen != "" && r.Descripcion != "");
                            if (oResponse.length > 0) {
                                oResolve = oResponse[0];
                            } else {
                                sap.ui.getCore().byId("form-cabecera_traslado_hu").setBlocked(true);
                                await MensajesObject._MensajeError("Error al cargar el Almacen");
                            }
                        } catch (e) {
                            sap.ui.getCore().byId("form-cabecera_traslado_hu").setBlocked(true);
                            await MensajesObject._MensajeError("Error al cargar el Almacen");
                        }
                        resolve(oResolve);
                    },
                    "error": function(error) {
                        sap.ui.getCore().byId("form-cabecera_traslado_hu").setBlocked(true);
                        MensajesObject._MensajeError("Error al cargar el Almacen");
                        resolve({});
                    }
                });
            });

            oView.getModel("mTrasladoHU").setProperty("/Almacen", oResponse.Descripcion);
            oView.getModel("mTrasladoHU").setProperty("/IdAlmacenOriginal", oResponse.IdAlmacen);
            return true;
        },

        recuperarAlmacenesDestino: async function() {
            var oView = this.getView();
            var oData = oView.getModel("ZEWM_0011");

            var oInputCentro = oView.byId("input-filter_centro"); //esta en la primera pantalla de filtros
            var sIdCentro = oInputCentro.getValue().trim();

            var oFiltros = new Array(
                new sap.ui.model.Filter("IdCentro", sap.ui.model.FilterOperator.EQ, sIdCentro)
            );

            var oResponse = await new Promise(resolve => {
                oData.read("/AlmacenesDestinoSet", {
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

            oView.setModel(new JSONModel(oResponse), "mAyudaAlmacenesDestino");
            return true;
        },

        buscarHUDisponiblesTraslado: async function() {
            var oView = this.getView();
            var oModelFiltros = oView.getModel("mTrasladoHU")
            var oData = oView.getModel("ZEWM_0011");

            var oModelFiltros = oView.getModel("mTrasladoHU");
            var sIdAlmacen = oModelFiltros.getProperty("/IdAlmacenOriginal");
            var sAlmacenDestino = oModelFiltros.getProperty("/AlmacenDestino");
            //SCH-Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks; //SCH-EWM Avopack Guatemala 2024
            //SCH-Fin
            
            if (!sIdAlmacen) {
                MensajesObject._MensajeAdvertencia("Falta el campo clave 'Almacen'");
                return;
            }

            if (!sAlmacenDestino) {
                MensajesObject._MensajeAdvertencia("Falta el campo clave 'Almacen Destino'");
                return;
            }

            oView.getModel("mBusy").setProperty("/iniciar", true);

            var oFiltros = new Array(
                new sap.ui.model.Filter("IdAlmacen", sap.ui.model.FilterOperator.EQ, sIdAlmacen),
                new sap.ui.model.Filter("IdCentro", sap.ui.model.FilterOperator.EQ, sCentro)   //SCH
            );

            var oResponse = await new Promise(resolve => {
                oData.read("/UnidadesDeManipulacionDisponiblesSet", {
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

            oView.getModel("mListaHUDisponiblesTraslado").setData(oResponse);

            var oTable = sap.ui.getCore().byId("table-hu_disponibles_traslado");
            var oBinding = oTable.getBinding("items");

            var sOrientation = false;
            //SCH- Se comenta el orden porque ya viene ordenado del servicio
            //var oSorter = [
            //    new sap.ui.model.Sorter("IdVariedad", sOrientation),
            //    new sap.ui.model.Sorter("IdModulo", sOrientation),
            //    new sap.ui.model.Sorter("IdPalletV2", sOrientation)
            //];

            //oBinding.sort(oSorter);

            return true;
        },

        onEscanearHU: function(oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mListaHUDisponiblesTraslado");
            var oModelPreparados = oView.getModel("mListaHUPreparadasTraslado");
            var oSource = oEvent.getSource();
            var sValue = oSource.getValue();

            var oListaDisponibles = oModel.getData();

           // var nIndexEliminar = oListaDisponibles.findIndex(h => h.IdPalletV2 == sValue);
            let aPreparadas=oListaDisponibles.filter(h => h.IdPalletV2 == sValue)
            if (aPreparadas.length >= 0) {
               // var oHUEscaneado = oListaDisponibles[nIndexEliminar];

               // var oAux = new Object();
               // Object.assign(oAux, oHUEscaneado);

            	oListaDisponibles =oListaDisponibles.filter(h => h.IdPalletV2 !== sValue);
            	oModel.setData(oListaDisponibles)
                oModel.refresh(true);

                sap.ui.getCore().byId("btn-ayuda_almacen_destino").setEnabled(false);
                sap.ui.getCore().byId("btn-buscar_hus_disponibles_traslado").setEnabled(false);

                oModelPreparados.setData(oModelPreparados.getData().concat(aPreparadas));
                oModelPreparados.refresh(true);

                try {
                    var oModel = oView.getModel("mCantidadesHU");
                    var nDisponibles = oModel.getProperty("/disponibles");
                    var nPreparadas = oModel.getProperty("/preparadas");
                    nDisponibles= nDisponibles - aPreparadas.length;
                    nPreparadas = nPreparadas + aPreparadas.length ;
                    oModel.setProperty("/disponibles", nDisponibles);
                    oModel.setProperty("/preparadas", nPreparadas);
                    oModel.refresh(true);
                } catch (e) {
                    debugger;
                }

                sap.ui.getCore().byId("input-escanear_hu_traslado").setValue("");
                sap.ui.getCore().byId("input-escanear_hu_traslado").focus();
            } else {
                MensajesObject._MensajeAdvertencia("El código escaneado no se encuentra en la lista de HUs disponibles");
            }
        },

        onEliminarHUTraslado: function(oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mListaHUPreparadasTraslado");
            var oListaDisponibles = oModel.getData();
            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("mListaHUPreparadasTraslado");
            var oElement = oBinding.getObject();
            var sPath = oBinding.getPath();
            var nIndex = sPath.split("/").pop();

            var oAux = new Object();
            Object.assign(oAux, oElement);

            oListaDisponibles.splice(nIndex, 1);
            oModel.setData(oListaDisponibles);
            oModel.refresh(true);

            var oModelDisponibles = oView.getModel("mListaHUDisponiblesTraslado");
            oModelDisponibles.getData().push(oAux);
            oModelDisponibles.refresh(true);

            sap.ui.getCore().byId("input-escanear_hu_traslado").setValue("");
            sap.ui.getCore().byId("input-escanear_hu_traslado").focus();

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

        onGuardarTrasladoHu: async function() {
            var oView = this.getView();
            var oModel = oView.getModel("mListaHUPreparadasTraslado");
            var oLista = oModel.getData();

            if (oLista.length == 0) {
                MensajesObject._MensajeAdvertencia("No hay HU asignadas para el traslado");
                return;
            }

            const formatear_fecha = (function(sFecha) {
                if (!sFecha) return "";
                try {
                    return sFecha.split("-").reverse().join("");
                } catch (e) {
                    return "";
                }
            });

            var oModelFiltros = oView.getModel("mTrasladoHU");
            var sIdAlmacen = oModelFiltros.getProperty("/IdAlmacenOriginal");
            var sIdAlmacenDestino = oModelFiltros.getProperty("/IdAlmacen");
            var sFlgEwm = Boolean(oModelFiltros.getProperty("/FlgEwm"));
            var sFecha = formatear_fecha(oModelFiltros.getProperty("/Fecha"));

            var oInputCentro = oView.byId("input-filter_centro"); //esta en la primera pantalla de filtros
            var sIdCentro = oInputCentro.getValue().trim();


            var sUrl = "/CabTrasladosNoEwmSet";
            var sCampoPosiciones = "PosTrasladosNoEwmSet";
            var sFieldNameIdDeep = "IdDeepTansactionPosition";
            var sFieldNameIdCentro = "IdWerks";
            var sFieldNamePalletId = "IdPalletIntPos"

            var oJson = {
                "IdDeepTransaction": "1",
                "IdAlmacen": sIdAlmacen,
                "IdAlmacenDestino": sIdAlmacenDestino,
                "Fecha": sFecha
            }

            if (sFlgEwm) {
                sUrl = "/CabTrasladosEwmSet"
                sCampoPosiciones = "PosTrasladosEwn";
                sFieldNameIdDeep = "IdDeepTransactionPosition";
                sFieldNameIdCentro = "IdCentro";
                sFieldNamePalletId = "IdPalletiIntPos";
            }

            oJson[sFieldNameIdCentro] = sIdCentro;
            oJson[sCampoPosiciones] = []

            oLista.forEach(hu => {
                var obj = {
                    "IdDeepTransaction": "1",
                    "IdPalletInt": hu.IdPalletInt
                }

                obj[sFieldNameIdDeep] = "1";
                obj[sFieldNamePalletId] = hu.IdPalletIntPos;

                if (!sFlgEwm) {
                    obj["IdPallet"] = hu.IdPallet;
                }

                oJson[sCampoPosiciones].push(obj);
            });

            var oData = oView.getModel("ZEWM_0011");



            oView.getModel("mBusy").setProperty("/iniciar", true);

            var oResponse = await new Promise(resolve => {
                oData.create(sUrl, oJson, {
                    "success": async function(response, header) {
                        // await MensajesObject._MensajeExito("Doc.Mat. " + response.IdDocMat);
                        var sDoc = sFlgEwm ? response["IdDocumentoMaterial"] : response["IdDocMat"];
                        await new Promise(resolve => {
                            sap.m.MessageBox.success(
                                "Doc.Mat. " + sDoc, {
                                    title: "Se proceso el traslado correctamente",
                                    styleClass: "sapUiSizeCompact",
                                    onClose: function(oAction) {
                                        resolve();
                                    }
                                }
                            )
                        });
                        resolve(true);
                    },
                    "error": async function(response) {
                        await MensajesObject._TratarError(response);
                        resolve(false);
                    }
                });
            });

            oView.getModel("mBusy").setProperty("/iniciar", false);

            if (!oResponse) return;

            oModel.setData([]);
            oModel.refresh(true);

            oView.getModel("mCantidadesHU").setProperty("/preparadas", 0);

            sap.ui.getCore().byId("btn-ayuda_almacen_destino").setEnabled(true);
            sap.ui.getCore().byId("btn-buscar_hus_disponibles_traslado").setEnabled(true);

            sap.ui.getCore().byId("input-escanear_hu_traslado").setValue("");
            sap.ui.getCore().byId("input-escanear_hu_traslado").focus();

            // this.onCerrarFragmento("TrasladoHU");
        }

    }
});