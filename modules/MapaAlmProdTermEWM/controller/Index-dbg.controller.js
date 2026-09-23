sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function (Controller, formatter, JSONModel, MensajesObject) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.MapaAlmProdTermEWM.controller.Index", {

        formatter: formatter,
        scope: {},
        dataBus: {},
        dataIzq: [],
        dataDer: [],
        _ListaProductos: [],

        onAfterRendering: function () { },

        onInit: function () {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "MapaAlmProdTermEWMView", this._busSuscribe, this);

            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0020_SRV", { "useBatch": false });
            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelDetail, "dataIzq");
            this.getView().setModel(oModelDetail, "dataDer");

            var oFiltros = [{ "value": "C1" }, { "value": "C2" }, { "value": "C3" }, { "value": "C4" }, { "value": "C5" }, { "value": "C6" }, { "value": "C7" }, { "value": "C8" }, { "value": "C9" }, { "value": "C10" }, { "value": "C11" }, { "value": "C12" }, { "value": "C13" }, { "value": "C14" }];
            this.getView().setModel(new JSONModel(oFiltros), "mFiltros");

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
        },

        _busSuscribe: function (channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function () {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onSelectUbicacion: function (sUbicacion) {
            sap.ui.core.BusyIndicator.show(0);
            var othat = this;

            othat.dataIzq = [];
            othat.dataDer = [];
            var oModelDataIzq = new sap.ui.model.json.JSONModel(othat.dataIzq);
            othat.getView().setModel(oModelDataIzq, "dataIzq");
            var oModelDataDer = new sap.ui.model.json.JSONModel(othat.dataDer);
            othat.getView().setModel(oModelDataDer, "dataDer");

            this.scope.ubicacion = sUbicacion;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");

            var sUrl = "/DeepMapaAlmacenamientoSet";
            // var sUrl = "/AlmacenamientoProductoTerminadoSet";
            
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks; // Centro GE 2-12-2024
            var obj = {
                "Camara": sUbicacion,
                "DeepMapaToAlmacenamiento": [],
                "DeepMapaToProductoAlm": [],
                "I_WERKS": sCentro  // Centro GE 2-12-2024
            }
            
            var oModelService = this.getView().getModel('service');
            oModelService.create(sUrl, obj, {
                success: function (result, response) {
                    var lista = result.DeepMapaToAlmacenamiento.results;

                    try {
                        othat._ListaProductos = result.DeepMapaToProductoAlm.results;
                    } catch (error) {
                        othat._ListaProductos = [];
                    }

                    lista.forEach(function (camara) {
                        if (camara.LADO == 'IZ') {
                            let found = othat.dataIzq.find(val => val.nameRACK == camara.RACK);
                            if (found) {
                                found.NIVEL.push(camara);
                            } else {
                                let objtmp = { 'nameRACK': camara.RACK, 'NIVEL': [] };
                                objtmp.NIVEL.push(camara);
                                othat.dataIzq.push(objtmp);
                            }
                        }
                    });

                    othat.dataIzq.forEach(function (izq) {
                        let tmpData = [];
                        izq.NIVEL.forEach(function (nivel) {
                            let found = tmpData.find(val => val.nameNIVEL == nivel.NIVEL);
                            if (found) {
                                found.SUBDIVISION.push(nivel);
                            } else {
                                let objtmp = { 'nameNIVEL': nivel.NIVEL, 'SUBDIVISION': [] };
                                objtmp.SUBDIVISION.push(nivel);
                                tmpData.push(objtmp);
                            }
                        });
                        izq.NIVEL = tmpData;
                    });
                    othat.dataIzq.sort((a, b) => (a.nameRACK > b.nameRACK) ? 1 : ((b.nameRACK > a.nameRACK) ? -1 : 0));
                    othat.dataIzq.forEach(function (izq) {
                        izq.NIVEL.sort((a, b) => (a.nameNIVEL < b.nameNIVEL) ? 1 : ((b.nameNIVEL < a.nameNIVEL) ? -1 : 0));
                    });
                    othat.dataIzq.forEach(function (izq) {
                        izq.NIVEL.forEach(function (nivel) {
                            nivel.SUBDIVISION.sort((a, b) => parseFloat(a.SUBDIVISION) - parseFloat(b.SUBDIVISION));
                        });
                    });

                    lista.forEach(function (camara) {
                        if (camara.LADO == 'DE') {
                            let found = othat.dataDer.find(val => val.nameRACK == camara.RACK);
                            if (found) {
                                found.NIVEL.push(camara);
                            } else {
                                let objtmp = { 'nameRACK': camara.RACK, 'NIVEL': [] };
                                objtmp.NIVEL.push(camara);
                                othat.dataDer.push(objtmp);
                            }
                        }
                    });

                    othat.dataDer.forEach(function (izq) {
                        let tmpData = [];
                        izq.NIVEL.forEach(function (nivel) {
                            let found = tmpData.find(val => val.nameNIVEL == nivel.NIVEL);
                            if (found) {
                                found.SUBDIVISION.push(nivel);
                            } else {
                                let objtmp = { 'nameNIVEL': nivel.NIVEL, 'SUBDIVISION': [] };
                                objtmp.SUBDIVISION.push(nivel);
                                tmpData.push(objtmp);
                            }
                        });
                        izq.NIVEL = tmpData;
                    });
                    othat.dataDer.sort((a, b) => (a.nameRACK > b.nameRACK) ? 1 : ((b.nameRACK > a.nameRACK) ? -1 : 0));
                    othat.dataDer.forEach(function (izq) {
                        izq.NIVEL.sort((a, b) => (a.nameNIVEL < b.nameNIVEL) ? 1 : ((b.nameNIVEL < a.nameNIVEL) ? -1 : 0));
                    });
                    othat.dataDer.forEach(function (izq) {
                        izq.NIVEL.forEach(function (nivel) {
                            nivel.SUBDIVISION.sort((a, b) => parseFloat(a.SUBDIVISION) - parseFloat(b.SUBDIVISION));
                        });
                    });

                    try {
                        othat.dataIzq.forEach(data => {
                            data.NIVEL.forEach(nivel => {
                                nivel.SUBDIVISION.forEach(izq => {
                                    var color_semaforo = false;
                                    try {
                                        var colores = othat._ListaProductos.filter(p =>
                                            p.Camara == izq.CAMARA &&
                                            p.Lado == izq.LADO &&
                                            p.Nivel == izq.NIVEL &&
                                            p.Rack == izq.RACK &&
                                            p.Subdivision == izq.SUBDIVISION
                                        ).map(p => p.ColorAlmacenamiento).filter((value, index, lista) => lista.indexOf(value) == index);

                                        if (colores.includes("ROJO")) {
                                            color_semaforo = "ROJO";
                                       // } else if (colores.includes("AMARILLO")) {
                                       // color_semaforo = "AMARILLO";    
                                        } else if (colores.includes("AMARI")) {
                                            color_semaforo = "AMARI";
                                        } else if (colores.includes("VERDE")) {
                                            var color_semaforo = "VERDE";
                                        } else if (colores.includes("ROJO2")) {
                                            var color_semaforo = "ROJO2";
                                        }
                                    } catch (error) {
                                        //
                                    }

                                    izq.color_semaforo = color_semaforo;
                                });
                            });
                        });
                    } catch (error) {
                        //
                    }

                    try {
                        othat.dataDer.forEach(data => {
                            data.NIVEL.forEach(nivel => {
                                nivel.SUBDIVISION.forEach(derecha => {
                                    var color_semaforo = false;
                                    try {
                                        var colores = othat._ListaProductos.filter(p =>
                                            p.Camara == derecha.CAMARA &&
                                            p.Lado == derecha.LADO &&
                                            p.Nivel == derecha.NIVEL &&
                                            p.Rack == derecha.RACK &&
                                            p.Subdivision == derecha.SUBDIVISION
                                        ).map(p => p.ColorAlmacenamiento).filter((value, index, lista) => lista.indexOf(value) == index);

                                        if (colores.includes("ROJO")) {
                                            color_semaforo = "ROJO";
                                        //} else if (colores.includes("AMARILLO")) {
                                        //    color_semaforo = "AMARILLO";
                                        } else if (colores.includes("AMARI")) {    
                                            color_semaforo = "AMARI";
                                        } else if (colores.includes("VERDE")) {
                                            var color_semaforo = "VERDE";
                                        } else if (colores.includes("ROJO2")) {
                                            var color_semaforo = "ROJO2";
                                        }
                                    } catch (error) {
                                        //
                                    }

                                    derecha.color_semaforo = color_semaforo;
                                });
                            });
                        });
                    } catch (error) {
                        //
                    }

                    var oModelDataIzq = new sap.ui.model.json.JSONModel(othat.dataIzq);
                    othat.getView().setModel(oModelDataIzq, "dataIzq");
                    var oModelDataDer = new sap.ui.model.json.JSONModel(othat.dataDer);
                    othat.getView().setModel(oModelDataDer, "dataDer");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function (error) {
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });

            // var oModelService = this.getView().getModel('service');
            // oModelService.read( sUrl, {
            //     filters: [new sap.ui.model.Filter("I_CAMARA", sap.ui.model.FilterOperator.EQ, sUbicacion)],
            //     success: function(result, response) {
            //         result.results.forEach(function(camara) {
            //             if (camara.LADO == 'IZ') {
            //                 let found = othat.dataIzq.find(val => val.nameRACK == camara.RACK);
            //                 if (found) {
            //                     found.NIVEL.push(camara);
            //                 } else {
            //                     let objtmp = { 'nameRACK': camara.RACK, 'NIVEL': [] };
            //                     objtmp.NIVEL.push(camara);
            //                     othat.dataIzq.push(objtmp);
            //                 }
            //             }
            //         });
            //         othat.dataIzq.forEach(function(izq) {
            //             let tmpData = [];
            //             izq.NIVEL.forEach(function(nivel) {
            //                 let found = tmpData.find(val => val.nameNIVEL == nivel.NIVEL);
            //                 if (found) {
            //                     found.SUBDIVISION.push(nivel);
            //                 } else {
            //                     let objtmp = { 'nameNIVEL': nivel.NIVEL, 'SUBDIVISION': [] };
            //                     objtmp.SUBDIVISION.push(nivel);
            //                     tmpData.push(objtmp);
            //                 }
            //             });
            //             izq.NIVEL = tmpData;
            //         });
            //         othat.dataIzq.sort((a, b) => (a.nameRACK > b.nameRACK) ? 1 : ((b.nameRACK > a.nameRACK) ? -1 : 0));
            //         othat.dataIzq.forEach(function(izq) {
            //             izq.NIVEL.sort((a, b) => (a.nameNIVEL < b.nameNIVEL) ? 1 : ((b.nameNIVEL < a.nameNIVEL) ? -1 : 0));
            //         });
            //         othat.dataIzq.forEach(function(izq) {
            //             izq.NIVEL.forEach(function(nivel) {
            //                 nivel.SUBDIVISION.sort((a, b) => parseFloat(a.SUBDIVISION) - parseFloat(b.SUBDIVISION));
            //             });
            //         });

            //         result.results.forEach(function(camara) {
            //             if (camara.LADO == 'DE') {
            //                 let found = othat.dataDer.find(val => val.nameRACK == camara.RACK);
            //                 if (found) {
            //                     found.NIVEL.push(camara);
            //                 } else {
            //                     let objtmp = { 'nameRACK': camara.RACK, 'NIVEL': [] };
            //                     objtmp.NIVEL.push(camara);
            //                     othat.dataDer.push(objtmp);
            //                 }
            //             }
            //         });
            //         othat.dataDer.forEach(function(izq) {
            //             let tmpData = [];
            //             izq.NIVEL.forEach(function(nivel) {
            //                 let found = tmpData.find(val => val.nameNIVEL == nivel.NIVEL);
            //                 if (found) {
            //                     found.SUBDIVISION.push(nivel);
            //                 } else {
            //                     let objtmp = { 'nameNIVEL': nivel.NIVEL, 'SUBDIVISION': [] };
            //                     objtmp.SUBDIVISION.push(nivel);
            //                     tmpData.push(objtmp);
            //                 }
            //             });
            //             izq.NIVEL = tmpData;
            //         });
            //         othat.dataDer.sort((a, b) => (a.nameRACK > b.nameRACK) ? 1 : ((b.nameRACK > a.nameRACK) ? -1 : 0));
            //         othat.dataDer.forEach(function(izq) {
            //             izq.NIVEL.sort((a, b) => (a.nameNIVEL < b.nameNIVEL) ? 1 : ((b.nameNIVEL < a.nameNIVEL) ? -1 : 0));
            //         });
            //         othat.dataDer.forEach(function(izq) {
            //             izq.NIVEL.forEach(function(nivel) {
            //                 nivel.SUBDIVISION.sort((a, b) => parseFloat(a.SUBDIVISION) - parseFloat(b.SUBDIVISION));
            //             });
            //         });

            //         var oModelDataIzq = new sap.ui.model.json.JSONModel(othat.dataIzq);
            //         othat.getView().setModel(oModelDataIzq, "dataIzq");
            //         var oModelDataDer = new sap.ui.model.json.JSONModel(othat.dataDer);
            //         othat.getView().setModel(oModelDataDer, "dataDer");
            //         sap.ui.core.BusyIndicator.hide();
            //     },
            //     error: function(error) {
            //         console.log(error);
            //         sap.ui.core.BusyIndicator.hide();
            //     }
            // });
        },

        onShowUbicacion: function (sLADO, sRACK, sNIVEL, sSUBDIVISION) {
            try {
                /* comentado por CML
                this._getDialog().open();
                let dataSearch = [];
                if (sLADO == 'IZ') {
                    dataSearch = this.dataIzq;
                } else {
                    dataSearch = this.dataDer;
                }
                */
                const oDialog = this._getDialog();
                let dataSearch = (sLADO === "IZ") ? this.dataIzq : this.dataDer;
                const foundRACK = dataSearch.find(val => val.nameRACK == sRACK);
                const foundNIVEL = foundRACK.NIVEL.find(val => val.nameNIVEL == sNIVEL);
                const found = foundNIVEL.SUBDIVISION.find(val => val.SUBDIVISION == sSUBDIVISION);
                const hideHeaderInfo = found.HidePaletaExportador || false;
                
                /* comentado por CML
                try {
                    var productos_correspondientes = this._ListaProductos.filter(p =>
                        p.Camara == found.CAMARA &&
                        p.Lado == found.LADO &&
                        p.Nivel == found.NIVEL &&
                        p.Rack == found.RACK &&
                        p.Subdivision == found.SUBDIVISION
                    );
                } catch (error) {
                    var productos_correspondientes = [];
                }
                */
                
                               
                /* comentado por SCH
                found.lista_productos = productos_correspondientes;  
                var oModel = new sap.ui.model.json.JSONModel(found); 
                // var oModel = new sap.ui.model.json.JSONModel(JSON.parse(JSON.stringify(found)));
                this.getView().setModel(oModel, "dialogData"); 
                */
                //inicio CML
                found.lista_productos = [];
                  this._ListaProductos.forEach(item => {
                      if (item.Camara === found.CAMARA &&
                          item.Lado === found.LADO &&
                          item.Nivel === found.NIVEL &&
                          item.Rack === found.RACK &&
                          item.Subdivision === found.SUBDIVISION) {
                          found.lista_productos.push(JSON.parse(JSON.stringify(item)));
                      }
                  });

         // === CALCULAR TOTAL DE CAJAS ===
         let totalCajas = 0;
         found.lista_productos.forEach(item => {
         totalCajas += Number(item.CajasAlmacenamiento || 0);
           });
         found.TOTAL_CAJAS = totalCajas;

          // === CALCULAR TOTAL DE PALLETS (DISTINTOS) ===
        const palletsSet = new Set();
        found.lista_productos.forEach(item => {
            palletsSet.add(item.NRO_PALLET);
        });
        found.TOTAL_PALLETS = palletsSet.size;

        // Si hay solo un pallet, entonces mostramos el número de paleta y exportador
        found.hideHeaderInfo = found.TOTAL_PALLETS === 1 ? false : true;

        // Modelo al fragment
        this.getView().setModel(new sap.ui.model.json.JSONModel(found), "dialogData");

        oDialog.open();
                //fin CML
                
            } catch (error) {
                alert("Ocurrió un error");
            }
        },

        _getDialog: function () {
            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.MapaAlmProdTermEWM.fragments.AsignarModal', this);
                this.getView().addDependent(this.oDialog);
            }
            return this.oDialog;
        },

        onCloseDialog: function () {
            this._getDialog().close();
        },

        onAfterCloseDialog: function () { }

    });
});