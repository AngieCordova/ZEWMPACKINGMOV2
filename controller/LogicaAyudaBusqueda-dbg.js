sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/SearchField",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Token",
    "sap/m/BusyDialog"
], function (JSONModel, SearchField, MessageToast, Fragment, Filter, FilterOperator, Token, BusyDialog) {
    "use strict";

    var FRAGMENT_PATH = "AvocadoProyecto.AvocadoProyecto.fragments.ModalAyudaBusqueda";
    const ODATA_NAME = "/sap/opu/odata/sap/ZEWM_0030_SRV";

    return {
        _FragmentoAyuda: new Object(),
        _InputSolicitaAyuda: new Object(),

        onCerrarFragmento: function (sNombre, oEvent) {
            this._FragmentoAyuda[sNombre].destroy();
            delete this._FragmentoAyuda[sNombre];
        },

        onCerrarFragmentoReubicarPallet: async function (oEvent) {
            var oCore = sap.ui.getCore();
            var oDialog = oCore.byId("dialog-reubicar_pallet_ewm");
            oDialog.close();
        },

        _ConfigurarFragmentoAyuda: function (oFragment, object) {
            var oView = this.getView();
            var sKey = object.key;
            var sDescriptionKey = object.description_key;
            var bSupportRange = false;
            var sTitle = object.title;
            var bMultiSelect = object.multiselect;

            //SETEAMOS EL KEY Y EL DESCRIPTION KEY DEL TOKEN
            oFragment.setDescriptionKey(sDescriptionKey);
            oFragment.setKey(sKey);
            oFragment.setSupportRanges(bSupportRange);
            oFragment.setSupportMultiselect(bMultiSelect);

            var sTitulo = oView.getModel("i18n").getResourceBundle().getText(sTitle);
            oFragment.setTitle(sTitulo);
        },

        _SetearleBarraBusqueda: function (oFragment, oColumnas, sNombreFragmento, oModel, settings) {
            var oSearchField = new SearchField({
                showSearchButton: false
            });

            oSearchField.attachSearch(this._FiltrarDatosAyudaBusqueda.bind(this, oColumnas, sNombreFragmento));
            oSearchField.attachLiveChange(this._LimpiarFiltrosAyudaBusqueda.bind(this, oColumnas, sNombreFragmento));

            var oFilterBar = oFragment.getFilterBar();
            oFilterBar.setFilterBarExpanded(false);
            oFilterBar.setBasicSearch(oSearchField);

            var mostrar_boton_buscar = false;
            var declarado = typeof settings.mostrar_boton_buscar != "undefined";

            if (declarado) {
                mostrar_boton_buscar = settings.mostrar_boton_buscar;
                oFilterBar.attachSearch(this._FiltrarDatosAyudaBusqueda.bind(this, oColumnas, sNombreFragmento));
            }

            oFilterBar.setShowGoOnFB(mostrar_boton_buscar);

            oFragment.getTableAsync().then(function (oTable) {
                oTable.setModel(oModel);
                oTable.setModel(new JSONModel({
                    "cols": oColumnas
                }), "columns");

                if (oTable.bindRows) {
                    oTable.bindAggregation("rows", "/");
                }

                if (oTable.bindItems) {
                    oTable.bindAggregation("items", "/", function () {
                        return new sap.m.ColumnListItem({
                            cells: oColumnas.map(function (column) {
                                return new sap.m.Label({
                                    text: "{" + column.template + "}"
                                });
                            })
                        });
                    });
                }

                oFragment.update();
            }.bind(this));
        },

        _SetearleEventos: function (oFragment, sNombreFragmento, callback = false) {
            try {
                var evento = this.onAceptarTokensIngresados;

                if (callback) {
                    evento = this[callback];
                }

                var oView = this.getView();

                oFragment.attachCancel({}, this.onCerrarFragmento.bind(this, sNombreFragmento), false);
                oFragment.attachAfterClose({}, this.onCerrarFragmento.bind(this, sNombreFragmento), false);
                oFragment.attachOk({}, evento.bind(this, sNombreFragmento), false);

                this._FragmentoAyuda[sNombreFragmento] = oFragment;
                oView.addDependent(oFragment);
            } catch (err) {
                throw "Error al cargar los eventos de la ayuda de búsqueda";
            }
        },

        _CargarDatos: async function (oSource, url_odata, sNombreFragmento, recargar = false, dependencias = []) {
            var oView = this.getView();
            var sName = oSource.getName();

            if (ODATA_NAME) {
                var oDataService = new sap.ui.model.odata.v2.ODataModel(ODATA_NAME, { "useBatch": false });
            } else {
                var oDataService = this.getOwnerComponent().getModel();
            }

            if (!url_odata) {
                throw "Error de código al abrir, no se encontro la URL del servicio";
                return new JSONModel([]);
            }

            var modelo_cargado = oView.getModel(sNombreFragmento);

            if (!recargar && modelo_cargado) {
                return oView.getModel(sNombreFragmento);
            }

            var oFiltros = new Array();

            if (dependencias.length > 0) {
                dependencias.forEach(dependencia => {
                    var sID = dependencia.id_control;
                    var oControl = oView.byId(sID);

                    if (!oControl) {
                        oControl = sap.ui.getCore().byId(sID);
                    }

                    var sCampo = dependencia.nombre_campo_filtro;

                    if (oControl instanceof sap.m.MultiInput) {
                        var oTokens = oControl.getTokens();

                        if (oTokens.length === 0) {
                            oControl.removeAllTokens();
                            throw dependencia.mensaje_error;
                        } else {
                            oTokens.forEach(token => {
                                var sKey = token.getKey();
                                var filtro = new Filter(sCampo, FilterOperator.EQ, sKey);
                                oFiltros.push(filtro);
                            });
                        }
                    } else if (oControl instanceof sap.m.Input) {
                        var sValue = oControl.getValue();

                        if (!sValue) {
                            throw dependencia.mensaje_error;
                        } else {
                            var filtro = new Filter(sCampo, FilterOperator.EQ, sValue);
                            oFiltros.push(filtro);
                        }
                    }
                });
            }

            var response = await new Promise(resolve => {
                oDataService.read(url_odata, {
                    filters: oFiltros,
                    "success": function (response, header) {
                        try {
                            resolve(response.results);
                        } catch (err) {
                            MessageToast.show("Error al procesar resultados");
                            resolve([]);
                        }
                    },
                    "error": function (response) {
                        // MessageToast.show("Error de servicio");
                        resolve([]);
                    }
                });
            });

            var oModel = new JSONModel(response);

            if (response.length > 0) {
                oView.setModel(oModel, sNombreFragmento);
            }

            return oModel;
        },

        /**
         * Apertura ayuda de busqueda.
         * @constructor
         * @param {sap.ui.base.Event} oEvent - Evento del multiinput.
         * @param {Object} settings - Parametros de configuracion = {
              columnas      : Array<Object> => [{ 'label': 'Test', 'template': 'campo_entity', 'width': '5rem' }],
              callback      : String => nombre de la funcion a ejecutar al seleccionar valores,
              recargar      : boolean => recarga los datos cada vez que se abre la ayuda de busqueda,
              dependencias  : Array<Object> => [{'id_control': 'Id del input', 'mensaje_error': 'Ingrese un test', 'nombre_campo_filtro': 'nombre campo del entity'}],
              fragment_path : String  => en caso de llegar un path, se reemplaza por el original para buscar el custom,
              no_cargar_odata : Boolean => no carga el odata, por si se necesita que retorne el fragmento y cargar el odata desde otra funcion,
              url           : String  => url del entity a consultar,
              key           : String  => Key del ValueHelpDialog,
              description_key : String  => description key del ValueHelpDialog;
              title         : String  => titulo de la ayuda de busqueda;
              multiselect   : boolean => permite multiple seleccion;
         }.
        * @returns {sap.ui.core.Fragment}
        */
        onAbrirAyudaBusqueda: async function (oEvent, settings) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var sNombreFragmento = oSource.getName();

            oSource.setBusy(true);

            const oBusyDialog = new BusyDialog({
                text: "Por favor, espere mientras se cargan los datos"
            });

            oBusyDialog.open();

            try {
                var oColumnas = settings.columnas;

                var oFragment = await Fragment.load({
                    name: FRAGMENT_PATH,
                    controller: this
                });

                //SETEAMOS EL KEY Y EL DESCRIPTION KEY DEL TOKEN
                this._ConfigurarFragmentoAyuda(oFragment, settings);

                //EVENTOS DE CIERRE DE AYUDA DE BUSQUEDA
                this._SetearleEventos(oFragment, sNombreFragmento, settings.callback);

                //DATOS DE MODELO
                var cargar_odata = settings.no_cargar_odata ? false : true;

                if (cargar_odata) {
                    var oModel = await this._CargarDatos(oSource, settings.url, sNombreFragmento, settings.recargar, settings.dependencias);
                } else {
                    var oModel = new JSONModel([]);
                }

                //BARRA DE BUSQUEDA
                this._SetearleBarraBusqueda(oFragment, oColumnas, sNombreFragmento, oModel, settings);

                oFragment.open();

                this._InputSolicitaAyuda[sNombreFragmento] = oSource;
                oBusyDialog.close();
            } catch (error) {
                var mensaje_error = "Ocurrió un error al intentar abrir el fragmento";

                if (typeof error == "string") {
                    mensaje_error = error;
                }

                console.log(mensaje_error);
                MessageToast.show(mensaje_error);
            }

            oSource.setBusy(false);

            try {
                oFragment.setTokens(oSource.getTokens());
            } catch (error) { }

            return oFragment;
        },

        _FiltrarDatosAyudaBusqueda: function (oColumnas, sNombreFragmento, oEvent) {
            try {
                var oSource = oEvent.getSource();
                var sValue = oEvent.getParameter("query");

                //Se ejecuta el evento desde el evento del boton IR de la ayuda de busqueda
                try {
                    if (!sValue) {
                        sValue = oSource.getBasicSearchValue();
                    }
                } catch (_error) { }

                var oFiltros = new Array();

                oColumnas.forEach(columna => {
                    var sCampoFiltro = columna.template;
                    var oFiltroAgregar = new sap.ui.model.Filter(sCampoFiltro, sap.ui.model.FilterOperator.Contains, sValue);
                    oFiltros.push(oFiltroAgregar);
                });

                var filtros_colocar = [
                    new sap.ui.model.Filter({
                        filters: oFiltros,
                        and: false
                    })
                ];

                var oFragment = this._FragmentoAyuda[sNombreFragmento];

                oFragment.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(filtros_colocar);
                    }

                    if (oTable.bindItems) {
                        oTable.getBinding("items").filter(filtros_colocar);
                    }

                    oFragment.update();
                });
            } catch (err) {
                var mensaje_error = "Falló el filtrado de la ayuda de búsqueda";
                MessageToast.show(mensaje_error);
                console.log(mensaje_error);
            }
        },

        _LimpiarFiltrosAyudaBusqueda: function (oColumnas, sNombreFragmento, oEvent) {
            try {
                var oSource = oEvent.getSource();
                var no_limpiar = oSource.getValue() != "";

                if (no_limpiar) {
                    return;
                }

                var oFiltros = new Array();

                var sValue = "";

                oColumnas.forEach(columna => {
                    var sCampoFiltro = columna.template;
                    var oFiltroAgregar = new sap.ui.model.Filter(sCampoFiltro, sap.ui.model.FilterOperator.Contains, sValue);
                    oFiltros.push(oFiltroAgregar);
                });

                var filtros_colocar = [
                    new sap.ui.model.Filter({
                        filters: oFiltros,
                        and: false
                    })
                ];

                var oFragment = this._FragmentoAyuda[sNombreFragmento];

                oFragment.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(filtros_colocar);
                    }

                    if (oTable.bindItems) {
                        oTable.getBinding("items").filter(filtros_colocar);
                    }

                    oFragment.update();
                });
            } catch (err) {
                var mensaje_error = "Falló la limpieza de filtros de la ayuda de búsqueda";
                MessageToast.show(mensaje_error);
                console.log(mensaje_error);
            }
        },

        onAceptarTokensIngresados: function (sNombreFragmento, oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var oTokens = oEvent.getParameter("tokens");

            // MultiInput
            if (this._InputSolicitaAyuda[sNombreFragmento] instanceof sap.m.MultiInput) {
                this._InputSolicitaAyuda[sNombreFragmento].setTokens(oTokens);
                this._InputSolicitaAyuda[sNombreFragmento].fireTokenUpdate();
            } else {
                // Input

                // Verifica si oTokens tiene al menos un elemento
                if (oTokens && oTokens.length > 0) {
                    // Se obtiene el dato del Input
                    var sValue = oTokens[0].getKey();

                    // Se setea el valor en el Input para que se llene el modelo asociado al Input
                    if (sValue) {
                        oView.byId(sNombreFragmento).setValue(sValue);
                    }
                }
            }

            oSource.fireAfterClose();
        },

        onAgregarSuggestion: function (oEvent, settings) {
            var oSource = oEvent.getSource();
            var sName = oSource.getName();

            var oSelectedRow = oEvent.getParameter("selectedRow");
            var oContext = oSelectedRow.getBindingContext(sName);
            var object = oContext.getObject();

            var key = object[settings.key];
            var text = object[settings.description_key];
            var descripcion = text + " (" + key + ")";

            var oToken = new sap.m.Token({
                "key": key,
                "text": descripcion
            });

            var existe = oSource.getTokens().some(token => token.getText() == descripcion);

            if (existe) {
                oSource.setValue("");
                return;
            }

            oSource.addToken(oToken);

            try {
                oSource.fireTokenUpdate();
            } catch (error) {
                //
            }
        },

        onTokenUpdate: function (oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var sPath = oSource.getName();

            var sType = oEvent.getParameter("type");

            //Si sType es undefined es porque no es un multiinput
            if (sType !== undefined) {
                var no_removed = sType == "removed" ? false : true;

                var oTokens = oSource.getTokens();

                if (oTokens && no_removed) {
                    var no_es_null = oTokens.length > 0;

                    if (no_es_null) {
                        oSource.setValueState("None");
                    }
                }
            }
        },

        onComprobarSuggestion: async function (oEvent, settings) {
            var oView = this.getView();

            var oSource = oEvent.getSource();
            var sName = oSource.getName();
            var oModel = oView.getModel(sName);

            oSource.setBusyIndicatorDelay(5);

            var sValue = oSource.getValue();
            var campo_vacio = sValue ? false : true;

            if (campo_vacio) {
                return;
            }

            var modelo_no_cargado = oModel ? false : true;

            if (modelo_no_cargado || settings.recargar) {
                oSource.setBusy(true);

                try {
                    await this._CargarDatos(oSource, settings.url_odata, sName, settings.recargar, settings.dependencias);
                } catch (error) {
                    var mensaje_error = "Ocurrió un error al intentar abrir el fragmento";

                    if (typeof error == "string") {
                        mensaje_error = error;
                    }

                    MessageToast.show(mensaje_error);
                }

                oSource.setBusy(false);
            }

            if (settings.comprobar_y_agregar) {
                this._BuscarTokenSegunListado(oSource, sValue, settings, sName);
            }
        },

        _BuscarTokenSegunListado: function (oSource, sValue, settings, sFragmentName) {
            try {
                var oView = this.getView();
                var oModel = oView.getModel(sFragmentName);
                var oLista = oModel.getData();
                var cadena = sValue.split(" ");

                cadena = cadena.filter((value, index, lista) => lista.indexOf(value) == index);

                var no_buscar = cadena.length == 0;

                if (no_buscar) {
                    return;
                }

                var se_localizo = false;

                cadena.forEach(valor => {
                    var localizado = oLista.find(e => e[settings.key] == valor);

                    if (localizado) {
                        var key = localizado[settings.key];
                        var text = localizado[settings.description_key];
                        var descripcion = text + " (" + key + ")";

                        var oToken = new sap.m.Token({
                            "key": key,
                            "text": descripcion
                        });

                        var existe = oSource.getTokens().some(token => token.getText() == descripcion);

                        if (existe) {
                            return;
                        }

                        oSource.addToken(oToken);
                        se_localizo = true;
                    }
                });

                if (se_localizo) {
                    setTimeout(() => {
                        oSource.setValue("");
                    }, 20);
                }
            } catch (_error) {
                console.log("Error");
            }
        }
    };
});