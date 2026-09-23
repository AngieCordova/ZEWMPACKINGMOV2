sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject",
    "sap/m/MessageToast"
], function(Controller, formatter, JSONModel, MensajesObject, MessageToast) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.trasladarHuRMP.controller.Index", {

        formatter: formatter,
        dataBus: {},
        _Fragmento: false,
        _FragmentoAyuda: new Object(),

        onAfterRendering: function() {},

        onInit: async function() {
            // Se crea la suscripción al canal
            var oView = this.getView();
            var bus = sap.ui.getCore().getEventBus();
            await bus.subscribe("splitApp", "TrasladarHURMPView", this._busSuscribe, this);

            try {
                var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0022_SRV");
                oView.setModel(oData, "ZEWM_0022");
            } catch (error) {
                MensajesObject._MensajeError("Ocurrio un error al cargar el odata");
            }

            oView.setModel(new JSONModel([]), "mListaEscaneados");

            var oConfigCampos = {
                "HabilitarInputEscaneo": false
            }

            oView.setModel(new JSONModel(oConfigCampos), "mCampos");

            var oInputsObjects = {
                "almacen_origen": new Object(),
                "almacen_destino": new Object()
            }

            oView.setModel(new JSONModel(oConfigCampos), "mInputs");

            this.onAbrirModalTrasladoHU();
        },

        /**
         * @param {String} sUrl 
         * @param {Array} aFilters 
         */
        _Read: async function(sUrl = "", aFilters = []) {
            var oView = this.getView();
            var oDataService = oView.getModel("ZEWM_0022");
            return new Promise(resolve => {
                oDataService.read(sUrl, {
                    filters: aFilters,
                    "success": function(response, header) {
                        resolve(response);
                    },
                    "error": function(response) {
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

        onAbrirModalTrasladoHU: async function() {
            var oView = this.getView();
            var sNombre = "ModalTrasladoHus";
            var sFragmentPath = "AvocadoProyecto.AvocadoProyecto.modules.trasladarHuRMP.fragments." + sNombre;

            var fragmento_no_creado = this._Fragmento ? false : true;

            if (fragmento_no_creado) {
                try {
                    this._Fragmento = sap.ui.xmlfragment(sFragmentPath, this);
                    oView.addDependent(this._Fragmento);
                } catch (e) {
                    debugger
                    //mensaje error
                    return;
                }
            }

            this._Fragmento.open();
        },

        onAbrirAyudaAlmacenOrigen: async function(oEvent) {
            var sNombreFragmento = "AyudaAlmacenOrigen";
            await this.onAbrirFragmento(sNombreFragmento);

            this._FragmentoAyuda[sNombreFragmento].setBusy(true);

            var sTipo = "O";
            // DG - Inicio            
            // var oFiltros = new Array(
            //     new sap.ui.model.Filter("Tipo", sap.ui.model.FilterOperator.EQ, sTipo)
            // );
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oFiltros = new Array(
                new sap.ui.model.Filter("Tipo", sap.ui.model.FilterOperator.EQ, sTipo),
                new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, sCentro)
            );
            // DG - Fin  
            var sUrl = "/AlmacenSet";

            var oResponse = await this._Read(sUrl, oFiltros);

            var existe_error = oResponse ? false : true;
            if (existe_error) {
                oResponse = [];
            } else {
                oResponse = oResponse.results;
            }

            var oModel = new JSONModel(oResponse);

            this._FragmentoAyuda[sNombreFragmento].setBusy(false);
            this._FragmentoAyuda[sNombreFragmento].setModel(oModel);
        },

        onAbrirAyudaAlmacenDestino: async function(oEvent) {
            var sNombreFragmento = "AyudaAlmacenDestino";
            await this.onAbrirFragmento(sNombreFragmento);

            this._FragmentoAyuda[sNombreFragmento].setBusy(true);

            var sTipo = "D";
            // DG - Inicio            
            // var oFiltros = new Array(
            //     new sap.ui.model.Filter("Tipo", sap.ui.model.FilterOperator.EQ, sTipo)
            // );
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oFiltros = new Array(
                new sap.ui.model.Filter("Tipo", sap.ui.model.FilterOperator.EQ, sTipo),
                new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, sCentro)
            );
            // DG - Fin   
            var sUrl = "/AlmacenSet";

            var oResponse = await this._Read(sUrl, oFiltros);

            var existe_error = oResponse ? false : true;
            if (existe_error) {
                oResponse = [];
            } else {
                oResponse = oResponse.results;
            }

            var oModel = new JSONModel(oResponse);

            this._FragmentoAyuda[sNombreFragmento].setBusy(false);
            this._FragmentoAyuda[sNombreFragmento].setModel(oModel);
        },

        onAbrirFragmento: async function(sNombre) {
            var oView = this.getView();
            var path_fragmento = "AvocadoProyecto.AvocadoProyecto.modules.trasladarHuRMP.fragments." + sNombre;

            if (!this._FragmentoAyuda[sNombre]) {
                try {
                    this._FragmentoAyuda[sNombre] = sap.ui.xmlfragment(path_fragmento, this);
                    oView.addDependent(this._FragmentoAyuda[sNombre]);
                } catch (e) {
                    debugger
                    //mensaje error
                    return;
                }
            }

            this._FragmentoAyuda[sNombre].open();
            return true;
        },

        onCerrarFragmento: function(sNombre) {
            this._FragmentoAyuda[sNombre].destroy();
            delete this._FragmentoAyuda[sNombre];
        },

        /**
         * 
         * @param {Event} oEvent 
         * @param {string} sNombreFragmentoCerrar 
         * @param {Array<{ path: string, campo: string | null}>} aCampos 
         */
        onAgregarValorMatchcode: function(oEvent, sNombreFragmentoCerrar, aCampos = []) {
            var oView = this.getView();
            var oModel = oView.getModel("mInputs");
            var oSelected = oEvent.getParameter("selectedItem");
            var oBinding = oSelected.getBindingContext();
            var object = oBinding.getObject();
            this.onCerrarFragmento(sNombreFragmentoCerrar);

            if (sNombreFragmentoCerrar == "AyudaAlmacenOrigen") {
                var oView = this.getView();
                var oModelCampos = oView.getModel("mCampos");
                oModelCampos.setProperty("/HabilitarInputEscaneo", true);
            }

            aCampos.forEach(campo => {
                var sPath = campo.path;
                var sCampo = campo.campo;
                var agregar_objeto_completo = sCampo ? false : true;
                if (agregar_objeto_completo) sCampo = object;
                oModel.setProperty(sPath, sCampo);
            });
        },

        onFiltrarDatosMatchcode: function(oEvent, oCamposFiltrar = []) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var sValue = oEvent.getParameter("value");

            var oFiltros = new Array();

            oCamposFiltrar.forEach(campo => {
                var filtro = new sap.ui.model.Filter(campo, sap.ui.model.FilterOperator.Contains, sValue);
                oFiltros.push(filtro);
            });

            var oBinding = oSource.getBinding("items");

            oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },

        onComprobarTamanioCajas: function(oNuevaHU) {
            var oView = this.getView();
            var oModel = oView.getModel("mListaEscaneados");
            var oLista = oModel.getData();

            var cant_elementos = oLista.length;
            var es_la_primera_hu = cant_elementos == 0;
            if (es_la_primera_hu) return;

            var oPrimeraHU = oLista[0];
            var tamanio_nueva_hu = Number(oNuevaHU.CantScanHu);
            var tamanio_permitido = Number(oPrimeraHU.CantScanHu);

            if (tamanio_nueva_hu != tamanio_permitido) throw "La HU escaneada supera el máximo permitido";

            if (cant_elementos >= tamanio_permitido) throw "Ya se llego al límite de escaneos";
        },

        onEscanearHU: async function(oEvent) {
            var oView = this.getView();
            if (oEvent) {
                var oSource = oEvent.getSource();
            } else {
                var oSource = sap.ui.getCore().byId("input-escaneo_hu_traslado");
            }
            var oModelInputs = oView.getModel("mInputs");
            var sValue = oSource.getValue();

            var oModel = oView.getModel("mListaEscaneados");
            var lista = oModel.getData();

            var campo_vacio = !sValue ? true : false;
            if (campo_vacio) {
                MensajesObject._MensajeError("Debe ingresar el HU a escanear");
                return;
            }

            var existe_hu_escaneada = lista.find(h => h.Exidv2 == sValue);
            if (existe_hu_escaneada) {
                MensajesObject._MensajeAdvertencia("La HU ingresada ya se encuentra escaneada");
                return;
            }

            // DG - Inicio     
            // var sUrl = `/UnidadManipulacionSet('${sValue}')`;
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var sUrl = `/UnidadManipulacionSet(Exidv='${sValue}',Werks='${sCentro}')`;
            // DG - Fin      

            this._Fragmento.setBusy(true);
            var oResponse = await this._Read(sUrl);
            this._Fragmento.setBusy(false);

            var existe_error = !oResponse ? true : false;
            if (existe_error) {
                MessageToast.show("Sin resultados");
                return;
            }

            try {
                this.onComprobarTamanioCajas(oResponse);
            } catch (error) {
                MensajesObject._MensajeError(error);
                return;
            }

            var sAlmacenOrigen = oModelInputs.getProperty("/almacen_origen/Lgort");
            var sAlmacenHUEscaneada = oResponse.Almacen;

            var no_pertenece_al_almacen = sAlmacenOrigen != sAlmacenHUEscaneada;
            if (no_pertenece_al_almacen) {
                MensajesObject._MensajeAdvertencia("La HU escaneada no pertenece al almacén de origen seleccionado");
                return;
            }

            lista.push(oResponse);
            oModel.setData(lista);
            oModel.refresh(true);

            oSource.setValue("");
            oSource.focus();
        },

        onQuitarHUEscaneado: function(oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mListaEscaneados");
            var lista = oModel.getData();

            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("mListaEscaneados");
            var sPath = oBinding.getPath();

            var index = sPath.split("/").pop();
            lista.splice(index, 1);

            oModel.setData(lista);
            oModel.refresh(true);
        },

        obtener_json_guardar: function() {
            var oView = this.getView();
            var oModelInputs = oView.getModel("mInputs");
            var oModelLista = oView.getModel("mListaEscaneados");

            var lista_sin_elementos = oModelLista.getData().length == 0;
            if (lista_sin_elementos) throw "Lista de HUs escaneadas vacía";

            var sAlmacenOrigen = oModelInputs.getProperty("/almacen_origen/Lgort");
            var sin_almacen_origen = sAlmacenOrigen ? false : true;
            if (sin_almacen_origen) throw "Debe seleccionar el almacén de origen";

            var sAlmacenDestino = oModelInputs.getProperty("/almacen_destino/Lgort");
            var sin_almacen_destino = sAlmacenDestino ? false : true;
            if (sin_almacen_destino) throw "Debe seleccionar el almacén de destino";

            var sFecha = oModelInputs.getProperty("/fecha");
            var sin_fecha = sFecha ? false : true;
            if (sin_fecha) throw "Debe seleccionar la fecha";
            
            //SCH - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //SCH - Fin

            var obj = {
                "IdDeep": "1",
                "AlmacenOrigen": sAlmacenOrigen,
                "AlmacenDestino": sAlmacenDestino,
                "FechaContable": sFecha,
                "Werks": sCentro,
                "AsocTraslado": []
            }

            var lista_escaneados = oModelLista.getData();
            lista_escaneados.forEach(escaneado => {
                var agregar = {
                    "IdDeep": "1",
                    "Exidv": escaneado.Exidv,
                    "Exidv2": escaneado.Exidv2
                }

                obj.AsocTraslado.push(agregar);
            });

            return obj;
        },

        onGuardar: async function() {
            try {
                var json_enviar = this.obtener_json_guardar();
            } catch (error) {
                MensajesObject._MensajeError(error);
                return;
            }

            this._Fragmento.setBusy(true);

            var oView = this.getView();
            var oDataService = oView.getModel("ZEWM_0022");
            var sUrl = "/CabTrasladoSet";
            var oResponse = await new Promise(resolve => {
                oDataService.create(sUrl, json_enviar, {
                    "success": async function(response, header) {
                        var sMessage = "";
                        var sErrorMessage = "";
                        try {
                            var oSuccess = JSON.parse(header.headers["sap-message"]);
                            sMessage = oSuccess.message + "\n";
                            if (oSuccess.details.length > 0) {
                                oSuccess.details.forEach(d => {
                                    if (d.severity == "error") {
                                        sErrorMessage += d.message + "\n";
                                    } else {
                                        sMessage += d.message + "\n";
                                    }
                                });
                            }
                        } catch (e) {
                            sMessage = "Se completo el traslado";
                        }

                        if (sErrorMessage) {
                            await MensajesObject._MensajeError(sErrorMessage);
                            resolve(false);
                        }

                        await MensajesObject._MensajeExito(sMessage);

                        resolve(true);
                    },
                    "error": function(response) {
                        var sMensajeErrorNormal = "Ocurrio un error en el servidor";
                        var sMensajeError = "";
                        try {
                            var oErrorResponse = JSON.parse(response.responseText).error;
                            var sMensajeEstandard = oErrorResponse.message.value;
                            var oListaErrores = oErrorResponse.innererror.errordetails;

                            try {
                                oListaErrores.forEach(err => {
                                    var mensaje = err.message;
                                    if (mensaje.includes("Internal error occurred, contact your system administrator")) return;
                                    sMensajeError += "-" + mensaje + "\n";
                                });
                            } catch (error) {
                                sMensajeError = sMensajeEstandard;
                            }

                        } catch (e) {
                            sMensajeError = sMensajeErrorNormal;
                        }
                        MensajesObject._MensajeError(sMensajeError);
                        resolve(false);
                    }
                });
            });

            this._Fragmento.setBusy(false);

            if (!oResponse) return;

            oView.getModel("mCampos").setProperty("/HabilitarInputEscaneo", false);

            oView.getModel("mListaEscaneados").setData([]);

            oView.getModel("mInputs").setProperty("/almacen_origen", new Object());
            oView.getModel("mInputs").setProperty("/almacen_destino", new Object());

            oView.getModel("mInputs").setProperty("/escaneo_hu", "");
            oView.getModel("mInputs").setProperty("/fecha", "");
        }
    });
});