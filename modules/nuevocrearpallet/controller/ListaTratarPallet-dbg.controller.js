sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function(Controller, formatter, JSONModel, MensajesObject) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.nuevocrearpallet.controller.ListaTratarPallet", {

        _Fragmento: new Object(),
        formatter: formatter,
        dataBus: {},
        scope: {
            visibleImpresoraOrdViaje: false
        },
        _ListaPathsProductosQuitar: [],
        _ListaCajasAgregarDisminuirConSecuencia: new Object(),
        _ListaGuias: new Object(),

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "tratarPalletView", this._busSuscribe, this);
            var oView = this.getView();

            oView.setModel(new JSONModel([]), "mListaTratar");

            oView.setModel(new JSONModel([]), "mTratarPallet");
            oView.setModel(new JSONModel([]), "mListaOrdenViaje");
            oView.setModel(new JSONModel([]), "mListaReimprimirEtiqueta");
            oView.setModel(new JSONModel({ "iniciar": false, "iniciarPost": false }), "mBusy");

            oView.setModel(new JSONModel([]), "mListaGrupoImpresora");

            var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0001_SRV");
            oView.setModel(oData, "ZEWM_0001");

            this.cargarDatos();
        },

        cargarDatos: async function() {
            var oView = this.getView();

            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            const aFilters = [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)];
            // var oResponse = await this._Read("/Grupo_ImpresorasSet");
            var oResponse = await this._Read("/Grupo_ImpresorasSet", aFilters);
            //DG - Fin    
            if (!oResponse) oResponse = [];

            oView.getModel("mListaGrupoImpresora").setData(oResponse);

            oView.getModel("mListaTratar").setData([]);
            oView.getModel("mListaTratar").refresh(true);

            sap.ui.core.BusyIndicator.show()
            //SCH Inicio
            //var oResponse = await this._Read("/PalletsPreRegistradosSet");
           // const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //const aFilters = [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)];
            var oResponse = await this._Read("/PalletsPreRegistradosSet", aFilters);
            //SCH Fin
            if (!oResponse) oResponse = [];
            sap.ui.core.BusyIndicator.hide()

            oView.getModel("mListaTratar").setData(oResponse);
            oView.getModel("mListaTratar").refresh(true);
        },

        _Post: async function(oUrl, oJson = {}, dontCheckSuccessError = true) {
            var oView = this.getView();
            var oBusyModel = oView.getModel("mBusy");

            oBusyModel.setProperty("/iniciarPost", true);

            var sOData = this.getView().getModel("ZEWM_0001");

            return new Promise((resolve, reject) => {
                sOData.create(oUrl, oJson, {
                    success: async function(oResponse, oHeader) {
                        oBusyModel.setProperty("/iniciarPost", false);

                        var oErrorExist = await MensajesObject.mostrarMensajesHeader(oHeader);
                        if (oErrorExist && dontCheckSuccessError) {
                            resolve(false);
                        } else {
                            resolve(oResponse);
                        }
                    },
                    error: function(oError, oHeader) {
                        oBusyModel.setProperty("/iniciarPost", false);

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



        _Read: function(oUrl, sFiltros = []) {
            var oView = this.getView();
            var oBusyModel = oView.getModel("mBusy");
            oBusyModel.setProperty("/iniciar", true);
            var sOData = this.getView().getModel("ZEWM_0001");
            return new Promise(resolve => {
                sOData.read(oUrl, {
                    filters: sFiltros,
                    "success": function(response, header) {
                        oBusyModel.setProperty("/iniciar", false);
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": function(error) {
                        oBusyModel.setProperty("/iniciar", false);
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
                        resolve(false);
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

        onCancelar: function() {
            var oViewId = "nuevoCrearPalletTerminadoView";
            var oPathView = "AvocadoProyecto.AvocadoProyecto.modules.nuevocrearpallet.view.ListaPreRegistro";
            this.dataBus.oView.oController.onSplitRouter(oViewId, oPathView, 13);
            this.getView().destroy();
        },

        onFiltrarDatosTabla: function(oEvent) {
            var oView = this.getView();
            var oTable = oView.byId("table-paletas_tratar");
            var oSource = oEvent.getSource();
            var sValue = oSource.getValue();

            // if (sValue) {
            var oFiltros = new Array(
                new sap.ui.model.Filter("PARTNER_NAME", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("NRO_PALETA", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("CONSIGNATARIO", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("FECHA_EMPAQUE", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("FECHA_RECEPCION", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("ORDEN", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("PRODUCTO", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("VIAJE", sap.ui.model.FilterOperator.Contains, sValue)
            );
            // } else {
            //     var oFiltros = new Array();
            // }


            var oBinding = oTable.getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },

        onFiltrarListaStock: function(oEvent) {
            var oTable = sap.ui.getCore().byId("table-tratar_pallet_cajas");
            var oSource = oEvent.getSource();
            var sValue = oSource.getValue();

            var oFiltros = new Array(
                new sap.ui.model.Filter("EMPRESA_AGRICOLA", sap.ui.model.FilterOperator.Contains, sValue)
            );

            var oBinding = oTable.getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");

            this._UncheckPosicionesStock();
        },

        _formatDate: function(oFecha) {
            var oAnio = oFecha.substring(0, 4);
            var oMes = oFecha.substring(4, 6);
            var oDia = oFecha.substring(6, 8);
            return `${oDia}.${oMes}.${oAnio}`;
        },

        onAbrirFragmento: function(sNombre) {
            var oView = this.getView();
            var nombre_fragmento = "AvocadoProyecto.AvocadoProyecto.modules.nuevocrearpallet.fragments." + sNombre;

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

            this._Fragmento[sNombre].open();
        },

        onFiltrarDatosMatchcode: function(oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var sValue = oEvent.getParameter("value");
            var oCampos = oSource.getId().split("-");
            var oCampo = oCampos.shift();
            var oCampoDos = oCampos.shift();

            // if (sValue) {
            if (oCampo && oCampoDos) {
                var oFiltros = new Array(
                    new sap.ui.model.Filter(oCampo, sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter(oCampoDos, sap.ui.model.FilterOperator.Contains, sValue)
                );
            } else {
                var oFiltros = new Array(
                    new sap.ui.model.Filter(oCampo, sap.ui.model.FilterOperator.Contains, sValue)
                );
            }
            // } else {
            // var oFiltros = new Array();
            // }

            var oBinding = oSource.getBinding("items");

            try {
                var oFilterInfo = oBinding.getFilterInfo();
                if (oFilterInfo) {

                    if (oFilterInfo.left.args) {
                        oFilterInfo = oFilterInfo.right
                    }

                    if (oFilterInfo.left) {
                        var sPath = oFilterInfo.left.path;
                        var sOldValue = oFilterInfo.right.value;
                        oFiltros.push(
                            new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.EQ, sOldValue)
                        );
                    }
                }
            } catch (error) {

            }

            oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },

        onAgregarValorMatchcode: function(oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mTratarPallet");
            var oItem = oEvent.getParameter("selectedItem");
            var oSelected = oItem.getTitle();
            var oDescrip = oItem.getDescription();

            if (this._InputSeleccionadoMatchcode) {
                this._InputSeleccionadoMatchcode.setValueState("None");
                this._InputSeleccionadoMatchcode.setValue(oSelected);
                this._InputSeleccionadoMatchcode.setName(oDescrip);
            }

            if (this._NombreFragmentoAyudaSeleccionado) {
                var sNombreFragmentoCerrar = this._NombreFragmentoAyudaSeleccionado;
                delete this._NombreFragmentoAyudaSeleccionado;

                if (sNombreFragmentoCerrar == "AyudaGuia") {
                    // sap.ui.getCore().byId("panel-administrar_cajas").setExpanded(false);
                    // sap.ui.getCore().byId("panel-administrar_cajas").setExpanded(true);
                    var oBindingInput = this._InputSeleccionadoMatchcode.getBindingContext("mTratarPallet");
                    var oParent = this._InputSeleccionadoMatchcode.getParent();
                    var oItemsField = oParent.getItems();
                    var oBtnGuia = oItemsField[1];

                    this._InputSeleccionadoMatchcode.setVisible(true);
                    oBtnGuia.setVisible(false);

                    var oPosicion = oBindingInput.getObject();
                    var oListaPosiciones = oPosicion.lista;
                    oListaPosiciones.forEach(posicion => {
                        posicion.GUIA = oSelected;
                    });
                }
            } else {
                var sNombreFragmentoCerrar = this._NombreFragmento;
                delete this._NombreFragmento;
            }

            this.onCerrarFragmento(sNombreFragmentoCerrar);
        },

        onCerrarFragmento: function(sNombre) {
            // this._Fragmento[sNombre].close();
            this._Fragmento[sNombre].destroy();
            delete this._Fragmento[sNombre];
        },

        onPressPalletTratar: async function(oEvent) {
            var sNombreFragmento = "TratarPaletaDialog";
            this._NombreFragmento = sNombreFragmento;

            var oListItem = oEvent.getParameter("listItem");
            // var oBindingContext = oListItem.getBindingContext("ZEWM_0001")
            var oBindingContext = oListItem.getBindingContext("mListaTratar")
            var oElement = oBindingContext.getObject();

            var oSource = oEvent.getSource();
            var oItems = oSource.getItems();
            var sIndex = oItems.findIndex(e =>
                // e.getBindingContext("ZEWM_0001").getObject().NRO_PALETA == oElement.NRO_PALETA
                e.getBindingContext("mListaTratar").getObject().NRO_PALETA == oElement.NRO_PALETA
            );

            // this._sIndexPalletSeleccionado = sIndex;
            this._sIndexPalletSeleccionado = oElement.NRO_PALETA;;

            var sNumeroPallet = oElement.NRO_PALETA;

            var oView = this.getView();
            var oModel = oView.getModel("mTratarPallet");
            oModel.setData(oElement);

            this.onAbrirFragmento(sNombreFragmento);

            await this._CargarDatosTratamientoPallet(sNumeroPallet);
        },

        _CargarDatosTratamientoPallet: async function(sNumeroPallet = "") {        	
        	var oView = this.getView();
            var oModel = oView.getModel("mTratarPallet");

            var oJson = {
                "N_PREREGISTRADOS": [{
                    "I_NRO_PALETA": sNumeroPallet
                }],
                "N_POSICIONES_STOCK": []
            }

            var sUrl = "/DetallePalletsSet";

            var oResponse = await this._Post(sUrl, oJson);

            if (!oResponse) {
                await MensajesObject._MensajeError("Ocurrio un error al cargar los datos del pallet.");
                return;
            }

            var oPosPreRegistadas = [];
            var oPosicionesDisponibles = [];

            try { oPosPreRegistadas = oResponse.N_PREREGISTRADOS.results; } catch (e) { oPosPreRegistadas = []; }
            try { oPosicionesDisponibles = oResponse.N_POSICIONES_STOCK.results; } catch (e) { oPosicionesDisponibles = []; }

            if (oPosPreRegistadas.length > 0 || oPosicionesDisponibles.length > 0) {
                var oListaStockConsolidada = this._ConsolidarListaPosicionesCajas(oPosPreRegistadas, oPosicionesDisponibles);
                oModel.setProperty("/ListaCajas", oListaStockConsolidada);
            } else {
                await MensajesObject._MensajeError("No se encontraron posiciones de stock del pallet seleccionado.");
            }

            var bExisteViajeOrden = oModel.getProperty("/VIAJE") || oModel.getProperty("/ORDEN") ? true : false;

            var oTable = sap.ui.getCore().byId("table-tratar_pallet_cajas");
            var oItems = oTable.getItems();
            oItems.forEach(item => {
                var oCells = item.getCells();
                var oCheckbox = oCells[0];
                var oFlexGuiaCajas = oCells[4];

                var oItemsFlex = oFlexGuiaCajas.getItems();
                var oInputGuia = oItemsFlex[0];
                var oBtnAyudaGuia = oItemsFlex[1];

                if (!oInputGuia.getValue()) {
                    // oInputGuia.setVisible(false);
                    // oBtnAyudaGuia.setVisible(true);
                } else {
                    oBtnAyudaGuia.setVisible(false);
                }

                if (bExisteViajeOrden) {
                    oCheckbox.setEnabled(false);
                }
            });

            //---------------------------------------------------------------
            //  Agregado selección impresora en "Asignar Orden/Viaje"

            this.scope.visibleImpresoraOrdViaje = false;
            if (sap.ui.getCore().byId("checkBox-impresoraOrdViaje")) {
                sap.ui.getCore().byId("checkBox-impresoraOrdViaje").setSelected(false);
            }

            //besmit
            var oModel = oView.getModel("mListaTratar");
            var sIndex = oModel.getProperty('/').findIndex(e =>
                e.NRO_PALETA == sNumeroPallet
            );

            this.scope.comentarioOrdViaje = oModel.getProperty('/' + sIndex).COMENTARIO;
            var oModelScope = new JSONModel(this.scope);
            oView.setModel(oModelScope, "scope");

        },

        _ConsolidarListaPosicionesCajas: function(oPosicionesPreRegistradas, oPosicionesStockDisponibles) {
            var oView = this.getView();

            var oModelOrdenViaje = oView.getModel("mListaOrdenViaje");
            var oModelReImprimirEtiqueta = oView.getModel("mListaReimprimirEtiqueta");

            var oListaPosicionesMostrar = new Array();
            var oListaOrdenViaje = new Array();
            var oListaReImprimiEtiquetas = new Array();

            var sNroPaleta = "";
            const cLINEA = oView.getModel("mTratarPallet").getProperty("/LINEA");

            if (oPosicionesPreRegistradas.length > 0) {
                sNroPaleta = oPosicionesPreRegistradas[0].NRO_PALETA;
            }

            this._ListaCajasAgregarDisminuirConSecuencia = new Object();
            this._ListaGuias = new Object();
            var oListaAgrupadaReimprimirEtiquetas = new Object();
            var oListaAgrupadaOrdenViaje = new Object();

            //Agrupamos las posiciones con numero de secuencia
            var sEmpresa = "";
            oPosicionesPreRegistradas.forEach(posicion => {
                posicion.NRO_PALETA = sNroPaleta;
                posicion.EMPRESA_AGRICOLA = posicion.NOMBRE;

                var sNombreOriginal = posicion.NOMBRE;
                if (!sEmpresa) {
                    sEmpresa = sNombreOriginal;
                    oView.getModel("mTratarPallet").setProperty("/EMPRESA_MOSTRAR", sEmpresa);
                } else {
                    if (sEmpresa != sNombreOriginal) {
                        oView.getModel("mTratarPallet").setProperty("/EMPRESA_MOSTRAR", "MIXTA");
                    }
                }

                oListaPosicionesMostrar = this._agruparListaAgregarDisminuirCajas(posicion, cLINEA);

                this._agruparListaReimprimir(oListaAgrupadaReimprimirEtiquetas, posicion);

                this._agruparOtros(oListaAgrupadaOrdenViaje, posicion);
            });

            //Recorremos la lista de reimpresion de etiquetas para agregarla al array a mostrar
            Object.keys(oListaAgrupadaReimprimirEtiquetas).forEach(key => {
                oListaReImprimiEtiquetas.push(oListaAgrupadaReimprimirEtiquetas[key]);
            });

            //Recorremos la lista de orden viaje
            Object.keys(oListaAgrupadaOrdenViaje).forEach(key => {
                oListaOrdenViaje.push(oListaAgrupadaOrdenViaje[key]);
            });

            oModelReImprimirEtiqueta.setData([]);
            oModelReImprimirEtiqueta.setData(oListaReImprimiEtiquetas);

            oModelOrdenViaje.setData([]);
            oModelOrdenViaje.setData(oListaOrdenViaje);


            var oNuevasPosiciones = new Object();

            oPosicionesStockDisponibles.forEach(posicion => {
                posicion.NRO_PALETA = sNroPaleta;

                // var sNombreOriginal = posicion.NOMBRE;
                // if (!sEmpresa) {
                //     sEmpresa = sNombreOriginal;
                //     oView.getModel("mTratarPallet").setProperty("/EMPRESA_MOSTRAR", sEmpresa);
                // } else {
                //     if (sEmpresa != sNombreOriginal) {
                //         oView.getModel("mTratarPallet").setProperty("/EMPRESA_MOSTRAR", "MIXTA");
                //     }
                // }

                var oPosicionDisponible = new Object();
                Object.assign(oPosicionDisponible, posicion);

                oPosicionDisponible.EMPRESA_AGRICOLA = posicion.PARTNER_NAME;
                oPosicionDisponible.FECHA_COSECHA = posicion.FCH_COSECHA;
                oPosicionDisponible.GUIA = "";
                oPosicionDisponible.NRO_SECUENCIA = "";
                oPosicionDisponible.CANT_CAJAS = "";

                var oGroupingKey = `${posicion.PARTNER}-${posicion.FCH_COSECHA}-${posicion.MODULO}`;

                if (!oNuevasPosiciones[oGroupingKey]) {
                    oNuevasPosiciones[oGroupingKey] = new Object();
                    Object.assign(oNuevasPosiciones[oGroupingKey], oPosicionDisponible);
                    oNuevasPosiciones[oGroupingKey].lista = [];
                    oNuevasPosiciones[oGroupingKey].lista_guias = [];
                }

                oNuevasPosiciones[oGroupingKey].lista.push(oPosicionDisponible);
                if (posicion.GUIA) {
                    oNuevasPosiciones[oGroupingKey].lista_guias.push({ "GUIA": posicion.GUIA, "LINEA": cLINEA });
                    oNuevasPosiciones[oGroupingKey].lista_guias = oNuevasPosiciones[oGroupingKey].lista_guias.filter(function(value, index, self) {
                        return self.findIndex(e => e.GUIA == value.GUIA) == index;
                    });
                }
            });

            Object.keys(oNuevasPosiciones).forEach(key => {
                oListaPosicionesMostrar.push(oNuevasPosiciones[key]);
            });

            return oListaPosicionesMostrar;
        },

        _agruparOtros: function(oLista, posicion) {
            var oPosicionCopy = new Object();
            Object.assign(oPosicionCopy, posicion);

            var oGroupingKey = `${posicion.EMPRESA_AGRICOLA}-${posicion.FECHA_COSECHA}-${posicion.MODULO}-${posicion.GUIA}`;

            var bSumado = false;

            if (!oLista[oGroupingKey]) {
                oLista[oGroupingKey] = new Object();
                Object.assign(oLista[oGroupingKey], posicion);
                oLista[oGroupingKey].CANT_CAJAS = Number(posicion.CANT_CAJAS);
                oLista[oGroupingKey].lista = [];
                bSumado = true;
            }

            if (!bSumado) {
                var nCajasSumar = Number(posicion.CANT_CAJAS);
                oLista[oGroupingKey].CANT_CAJAS += nCajasSumar;
            }

            oLista[oGroupingKey].lista.push(oPosicionCopy);
        },

        _agruparListaReimprimir: function(oLista, posicion) {
            var oPosicionReiprimir = new Object();
            Object.assign(oPosicionReiprimir, posicion);

            oPosicionReiprimir.PTI = false;
            oPosicionReiprimir.OGL = false;
            oPosicionReiprimir.SENASA = false;
            oPosicionReiprimir.PALLETTAG = true;

            var oGroupingKey = `${posicion.EMPRESA_AGRICOLA}-${posicion.FECHA_COSECHA}-${posicion.MODULO}-${posicion.FECHA_PRODUCCION}`;

            var bSumado = false;

            if (!oLista[oGroupingKey]) {
                oLista[oGroupingKey] = new Object();
                Object.assign(oLista[oGroupingKey], posicion);
                oLista[oGroupingKey].CANT_CAJAS = Number(posicion.CANT_CAJAS);
                oLista[oGroupingKey].lista = [];
                bSumado = true;
            }

            if (!bSumado) {
                var nCajasSumar = Number(posicion.CANT_CAJAS);
                oLista[oGroupingKey].CANT_CAJAS += nCajasSumar;
            }

            oLista[oGroupingKey].lista.push(oPosicionReiprimir);
        },

        _agruparListaAgregarDisminuirCajas: function(posicion, cLINEA) {
            var oLista = this._ListaCajasAgregarDisminuirConSecuencia;
            var oListaGuias = this._ListaGuias;

            var oGroupingKey = `${posicion.EMPRESA_AGRICOLA}-${posicion.FECHA_COSECHA}-${posicion.MODULO}-${posicion.GUIA}`;
            var oGroupingKeyGuias = `${posicion.EMPRESA_AGRICOLA}-${posicion.FECHA_COSECHA}-${posicion.MODULO}`;

            var bSumado = false;

            if (!oLista[oGroupingKey]) {
                oLista[oGroupingKey] = new Object();
                Object.assign(oLista[oGroupingKey], posicion);
                oLista[oGroupingKey].CANT_CAJAS = Number(posicion.CANT_CAJAS);
                oLista[oGroupingKey].lista = [];
                oLista[oGroupingKey].lista_guias = [];
                bSumado = true;
            }

            if (!oListaGuias[oGroupingKeyGuias]) {
                oListaGuias[oGroupingKeyGuias] = new Array();
            }


            if (posicion.GUIA) {
                oListaGuias[oGroupingKeyGuias].push({ "GUIA": posicion.GUIA, "LINEA": cLINEA });
            }

            // oLista[oGroupingKey].lista_guias.push({ "GUIA": posicion.GUIA, "LINEA": cLINEA });
            oLista[oGroupingKey].lista_guias = oListaGuias[oGroupingKeyGuias];
            oLista[oGroupingKey].lista_guias = oLista[oGroupingKey].lista_guias.filter(function(value, index, self) {
                return self.findIndex(e => e.GUIA == value.GUIA) == index;
            });

            if (!bSumado) {
                var nCajasSumar = Number(posicion.CANT_CAJAS);
                oLista[oGroupingKey].CANT_CAJAS += nCajasSumar;
            }

            oLista[oGroupingKey].lista.push(posicion);

            var arr = new Array();

            Object.keys(oLista).forEach(key => {
                arr.push(oLista[key]);
            });

            return arr;
        },

        onTratarCajaPosicion: function(oEvent) {
            var oSource = oEvent.getSource();
            var oSelected = oSource.getSelected();
            var oFila = oSource.getParent();
            var oCells = oFila.getCells();
            var oBtnQuitar = oCells[7];
            var oBtnAgregar = oCells[6];
            var oInputCantidad = oCells[5];
            var oFlexGuiaCajas = oCells[4];
            var oItemsFlex = oFlexGuiaCajas.getItems();
            var oBtnAyudaGuia = oItemsFlex[1];

            if (oBtnAyudaGuia.getVisible()) {
                oBtnAyudaGuia.setEnabled(oSelected);
            }

            this._InputCantidad = oInputCantidad;

            oBtnQuitar.setEnabled(oSelected);
            oBtnAgregar.setEnabled(oSelected);
            oInputCantidad.setEnabled(oSelected);

            var oValueOriginal = oInputCantidad.getValue();
            var oValueFormated = Number(oValueOriginal);
            if (isNaN(oValueFormated)) oValueFormated = ""; //0;
            oInputCantidad.setValue(oValueFormated);

            var oPathCheckboxSeleccionado = oSource.getBindingContext("mTratarPallet").getPath();

            var oTable = sap.ui.getCore().byId("table-tratar_pallet_cajas");
            var oItems = oTable.getItems();
            oItems.forEach(item => {
                var oCells = item.getCells();
                var oCheckbox = oCells[0];
                var oPath = oCheckbox.getBindingContext("mTratarPallet").getPath();

                if (oPath != oPathCheckboxSeleccionado) {
                    oCheckbox.setEnabled(!oSelected);
                }
            });
        },

        onAbrirAyudaGuia: function(oEvent) {
            var sNombreFragmento = "AyudaGuia";
            this._NombreFragmentoAyudaSeleccionado = sNombreFragmento;

            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("mTratarPallet");
            var oPosicion = oBinding.getObject();
            var oListaGuias = oPosicion.lista_guias;
            var oParent = oSource.getParent();
            var oItems = oParent.getItems();
            var oInput = oItems[0];

            var oView = this.getView();

            var oModel = new JSONModel(oListaGuias);

            oView.setModel(oModel, "AyudaGuia");

            this._InputSeleccionadoMatchcode = oInput;
            this.onAbrirFragmento(sNombreFragmento);
        },

        //---------------------------------------------------------------
        //  Agregado selección impresora en "Asignar Orden/Viaje"
        onAbrirAyudaImpresoraOrdViaje: async function(oEvent) {
            var oView = this.getView();

            oView.setModel(new JSONModel([]), "mListaAyudaImpresoraSet");
            sap.ui.core.BusyIndicator.show(0);
            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            const aFilters = [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)];
            // var oResponse = await this._Read("/AyudaImpresoraSet");
            var oResponse = await this._Read("/AyudaImpresoraSet", aFilters);
            //DG - Fin             
            if (!oResponse) oResponse = [];
            sap.ui.core.BusyIndicator.hide();
            oView.getModel("mListaAyudaImpresoraSet").setData(oResponse);

            var sNombreFragmento = "AyudaGrupoImpresoraOrdViaje";
            this._NombreFragmentoAyudaSeleccionado = sNombreFragmento;
            this.onAbrirFragmento(sNombreFragmento);
        },

        onAddValMCImpresoraOrdViaje: function(oEvent) {
            var oView = this.getView();
            var oItem = oEvent.getParameter("selectedItem");
            var oSelected = oItem.getTitle();
            var oInput = sap.ui.getCore().byId("input-impresoraOrdViaje");
            oInput.setValue(oSelected);
            if (this._NombreFragmentoAyudaSeleccionado) {
                var sNombreFragmentoCerrar = this._NombreFragmentoAyudaSeleccionado;
                delete this._NombreFragmentoAyudaSeleccionado;
            } else {
                var sNombreFragmentoCerrar = this._NombreFragmento;
                delete this._NombreFragmento;
            }
            this.onCerrarFragmento(sNombreFragmentoCerrar);
        },

        onChkImpresoraOrdViaje: function() {
            var oCore = sap.ui.getCore();
            var oView = this.getView();
            this.scope.visibleImpresoraOrdViaje = oCore.byId("checkBox-impresoraOrdViaje").getSelected();

            if (!this.scope.visibleImpresoraOrdViaje) {
                oCore.byId("input-impresoraOrdViaje").setValue('');
            }

            var oModelScope = new JSONModel(this.scope);
            oView.setModel(oModelScope, "scope");
        },
       
      
        onAbrirAyudaImpresora: function(oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mTratarPallet")
            var sNombreFragmento = "AyudaGrupoImpresora";
            this._NombreFragmentoAyudaSeleccionado = sNombreFragmento;

            var oSource = oEvent.getSource();
            var oParent = oSource.getParent();
            var oFields = oParent.getFields();
            var oInput = oFields[0];

            this._InputSeleccionadoMatchcode = oInput;
            this.onAbrirFragmento(sNombreFragmento);

            // var sLinea = oModel.getProperty("/LINEA");

            // var oFiltros = new Array(
            //     new sap.ui.model.Filter("ZZ_LINEA", sap.ui.model.FilterOperator.EQ, sLinea)
            // );

            // var oBinding = this._Fragmento[sNombreFragmento].getBinding("items");
            // oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },

        onAbrirAyudaViaje: function(oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mTratarPallet")
            var sNombreFragmento = "AyudaViaje";
            this._NombreFragmentoAyudaSeleccionado = sNombreFragmento;

            var oSource = oEvent.getSource();
            var oParent = oSource.getParent();
            var oFields = oParent.getFields();
            var oInput = oFields[0];
            //Inicio SCH
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //Fin SCH

            this._InputSeleccionadoMatchcode = oInput;
            this.onAbrirFragmento(sNombreFragmento);

            var sProducto = oModel.getProperty("/PRODUCTO");
            sProducto = sProducto.split("-");
            sProducto = sProducto.shift();
            sProducto = sProducto.trim();

            var oFiltros = new Array(
                new sap.ui.model.Filter("PRODUCTO", sap.ui.model.FilterOperator.EQ, sProducto),
                new sap.ui.model.Filter("WERKS", sap.ui.model.FilterOperator.EQ, sCentro) //SCH
            );

            var oBinding = this._Fragmento[sNombreFragmento].getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(oFiltros, true), "Application");    //SCH
            //oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application"); //SCH
        },

        _NoSuperaMaximo: function(oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mTratarPallet");
            var oCore = sap.ui.getCore();

            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("mTratarPallet");
            var oPosicion = oBinding.getObject();

            var oTable = oCore.byId("table-tratar_pallet_cajas");
            var oItems = oTable.getItems();

            var nCajasEnPaleta = oModel.getProperty("/CAJAS_EN_PALETA");
            nCajasEnPaleta = Number(nCajasEnPaleta);
            nCajasEnPaleta = isNaN(nCajasEnPaleta) ? 0 : nCajasEnPaleta;

            var nCajasFaltantes = oModel.getProperty("/CAJAS_FALTANTES");
            nCajasFaltantes = Number(nCajasFaltantes);
            nCajasFaltantes = isNaN(nCajasFaltantes) ? 0 : nCajasFaltantes;

            var nMaxPaletas = nCajasFaltantes + nCajasEnPaleta;

            var nCantCajas = 0;

            oItems.forEach(item => {
                var oCells = item.getCells();
                var oInputCajas = oCells[5];

                if (oInputCajas.getEnabled()) return;

                var sValue = oInputCajas.getValue();
                sValue = Number(sValue);
                sValue = isNaN(sValue) ? 0 : sValue;

                nCantCajas += sValue;
            });

            //Se solicito que se valide contra MAXPALETA y no las cajas faltantes, esto puede generar negativo
            //queda a modo de prueba y a espera de autorizacion para volver a validar contra cajas faltantes.
            var nRestante = nMaxPaletas - nCantCajas; //validacion correcta
            // var nRestante = nMaxPaletas;

            var nValueIngresado = Number(this._InputCantidad.getValue());
            nValueIngresado = isNaN(nValueIngresado) ? 0 : nValueIngresado;

            if (nValueIngresado > nRestante) {
                // nValueIngresado = nRestante;                
                sap.m.MessageToast.show("La cantidad no puede superar el Maximo de cajas de la Paleta.");
                nValueIngresado = "";
            }

            var oListaPosiciones = oPosicion.lista;
            var nCajasRepartidas = 0;
            var nIndices = oListaPosiciones.length;
            var nIndicesRecorridos = 0;

            oListaPosiciones.forEach(posicion => {
                posicion.CANT_CAJAS = 0;
                if (!posicion.NRO_SECUENCIA) nIndices = 0; // si es una posicion disponible sin secuencia, siempre le sumamos o restamos al primero
            });

            if (nValueIngresado > 0) {
                for (var i = 0; i < nValueIngresado; i++) {
                    if (nIndicesRecorridos > nIndices - 1) nIndicesRecorridos = 0;

                    nCajasRepartidas++;
                    if (nCajasRepartidas > nValueIngresado) return;

                    var posicion = oListaPosiciones[nIndicesRecorridos];
                    posicion.CANT_CAJAS = Number(posicion.CANT_CAJAS);
                    posicion.CANT_CAJAS++;

                    nIndicesRecorridos++;
                }
            } else {
                // nValueIngresado = 0;
            }

            this._InputCantidad.setValue(nValueIngresado);
        },

        onQuitarCajas: function(oEvent) {
            var nValue = Number(this._InputCantidad.getValue()) - 1;

            this._InputCantidad.setValue(nValue);

            this._InputCantidad.fireLiveChange();
        },

        onAgregarCajas: function(oEvent) {
            var nValue = Number(this._InputCantidad.getValue()) + 1;

            this._InputCantidad.setValue(nValue);
            this._InputCantidad.fireLiveChange();
        },

        onActualizarPosicionesCajas: async function() {
            this._ConfirmarEliminarPosicionesStock = false;
            var oCore = sap.ui.getCore();
            var oView = this.getView();
            var oModel = oView.getModel("mTratarPallet");
            var oListaCajas = oModel.getProperty("/ListaCajas");

            var oJson = {
                "N_ACTUALIZAR_CAJAS": [],
                "N_GRUPO_IMPRESORAS": []
            }

            var bExisteErrorGuia = false;

            var contador_cajas_pallet = 0;

            oListaCajas.forEach(caja => {
                var oListaPosiciones = caja.lista;
                var sLote = caja.LOTE;

                oListaPosiciones.forEach(posicion => {
                    var obj = this._CheckearActualizacionPosicionStock(posicion, sLote);

                    if (!obj) return;

                    if (obj.GUIA) {
                        var aGuiaSegmentada = obj.GUIA.split("-");
                        if (aGuiaSegmentada.length > 3) {
                            aGuiaSegmentada.pop()
                            obj.GUIA = aGuiaSegmentada.join("-");
                        }
                    } else {
                        bExisteErrorGuia = true;
                    }

                    contador_cajas_pallet += Number(obj.CANT_CAJAS)

                    oJson.N_ACTUALIZAR_CAJAS.push(obj);
                });
            });

            if (bExisteErrorGuia) {
                MensajesObject._MensajeError(`Existe una posición nueva sin GUIA`);
                return;
            }

            var oInputGrupoImpresora = oCore.byId("input-grupo_impresora_edicion_cajas");
            var oValueGrupoImpresora = oInputGrupoImpresora.getValue();

            oJson.N_GRUPO_IMPRESORAS.push({ "ZZ_GRUPO": oValueGrupoImpresora });

            // SE DESCOMENTO PORQUE AL ESTAN CONSOLIDADOS PUEDEN SER VARIOS REGISTROS Y EL USUARIO NO LOS VE, HAY QUE CONFIRMAR 
            // SI PEDIR ESTA CONFIRMACION
            // if (this._ConfirmarEliminarPosicionesStock) {
            //     var oResponse = await MensajesObject._MensajeConfirmacion(`Hay posiciones que se eliminaran, desea que se quiten?`);
            //     if (!oResponse) {
            //         return;
            //     }
            // }

            this._ConfirmarEliminarPosicionesStock = false;

            var sUrl = "/ActualizarCantidadCajasSet";

            var oResponse = await this._Post(sUrl, oJson, false);

            if (!oResponse) {
                return;
            }

            oModel.setProperty("/CAJAS_EN_PALETA", contador_cajas_pallet);

            this._UncheckPosicionesStock();

            var oTableAgregarDisminuirCajas = oCore.byId("table-tratar_pallet_cajas");
            oTableAgregarDisminuirCajas.destroyItems();

            // await MensajesObject._MensajeExito("Actualizado");
            var sNumeroPallet = oModel.getProperty("/NRO_PALETA");
            await this._CargarDatosTratamientoPallet(sNumeroPallet);

            oTableAgregarDisminuirCajas.getBinding("items").refresh(true);

            var oInputImpresora = oCore.byId("input-grupo_impresora_edicion_cajas");
            oInputImpresora.setValue("");

            var oTable = oView.byId("table-paletas_tratar");
            oTable.destroyItems();
            await this.cargarDatos();
            oTable.getBinding("items").refresh(true);

            // oTable.attachUpdateFinished((oEvent) => {
            //     var oView = this.getView();
            //     var oModel = oView.getModel("mTratarPallet");

            try {
                // var oSource = oEvent.getSource();
                // var oItems = oSource.getItems();
                // var oItem = oItems[this._sIndexPalletSeleccionado];
                // var oBinding = oItem.getBindingContext("mListaTratar");
                // var oElement = oBinding.getObject();
                debugger

                var oModelLista = oView.getModel("mListaTratar");
                var sNroPallet = this._sIndexPalletSeleccionado;
                var oElement = oModelLista.getData().find(e => e.NRO_PALETA == sNroPallet);

                oModel.setProperty("/CAJAS_FALTANTES", oElement.CAJAS_FALTANTES);
                oModel.setProperty("/CAJAS_EN_PALETA", oElement.CAJAS_EN_PALETA);
                oModel.refresh(true);

                // oSource.mEventRegistry.updateFinished = [];
            } catch (e) {
                //
            }
            // });
        },

        _UncheckPosicionesStock: function() {
            var oTable = sap.ui.getCore().byId("table-tratar_pallet_cajas");
            var oItems = oTable.getItems();

            oItems.forEach(item => {
                var oCells = item.getCells();
                var oCheckbox = oCells[0];

                var isSelected = oCheckbox.getSelected();

                if (isSelected) {
                    oCheckbox.setSelected(false);
                    oCheckbox.fireSelect();
                }
            });
        },

        _CheckearActualizacionPosicionStock: function (caja, sLote) {
            var objetos = new Array();
            //DG - Incidente 6 - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Incidente 6 - Fin
            if (caja.CANT_CAJAS == 0 && caja.NRO_SECUENCIA != "") {
                this._ConfirmarEliminarPosicionesStock = true;
                return {
                    "NRO_PALETA": caja.NRO_PALETA,
                    "NRO_SECUENCIA": caja.NRO_SECUENCIA,
                    "GUIA": caja.GUIA,
                    "CANT_CAJAS": String(caja.CANT_CAJAS),
                    "PRODUCTO_MAT_PRIMA": caja.PRODUCTO_MAT_PRIMA,
                    //DG - Incidente 6 - Inicio
                    "WERKS": sCentro
                    //DG - Incidente 6 - Fin                    
                }
            } else if (caja.NRO_SECUENCIA != "") {
                return {
                    "NRO_PALETA": caja.NRO_PALETA,
                    "NRO_SECUENCIA": caja.NRO_SECUENCIA,
                    "GUIA": caja.GUIA,
                    "CANT_CAJAS": String(caja.CANT_CAJAS),
                    "PRODUCTO_MAT_PRIMA": caja.PRODUCTO_MAT_PRIMA,
                    //DG - Incidente 6 - Inicio
                    "WERKS": sCentro
                    //DG - Incidente 6 - Fin                      
                }
            }

            if (caja.NRO_SECUENCIA == "" && String(caja.CANT_CAJAS) != 0) {
                return {
                    "NRO_PALETA": caja.NRO_PALETA,
                    "NRO_SECUENCIA": "",
                    "EMPRESA_AGRICOLA": caja.PARTNER,
                    "MODULO": caja.MODULO,
                    "FECHA_COSECHA": caja.FECHA_COSECHA,
                    "GUIA": caja.GUIA,
                    "CANT_CAJAS": String(caja.CANT_CAJAS),
                    "PRODUCTO_MAT_PRIMA": caja.PRODUCTO_MAT_PRIMA,
                    "LOTE": sLote,
                    //DG - Incidente 6 - Inicio
                    "WERKS": sCentro
                    //DG - Incidente 6 - Fin                      
                };
            }

            return false;
        },

        onlyNumberFormat: function(oEvent) {
            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("mListaReimprimirEtiqueta");
            var oPallet = oBinding.getObject();
            var nMaxCajas = oPallet.CANT_CAJAS;

            var sValue = oSource.getValue();

            var numberPattern = /\d+/g;

            var sFormatValue = sValue.match(numberPattern).join("");

            if (sFormatValue > nMaxCajas) {
                sap.m.MessageToast.show("La cantidad no puede superar el Maximo de cajas de la Paleta.");
                sFormatValue = "";
                // sFormatValue = nMaxCajas;
                // MensajesObject._MensajeAdvertencia("No se puede superar la cantidad maxima del pallet");
            }

            oSource.setValue(sFormatValue);
        },

        onGuardarOrdenViaje: async function() {
            var oView = this.getView();
            var oModel = oView.getModel("mTratarPallet");
            var oPallet = oModel.getData();
            var oCore = sap.ui.getCore();

            var oInputOrdenViaje = oCore.byId("input-orden_viaje");
            var oValue = oInputOrdenViaje.getValue();

            if (oValue == "") {
                await MensajesObject._MensajeError("Debe asignar un elemento de orden / viaje.");
                return;
            }

            var sNroPaleta = oPallet.NRO_PALETA;
            var [orden, viaje] = oValue.split(" - ");

            var oJson = {
                "NRO_PALETA": sNroPaleta,
                "ORDEN": orden,
                "VIAJE": viaje
            }
            //INI TKT 8000024143 Pallet CHEP(AZUL)
            var oCheckPalletChep = oCore.byId("checkBox-PalletChep").getSelected();
            if (oCheckPalletChep) {
            	oJson.FLAG_PALLET_CHEP = 'X';
            } else{oJson.FLAG_PALLET_CHEP = ''; }
            
            //FIN TKT 8000024143 Pallet CHEP(AZUL)
            //---------------------------------------------------------------
            //  Agregado selección impresora en "Asignar Orden/Viaje"
            var oCheckImpOrdViaje = oCore.byId("checkBox-impresoraOrdViaje").getSelected();
            if (oCheckImpOrdViaje) {
                var oInputImpOrdViaje = oCore.byId("input-impresoraOrdViaje").getValue();
                if (oInputImpOrdViaje == "") {
                    await MensajesObject._MensajeError("Debe seleccionar una impresora.");
                    return;
                }
                oJson.FLAG_IMP = 'X';
                oJson.LNAME = oInputImpOrdViaje;
            } else {
                oJson.FLAG_IMP = '';
                oJson.LNAME = '';
            }
            //Inicio SCH
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;   
            oJson.WERKS = sCentro;
            //Fin SCH
            var oInputCommentOrdViaje = oCore.byId("input-comentarioOrdViaje").getValue();
            /*
            if (oInputCommentOrdViaje.trim() == "") {
                await MensajesObject._MensajeError("Es necesario el comentario");
                return;
            }
            */
            oJson.COMENTARIO = oInputCommentOrdViaje;


            var sUrl = "/GuardarOrdenViajeSet";

            //BEGIN - DGOMEZ - 8000018915
            var oResponse = await this._PostAsyncMsg(sUrl, oJson);
            //var oResponse = await this._Post(sUrl, oJson);

            console.log("------------------------------------");
            console.log("oResponse");
            console.log(oResponse);

            //if (!oResponse) return;
            //END   - DGOMEZ - 8000018915

            var sNumeroPallet = oModel.getProperty("/NRO_PALETA");
            await this._CargarDatosTratamientoPallet(sNumeroPallet);

            // var oInputOrdenViaje = oCore.byId("input-orden_viaje");
            // oInputOrdenViaje.setValue("");

            var oTable = oCore.byId("table-tabla_asignar_orden_viaje");
            oTable.destroyItems();
            oTable.getBinding("items").refresh(true);
            this.cargarDatos();

            // oModel.setProperty("/ORDEN", orden);
            // oModel.setProperty("/VIAJE", viaje);

            this.onCerrarFragmento('TratarPaletaDialog');

        },

        onReeimprimirEtiquetas: async function() {
        	//Inicio SCH
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;               
            //Fin SCH
        	var oView = this.getView();
            var oCore = sap.ui.getCore();
            var oModel = oView.getModel("mTratarPallet");
            var oModelListaReimpresion = oView.getModel("mListaReimprimirEtiqueta");

            var oCheckboxMarcarTodo = oCore.byId("chk-reimprimir_marcar_todo");
            var oInputGrupoImpresora = oCore.byId("input-grupo_impresora_reimprimir");

            var oChk = oCheckboxMarcarTodo.getSelected();
            var oGrupoImpresora = oInputGrupoImpresora.getValue();

            var oData = oModelListaReimpresion.getData();

            var oListaReImprimir = new Array();

            oData.forEach(e => {
                var obj = {
                    "NRO_PALETA": e.NRO_PALETA,
                    "NRO_SECUENCIA": e.NRO_SECUENCIA,
                    "CANTIDAD": e.CANTIDAD_ETIQUETAS,
                    "PTI": e.PTI ? "X" : "",
                    "OGL": e.OGL ? "X" : "",
                    "SENASA": e.SENASA ? "X" : "",
                    "PALLETTAG": oChk ? "X" : "",
                    "WERKS":sCentro		
                }

                if (oChk || e.PTI || e.OGL || e.SENASA) {
                    oListaReImprimir.push(obj);
                }
            });

            var oJson = {
                "N_GRUPO_IMPRESORAS": [],
                "N_REIMPRIMIR": []
            }

            if (oGrupoImpresora) oJson.N_GRUPO_IMPRESORAS.push({ "ZZ_GRUPO": oGrupoImpresora });

            if (oListaReImprimir.length == 0) {
                await MensajesObject._MensajeError("Debe seleccionar al menos una opción de alguna de las posiciones.");
                return;
            }

            oJson.N_REIMPRIMIR = oListaReImprimir;

            var sUrl = "/ReImprimirPalletsSet";

            var oResponse = await this._Post(sUrl, oJson);

            if (!oResponse) {
                return;
            }

            oCheckboxMarcarTodo.setSelected(false);
            oData.forEach(e => {
                e.PTI = false;
                e.OGL = false;
                e.SENASA = false;
            });

            oModelListaReimpresion.refresh(true);

            await MensajesObject._MensajeExito("Actualizado.");
            var sNumeroPallet = oModel.getProperty("/NRO_PALETA");
            await this._CargarDatosTratamientoPallet(sNumeroPallet);

            var oInputImpresora = oCore.byId("input-grupo_impresora_reimprimir");
            oInputImpresora.setValue("");

            var oTable = oCore.byId("table-reimprimir_etiquetas");
            oTable.destroyItems();
            oTable.getBinding("items").refresh(true);
            this.cargarDatos();
        },

        onEliminarPallet: async function() {
            var oView = this.getView();
            var oModel = oView.getModel("mTratarPallet");
            var sNroPaleta = oModel.getProperty("/NRO_PALETA");

            var sMensaje = `Desea eliminar el pallet Nro ${sNroPaleta}`;
            var oResponse = await MensajesObject._MensajeConfirmacion(sMensaje);

            if (!oResponse) {
                return;
            }

            var sUrl = "/EliminarPalletSet";

            var oJson = {
                "NRO_PALETA": sNroPaleta
            }

            oResponse = await this._Post(sUrl, oJson);

            if (oResponse) {
                this.onCerrarFragmento("TratarPaletaDialog");

                var oTable = oView.byId("table-paletas_tratar");
                oTable.destroyItems();
                oTable.getBinding("items").refresh(true);
                this.cargarDatos();
            }
        },

        //BEGIN - DGOMEZ - 8000018915
        _PostAsyncMsg: async function(oUrl, oJson = {}, dontCheckSuccessError = true) {
            var oView = this.getView();
            var oBusyModel = oView.getModel("mBusy");

            oBusyModel.setProperty("/iniciarPost", true);

            var sOData = this.getView().getModel("ZEWM_0001");

            return new Promise((resolve, reject) => {
                sOData.create(oUrl, oJson, {
                    success: async function(oResponse, oHeader) {
                        oBusyModel.setProperty("/iniciarPost", false);

                        var oErrorExist = await MensajesObject.mostrarMensajesHeader(oHeader);
                        if (oErrorExist && dontCheckSuccessError) {
                            resolve(false);
                        } else {
                            resolve(oResponse);
                        }
                    },
                    error: async function(oError, oHeader) {
                        oBusyModel.setProperty("/iniciarPost", false);

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

                                    var oMsg = await MensajesObject._MensajeError(oMessage);
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

        onRefresh: async function() {
                this.cargarDatos();
            }
            //END   - DGOMEZ - 8000018915

    });
});