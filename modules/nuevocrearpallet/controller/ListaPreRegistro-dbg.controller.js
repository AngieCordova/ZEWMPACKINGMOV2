sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function (Controller, formatter, JSONModel, MensajesObject) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.nuevocrearpallet.controller.ListaPreRegistro", {

        _Fragmento: new Object(),
        formatter: formatter,
        dataBus: {},
        _ListaPathsProductosQuitar: [],
        _ListaGuiasPreRegistrarProductoSeleccionado: [],
        //BEGIN - DGOMEZ - 24.04.2021 - 8000019190, Filtro Módulo en Rehabilitar Guías
        _GuiasTotales: [],
        //END   - DGOMEZ - 24.04.2021 - 8000019190, Filtro Módulo en Rehabilitar Guías

        onInit: async function () {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "nuevoCrearPalletTerminadoView", this._busSuscribe, this);
            var oView = this.getView();

            var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0001_SRV");

            var oDataFrio = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV", { "useBatch": false });
            oView.setModel(oDataFrio, "ZPPGW_FIORI_GUIA");

            oView.setModel(oData, "ZEWM_0001");
            oView.setModel(new JSONModel([]), "mListaAgrupada");
            oView.setModel(new JSONModel([]), "mPreRegistro");
            oView.setModel(new JSONModel([]), "mListaAyudaConsignatario");
            oView.setModel(new JSONModel({ "iniciar": false, "iniciarPost": false }), "mBusy");
            oView.setModel(new JSONModel([]), "mListaGrupoImpresora");

            
            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            const aFilters = [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)];
            // var oResponse = await this._Read("/Grupo_ImpresorasSet");
            var oResponse = await this._Read("/Grupo_ImpresorasSet", aFilters);
            //DG - Fin  
            if (!oResponse) oResponse = [];

            oView.getModel("mListaGrupoImpresora").setData(oResponse);


            this.cargarDatos();
        },

        _Post: async function (oUrl, oJson = {}, dontCheckSuccessError = true) {
            var oView = this.getView();
            var oBusyModel = oView.getModel("mBusy");

            oBusyModel.setProperty("/iniciarPost", true);

            var sOData = this.getView().getModel("ZEWM_0001");

            return new Promise((resolve, reject) => {
                sOData.create(oUrl, oJson, {
                    success: async function (oResponse, oHeader) {
                        oBusyModel.setProperty("/iniciarPost", false);

                        var oErrorExist = await MensajesObject.mostrarMensajesHeader(oHeader);
                        if (oErrorExist && dontCheckSuccessError) {
                            resolve(false);
                        } else {
                            resolve(oResponse);
                        }
                    },
                    error: function (oError, oHeader) {
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

        _Read: function (oUrl, sFiltros = [], sServiceSlc = "ZEWM_0001") {
            var oView = this.getView();
            var oBusyModel = oView.getModel("mBusy");
            oBusyModel.setProperty("/iniciar", true);
            var sOData = this.getView().getModel(sServiceSlc);
            return new Promise(resolve => {
                sOData.read(oUrl, {
                    filters: sFiltros,
                    "success": function (response, header) {
                        oBusyModel.setProperty("/iniciar", false);
                        try {
                            if (sServiceSlc == "ZEWM_0001") {
                                resolve(response.results);
                            } else {
                                resolve(response);
                            }
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": function (error) {
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

        _busSuscribe: function (channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function () {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onIrTratarPallet: function () {
            var oModelOdata = this.getView().getModel("ZEWM_0001");

            var oViewId = "tratarPalletView";
            var oPathView = "AvocadoProyecto.AvocadoProyecto.modules.nuevocrearpallet.view.ListaTratarPallet";
            this.dataBus.oView.oController.onSplitRouter(oViewId, oPathView, 16);
            this.getView().destroy();

            var oNextView = sap.ui.getCore().byId(oViewId);
            oNextView.setModel(oModelOdata, "ZEWM_0001");
        },

        onFiltrarDatosTabla: function (oEvent) {
            var oValue = oEvent.getSource().getValue();

            var oFiltros = new Array(
                new sap.ui.model.Filter("FCH_COSECHA", sap.ui.model.FilterOperator.Contains, oValue),
                new sap.ui.model.Filter("PARTNER_NAME", sap.ui.model.FilterOperator.Contains, oValue),
                new sap.ui.model.Filter("MODULO", sap.ui.model.FilterOperator.Contains, oValue),
                new sap.ui.model.Filter("MODULO_DESCR", sap.ui.model.FilterOperator.Contains, oValue),
                new sap.ui.model.Filter("STATUS_DESCR", sap.ui.model.FilterOperator.Contains, oValue)
            );

            var list = this.getView().byId("idPaletTableNuevo");
            var binding = list.getBinding("items");
            binding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },

        onFiltrarMatchcodeProductos: function (oEvent) {
            var oSource = oEvent.getSource();
            var sValue = oSource.getValue();

            var oFiltros = new Array(
                new sap.ui.model.Filter("Producto", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("Descripcion", sap.ui.model.FilterOperator.Contains, sValue)
            );

            var oTable = sap.ui.getCore().byId("table-matchcode_productos");
            var binding = oTable.getBinding("items");
            binding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },

        cargarDatos: async function (QuitarProductoObject) {
            var oView = this.getView();
            debugger
            //DG - Inicio
            // var oResponse = await this._Read("/Rep_Stock_MMPP_Volcado");
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            const aFilters = [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)];
            var oResponse = await this._Read("/Rep_Stock_MMPP_Volcado", aFilters);
            //DG - Fin

            if (oResponse) {
                var oItemsAgrupados = this._AgruparItems(oResponse);
                oView.getModel("mListaAgrupada").setData(oItemsAgrupados);
            }

            oView.getModel("mListaAgrupada").refresh(true);
        },

        _AgruparItems: function (oListItem) {
            var oShowList = new Array();
            var oListObjects = new Object();

            oListItem.forEach(element => {
                var sFechaCosecha = this._formatDate(element.FCH_COSECHA);;
                var oGroupingKey = `${sFechaCosecha}-${element.PARTNER}-${element.MODULO}-${element.STATUS}`;

                if (oListObjects[oGroupingKey]) {
                    oListObjects[oGroupingKey].list.push(element);
                } else {
                    oListObjects[oGroupingKey] = this._CreateNewObjInGrouping(element);
                }
            });

            var oExistenItems = Object.entries(oListObjects).length > 0 ? true : false;
            if (!oExistenItems) return [];

            Object.keys(oListObjects).forEach(key => {
                oShowList.push(
                    oListObjects[key]
                );
            });

            return oShowList;
        },

        _CreateNewObjInGrouping: function (element) {
            element.FCH_COSECHA = this._formatDate(element.FCH_COSECHA);
            element.FCH_RECEPCION = this._formatDate(element.FCH_RECEPCION);

            var obj = new Object();
            Object.assign(obj, element);
            obj.list = [];
            obj.COMENTARIO = "";

            obj.list.push(element);
            return obj;
        },

        _formatDate: function (oFecha) {
            var oAnio = oFecha.substring(0, 4);
            var oMes = oFecha.substring(4, 6);
            var oDia = oFecha.substring(6, 8);
            return `${oDia}.${oMes}.${oAnio}`;
        },

        onAbrirModalPreRegistro: function (oEvent) {
            var sNombreFragmento = "AyudaDestinoCliente";
            this._NombreFragmento = sNombreFragmento;

            var oView = this.getView();
            var oModel = oView.getModel("mPreRegistro");
            var oListItem = oEvent.getParameter("listItem");
            var oBindingContext = oListItem.getBindingContext("mListaAgrupada")
            var oElement = oBindingContext.getObject();

            if (!oElement) return;

            oModel.setData({});
            oModel.refresh(true);

            this._ListaGuiasPreRegistrarProductoSeleccionado = [];
            /*CBS-DOC-FIX{ "fecha" : "04/06/2021 19:16", "autor" : "Christopher B.S.",
                "FIX" : "Se agrega los lotes a las guias, esto para cuando se selecciona una guía pueda cambiar el lote"
            }CBS-DOC-FIX*/
            this._ListaGuiasPreRegistrarProductoSeleccionado = oElement.list.map(e => {
                return { "GUIA": e.GUIA, "LINEA": e.LINEA, "VBELN": e.VBELN, "VARIEDAD": e.VARIEDAD, "LOTE": e.LOTE };
            }).filter(function (value, index, self) {
                //return self.findIndex(e => e.GUIA == value.GUIA) == index;
                //TKT 8000020734
                return self.findIndex(e => e.GUIA == value.GUIA && e.VARIEDAD == value.VARIEDAD) == index;
            });

            var oAux = new Object();
            // Object.assign(oAux, oElement.list[0]);
            Object.assign(oAux, oElement);
            oAux.GUIA = "";
            oAux.LINEA = "";
            oModel.setData(oAux);

            var sNombreFragmento = "PreRegistrarPalet";

            this.onAbrirFragmento(sNombreFragmento);

            const fRemoverPadding = (function (oFormId, oPaddingTop = "7px") {
                $(`#${oFormId}`).css("padding-bottom", "0px");
                $(`#${oFormId}`).css("padding-top", oPaddingTop);
            });

            fRemoverPadding('form_uno_nuevo_tratar_paleta--Grid');
            fRemoverPadding('form_dos_nuevo_tratar_paleta--Grid');
            fRemoverPadding('form_tres_nuevo_tratar_paleta--Grid');
            fRemoverPadding('form_cuatro_nuevo_tratar_paleta--Grid');
        },

        noSuperaMaxPallet: function (oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mPreRegistro");
            var oSource = oEvent.getSource();

            var sMaxPaleta = oModel.getProperty("/MAXPALETA");
            sMaxPaleta = Number(sMaxPaleta);
            sMaxPaleta = isNaN(sMaxPaleta) ? 0 : sMaxPaleta;

            var sValue = oSource.getValue();
            sValue = Number(sValue);
            sValue = isNaN(sValue) ? 0 : sValue;

            if (sValue > sMaxPaleta) {
                sap.m.MessageToast.show("La cantidad no puede superar el Maximo de cajas de la Paleta.");
                // sValue = sMaxPaleta;
                // var sValueString = String(sValue);
                // sValue = sValueString.split("").pop();
                sValue = "";
            }


            sValue = String(sValue);

            oModel.setProperty("/CANTIDAD", sValue);
            oModel.refresh(true);
            sap.ui.getCore().byId("input-preregistrarpallet-cantidad").setValue(sValue);
            sap.ui.getCore().byId("input-preregistrarpallet-cantidad").setValueState("None")
        },

        onAbrirFragmento: function (sNombre) {
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

            //BEGIN - DGOMEZ - 8000018915
            //Si es el diálogo de ayuda destino cliente
            if (sNombre === "AyudaDestinoCliente") {
                var oDialogo = this._Fragmento[sNombre];
                jQuery.sap.delayedCall(300, null, function () {
                    oDialogo._oSearchField.focus();
                })
            }
            //END   - DGOMEZ - 8000018915

        },

        onFiltrarDatosMatchcode: function (oEvent) {
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
            //     var oFiltros = new Array();
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

        onAgregarValorMatchcode: function (oEvent, bAyudaGuia) {
            var oView = this.getView();
            var oItem = oEvent.getParameter("selectedItem");
            var oSelected = oItem.getTitle();
            var oDescrip = oItem.getDescription();

            if (bAyudaGuia) {
                var oBinding = oItem.getBindingContext("AyudaGuia");
                var oElement = oBinding.getObject();
                var sVBELN = oElement.VBELN;
                var sGUIA = oElement.GUIA;
                var sLINEA = oElement.LINEA;
                oView.getModel("mPreRegistro").setProperty("/VBELN", sVBELN);
                oView.getModel("mPreRegistro").setProperty("/GUIA", sGUIA);
                oView.getModel("mPreRegistro").setProperty("/LINEA", sLINEA);

                /*CBS-DOC-FIX{ "fecha" : "04/06/2021 19:16", "autor" : "Christopher B.S.",
                    "FIX" : "Se agrega los lotes a las guias, esto para cuando se selecciona una guía pueda cambiar el lote"
                }CBS-DOC-FIX*/
                oView.getModel("mPreRegistro").setProperty("/LOTE", oElement.LOTE);

                // oView.getModel("mPreRegistro").setProperty("/PRODUCTO", "");
                // oView.getModel("mPreRegistro").setProperty("/DESCRIP_PRODUCTO", "");
                // oView.getModel("mPreRegistro").setProperty("/MAXPALETA", "");
            } else if (this._InputSeleccionadoMatchcode) {
                this._InputSeleccionadoMatchcode.setValueState("None");
                this._InputSeleccionadoMatchcode.setValue(oSelected);
                this._InputSeleccionadoMatchcode.setName(oDescrip);
            }

            if (this._NombreFragmentoAyudaSeleccionado) {
                var sNombreFragmentoCerrar = this._NombreFragmentoAyudaSeleccionado;
                delete this._NombreFragmentoAyudaSeleccionado;
            } else {
                var sNombreFragmentoCerrar = this._NombreFragmento;
                delete this._NombreFragmento;
            }

            this.onCerrarFragmento(sNombreFragmentoCerrar);
        },

        onCerrarFragmento: function (sNombre) {
            // this._Fragmento[sNombre].close();
            this._Fragmento[sNombre].destroy();
            delete this._Fragmento[sNombre];
        },

        onAbrirAyudaBusquedaGuia: function (oEvent) {
            var oView = this.getView();

            var sNombreFragmento = "AyudaGuia";
            this._NombreFragmentoAyudaSeleccionado = sNombreFragmento;

            var oSource = oEvent.getSource();
            var oParent = oSource.getParent();
            var oFields = oParent.getFields();
            var oInput = oFields[0];

            this._InputSeleccionadoMatchcode = oInput;
            this.onAbrirFragmento(sNombreFragmento);

            try {
                var oModel = oView.getModel("mPreRegistro");
                var sProducto = oModel.getProperty("/PRODUCTO");
                var sVariedad = sProducto.substring(5, 7);

                var oListaGuias = this._ListaGuiasPreRegistrarProductoSeleccionado.filter(e =>
                    e.VARIEDAD == sVariedad
                );

                var oModel = oView.getModel("AyudaGuia");
                if (!oModel) {
                    oModel = new JSONModel(oListaGuias);
                    oView.setModel(oModel, "AyudaGuia");
                } else {
                    oView.getModel("AyudaGuia").setData([]);
                    oView.getModel("AyudaGuia").setData(oListaGuias);
                    oView.getModel("AyudaGuia").refresh(true);
                }
            } catch (error) {
                oView.getModel("AyudaGuia").setData([]);
            }
        },

        onAbrirAyudaBusquedaConsignatario: async function (oEvent) {
            var oView = this.getView();

            try {
                var oModel = oView.getModel("mPreRegistro");
                var sProducto = oModel.getProperty("/PRODUCTO_MAT_PRIMA");
                var sCultivo = sProducto.substring(3, 5);

                var oData = oView.getModel("ZEWM_0001");

                var oSource = oEvent.getSource();
                var oParent = oSource.getParent();
                var oFields = oParent.getFields();
                var oInput = oFields[0];

                this._InputSeleccionadoMatchcode = oInput;

                sap.ui.core.BusyIndicator.show();
                //DG - Inicio
                const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
                //DG - Fin
                // var sUrl = "/ConsignatariosSet";
                var sUrl = "/ConsignatarioCultivoSet";
                var oFiltros = new Array(
                    new sap.ui.model.Filter("ICultivo", sap.ui.model.FilterOperator.EQ, sCultivo),
                    //DG - Inicio
                    new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)
                    //DG - Fin
                );

                var oResponse = await new Promise(resolve => {
                    oData.read(sUrl, {
                        filters: oFiltros,
                        "success": function (response, header) {
                            try {
                                resolve(response.results);
                            } catch (e) {
                                resolve([]);
                            }
                        },
                        "error": function (error) {
                            resolve([]);
                        }
                    });
                });
            } catch (error) {
                var oResponse = [];
            }

            sap.ui.core.BusyIndicator.hide();

            oView.getModel("mListaAyudaConsignatario").setData(oResponse);


            var sNombreFragmento = "AyudaDestinoCliente";
            this._NombreFragmentoAyudaSeleccionado = sNombreFragmento;
            this.onAbrirFragmento(sNombreFragmento);
        },

        onAbrirAyudaBusquedaGrupoImpresora: function (oEvent) {
            var sNombreFragmento = "AyudaGrupoImpresora";
            this._NombreFragmentoAyudaSeleccionado = sNombreFragmento;

            var oView = this.getView();
            var oModel = oView.getModel("mPreRegistro");
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

        onAbrirAyudaBusquedaProducto: async function (oEvent) {
            var sNombreFragmento = "BuscarProducto";
            this._NombreFragmentoAyudaSeleccionado = sNombreFragmento;

            var oView = this.getView();
            var oModel = oView.getModel("mPreRegistro");
            var oSource = oEvent.getSource();
            var oParent = oSource.getParent();
            var oFields = oParent.getFields();
            var oInput = oFields[0];

            oView.setModel(new JSONModel([]), "mListaProductos");

            this._InputSeleccionadoMatchcode = oInput;
            this.onAbrirFragmento(sNombreFragmento);

            var sConsignatario = oModel.getProperty("/CONSIGNATARIO");

            var obj = {
                "idDeep": "1",
                "iConsignatario": sConsignatario,
                "ProdCabToProdDet": [],
                "ProdCabToProdProd": []
            }

            oModel.getProperty("/list").forEach(documento => {
                var exist = obj.ProdCabToProdDet.some(e => e.Vbeln == documento.VBELN);
                if (exist) return;
                obj.ProdCabToProdDet.push({
                    "IdDeep": "1",
                    "Vbeln": documento.VBELN,
                    "Mjahr": documento.MJAHR,
                    "Werks": documento.WERKS,
                    "Modulo": documento.MODULO
                });
            });

            var sUrl = "/ProductosVariedadCabSet ";
            var oResponse = await this._Post(sUrl, obj);

            if (!oResponse) return;

            oResponse = oResponse.ProdCabToProdProd.results;

            this._ListaProductosSinFiltros = oResponse;
            sap.ui.getCore().byId("radio_btn-select_tipo_producto").fireSelect();
        },

        onCambioTipoProducoAyudaBusqueda: function (oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mListaProductos");

            var oSource = oEvent.getSource();
            var oSelectedButton = oSource.getSelectedButton();
            var sKey = oSelectedButton.getId();

            if (!this._ListaProductosSinFiltros) return;

            var aDataFiltrada = this._ListaProductosSinFiltros.filter(p => {
                return p.Producto.substring(0, 1) == sKey;
            });

            oModel.setData(aDataFiltrada);
        },

        onSeleccionarProducto: function (oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mPreRegistro");
            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("mListaProductos");
            var oElement = oBinding.getObject();

            this._InputSeleccionadoMatchcode.setValue(oElement.Producto);
            this._InputSeleccionadoMatchcode.setName(oElement.Descripcion);

            oModel.setProperty("/MAXPALETA", oElement.MaxPaleta);
            oModel.refresh(true);

            oModel.setProperty("/GUIA", "");
            oModel.setProperty("/LINEA", "");

            var sProducto = oModel.getProperty("/PRODUCTO");
            var sVariedad = sProducto.substring(5, 7);
            var oListaGuias = this._ListaGuiasPreRegistrarProductoSeleccionado.filter(e =>
                e.VARIEDAD == sVariedad
            );

            try {
                var existe_uno = oListaGuias.length == 1;
                if (existe_uno) {
                    var primero = oListaGuias[0];
                    var sVBELN = primero.VBELN;
                    var sGUIA = primero.GUIA;
                    var sLINEA = primero.LINEA;
                    oView.getModel("mPreRegistro").setProperty("/VBELN", sVBELN);
                    oView.getModel("mPreRegistro").setProperty("/GUIA", sGUIA);
                    oView.getModel("mPreRegistro").setProperty("/LINEA", sLINEA);
                }
            } catch (error) {

            }

            this.onCerrarFragmento('BuscarProducto');
        },

        validar: async function () {
            var oView = this.getView();
            var oModel = oView.getModel("mPreRegistro");

            var oCantidad = oModel.getProperty("/CANTIDAD");

            if (Number(oCantidad) > 0) {
                return true;
            }

            var oInputCantidad = sap.ui.getCore().byId("input-preregistrarpallet-cantidad");
            oInputCantidad.setValueState("Error");
            // oInputCantidad.mEventRegistry.liveChange = [];
            // oInputCantidad.attachChange("liveChange",
            //     (oEvent) => {
            //         oEvent.getSource().setValueState("None")
            //     }
            // );

            await MensajesObject._MensajeError("Debe ingresar una cantidad.")

            return false;
        },

        onGuardarPreRegistro: async function (oEvent) {
            var oFormValidado = await this.validar();
            if (!oFormValidado) return;

            var oView = this.getView();
            var oModel = oView.getModel("mPreRegistro");

            const oFormatDate = ((oDate) => {
                return oDate.split(".").reverse().join("");
            });

            try {
                var sGuia = sap.ui.getCore().byId("input-guia_preregistro").getValue();
                sGuia = sGuia.split("-");
                sGuia.pop()
                sGuia = sGuia.join("-");

                var sPRODUCTO_MAT_PRIMA = oModel.getData().list.find(e => e.GUIA == sGuia).PRODUCTO_MAT_PRIMA;
            } catch (error) {
                MensajesObject._MensajeError("Ocurrió un error al recuperar el producto");
                return;
            }
            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin
            var oJson = {
                "FECHA_COSECHA": oFormatDate(oModel.getProperty("/FCH_COSECHA")),
                "GR_IMP": oModel.getProperty("/GRUPO_IMPRESORAS"),
                "EMPRESA_AGRICOLA": oModel.getProperty("/PARTNER"),
                "MODULO": oModel.getProperty("/MODULO"),
                "CONSIGNATARIO": oModel.getProperty("/CONSIGNATARIO"),
                "PRODUCTO": oModel.getProperty("/PRODUCTO"),
                "PRODUCTO_DESC": oModel.getProperty("/DESCRIP_PRODUCTO"),
                "FECHA_RECEPCION": oFormatDate(oModel.getProperty("/FCH_RECEPCION")),
                "GUIA": sGuia, //oModel.getProperty("/GUIA"),
                "LINEA": oModel.getProperty("/LINEA"),
                "CANTIDAD": oModel.getProperty("/CANTIDAD"),
                "MAX_PALETA": oModel.getProperty("/MAXPALETA"),
                "COMENTARIO": oModel.getProperty("/COMENTARIO"),
                "LOTE": oModel.getProperty("/LOTE"),
                "PRODUCTO_MAT_PRIMA": sPRODUCTO_MAT_PRIMA,
                //DG - Inicio
                "WERKS": sCentro
                //DG - Fin
            }

            var sUrl = "/RegistrarPalletSet";
            var oDontCheckSuccessExistError = false;

            var oResponse = await this._Post(sUrl, oJson, oDontCheckSuccessExistError);

            if (oResponse) {
                var oTable = oView.byId("idPaletTableNuevo");
                oTable.destroyItems();
                oTable.getBinding("items").refresh();
                this.onCerrarFragmento("PreRegistrarPalet");
                delete this._NombreFragmento;
                this.cargarDatos();
            }
        },

        onAbrirModalRehabilitar: function (oEvent) {
            var sNombreFragmento = "RehabilitarPallet";
            this._NombreFragmento = sNombreFragmento;

            this._ListaGuiaRehabilitar = [];

            this.onAbrirFragmento(sNombreFragmento);

            const fRemoverPadding = (function (oFormId, oPaddingTop = "7px") {
                $(`#${oFormId}`).css("padding-bottom", "0px");
                $(`#${oFormId}`).css("padding-top", oPaddingTop);
            });

            fRemoverPadding("form_uno_rehabilitar_palet", "0px");

            var oFechaHoy = new Date();
            var oDia = oFechaHoy.getDate();
            var oSum = oDia - 2;
            var oFechaSinFormato = oFechaHoy.setDate(oSum);
            var oFecha = new Date(oFechaSinFormato);
            oFecha = oFecha.toISOString();
            oFecha = oFecha.split("T").shift();
            oFecha = oFecha.split("-").reverse().join("-");

            var oSelectFecha = sap.ui.getCore().byId("select-rehabilitar_fecha");
            oSelectFecha.setValue(oFecha);
            oSelectFecha.fireChange();
        },

        onCambioFechaRehabilitacion: async function (oEvent) {
            var oCore = sap.ui.getCore();
            var oSource = oEvent.getSource();
            var sDate = oSource.getValue();

            oSource.setValueState("None");

            var oSelectEmpresaAgricola = oCore.byId("select-rehabilitar_empresa_agricola");
            var oSelectModulo = oCore.byId("select-rehabilitar_modulo");

            oSelectEmpresaAgricola.destroyItems();
            oSelectEmpresaAgricola.setValueState("None");
            oSelectEmpresaAgricola.setEnabled(false);

            oSelectModulo.destroyItems();
            oSelectModulo.setValueState("None");
            oSelectModulo.setEnabled(false);

            if (!sDate) {
                return;
            }

            var sFormatDate = sDate.split("-").reverse().join("");

            var sUrl = "/EmpresaAgricolaSet";

            var oFiltros = new Array(
                new sap.ui.model.Filter("FECHA_COSECHA", sap.ui.model.FilterOperator.EQ, sFormatDate)
            );

            oSelectEmpresaAgricola.setBusy(true);

            var oResponse = await this._Read(sUrl, oFiltros);

            oSelectEmpresaAgricola.setBusy(false);

            if (!oResponse || oResponse.length == 0) {
                var oMensaje = "No se encontraron empresas con la fecha ingresada";
                await MensajesObject._MensajeAdvertencia(oMensaje);
                return;
            }

            // var oResponse = new Array({ "EMPRESA_AGRICOLA": "101010" }, { "EMPRESA_AGRICOLA": "202020" });

            var oNewModel = new JSONModel(oResponse);
            oSelectEmpresaAgricola.setModel(oNewModel, "mListaEmpresas");
            oSelectEmpresaAgricola.setEnabled(true);

            //BEGIN - DGOMEZ - 17.03.2021 - 8000019190, Filtro Módulo en Rehabilitar Guías
            //if (oResponse.length == 2) {
            if (oResponse.length >= 1) {
                //END   - DGOMEZ - 17.03.2021 - 8000019190, Filtro Módulo en Rehabilitar Guías
                var oItems = oSelectEmpresaAgricola.getItems();
                //BEGIN - DGOMEZ - 17.03.2021 - 8000019190, Filtro Módulo en Rehabilitar Guías
                //var oFirstItem = oItems[1];
                var oFirstItem = oItems[0];
                //END   - DGOMEZ - 17.03.2021 - 8000019190, Filtro Módulo en Rehabilitar Guías
                oSelectEmpresaAgricola.setSelectedItem(oFirstItem);
                oSelectEmpresaAgricola.fireChange(oFirstItem);
            }
        },

        onCambioEmpresaRehabilitacion: async function (oEvent) {
            var oCore = sap.ui.getCore();
            var oSource = oEvent.getSource();
            var sSelectedKey = oSource.getSelectedKey();
            var sEmpresaAgricola = sSelectedKey.split("-")[0].trim();

            oSource.setValueState("None");

            var oSelectFecha = oCore.byId("select-rehabilitar_fecha");
            var oSelectModulo = oCore.byId("select-rehabilitar_modulo");

            oSelectModulo.destroyItems();
            oSelectModulo.setValueState("None");
            oSelectModulo.setEnabled(false);

            var sDate = oSelectFecha.getValue();
            var sFormatDate = sDate.split("-").reverse().join("");

            var sUrl = "/ModulosSet";

            var oFiltros = new Array(
                new sap.ui.model.Filter("FECHA_COSECHA", sap.ui.model.FilterOperator.EQ, sFormatDate),
                new sap.ui.model.Filter("PARTNER", sap.ui.model.FilterOperator.EQ, sEmpresaAgricola)
            );

            oSelectModulo.setBusy(true);

            var oResponse = await this._Read(sUrl, oFiltros);

            oSelectModulo.setBusy(false);

            if (!oResponse || oResponse.length == 0) {
                var oMensaje = "No se encontraron modulos para la empresa seleccionada";
                await MensajesObject._MensajeAdvertencia(oMensaje);
                return;
            }

            // var oResponse = new Array({ "MODULO": "101010" }, { "MODULO": "202020" });

            var oNewModel = new JSONModel(oResponse);
            oSelectModulo.setModel(oNewModel, "mListaModulos");
            oSelectModulo.setEnabled(true);

            if (oResponse.length == 1) {
                var oItems = oSelectModulo.getItems();
                var oFirstItem = oItems[0];
                oSelectModulo.setSelectedItem(oFirstItem);
                oSelectModulo.fireChange(oFirstItem);
            }
        },

        onCambioModuloRehabilitacion: function (oEvent) {
            var oCore = sap.ui.getCore();
            var oSource = oEvent.getSource();

            oSource.setValueState("None");
        },

        _EnsureSelectDontEmpty: function (oSelect) {
            try {
                var oSelectedItem = oSelect.getSelectedKey();
            } catch (e) {
                var oSelectedItem = oSelect.getValue();
            }

            if (!oSelectedItem) {
                oSelect.setValueState("Error");
                throw true;
            } else {
                oSelect.setValueState("None");
            }
        },

        onBuscarGuiasRehabilitar: async function () {
            var oCore = sap.ui.getCore();
            var oTable = oCore.byId("table-lista_guias_rehabilitar");
            var oSelectFecha = oCore.byId("select-rehabilitar_fecha");
            var oSelectEmpresaAgricola = oCore.byId("select-rehabilitar_empresa_agricola");
            var oSelectModulo = oCore.byId("select-rehabilitar_modulo");

            try {
                await this._EnsureSelectDontEmpty(oSelectFecha);
                await this._EnsureSelectDontEmpty(oSelectEmpresaAgricola);
                await this._EnsureSelectDontEmpty(oSelectModulo);
            } catch (e) {
                return;
            }

            var sDate = oSelectFecha.getValue();
            var sFormatDate = sDate.split("-").reverse().join("");
            
            //SCH-Inicio-Actualiza envío de filtro por nueva version de odata
            
            //var sEmpresaAgricola = oSelectEmpresaAgricola.getSelectedKey();
            //var sModulo = oSelectModulo.getSelectedKey();
            
            var sEmpresaAgricola = oSelectEmpresaAgricola.getSelectedKey().substring(0, 10);
            var sModulo = oSelectModulo.getSelectedKey().substring(0, 3);
            
           //SCH-Fin-Actualiza envío de filtro por nueva version de odata

            var oFiltros = new Array(
                new sap.ui.model.Filter("FECHA_COSECHA", sap.ui.model.FilterOperator.EQ, sFormatDate),
                new sap.ui.model.Filter("PARTNER", sap.ui.model.FilterOperator.EQ, sEmpresaAgricola),
                new sap.ui.model.Filter("MODULO", sap.ui.model.FilterOperator.EQ, sModulo)
            );

            var sUrl = "/GuiasRehabilitarSet";

            oTable.setBusy(true);
            var oResponse = await this._Read(sUrl, oFiltros);
            oTable.setBusy(false);

            if (!oResponse || oResponse.length == 0) {
                var oMensaje = "No se encontraron guias";
                await MensajesObject._MensajeAdvertencia(oMensaje);
                return;
            }

            //BEGIN - DGOMEZ - 24.04.2021 - 8000019190, Filtro Módulo en Rehabilitar Guías
            //var oModel = new JSONModel(oResponse);
            var oModel = new JSONModel(this.agruparGuiasRehabilitar(oResponse));
            //END   - DGOMEZ - 24.04.2021 - 8000019190, Filtro Módulo en Rehabilitar Guías

            oTable.setModel(oModel, "mListaGuias");
        },

        //BEGIN - DGOMEZ - 24.04.2021 - 8000019190, Filtro Módulo en Rehabilitar Guías
        agruparGuiasRehabilitar: function (oResponseGuias) {
            this._GuiasTotales = oResponseGuias;
            var aUnicos = [];
            var aDistintos = [];
            for (let i = 0; i < oResponseGuias.length; i++) {
                if (!aUnicos[oResponseGuias[i].GUIA]) {
                    aDistintos.push(oResponseGuias[i]);
                    aUnicos[oResponseGuias[i].GUIA] = 1;
                }
            }
            return aDistintos;
        },
        //END   - DGOMEZ - 24.04.2021 - 8000019190, Filtro Módulo en Rehabilitar Guías

        onSeleccionarGuiaRehabilitar: function (oEvent) {
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext("mListaGuias");
            var oPath = oContext.getPath();
            this.agregarPathGuia(oPath);
        },

        agregarPathGuia: function (oPathRehabilitar) {
            var oIndex = this._ListaGuiaRehabilitar.findIndex(path => path == oPathRehabilitar);
            if (oIndex < 0) {
                this._ListaGuiaRehabilitar.push(oPathRehabilitar);
            } else {
                this._ListaGuiaRehabilitar.splice(oIndex, 1);
            }
        },

        onRehabilitarGuiasSeleccionadas: async function () {
            var oListaPaths = this._ListaGuiaRehabilitar;

            if (oListaPaths.length == 0 || !oListaPaths) {
                MensajesObject._MensajeError("Seleccione al menos una guía.");
                return;
            }

            var oRehabilitar = await MensajesObject._MensajeConfirmacion(
                "Está seguro que desea re-habilitar las guias seleccionadas?",
                "confirm"
            );

            if (!oRehabilitar) return;

            var oView = this.getView();
            var oTable = sap.ui.getCore().byId("table-lista_guias_rehabilitar");
            var oModel = oTable.getModel("mListaGuias");

            var oJson = {
                "VBELN": "",
                "MJAHR": "",
                "WERKS": "",
                "POS": "",
                "N_ACCION": [{
                    "ACCION": "R"
                }],
                "N_ACTUALIZARGUIAS": []
            }

            oListaPaths.forEach(path => {
                var oElement = oModel.getProperty(path);

                //BEGIN - DGOMEZ - 24.04.2021 - 8000019190, Filtro Módulo en Rehabilitar Guías
                this._GuiasTotales.forEach(Guia => {
                    if (Guia.GUIA === oElement.GUIA) {
                        var obj = {
                            "VBELN": Guia.VBELN,
                            "MJAHR": Guia.MJAHR,
                            "WERKS": Guia.WERKS,
                            "POS": Guia.POS
                        }

                        oJson.N_ACTUALIZARGUIAS.push(obj);
                    }
                });
                var obj = {
                    "VBELN": oElement.VBELN,
                    "MJAHR": oElement.MJAHR,
                    "WERKS": oElement.WERKS,
                    "POS": oElement.POS
                }
                //var obj = {
                //    "VBELN": oElement.VBELN,
                //    "MJAHR": oElement.MJAHR,
                //    "WERKS": oElement.WERKS,
                //    "POS": oElement.POS
                //}
                //
                //oJson.N_ACTUALIZARGUIAS.push(obj);
                //END   - DGOMEZ - 24.04.2021 - 8000019190, Filtro Módulo en Rehabilitar Guías
            });

            var sUrl = "/ActualizarGuiasSet";

            var oResponse = await this._Post(sUrl, oJson);

            if (!oResponse) return;

            var sNombreFragmento = "RehabilitarPallet";
            this.onCerrarFragmento(sNombreFragmento);
            delete this._NombreFragmento;
            this._ListaGuiaRehabilitar = [];
        },

        onSeleccionarProductoQuitar: function (oEvent) {
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext("mListaAgrupada");
            var sPath = oContext.getPath();

            var oIndex = this._ListaPathsProductosQuitar.findIndex(path => path == sPath);
            if (oIndex < 0) {
                this._ListaPathsProductosQuitar.push(sPath);
            } else {
                this._ListaPathsProductosQuitar.splice(oIndex, 1);
            }
        },

        onEliminarProductosSeleccionados: async function () {
            var oListaPaths = this._ListaPathsProductosQuitar;

            if (oListaPaths.length == 0) {
                MensajesObject._MensajeError("Seleccione al menos un producto.");
                return;
            }

            var oQuitar = await MensajesObject._MensajeConfirmacion("Está seguro que desea quitar los módulos seleccionados?");

            if (!oQuitar) return false;

            var oView = this.getView();
            var oTable = oView.byId("idPaletTableNuevo");
            var oModel = oView.getModel("mListaAgrupada");

            var oJson = {
                "VBELN": "",
                "MJAHR": "",
                "WERKS": "",
                "POS": "",
                "N_ACCION": [{
                    "ACCION": "E"
                }],
                "N_ACTUALIZARGUIAS": []
            }

            oListaPaths.forEach((path, index) => {
                var oElement = oModel.getProperty(path);
                oElement.list.forEach(e => {
                    var obj = {
                        "VBELN": e.VBELN,
                        "MJAHR": e.MJAHR,
                        "WERKS": e.WERKS,
                        "POS": e.POS
                    }

                    oJson.N_ACTUALIZARGUIAS.push(obj);
                });
            });

            var sUrl = "/ActualizarGuiasSet";

            var oResponse = await this._Post(sUrl, oJson);

            if (!oResponse) {
                return;
            }

            oModel.setData([]);
            oModel.refresh(true);
            oTable.destroyItems();
            this.cargarDatos();

            this._ListaPathsProductosQuitar = [];
        },

        /** ---------------------------------------------------
         * TRATAMIENTO EN FRIO
         */

        scope: {
            inptTratamientoFrio: {},
            MCTratamientoFrio: []
        },

        onAbrirTratamientoFrio: function (oEvent) {
            this.scope.inptTratamientoFrio = {};
            this.scope.MCTratamientoFrio = [];
            this.getView().setModel(new sap.ui.model.json.JSONModel(this.scope), "scope");

            var sNombreFragmento = "TratamientoFrio";
            this._NombreFragmento = sNombreFragmento;
            this.onAbrirFragmento(sNombreFragmento);

            var oFecha = new Date();
            oFecha = oFecha.toISOString();
            oFecha = oFecha.split("T").shift();
            oFecha = oFecha.split("-").join("");

            this.scope.inptTratamientoFrio.fechaRecepcion = oFecha;
            this.getView().setModel(new sap.ui.model.json.JSONModel(this.scope), "scope");

            //INI TKT 8000018858
            var oView = this.getView();
            var oModelImp = oView.getModel("mPreRegistro");
            oModelImp.setProperty("/GRUPO_IMPRESORAS", "")
            //FIN TKT 8000018858
        },

        onAbrirMCTratamientoFrio: async function (oEvent, fragment) {
            var sNombreFragmento = fragment;
            this._NombreFragmentoAyudaSeleccionado = sNombreFragmento;

            var othat = this;
            var oSource = oEvent.getSource();
            var oParent = oSource.getParent();
            var oFields = oParent.getFields();
            var oInput = oFields[0];
            let sSetCall = "";
            let oFiltros = [];
            //obtención de los datos de servicios dependiendo del MC que se abrirá
            switch (sNombreFragmento) {
                case 'MCEmpresaAgricola':
                    /*
                    sSetCall = "/EmpresaAgricolaTratFrioSet";
                    oFiltros.push(new sap.ui.model.Filter("I_FECHA_RECEPCION", sap.ui.model.FilterOperator.EQ, this.scope.inptTratamientoFrio.fechaRecepcion));
                    */
                    sSetCall = "/GETSet('CPSEM-" + this.scope.inptTratamientoFrio.fechaRecepcion + "----------')/$value";
                    var oDataFrio = await this._ReadTratamientoFrio(sSetCall);
                    this.scope.MCTratamientoFrio = oDataFrio.getData().ITAB;
                    break;
                case 'MCModulo':
                    /*
                    sSetCall = "/ModulosSet";
                    oFiltros.push(new sap.ui.model.Filter("I_FECHA_RECEPCION", sap.ui.model.FilterOperator.EQ, this.scope.inptTratamientoFrio.fechaRecepcion));
                    oFiltros.push(new sap.ui.model.Filter("I_EMPRESA", sap.ui.model.FilterOperator.EQ, this.scope.inptTratamientoFrio.empresaAgricola.split("-").shift().trim()));
                    */
                    sSetCall = "/GETSet('CPSMO-" + this.scope.inptTratamientoFrio.fechaRecepcion + "-------" + this.scope.inptTratamientoFrio.empresaAgricola.split("-").shift().trim() + "---')/$value";
                    var oDataFrio = await this._ReadTratamientoFrio(sSetCall);
                    this.scope.MCTratamientoFrio = oDataFrio.getData().ITAB;
                    break;
                case 'MCCliente':
                    //sSetCall = "/ClienteTratFrioSet";
                    sSetCall = "/GETSet('CPHCL----')/$value";
                    var oDataFrio = await this._ReadTratamientoFrio(sSetCall);
                    this.scope.MCTratamientoFrio = oDataFrio.getData().ITAB;
                    break;
                case 'MCProducto':
                    //sSetCall = "/ProductosSet";
                    sSetCall = "/GETSet('CPHPR--1401----------')/$value";
                    var oDataFrio = await this._ReadTratamientoFrio(sSetCall);
                    this.scope.MCTratamientoFrio = oDataFrio.getData().ITAB;
                    break;
                case 'MCViaje':
                    /*
                    sSetCall = "/ViajesSet";
                    oFiltros.push(new sap.ui.model.Filter("I_CLIENTE", sap.ui.model.FilterOperator.EQ, this.scope.inptTratamientoFrio.cliente.split("-").shift().trim()));
                    oFiltros.push(new sap.ui.model.Filter("I_PRODUCTO", sap.ui.model.FilterOperator.EQ, this.scope.inptTratamientoFrio.producto.split("-").shift().trim()));
                    */
                    sSetCall = "/GETSet('CPSVI-" + this.scope.inptTratamientoFrio.fechaRecepcion + "---" + this.scope.inptTratamientoFrio.modulo.split("-").shift().trim() + "----" + this.scope.inptTratamientoFrio.empresaAgricola.split("-").shift().trim() + "-" + this.scope.inptTratamientoFrio.cliente.split("-").shift().trim() + "-" + this.scope.inptTratamientoFrio.producto.split("-").shift().trim() + "')/$value";
                    var oDataFrio = await this._ReadTratamientoFrio(sSetCall);
                    this.scope.MCTratamientoFrio = oDataFrio.getData().ITAB;
                    break;
                case 'MCGuia':
                    /*
                    sSetCall = "/GuiasSet";
                    oFiltros.push(new sap.ui.model.Filter("I_FECHA_RECEPCION", sap.ui.model.FilterOperator.EQ, this.scope.inptTratamientoFrio.fechaRecepcion));
                    oFiltros.push(new sap.ui.model.Filter("I_EQV_FM", sap.ui.model.FilterOperator.EQ, this.scope.inptTratamientoFrio.modulo.split("-").shift().trim()));
                    oFiltros.push(new sap.ui.model.Filter("I_EMPRESA", sap.ui.model.FilterOperator.EQ, this.scope.inptTratamientoFrio.empresaAgricola.split("-").shift().trim()));
                    oFiltros.push(new sap.ui.model.Filter("I_PRODUCTO", sap.ui.model.FilterOperator.EQ, this.scope.inptTratamientoFrio.producto.split("-").shift().trim()));
                    */
                    sSetCall = "/GETSet('CPSGR-" + this.scope.inptTratamientoFrio.fechaRecepcion + "---" + this.scope.inptTratamientoFrio.modulo.split("-").shift().trim() + "----" + this.scope.inptTratamientoFrio.empresaAgricola.split("-").shift().trim() + "-" + this.scope.inptTratamientoFrio.cliente.split("-").shift().trim() + "-" + this.scope.inptTratamientoFrio.producto.split("-").shift().trim() + "')/$value";
                    var oDataFrio = await this._ReadTratamientoFrio(sSetCall);
                    this.scope.MCTratamientoFrio = oDataFrio.getData().ITAB;
                    break;
            }
            /*
            if (sSetCall != "") {
                sap.ui.core.BusyIndicator.show(0);
                this.scope.MCTratamientoFrio = await this._Read(sSetCall, oFiltros, 'ZPPGW_FIORI_GUIA');
                if (!this.scope.MCTratamientoFrio) this.scope.MCTratamientoFrio = [];
                sap.ui.core.BusyIndicator.hide();
            }
            */
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");

            this._InputSeleccionadoMatchcode = oInput;
            this.onAbrirFragmento(sNombreFragmento);
        },

        onSelectMCTratamientoFrio: async function (oEvent) {
            var oItem = oEvent.getParameter("selectedItem");
            var oSelected = oItem.getTitle();
            var oDescrip = oItem.getDescription();
            let data = oItem.getBindingContext("scope").getObject();

            if (oSelected.split("-").shift().trim() == "") {
                var sNombreFragmentoCerrar = this._NombreFragmentoAyudaSeleccionado;
                delete this._NombreFragmentoAyudaSeleccionado;
                this.onCerrarFragmento(sNombreFragmentoCerrar);
                return false;
            }

            if (this._InputSeleccionadoMatchcode) {
                this._InputSeleccionadoMatchcode.setValueState("None");
                this._InputSeleccionadoMatchcode.setValue(oSelected);
                this._InputSeleccionadoMatchcode.setName(oDescrip);
            }

            //acciones especiales dependiendo del MC
            switch (this._NombreFragmentoAyudaSeleccionado) {
                case 'MCEmpresaAgricola':
                    this.scope.inptTratamientoFrio.modulo = "";
                    this.scope.inptTratamientoFrio.viaje = "";
                    this.scope.inptTratamientoFrio.guia = "";
                    this.scope.inptTratamientoFrio.fechaCosecha = "";
                    break;
                case 'MCModulo':
                    this.scope.inptTratamientoFrio.viaje = "";
                    this.scope.inptTratamientoFrio.guia = "";
                    this.scope.inptTratamientoFrio.fechaCosecha = "";
                    break;
                case 'MCCliente':
                    this.scope.inptTratamientoFrio.viaje = "";
                    this.scope.inptTratamientoFrio.guia = "";
                    this.scope.inptTratamientoFrio.fechaCosecha = "";
                    break;
                case 'MCProducto':
                    this.scope.inptTratamientoFrio.descripcionProducto = data.MAKTX;
                    this.scope.inptTratamientoFrio.maxPaleta = parseInt(data.UMREZ);
                    this.scope.inptTratamientoFrio.cantidad = "";
                    this.scope.inptTratamientoFrio.viaje = "";
                    this.scope.inptTratamientoFrio.guia = "";
                    this.scope.inptTratamientoFrio.fechaCosecha = "";
                    break;
                case 'MCViaje':
                    break;
                case 'MCGuia':
                    this.scope.inptTratamientoFrio.fechaCosecha = data.FECCOS;
                    break;
            }

            if (this.isSetNoEmpty(this.scope.inptTratamientoFrio.fechaRecepcion) &&
                this.isSetNoEmpty(this.scope.inptTratamientoFrio.modulo) &&
                this.isSetNoEmpty(this.scope.inptTratamientoFrio.empresaAgricola) &&
                this.isSetNoEmpty(this.scope.inptTratamientoFrio.cliente) &&
                this.isSetNoEmpty(this.scope.inptTratamientoFrio.producto) &&
                this._NombreFragmentoAyudaSeleccionado != 'MCViaje' &&
                this._NombreFragmentoAyudaSeleccionado != 'MCGuia'
            ) {
                let sSetCall = "/GETSet('CPSGV-" + this.scope.inptTratamientoFrio.fechaRecepcion + "---" + this.scope.inptTratamientoFrio.modulo.split("-").shift().trim() + "----" + this.scope.inptTratamientoFrio.empresaAgricola.split("-").shift().trim() + "-" + this.scope.inptTratamientoFrio.cliente.split("-").shift().trim() + "-" + this.scope.inptTratamientoFrio.producto.split("-").shift().trim() + "-')/$value";
                var oDataFrio = await this._ReadTratamientoFrio(sSetCall);
                let dataResponse = oDataFrio.getData().ITAB[0];
                if (this.isSetNoEmpty(dataResponse.GUIAS) && this.isSetNoEmpty(dataResponse.GUIAS[0])) {
                    this.scope.inptTratamientoFrio.fechaCosecha = dataResponse.GUIAS[0].FECCOS;
                    this.scope.inptTratamientoFrio.guia = dataResponse.GUIAS[0].GUIA;

                }
                if (this.isSetNoEmpty(dataResponse.VIAJES) && this.isSetNoEmpty(dataResponse.VIAJES[0])) {
                    this.scope.inptTratamientoFrio.viaje = dataResponse.VIAJES[0].VIAJE + "-" + dataResponse.VIAJES[0].PEDIDO;

                }
            }

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");

            var sNombreFragmentoCerrar = this._NombreFragmentoAyudaSeleccionado;
            delete this._NombreFragmentoAyudaSeleccionado;
            this.onCerrarFragmento(sNombreFragmentoCerrar);
        },

        isSetNoEmpty: function (valor) {
            if (valor == undefined) { return false; } else if (valor == null) { return false; } else if (valor == "") { return false; }
            return true;
        },

        _ReadTratamientoFrio: function (oUrl) {
            sap.ui.core.BusyIndicator.show(0);
            var oView = this.getView();
            var oBusyModel = oView.getModel("mBusy");
            oBusyModel.setProperty("/iniciar", true);
            return new Promise(resolve => {
                let oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV" + oUrl);
                oModel.attachRequestCompleted(function () {
                    oBusyModel.setProperty("/iniciar", false);
                    resolve(oModel);
                    sap.ui.core.BusyIndicator.hide();
                });
            });
        },

        onChangeDateTratamientoFrio: async function (oEvent) {
            this.scope.inptTratamientoFrio.empresaAgricola = "";
            this.scope.inptTratamientoFrio.modulo = "";
            this.scope.inptTratamientoFrio.viaje = "";
            this.scope.inptTratamientoFrio.guia = "";
            this.scope.inptTratamientoFrio.fechaCosecha = "";
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
        },

        onFilterMCTratamientoFrio: function (oEvent, campos = []) {
            var oSource = oEvent.getSource();
            var sValue = oEvent.getParameter("value");
            var oBinding = oSource.getBinding("items");

            var oFiltros = [];
            campos.forEach(function (valor, indice, array) {
                oFiltros.push(new sap.ui.model.Filter(valor, sap.ui.model.FilterOperator.Contains, sValue));
            });

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

        onDependMaxPaleta: function (oEvent) {
            var oSource = oEvent.getSource();
            var sValue = oSource.getValue();
            var numberPattern = /\d+/g;
            if (!sValue.match(numberPattern)) {
                oSource.setValue('');
                this.getView().setModel(new sap.ui.model.json.JSONModel(this.scope), "scope");
                return;
            }
            var iFormatValue = parseInt(sValue.match(numberPattern).join(""));
            let iMaxPaleta = (isNaN(parseInt(this.scope.inptTratamientoFrio.maxPaleta))) ? 0 : parseInt(this.scope.inptTratamientoFrio.maxPaleta);
            if (iFormatValue < 0 || iFormatValue > iMaxPaleta) {
                sap.m.MessageToast.show("La cantidad no puede superar el Máximo de cajas de la Paleta.");
                iFormatValue = "";
            }
            oSource.setValue(iFormatValue);
            this.getView().setModel(new sap.ui.model.json.JSONModel(this.scope), "scope");
        },

        onGuardarTratamientoFrio: async function () {
            var oView = this.getView();
            var oBusyModel = oView.getModel("mBusy");
            oBusyModel.setProperty("/iniciarPost", true);
            const othat = this;
            //INI TKT 8000018858
            var oModelImp = oView.getModel("mPreRegistro");
            var grupoImpr = oModelImp.getProperty("/GRUPO_IMPRESORAS");
            if (grupoImpr == undefined || grupoImpr == "") {
                oBusyModel.setProperty("/iniciarPost", false);
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageToast.show("Debe seleccionar Grupo de impresora.");
                return false;
            }
            //FIN TKT 8000018858
            const ano = this.scope.inptTratamientoFrio.fechaRecepcion.substr(0, 4);
            const mes = this.scope.inptTratamientoFrio.fechaRecepcion.substr(4, 2);
            const dia = this.scope.inptTratamientoFrio.fechaRecepcion.substr(6, 2);
            let data = [{
                "COMENT": this.scope.inptTratamientoFrio.comentario,
                "PARAM": "CP-----",
                "VECTOR": [],
                "PALETA": [{
                    "GUIA": this.scope.inptTratamientoFrio.guia,
                    "FEC_COS": this.scope.inptTratamientoFrio.fechaCosecha,
                    "FEC_REC": dia + "." + mes + "." + ano,
                    "PARTNER": this.scope.inptTratamientoFrio.empresaAgricola.split("-").shift().trim(),
                    "TXT_EMP": "",
                    "MODULO": this.scope.inptTratamientoFrio.modulo.split("-").shift().trim(),
                    "PALLETS": String(this.scope.inptTratamientoFrio.maxPaleta),
                    "CANT": this.scope.inptTratamientoFrio.cantidad,
                    "KUNNR": this.scope.inptTratamientoFrio.cliente.split("-").shift().trim(),
                    "VIAJE": this.scope.inptTratamientoFrio.viaje.split("-").shift().trim(),
                    "PEDIDO": this.scope.inptTratamientoFrio.viaje.split("-")[1].trim(),
                    "MATNR": this.scope.inptTratamientoFrio.producto.split("-").shift().trim(),
                    "IMP_PT": "",
                    "CODSKY": grupoImpr.split("-").shift().trim(),//"", //TKT 8000018858
                    "LINEA": "X"
                }]
            }];

            var sOData = this.getView().getModel("ZPPGW_FIORI_GUIA");
            sap.ui.core.BusyIndicator.show(0);
            sOData.create("/GETSet", data, {
                success: async function (oResponse, oHeader) {
                    oBusyModel.setProperty("/iniciarPost", false);
                    sap.ui.core.BusyIndicator.hide();

                    if (othat.isSetNoEmpty(oResponse.ID)) {
                        let resID = oResponse.ID.split("-");
                        let dialogContent = new sap.ui.layout.VerticalLayout({
                            content: [
                                new sap.m.Text({
                                    text: 'Se creó correctamente la paleta de tratamiento frío.',
                                    width: '100%'
                                }),
                                new sap.ui.layout.HorizontalLayout({
                                    content: [
                                        new sap.ui.layout.VerticalLayout({
                                            width: '120px',
                                            content: [
                                                new sap.m.Label({
                                                    text: 'HU: ',
                                                    design: 'Bold'
                                                }),
                                                new sap.m.Label({
                                                    text: 'Pedido:',
                                                    design: 'Bold'
                                                }),
                                                new sap.m.Label({
                                                    text: 'Cliente: ',
                                                    design: 'Bold'
                                                }),
                                                //INI TKT 8000018858                                                
                                                new sap.m.Label({
                                                    text: 'Pallet: ',
                                                    design: 'Bold'
                                                })
                                                //FIN TKT 8000018858
                                            ]
                                        }),
                                        new sap.ui.layout.VerticalLayout({
                                            content: [
                                                new sap.m.Label({
                                                    text: resID[0]
                                                }),
                                                new sap.m.Label({
                                                    text: resID[1]
                                                }),
                                                new sap.m.Label({
                                                    text: resID[2]
                                                }),
                                                //INI TKT 8000018858
                                                new sap.m.Label({
                                                    text: resID[3]
                                                })
                                                //FIN TKT 8000018858
                                            ]
                                        })
                                    ]
                                })
                            ]
                        });
                        let dialog = new sap.m.Dialog({
                            title: 'Guardado',
                            type: 'Message',
                            state: 'Success',
                            content: dialogContent,
                            beginButton: new sap.m.Button({
                                text: 'Aceptar',
                                type: 'Emphasized',
                                press: function () {
                                    dialog.close();
                                }
                            }),
                            afterClose: function () {
                                dialog.destroy();
                                othat.onCerrarFragmento('TratamientoFrio');
                                othat.cargarDatos();
                            }
                        });
                        dialog.open();
                    } else {
                        MensajesObject._MensajeError("No se creó correctamente la paleta de tratamiento frío")
                    }

                },
                error: function (oError, oHeader) {
                    oBusyModel.setProperty("/iniciarPost", false);
                    sap.ui.core.BusyIndicator.hide();
                    console.log("oError");
                    console.log(oError);
                    MensajesObject._MensajeError("No se creó correctamente la paleta de tratamiento frío")
                }
            });
        }

    });
});