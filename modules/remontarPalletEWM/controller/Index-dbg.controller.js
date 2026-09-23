sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function (Controller, formatter, JSONModel, MensajesObject) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.remontarPalletEWM.controller.Index", {

        formatter: formatter,
        dataBus: {},
        scope: {
            "btnImprimirSheet": false, //TKT 8000024930
            "CJ_PalletInicial": 0, //TKT#29657-Validaciones app remontar. 06.2024
            "Almacen": "   ",
        },

        _Fragmento: new Object(),

        onInit: async function () {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "RemontarPalletsEWMIndexView", this._busSuscribe, this);

            var oView = this.getView();
            var oTable = oView.byId("table-lista_palets_incompletos");

            var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0034_SRV");
            oView.setModel(oData, "ZEWM_0034");

            oTable.setBusyIndicatorDelay(100);
            oTable.setBusy(true);

            // var oResponse = await new Promise(resolve => {
            //     oData.read("/ObtenerPalletsIncompletasSet", {
            //         "success": function(response, header) {
            //             try {
            //                 resolve(response.results);
            //             } catch (e) {
            //                 resolve([]);
            //             }
            //         },
            //         "error": async function(error) {
            //             resolve([]);
            //         }
            //     });
            // });

            // await this.cargarListadoPalletsPantallaInicial();

            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin
            var oDataB = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0001_SRV");
            var oResponseImpresora = await new Promise(resolve => {
                oDataB.read("/Grupo_ImpresorasSet", {
                    //DG - Inicio
                    filters: [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)],
                    //DG - Fin                      	                    
                    "success": function (response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": function (response) {
                        resolve([]);
                    }
                });
            });

            oView.setModel(new JSONModel(oResponseImpresora), "mListaGrupoImpresora");

            //INI TKT 8000024930
            var oResponseImprSheet = await new Promise(resolve => {
                oDataB.read("/AyudaImpresoraSet", {
                	 //DG - Inicio
                    filters: [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)],
                    //DG - Fin 
                    "success": function (response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": function (response) {
                        resolve([]);
                    }
                });
            });

            oView.setModel(new JSONModel(oResponseImprSheet), "mListaImpresoraSheet");

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            //FIN TKT 8000024930  
            oTable.setBusy(false);

            // oView.setModel(new JSONModel(oResponse), "mListaPalletsIncompletos");            
        },

        onObtenerPalletsInicio: async function (oEvent) {
            const oView = this.getView();
            const oTable = oView.byId("table-lista_palets_incompletos");

            //Si se presionó borrar
            if (oEvent.mParameters.clearButtonPressed) {
                oTable.destroyItems();
                oTable.refreshItems();
                return;
            }

            //Validar si se ingresó un centro
            const oSource = oEvent.getSource();
            const sLgort = oSource.getValue();
            var sAlmacen = oView.byId("sfLgort").getValue();  
            //if (!sLgort) {
            if (sAlmacen == "") {	
                MensajesObject._MensajeError("El ingreso de un almacén es obligatorio para la búsqueda de pallets incompletos");
                return;
            }

            this.scope.Almacen = sLgort;
            //Poner la tabla a cargar y llamar al servicio
            oTable.setBusyIndicatorDelay(100);
            oTable.setBusy(true);
            await this.cargarListadoPalletsPantallaInicial(sLgort);
            oTable.setBusy(false);
        },

        cargarListadoPalletsPantallaInicial: async function (sLgort) {
            var oView = this.getView();
            var oData = oView.getModel("ZEWM_0034");
            var oTable = oView.byId("table-lista_palets_incompletos");
            var sAlmacen = oView.byId("sfLgort").getValue();                                
            
            if (sAlmacen == "") {
                MensajesObject._MensajeError("El ingreso de un almacén es obligatorio para la búsqueda de pallets incompletos");
                return;
            }
            

            oView.byId("input-filtrar_lista_inicial_remontar_pallet").setValue("");

            oTable.destroyItems();
            try {
                oTable.refreshItems();
            } catch (e) {
                //
            }

            var bBusy = false;

            if (!oTable.getBusy()) {
                oTable.setBusy(true);
                bBusy = true;
            }
            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin
            var oResponse = await new Promise(resolve => {
                oData.read("/ObtenerPalletsIncompletasSet", {
                    //DG - Inicio
                    filters: [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro),
                    new sap.ui.model.Filter("I_LGORT", sap.ui.model.FilterOperator.EQ, sAlmacen)
                    ],
                    //DG - Fin                    
                    "success": function (response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": async function (error) {
                        var sMessage = "";
                        try {
                            var errorResponse = error.responseText;
                            if (errorResponse) {
                                var oJson = JSON.parse(error.responseText);
                                var oError = oJson.error;
                                if (oError) {
                                    var oInner = oError.innererror;
                                    if (oInner) {
                                        var oDetails = oInner.errordetails;
                                        if (oDetails.length > 0) {
                                            oDetails.forEach(d => {
                                                if (d.message.includes("Internal error occurred, contact your system administrator")) return;
                                                sMessage += d.message + "\n";
                                            });
                                        }
                                    } else {
                                        var oMessageError = oError.message;
                                        var sValue = oMessageError.value;
                                        if (sValue) {
                                            sMessage = sValue;
                                        }
                                    }
                                }
                            }
                            if (!sMessage) throw true;
                        } catch (e) {
                            sMessage = "Ocurrio un error en la busqueda de pallets.";
                        }

                        MensajesObject._MensajeError(sMessage);
                        resolve([]);
                    }
                });
            });

            if (bBusy) oTable.setBusy(false);


            oView.setModel(new JSONModel(oResponse), "mListaPalletsIncompletos");

            return true;
        },

        _busSuscribe: function (channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function () {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onFiltrarTablaPrincipal: function (oEvent) {
            var oSource = oEvent.getSource();
            var oValue = oSource.getValue();

            var oFiltros = new Array(
                new sap.ui.model.Filter("NRO_PALLET", sap.ui.model.FilterOperator.Contains, oValue),
                new sap.ui.model.Filter("PROD_DESCR", sap.ui.model.FilterOperator.Contains, oValue),
                new sap.ui.model.Filter("PEDIDO", sap.ui.model.FilterOperator.Contains, oValue),
                new sap.ui.model.Filter("FECHA_EMPAQUE", sap.ui.model.FilterOperator.Contains, oValue)
            );

            var oTable = this.getView().byId("table-lista_palets_incompletos");
            var binding = oTable.getBinding("items");
            binding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },

        onCerrarFragmento: function (sNombreFragmento) {
            //INICIO TKT#29657-Validaciones app remontar. 06.2024
            if (sNombreFragmento == 'ModalRemontarPalet') {
                //Volver los campos CAJAS_PALLET y CJ_FALTANTES con los valores originales
                var oView = this.getView();
                var nMaxPal = oView.getModel("CABECERA").getData().MAX_PALLETS;
                oView.getModel("CABECERA").getData().CAJAS_PALLET = this.scope.CJ_PalletInicial;
                oView.getModel("CABECERA").getData().CJ_FALTANTES = Number(nMaxPal) - Number(this.scope.CJ_PalletInicial);
            }
            //FIN TKT#29657-Validaciones app remontar. 06.2024
            this._Fragmento[sNombreFragmento].destroy();
            delete this._Fragmento[sNombreFragmento];
        },

        onSelectItem: async function (oEvent) {

            var oView = this.getView();
            var oModelOdata = this.getView().getModel("ZEWM_0034");

            oView.setModel(new JSONModel({ "disponibles": 0, "preparadas": 0 }), "mCantidades");

            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("mListaPalletsIncompletos");
            var object = oBinding.getObject();

            this.scope.CJ_PalletInicial = object.CAJAS_PALLET; //TKT#29657-Validaciones app remontar. 06.2024

            var sVenum = object.VENUM;
            var sMatnr = object.MATNR;
            var sPedido = object.PEDIDO;
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var sAlmacen = this.scope.Almacen;

            oView.setBusy(true);

            var oFiltros = new Array(
                new sap.ui.model.Filter("I_VENUM", sap.ui.model.FilterOperator.EQ, sVenum),
                new sap.ui.model.Filter("I_MATNR", sap.ui.model.FilterOperator.EQ, sMatnr),
                new sap.ui.model.Filter("I_PEDIDO", sap.ui.model.FilterOperator.EQ, sPedido),
                new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro),
                new sap.ui.model.Filter("I_LGORT", sap.ui.model.FilterOperator.EQ, sAlmacen)
            );

            var oResponse = await new Promise(resolve => {
                oModelOdata.read("/GetPalletsDispRemontarSet", {
                    filters: oFiltros,
                    "success": function (response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": async function (error) {
                        var sMessage = "";
                        try {
                            var errorResponse = error.responseText;
                            if (errorResponse) {
                                var oJson = JSON.parse(error.responseText);
                                var oError = oJson.error;
                                if (oError) {
                                    var oInner = oError.innererror;
                                    if (oInner) {
                                        var oDetails = oInner.errordetails;
                                        if (oDetails.length > 0) {
                                            oDetails.forEach(d => {
                                                if (d.message.includes("Internal error occurred, contact your system administrator")) return;
                                                sMessage += d.message + "\n";
                                            });
                                        }
                                    } else {
                                        var oMessageError = oError.message;
                                        var sValue = oMessageError.value;
                                        if (sValue) {
                                            sMessage = sValue;
                                        }
                                    }
                                }
                            }
                            if (!sMessage) throw true;
                        } catch (e) {
                            sMessage = "Ocurrio un error en la busqueda de pallets.";
                        }

                        MensajesObject._MensajeError(sMessage);

                        resolve(false);
                    }
                });
            });

            oView.setBusy(false);

            if (!oResponse) return;
            if (oResponse.length == 0) {
                MensajesObject._MensajeError("No existen pallets incompletos disponibles para remontar.");
                return;
            }

            oView.getModel("mCantidades").setProperty("/disponibles", oResponse.length);

            var sNombreFragmento = "ModalRemontarPalet";
            var sPathFragmento = "AvocadoProyecto.AvocadoProyecto.modules.remontarPalletEWM.fragments." + sNombreFragmento;

            if (!this._Fragmento[sNombreFragmento]) {
                try {
                    this._Fragmento[sNombreFragmento] = sap.ui.xmlfragment(sPathFragmento, this);
                    oView.addDependent(this._Fragmento[sNombreFragmento]);
                } catch (e) {
                    debugger
                    return;
                }
            }

            this._Fragmento[sNombreFragmento].open();

            // var oViewId = "ListaPalletsRemontarView";
            // var oPathView = "AvocadoProyecto.AvocadoProyecto.modules.remontarPallet.view.ListaPalletsRemontar";
            // this.dataBus.oView.oController.onSplitRouter(oViewId, oPathView, 23);
            // this.getView().destroy();

            // var oNextView = sap.ui.getCore().byId(oViewId);
            // oNextView.setModel(new JSONModel(object), "CABECERA");

            // oNextView.setModel(oModelOdata, "ZEWM_0013");
            // oNextView.setModel(new JSONModel(oResponse), "mLista");

            oView.setModel(new JSONModel(object), "CABECERA");
            oView.setModel(new JSONModel(oResponse), "mLista");
            oView.setModel(new JSONModel([]), "mListaPreparados");

            var oTable = sap.ui.getCore().byId("table-lista_pallets_remontar");

            oTable.attachUpdateFinished((oEvent) => {
                var oSource = oEvent.getSource();
                var oItems = oSource.getItems();
                oItems.forEach(item => {
                    var oCells = item.getCells();
                    var oInput = oCells[9];
                    var oBindingObject = oInput.getBindingContext("mLista").getObject();
                    oBindingObject.CANTIDAD_PALLET_ORIGINAL = oBindingObject.CAJAS_PALLET;
                    oBindingObject.CJ_FALTANTES_ORIGINAL = oBindingObject.CJ_FALTANTES;
                    // INICIO TKT #31624-30.07.2024  
                    //  oInput.setEnabled(false);  
                    if (oBindingObject.Check) {
                        oInput.setEnabled(oBindingObject.Check);
                    }// TKT #31624-30.07.2024
                    else {
                        oInput.setEnabled(false);
                    }

                    // INICIO TKT #31624-30.07.2024     
                });
            });
        },







        onAbrirAyudaBusquedaGrupoImpresora: function (oEvent) {
            var oView = this.getView();
            var sNombreFragmento = "AyudaGrupoImpresora";
            var sPath = "AvocadoProyecto.AvocadoProyecto.modules.remontarPalletEWM.fragments." + sNombreFragmento;

            if (!this._Fragmento[sNombreFragmento]) {
                try {
                    this._Fragmento[sNombreFragmento] = sap.ui.xmlfragment(sPath, this);
                    oView.addDependent(this._Fragmento[sNombreFragmento]);
                } catch (e) {
                    debugger
                    //mensaje error
                    return;
                }
            }

            this._Fragmento[sNombreFragmento].open();
        },

        onAgregarValorMatchcodeImpresora: function (oEvent) {
            var oCore = sap.ui.getCore();
            var oItem = oEvent.getParameter("selectedItem");
            var oSelected = oItem.getTitle();

            var oInputImpresora = oCore.byId("input-impresora_remontar_pallets");

            oInputImpresora.setValueState("None");
            oInputImpresora.setValue(oSelected);

            this.onCerrarFragmento("AyudaGrupoImpresora");
        },

        onFiltrarDatosMatchcodeImpresora: function (oEvent) {
            var oSource = oEvent.getSource();
            var sValue = oEvent.getParameter("value");

            var oFiltros = new Array(
                new sap.ui.model.Filter("ZZ_GRUPO", sap.ui.model.FilterOperator.Contains, sValue)
            );

            var oBinding = oSource.getBinding("items");

            oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },





        onSelectPalletRemontar: function (oEvent) {
            var oSource = oEvent.getSource();
            var oSelected = oSource.getSelected();
            var oFila = oSource.getParent();
            var oCells = oFila.getCells();
            var oInputCantidad = oCells[9];

            oInputCantidad.setEnabled(oSelected);
            //Inicio TKT #31624-Revision app Remotar Pallets-30.07.2024
            //Cuando se retire el check, se reinicie el campo de contador de caja 
            //y se actualicen los campos de cajas en paleta y cajas faltantes
            if (!oSelected) {
                var oView = this.getView();
                var oBinding = oFila.getBindingContext("mLista");
                var oPosicion = oBinding.getObject();

                oPosicion.CAJAS_PALLET = oPosicion.CANTIDAD_PALLET_ORIGINAL;
                oPosicion.CJ_FALTANTES = oPosicion.CJ_FALTANTES_ORIGINAL;
                oPosicion.CJ_FUSIONAR = 0;
                oBinding.getModel("mLista").refresh(true);

                oInputCantidad.setValue(0);  //Cantidad de cajas ingresadas
                oInputCantidad.fireLiveChange();
            }
            //Fin TKT #31624-Revision app Remotar Pallets-30.07.2024
        },

        onFiltrarTabla: function (oEvent) {
            var oTable = sap.ui.getCore().byId("table-lista_pallets_remontar");
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

        noSuperaMaximo: function (oEvent) {
            var oView = this.getView();
            var oModelCabecera = oView.getModel("CABECERA");
            var oModel = oView.getModel("mLista");
            var oSource = oEvent.getSource();
            var oParent = oSource.getParent();
            var oCells = oParent.getCells();

            var nMaxPaletCabecera = oModelCabecera.getProperty("/MAX_PALLETS");

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
            var nCajasEnPallet = Number(oPosicion.CAJAS_PALLET);
            var nCajasFaltantes = Number(oPosicion.CJ_FALTANTES);
            var nResultado = nCajasEnPallet - nValueIngresado;
            var nCajasEnPallet = nCajasFaltantes + nValueIngresado;

            if (nResultado < 0) {
                sap.m.MessageToast.show("La cantidad no puede superar el Maximo de cajas de la Paleta.");
                oSource.setValue("");
                oPosicion.CAJAS_PALLET = oPosicion.CANTIDAD_PALLET_ORIGINAL;
                oPosicion.CJ_FALTANTES = oPosicion.CJ_FALTANTES_ORIGINAL;
                // var nMax = Number(oPosicion.CANTIDAD_PALLET_ORIGINAL) + Number(oPosicion.CJ_FALTANTES_ORIGINAL);
                // oPosicion.CJ_FALTANTES = nMax;
                // oPosicion.CAJAS_PALLET = 0;
                // oTextBoxCajasFaltantes.setText(nMax);
                // nValueIngresado = oPosicion.CANTIDAD_PALLET_ORIGINAL;
                // oSource.setValue(nValueIngresado);
                // oPosicion.CJ_FUSIONAR = nValueIngresado;
                return;
            }

            var nResultadoMaxPaletCabecera = this.contarTotalPalletsAsignados(nValueIngresado, oPosicion.CJ_FUSIONAR);
            if (nResultadoMaxPaletCabecera < 0) {
                sap.m.MessageToast.show("La cantidad no puede superar el Maximo de cajas de la Paleta.");
                oSource.setValue("");
                oPosicion.CAJAS_PALLET = oPosicion.CANTIDAD_PALLET_ORIGINAL;
                oPosicion.CJ_FALTANTES = oPosicion.CJ_FALTANTES_ORIGINAL;
                // var nNuevoResultado = nValueIngresado += nResultadoMaxPaletCabecera;
                // nNuevoResultado += oPosicion.CJ_FUSIONAR;
                // nValueIngresado = nNuevoResultado;
                // oSource.setValue(nValueIngresado);
                // oPosicion.CJ_FALTANTES += nValueIngresado;
                // oPosicion.CAJAS_PALLET = 0;
                return;
            }

            oPosicion.CJ_FALTANTES = nCajasEnPallet;
            oPosicion.CAJAS_PALLET = nResultado;
            oTextBoxCajasFaltantes.setText(nCajasEnPallet);
            oSource.setValue(nValueIngresado);
            oPosicion.CJ_FUSIONAR = nValueIngresado;
        },

        contarTotalPalletsAsignados: function (nValueIngresado, nValueAnterior) {
            var oView = this.getView();
            var oModelCabecera = oView.getModel("CABECERA");
            var oModelDisponibles = oView.getModel("mLista");
            var oModelPreparados = oView.getModel("mListaPreparados");

            var oListaDisponibles = oModelDisponibles.getData();
            var oListaPreparados = oModelPreparados.getData();

            var nMaxPaletCabecera = oModelCabecera.getProperty("/CJ_FALTANTES");
            nMaxPaletCabecera = Number(nMaxPaletCabecera);
            nMaxPaletCabecera = isNaN(nMaxPaletCabecera) ? 0 : nMaxPaletCabecera;

            var nTotal = 0;

            oListaDisponibles.forEach(d => {
                var nCajasIngresadas = d.CJ_FUSIONAR;
                nCajasIngresadas = Number(nCajasIngresadas);
                nCajasIngresadas = isNaN(nCajasIngresadas) ? 0 : nCajasIngresadas;
                nTotal += nCajasIngresadas;
            });

            //Inicio TKT #31624-Revision app Remotar Pallets-30.07.2024
            //Se comenta esta linea porque el campo cajas faltantes de cabecera ahora está actualizado
            //oListaPreparados.forEach(d => {
            //    var nCajasIngresadas = d.CJ_FUSIONAR;
            //    nCajasIngresadas = Number(nCajasIngresadas);
            //    nCajasIngresadas = isNaN(nCajasIngresadas) ? 0 : nCajasIngresadas;
            //    nTotal += nCajasIngresadas;
            //});
            //Fin TKT #31624-Revision app Remotar Pallets-30.07.2024

            nValueAnterior = Number(nValueAnterior);
            nValueAnterior = isNaN(nValueAnterior) ? 0 : nValueAnterior;

            var nResultado = nMaxPaletCabecera - nTotal + nValueAnterior;
            var nResponse = nResultado - nValueIngresado;

            return nResponse;
        },

        onRemontarPallets: function () {
            var oView = this.getView();
            var oModel = oView.getModel("mLista");
            var oModelPreparados = oView.getModel("mListaPreparados");
            var oListaPallets = oModel.getData();
            var oTable = sap.ui.getCore().byId("table-lista_pallets_remontar");
            var oItems = oTable.getItems();
            //Inicio TKT#29657-Validaciones app remontar. 06.2024     
            var nNumPallet = oView.getModel("CABECERA").getData().NRO_PALLET;
            var nCajasFaltantes = oView.getModel("CABECERA").getData().CJ_FALTANTES;
            var nCajasPallet = oView.getModel("CABECERA").getData().CAJAS_PALLET;
            var nCantCajas = 0;
            var nCajasFaltNew = 0;
            //Fin TKT#29657-Validaciones app remontar. 06.2024
            var oArraysRemontar = new Array();

            var contador = 0;

            oItems.forEach(item => {
                var oCells = item.getCells();
                var oCheckbox = oCells[0];
                var oInput = oCells[9];
                var oBindingObject = oInput.getBindingContext("mLista").getObject();

                var bSelected = oCheckbox.getSelected();
                var sValue = oInput.getValue();
                if (bSelected && sValue != "" && sValue != 0 && sValue != "0") {
                    oArraysRemontar.push(oBindingObject);
                    contador++;
                    nCantCajas += Number(sValue); //TKT#29657-Validaciones app remontar. 06.2024
                }
                oCheckbox.setSelected(false);
                oInput.setEnabled(false);
                // oInput.setValue(""); //TKT #31624-30.07.2024
            });

            /* Inicio TKT#29657-Validaciones app remontar. 06.2024 */
            if (nCantCajas > 0) {
                nCajasFaltNew = nCajasFaltantes - nCantCajas;
                nCajasPallet = Number(nCajasPallet) + Number(nCantCajas);
                oView.getModel("CABECERA").getData().CJ_FALTANTES = nCajasFaltNew;
                oView.getModel("CABECERA").getData().CAJAS_PALLET = nCajasPallet;
                oView.getModel("CABECERA").refresh(true);

                //Si se remontó más de 1 pallet, desplegar mensaje indicando cuantas cajas faltan              
                if (contador > 1) {
                    //“Se remontaron 50 cajas al pallet 8020365. Faltan 155 cajas para completar el pallet.”
                    var strMsg = "Se remontaron ";
                    strMsg = strMsg.concat(nCantCajas.toString());
                    strMsg = strMsg.concat(" cajas al pallet ");
                    strMsg = strMsg.concat(nNumPallet);
                    strMsg = strMsg.concat(". Faltan ");
                    strMsg = strMsg.concat(nCajasFaltNew.toString());
                    strMsg = strMsg.concat(" cajas para completar el pallet. ");
                    //await MensajesObject._MensajeInfo(strMsg);
                    MensajesObject._MensajeInfo(strMsg);
                }
            }
            //Fin TKT#29657-Validaciones app remontar. 06.2024  
            var total = oView.getModel("mCantidades").getProperty("/disponibles",);
            total -= contador;
            oView.getModel("mCantidades").setProperty("/disponibles", total);

            var totalp = oView.getModel("mCantidades").getProperty("/preparadas",);
            totalp += contador;
            oView.getModel("mCantidades").setProperty("/preparadas", totalp);

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

        /*INI TKT 8000024930 - Agregar el Botón Imprimir Pallet Sheet*/

        onAgregarValorMatchcodeImprPSheet: function (oEvent) {
            var oCore = sap.ui.getCore();
            var oItem = oEvent.getParameter("selectedItem");
            var oSelected = oItem.getTitle();

            var oInputImpresora = oCore.byId("input-impresora_pallets_sheet");

            oInputImpresora.setValueState("None");
            oInputImpresora.setValue(oSelected);

            this.onCerrarFragmento("AyudaGrupoImpresoraOrdViaje");
        },

        onAbrirAyudaBusqImpresoraPSheet: function (oEvent) {
            var oView = this.getView();
            var sNombreFragmento = "AyudaGrupoImpresoraOrdViaje";
            var sPath = "AvocadoProyecto.AvocadoProyecto.modules.remontarPalletEWM.fragments." + sNombreFragmento;

            if (!this._Fragmento[sNombreFragmento]) {
                try {
                    this._Fragmento[sNombreFragmento] = sap.ui.xmlfragment(sPath, this);
                    oView.addDependent(this._Fragmento[sNombreFragmento]);
                } catch (e) {
                    debugger
                    //mensaje error
                    return;
                }
            }

            this._Fragmento[sNombreFragmento].open();
        },


        onFiltrarDatosMatchcodeImprPSheet: function (oEvent) {
            var oSource = oEvent.getSource();
            var sValue = oEvent.getParameter("value");

            var oFiltros = new Array(
                new sap.ui.model.Filter("Lname", sap.ui.model.FilterOperator.Contains, sValue)
            );

            var oBinding = oSource.getBinding("items");

            oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },

        onChkImpresoraOrdViaje: function () {
            var oCore = sap.ui.getCore();
            var oView = this.getView();
            this.scope.btnImprimirSheet = oCore.byId("checkBox-PalletSheet").getSelected();

            if (!this.scope.btnImprimirSheet) {
                oCore.byId("input-impresora_pallets_sheet").setValue('');
            }

            var oModelScope = new JSONModel(this.scope);
            oView.setModel(oModelScope, "scope");
        },
        //FIN TKT 8000024930 - Agregar el Botón Imprimir Pallet Sheet   

        onGuardarPalletsRemontar: function () {
            var oView = this.getView();
            let oModelOdata = oView.getModel("ZEWM_0034");
            var oModelCabecera = oView.getModel("CABECERA");
            var oCabecera = oModelCabecera.getData();
            var oTable = sap.ui.getCore().byId("table-lista_pallets_preparados_remontar");
            var oItems = oTable.getItems();

            var oInputImpresora = sap.ui.getCore().byId("input-impresora_remontar_pallets");
            var sImpresora = oInputImpresora.getValue();

            if (!sImpresora) {
                MensajesObject._MensajeError("Seleccione una impresora");
                return;
            }

            /*INI TKT 8000024930 - Agregar el Botón Imprimir Pallet Sheet */
            var sInputImpPalletSheet = "";
            var oCheckImpPalletSheet = sap.ui.getCore().byId("checkBox-PalletSheet").getSelected();

            if (oCheckImpPalletSheet) {
                sInputImpPalletSheet = sap.ui.getCore().byId("input-impresora_pallets_sheet").getValue();
                if (sInputImpPalletSheet == "") {
                    MensajesObject._MensajeError("Debe seleccionar una impresora Pallet SHEET.");
                    return;
                }
            }
            /*FIN TKT 8000024930 - Agregar el Botón Imprimir Pallet Sheet */
            
          //SCH - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //SCH - Fin
            var sAlmacen = oView.byId("sfLgort").getValue();

            let oJson = {  
                "N_GRUP_IMP": [{
                    "GRUP_IMP": sImpresora
                }],
                //INI TKT 8000024930
                "N_IMP_PALLETSHEET": [{
                    "LNAME": sInputImpPalletSheet,
                    "WERKS": sCentro   //SCH 
                }],
                //FIN //INI TKT 8000024930 

                "N_REMONTE_CAB": [{
                    "VENUM": oCabecera.VENUM,
                    //"VEPOS": "", // no llega en la cabecera *No es necesario este campo
                    "NRO_PALLET": oCabecera.NRO_PALLET,
                    "MATNR": oCabecera.MATNR,
                    "CHARG": "", //no llega tampoco
                    "CAJAS_PALLET": String(oCabecera.CAJAS_PALLET),
                    "VEMEH": oCabecera.VEMEH,
                    "MAX_PALLETS": String(oCabecera.MAX_PALLETS),
                    "CJ_FALTANTES": String(oCabecera.CJ_FALTANTES),
                    "CJ_FUSIONAR": "0", // esto porque si cada posicion tiene sus cajas y su maximo de pallet
                    "I_LGORT": sAlmacen
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

            let sLimMaxPallet = oJson.N_REMONTE_CAB[0].MAX_PALLETS;
            let sNuevaCantPallet = oJson.N_REMONTE_CAB[0].CAJAS_PALLET; //TKT#29657-Validaciones app remontar. 06.2024
            /* //Inicio TKT#29657-Validaciones app remontar. 06.2024
            let sNuevaCantPallet = Number(oJson.N_REMONTE_CAB[0].CAJAS_PALLET)
                + oJson.N_REMONTE_PALLET.map(x => (Number(x.CJ_FUSIONAR))).reduce((partialSum, x) => (partialSum + x), 0);
            sNuevaCantPallet = String(sNuevaCantPallet);
            */ //Fin TKT#29657-Validaciones app remontar. 06.2024

            if (sLimMaxPallet !== sNuevaCantPallet) {
                MensajesObject._MensajeConfirmacion(this.getI18nText("msgConfirmationRemontarConCantidadDistinta", [sNuevaCantPallet, sLimMaxPallet]), "warning")
                    .then(bConfirmacion => {
                        if (bConfirmacion) {
                            sap.ui.core.BusyIndicator.show();
                            oModelOdata.create("/RealizarRemontePalletSet", oJson, {
                                "success": async function (response, header) {
                                    sap.ui.core.BusyIndicator.hide();
                                    var sMessage = "";
                                    try {
                                        var oSuccess = JSON.parse(header.headers["sap-message"]);
                                        sMessage = oSuccess.message + "\n";
                                        if (oSuccess.details.length > 0) {
                                            oSuccess.details.forEach(d => {
                                                sMessage += d.message + "\n";
                                            });
                                        }
                                    } catch (e) {
                                        sMessage = "Se realizó el remonte de Pallet correctamente";
                                    }
                                    await MensajesObject._MensajeExito(sMessage);
                                    THAT.cargarListadoPalletsPantallaInicial();
                                    THAT.onCerrarFragmento('ModalRemontarPalet');
                                },
                                "error": function (oError) {
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
                                                            if (detalle.message != "Internal error occurred, contact your system administrator") {
                                                                oMessage += '- ' + detalle.message + '\n';
                                                            }
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
                    })
            } else {
                sap.ui.core.BusyIndicator.show();
                oModelOdata.create("/RealizarRemontePalletSet", oJson, {
                    "success": async function (response, header) {
                        sap.ui.core.BusyIndicator.hide();
                        var sMessage = "";
                        try {
                            var oSuccess = JSON.parse(header.headers["sap-message"]);
                            sMessage = oSuccess.message + "\n";
                            if (oSuccess.details.length > 0) {
                                oSuccess.details.forEach(d => {
                                    sMessage += d.message + "\n";
                                });
                            }
                        } catch (e) {
                            sMessage = "Se realizó el remonte de Pallet correctamente";
                        }
                        await MensajesObject._MensajeExito(sMessage);
                        THAT.cargarListadoPalletsPantallaInicial();
                        THAT.onCerrarFragmento('ModalRemontarPalet');
                    },
                    "error": function (oError) {
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
                                                if (detalle.message != "Internal error occurred, contact your system administrator") {
                                                    oMessage += '- ' + detalle.message + '\n';
                                                }
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
        },
        getI18nText: function (sText, aParameters = []) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sText, aParameters);
        }
    });
});