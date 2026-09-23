sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
], function(MessageBox, Controller, formatter) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.reprocesoPallet.controller.reprocesoPallet", {

        oView: new Object(),
        idMasterDialog: "reprocesoPalletFragment",
        _localFragmento: new Object(),
        _Fragmento: new Object(),
        formatter: formatter,

        initDialog: function(othat) {
            this.oView = othat;
        },

        onCreateMasterDialog: function() {
            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0018_SRV", { "useBatch": false });
            this.oView.getView().setModel(oModelService, "service");

            var oModel = new sap.ui.model.json.JSONModel([]);
            this.oView.getView().setModel(oModel, "mListaNotificar");
        },

        onAfterCloseMasterDialog: function() {
            //se limpia los datos y se destruye el dialog
            this.oView.getView().setModel(null, "service");
            this.oView.getView().setModel(null, "scopeTPR");
            this.oView.getView().setModel(null, "posTPR");
            this.oView.getView().setModel(null, "ReprocesadosIdVIR");
            this.oView.closeSplitDialogRouter(this.idMasterDialog, function() { console.log('cerrado'); });
        },

        onCloseMasterDialog: function() {
            this.oView._Fragmento[this.idMasterDialog].close();
        },

        //-------- TransformarPallet ----- INICIO
        scopeTPR: {},
        posTPR: [],
        onShowTransformarPalletDialog: function() {
            var othat = this;
            this.scopeTPR.numCodigo = 0;
            this.scopeTPR.btnGuardar = false;
            this.posTPR = [];
            this.onOpenDialog('transformarPallet', 'AvocadoProyecto.AvocadoProyecto.modules.reprocesoPallet.fragments.transformarPallet');
            var oModelposTPR = new sap.ui.model.json.JSONModel(this.posTPR);
            this.oView.getView().setModel(oModelposTPR, "posTPR");
            var oModelscopeTPR = new sap.ui.model.json.JSONModel(this.scopeTPR);
            this.oView.getView().setModel(oModelscopeTPR, "scopeTPR");
            if (this.oView.getView().byId("inpScanCodTPR")) {
                setTimeout(function() { othat.oView.getView().byId("inpScanCodTPR").setValue('').focus(); }, 800);
            }
        },

        onScanCodigoTPR: function() {
            var othat = this;
            var sHU = othat.oView.getView().byId("inpScanCodTPR").getValue().toString();
            if (sHU === "") return;
            var oFinded = this.posTPR.find(function(val) {
                if (val.NRO_PALLET == sHU) {
                    return val;
                }
            });
            if (oFinded !== undefined) {
                sap.m.MessageToast.show("El código actual ya ha sido escaneado y registrado");
                othat.oView.getView().byId("inpScanCodTPR").setValue('').focus();
                return;
            }
            var data = {};
            data.NRO_PALLET = sHU;
            this.posTPR.push(data);
            var oModelposTPR = new sap.ui.model.json.JSONModel(this.posTPR);
            this.oView.getView().setModel(oModelposTPR, "posTPR");
            this.oView.getView().getModel("posTPR").refresh();
            this.oView.getView().byId("inpScanCodTPR").setValue('').focus();
            this.scopeTPR.btnGuardar = (this.posTPR.length > 0) ? true : false;
            this.scopeTPR.numCodigo = this.posTPR.length;
            this.oView.getView().getModel("scopeTPR").refresh();
        },

        onDeleteposTPR: function(event) {
            var deleteRecord = parseInt(event.getSource().getBindingContext("posTPR").getPath().replace("/", ""));
            var othat = this;
            this.posTPR.splice(deleteRecord, 1);
            var oModelposTPR = new sap.ui.model.json.JSONModel(this.posTPR);
            this.oView.getView().setModel(oModelposTPR, "posTPR");
            this.oView.getView().getModel("posTPR").refresh();
            this.oView.getView().byId("inpScanCodTPR").setValue('').focus();
            this.scopeTPR.btnGuardar = (this.posTPR.length > 0) ? true : false;
            this.scopeTPR.numCodigo = this.posTPR.length;
            this.oView.getView().getModel("scopeTPR").refresh();
        },

        onSaveTPR: function() {
            var othat = this;
            if (this.posTPR.length <= 0) return;
            sap.ui.core.BusyIndicator.show(0);
            var data = {};
            data.N_REPROCESO = this.posTPR;
            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            data.N_REPROCESO.forEach(obj => { obj.I_WERKS = sCentro; });
            //DG - Fin            
            var oModelService = othat.oView.getView().getModel('service');
            oModelService.create("/ReprocesoDePalletSet", data, {
                success: async function(oResponse, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    var msgError = othat._processErrorOdata(oResponse);
                    if (msgError != "") {
                        MessageBox.error(
                            msgError, {
                                styleClass: "sapUiSizeCompact",
                                onClose: function(oAction) {}
                            }
                        );
                    } else {
                        var msgSucc = othat._processSuccessOdata(oHeader);
                        MessageBox.success(
                            msgSucc.success, {
                                styleClass: "sapUiSizeCompact",
                                onClose: function(oAction) {
                                    if (msgSucc.error != "") {
                                        MessageBox.error(
                                            msgSucc.error, {
                                                styleClass: "sapUiSizeCompact",
                                                onClose: function(oAction) {
                                                    othat._SaveTPRClean(othat);
                                                }
                                            }
                                        );
                                    } else {
                                        othat._SaveTPRClean(othat);
                                    }
                                }
                            }
                        );
                    }
                },
                error: function(oError, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    var msgError = othat._processErrorOdata(oError);
                    MessageBox.error(
                        msgError, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function(oAction) {}
                        }
                    );
                }
            });
        },

        _SaveTPRClean: function(othat) {
            othat.scopeTPR.numCodigo = 0;
            othat.scopeTPR.btnGuardar = false;
            othat.posTPR = [];
            var oModelposTPR = new sap.ui.model.json.JSONModel(othat.posTPR);
            othat.oView.getView().setModel(oModelposTPR, "posTPR");
            var oModelscopeTPR = new sap.ui.model.json.JSONModel(othat.scopeTPR);
            othat.oView.getView().setModel(oModelscopeTPR, "scopeTPR");
            othat.oView.getView().byId("inpScanCodTPR").setValue('').focus();
        },
        //-------- TransformarPallet ----- FIN

        //-------- Visualizar ID Reproceso ----- INICIO
        onShowVisualizarIdReprocesoDialog: function() {
            var othat = this;
            this.onOpenDialog('visualizarIDReproceso', 'AvocadoProyecto.AvocadoProyecto.modules.reprocesoPallet.fragments.visualizarIDReproceso');
            var oModelReprocesadosIdVIR = new sap.ui.model.json.JSONModel();
            this.oView.getView().setModel(oModelReprocesadosIdVIR, "ReprocesadosIdVIR");
            if (this.oView.getView().byId("inpSlcIdVIR")) {
                setTimeout(function() { othat.oView.getView().byId("inpSlcIdVIR").setValue('').focus(); }, 800);
            }
        },

        onSlcIdVIR: function() {
            var othat = this;
            var sHU = othat.oView.getView().byId("inpSlcIdVIR").getValue().toString();
            if (sHU === "") return;
            //Inicio SCH
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;               
            //Fin SCH
            sap.ui.core.BusyIndicator.show(0);
            var oModel = new sap.ui.model.json.JSONModel();
            othat.oView.getView().setModel(oModel, "ReprocesadosIdVIR");
            var oModelService = othat.oView.getView().getModel('service');
            oModelService.read("/GetIdReproSet", {
                filters: [new sap.ui.model.Filter("I_ID_REP", sap.ui.model.FilterOperator.EQ, sHU),
                	      new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro) ],  //SCH
                success: function(result, response) {
                    var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.oView.getView().setModel(oModel, "ReprocesadosIdVIR");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(error) {
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });

        },

        //-------- Notificación producto terminado ----- FIN
        scopeNPT: {},
        posNPT: [],
        onShowNotifProdTerminadoDialog: function() {
            var othat = this;
            this.scopeNPT.ordenProceso = {};
            this.scopeNPT.ordenSeleccionado = {};
            this.onOpenDialog('notifProdTerminado', 'AvocadoProyecto.AvocadoProyecto.modules.reprocesoPallet.fragments.notifProdTerminado');
            var oModelscopeNPT = new sap.ui.model.json.JSONModel(this.scopeNPT);
            this.oView.getView().setModel(oModelscopeNPT, "scopeNPT");
            if (this.oView.getView().byId("inpIdreProcesoNPT")) {
                setTimeout(function() { othat.oView.getView().byId("inpIdreProcesoNPT").setValue('').focus(); }, 800);
            }
        },

        onBusquedaOrdenNPT: async function() {
            var othat = this;
            sap.ui.core.BusyIndicator.show(0);
            var oModel = new sap.ui.model.json.JSONModel();
            othat.oView.getView().setModel(oModel, "posNPT");
            var oModelService = othat.oView.getView().getModel('service');
            
          //Inicio SCH
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;        
            var oFiltros = new Array(
            		new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)
            );
            //Fin SCH

            var oResponseOT = await new Promise(resolve => {
                oModelService.read("/AyudaBusquedaOrdenReproSet", {
                	filters: oFiltros, //SCH
                    success: function(result, response) {
                        sap.ui.core.BusyIndicator.hide();
                        var oModel = new sap.ui.model.json.JSONModel(result);
                        othat.oView.getView().setModel(oModel, "posNPT");
                        resolve(true);
                    },
                    error: function(error) {
                        sap.ui.core.BusyIndicator.hide();
                        console.log(error);
                        resolve(false);
                    }
                });
            });
            this.onOpenDialog('busquedaOrdenNPT', 'AvocadoProyecto.AvocadoProyecto.modules.reprocesoPallet.fragments.busquedaOrdenNPT');
        },

        onFiltrarListaOrdenes: function(oEvt) {
            var sValue = oEvt.getParameter("value");
            var orFilter = [];
            var oFilter = new sap.ui.model.Filter("PLNBEZ", sap.ui.model.FilterOperator.Contains, sValue);
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("AUFNR", sap.ui.model.FilterOperator.Contains, sValue);
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("VIAJE", sap.ui.model.FilterOperator.Contains, sValue);
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("VBELN", sap.ui.model.FilterOperator.Contains, sValue);
            orFilter.push(oFilter);
            var oBinding = oEvt.getSource().getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(orFilter, false), "Application");
        },

        onBuscarClasificaciones: async function(oEvent) {
            var oSource = oEvent.getSource();
            var sValue = oSource.getValue();
            var othat = this;
            
            //Inicio SCH
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;               
            //Fin SCH

            if (!sValue) return;

            othat._localFragmento["notifProdTerminado"].fragment.setBusyIndicatorDelay(100);
            othat._localFragmento["notifProdTerminado"].fragment.setBusy(true);

            var oDataService = this.oView.getView().getModel('service');
            var sUrlEntity = "/ClasificacionSet";
          //Inicio SCH
            //  var oFiltroAgregar = new sap.ui.model.Filter("IdRepro", sap.ui.model.FilterOperator.EQ, sValue);
            //  var oFiltros = new Array();
            //oFiltros.push(oFiltroAgregar);            
           
            var oFiltros = new Array(
            		new sap.ui.model.Filter("IdRepro", sap.ui.model.FilterOperator.EQ, sValue),
            		new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)
            		);
          //Fin SCH 

            var oResponse = await this._ReadService(oDataService, sUrlEntity, oFiltros);

            othat._localFragmento["notifProdTerminado"].fragment.setBusy(false);

            this.oView.getView().getModel("mListaNotificar").setData(oResponse);
        },

        onSelectElementOrden: async function(oEvent) {
            try {
                this.scopeNPT.ordenSeleccionado = JSON.parse(JSON.stringify(oEvent.getParameter("selectedContexts")[0].getObject()));
                var oModelscopeNPT = new sap.ui.model.json.JSONModel(this.scopeNPT);
                this.oView.getView().setModel(oModelscopeNPT, "scopeNPT");
                this.oView.getView().getModel("scopeNPT").refresh();
                console.log(this.scopeNPT.ordenSeleccionado);
            } catch (err) {
                sap.m.MessageToast.show("Ocurrio un error al selecciona la Orden, vuelva a intentarlo");
            }
        },

        onChaneCantidadNPT: function() {
            var othat = this;
            var cant = Number(othat.oView.getView().byId("inpCantidadNPT").getValue());
            var MaxPallet = parseInt(this.scopeNPT.ordenSeleccionado.UMREZ);
            if (isNaN(MaxPallet)) {
                othat.oView.getView().byId("inpCantidadNPT").setValue("")
                sap.m.MessageToast.show("Se requiere seleccionar el orden de reproceso.");
                return;
            }
            if (isNaN(cant)) {
                othat.oView.getView().byId("inpCantidadNPT").setValue("")
                return;
            }
            if (cant <= 0) {
                return;
            }
            if (cant > MaxPallet) {
                othat.oView.getView().byId("inpCantidadNPT").setValue("")
                sap.m.MessageToast.show("La cantidad no puede ser mayor al máximo de paletas.");
                return;
            }
        },

        onValidarCantidadCajas: function(oEvent) {
            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("mListaNotificar");
            var sPath = oBinding.getPath();

            var oView = this.oView.getView();
            var oModel = oView.getModel("scopeNPT");
            var nMaxPallet = oModel.getProperty("/ordenSeleccionado/UMREZ");

            nMaxPallet = Number(nMaxPallet);
            if (isNaN(nMaxPallet)) {
                MessageBox.error("Selecione una orden");
                oSource.setValue(0);
                return;
            }

            var [slash, index] = sPath.split("/");
            index = Number(index);
            if (isNaN(index)) {
                MessageBox.error("Error en el código al validar las cantidades");
                return;
            }

            var oRow = oSource.getParent();
            var oTable = oRow.getParent();
            var oItems = oTable.getItems();

            var nTotal = oItems.map(item => {
                var oCells = item.getCells();
                var oInputCantidad = oCells[3];  //oCells[2]; TKT 8000018845
                var sValue = oInputCantidad.getValue();
                sValue = Number(sValue);
                sValue = isNaN(sValue) ? 0 : sValue;
                return sValue;
            }).reduce((anterior, nuevo) =>
                anterior + nuevo
            );

            if (nTotal > nMaxPallet) {
                MessageBox.error("Cant cajas no puede ser mayor a Máx. Pallet");
                oSource.setValue(0);
            }
        },

        onSaveNPT: function() {
            var oView = this.oView.getView();
            var othat = this;
            var oModelListaCajas = oView.getModel("mListaNotificar");
            var oListaCajas = oModelListaCajas.getData();
                        
            if (this.scopeNPT.ordenSeleccionado.AUFNR == undefined || this.scopeNPT.ordenSeleccionado.AUFNR == "") {
                sap.m.MessageToast.show("Se requiere seleccionar el orden de reproceso.");
                return
            }
            if (this.scopeNPT.ordenProceso.ID_REPRO == undefined || this.scopeNPT.ordenProceso.ID_REPRO == "") {
                sap.m.MessageToast.show("Se requiere Id de reproceso");
                oView.byId("inpIdreProcesoNPT").focus();
                return
            }
            // if (this.scopeNPT.ordenProceso.CANT == undefined || this.scopeNPT.ordenProceso.CANT == "") {
            //     sap.m.MessageToast.show("Se requiere Cantidad");
            //     oView.byId("inpCantidadNPT").focus();
            //     return
            // }
            // if (this.scopeNPT.ordenProceso.CODSKY == undefined || this.scopeNPT.ordenProceso.CODSKY == "") {
            //     sap.m.MessageToast.show("Se requiere Nro. Pallet Skynet");
            //     oView.byId("inpSkynetNPT").focus();
            //     return
            // }
            if (!this.scopeNPT.ordenProceso.Consignatario) {
                sap.m.MessageToast.show("Se requiere Consignatario");
                return
            }
            if (!this.scopeNPT.ordenProceso.GrupoImpresora) {
                sap.m.MessageToast.show("Se requiere Grupo de Impresora");
                return
            }
            if (oListaCajas.length == 0) {
                sap.m.MessageToast.show("No existe lista de cajas a Notificar");
                return
            }

            //Inicio SCH
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;               
            //Fin SCH
            
            var data = new Object();

            data.ID_REPRO = this.scopeNPT.ordenProceso.ID_REPRO;
            data.AUFNR = this.scopeNPT.ordenSeleccionado.AUFNR;
            data.MATNR = this.scopeNPT.ordenSeleccionado.PLNBEZ;
            data.VIAJE = this.scopeNPT.ordenSeleccionado.VIAJE;
            data.PEDIDO = this.scopeNPT.ordenSeleccionado.VBELN;
            data.CANT = "0"; //this.scopeNPT.ordenProceso.CANT;
            data.MAXPAL = this.scopeNPT.ordenSeleccionado.UMREZ;
            data.CODSKY = "0"; //this.scopeNPT.ordenProceso.CODSKY;

            // data.ITEMCONSIGNATARIO = this.scopeNPT.ordenProceso.Consignatario;
            data.ITEMCONSIGNATARIO = this.scopeNPT.ordenProceso.ConsignatarioID;
            data.GRUPOIMPRESORA = this.scopeNPT.ordenProceso.GrupoImpresora;

            data.PRODUCTO = this.scopeNPT.ordenSeleccionado.PLNBEZ;
            data.COMENTARIO = this.scopeNPT.ordenProceso.COMENTARIO;
          //Inicio SCH
            data.WERKS = sCentro;
          //Fin SCH
             
            data.NavClasificacion = new Array();

            var nTotalCantidadCajasIngresadas = 0;
            var nTotalEtiquetas = 0;

            oListaCajas.forEach(caja => {
                caja.IdRepro = this.scopeNPT.ordenProceso.ID_REPRO;
                caja.Matnr = this.scopeNPT.ordenSeleccionado.PLNBEZ;
                caja.Cantidad = Number(caja.Cantidad);
                caja.Cantidad = isNaN(caja.Cantidad) ? 0 : caja.Cantidad;
                caja.Cantidad = String(caja.Cantidad);

                nTotalCantidadCajasIngresadas += caja.Cantidad;

                data.NavClasificacion.push(caja);
                
                if (Number(caja.Cantidad) > 0) {
                	nTotalEtiquetas++;
                }
                
            });

            if (nTotalCantidadCajasIngresadas == 0) {
                var oTable = this.getView().byId("table-lista_cajas_notificas");
                var oItems = oTable.getItems();
                var oPrimeraFila = oItems[0];
                var oCells = oPrimeraFila.getCells();
                var oInputCantidad = oCells[3]; //oCells[2]; TKT 8000018845
                oInputCantidad.focus();
                MessageBox.error("Ingresar Cantidad de Cajas");
                return;
            }

            var nCantidadRegistros = oListaCajas.length;

            var othat = this;
            var oDataService = oView.getModel("service");
            var sUrl = "/NotificacionPTSet";

            othat._localFragmento["notifProdTerminado"].fragment.setBusyIndicatorDelay(100);
            othat._localFragmento["notifProdTerminado"].fragment.setBusy(true);

            oDataService.create(sUrl, data, {
                success: async function(response, header) {
                    othat._localFragmento["notifProdTerminado"].fragment.setBusy(false);
                    var sMensaje = "Se creo correctamente el pallet del producto terminado. \n";
                    sMensaje += "HU: " + response.HU2 + " \n";
                    sMensaje += "Pedido: " + response.PEDIDO + " \n";
                    //sMensaje += "Se imprimió " + nCantidadRegistros + " etiquetas PTI";
                    sMensaje += "Se imprimió " + nTotalEtiquetas + " etiquetas PTI";
                    MessageBox.success(
                        sMensaje, {
                            title: "Guardado",
                            styleClass: "sapUiSizeCompact",
                            onClose: function(oAction) {
                                oModelListaCajas.setData([]);
                                oModelListaCajas.refresh(true);
                                othat.onCloseDialog('notifProdTerminado');
                            }
                        }
                    );
                },
                error: function(oError, oHeader) {
                    othat._localFragmento["notifProdTerminado"].fragment.setBusy(false);
                    var msgError = othat._processErrorOdata(oError);
                    MessageBox.error(
                        msgError, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function(oAction) {}
                        }
                    );
                }
            });
        },
        //-------- Notificación producto terminado ----- INICIO

        /**
         * Lee un servicio del tipo GET_ENTITY_SET y retorna un array, en caso de error, retorna FALSE
         * @param {sap.ui.model.odata.v2.ODataModel} oDataService 
         * @param {String} sUrl 
         * @param {Array} oFiltros 
         * @returns {Array}
         */
        _ReadService: function(oDataService, sUrl, oFiltros = []) {
            return new Promise(resolve => {
                oDataService.read(sUrl, {
                    filters: oFiltros,
                    "success": function(response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": async function(error) {
                        var sMensajeError = "Ocurrio un error en el servidor.";
                        try {
                            var oErrorJson = JSON.parse(error.responseText);
                            var oDetallesError = oErrorJson.error.innererror.errordetails;
                            if (oDetallesError.length > 0) {
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
                        await new Promise(r => {
                            sap.m.MessageBox.error(
                                sMensajeError, {
                                    styleClass: "sapUiSizeCompact",
                                    onClose: function(oAction) {
                                        r();
                                    }
                                }
                            )
                        });
                        resolve(false);
                    }
                });
            });
        },

        onAbrirAyudaBusqueda: async function(oEvent, sNombreFragmento, sOdataUrl = false, sUrlEntity = false, oCamposDependendientes = false) {
            var oView = this.getView().oView;
            var oFiltros = new Array();

            if (oCamposDependendientes) {
                try {
                    var bValidado = true;
                    var sMensajesError = "";
                    oCamposDependendientes.forEach(dependencia => {
                        var oModeloDependiente = oView.getModel(dependencia.modelo);
                        var sPath = dependencia.path;
                        var sValue = oModeloDependiente.getProperty(sPath);

                        if (!sValue) {
                            sMensajesError += dependencia.mensaje_error;
                            bValidado = false;
                        } else {
                            var sCampoFiltro = dependencia.campo_filtro;
                            var oFiltroAgregar = new sap.ui.model.Filter(sCampoFiltro, sap.ui.model.FilterOperator.EQ, sValue);
                            oFiltros.push(oFiltroAgregar);
                        }
                    });
                    if (!bValidado) {
                        MessageBox.error(sMensajesError, { styleClass: "sapUiSizeCompact" });
                        return;
                    }
                } catch (err) {
                    MessageBox.error("Error de codigo al recuperar las condiciones del campo", { styleClass: "sapUiSizeCompact" });
                }
            }

            var sPath = "AvocadoProyecto.AvocadoProyecto.modules.reprocesoPallet.fragments.AyudaBusqueda." + sNombreFragmento;
            var oFragment = sap.ui.xmlfragment(sPath, this);
            oView.addDependent(oFragment);
            oFragment.open();

            if (sOdataUrl) {
                oFragment.setBusy(true);
                var oDataService = new sap.ui.model.odata.v2.ODataModel(sOdataUrl);
                // add Filter Centro
                if(sNombreFragmento=='AyudaGrupoImpresora'){
                	  const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
                      var oFiltroCentro = new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro);
                      oFiltros.push(oFiltroCentro);  
                      
                }
                            
                var oResponse = await this._ReadService(oDataService, sUrlEntity, oFiltros);
                if (!oResponse) oResponse = new Array();
                var oModel = new sap.ui.model.json.JSONModel(oResponse);
                oFragment.setModel(oModel);
                oFragment.setBusy(false);
            }

            this._Fragmento[sNombreFragmento] = oFragment;
        },

        onCerrarFragmento: function(sNombre) {
            this._Fragmento[sNombre].destroy();
            delete this._Fragmento[sNombre];
        },

        onFiltrarDatosMatchcode: function(oEvent, oCampos = []) {
            var oSource = oEvent.getSource();
            var sValue = oEvent.getParameter("value");

            var oFiltros = new Array();

            oCampos.forEach(sCampo => {
                var oFiltroAgregar = new sap.ui.model.Filter(sCampo, sap.ui.model.FilterOperator.Contains, sValue);
                oFiltros.push(oFiltroAgregar);
            });

            var oBinding = oSource.getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },

        onAgregarValorMatchcode: function(oEvent, sNombreFragmento, sModelo, oPropiedades) {
            var oItem = oEvent.getParameter("selectedItem");
            var sPath = oItem.getBindingContextPath();

            var oView = this.getView().oView;
            var oModel = oView.getModel(sModelo);
            var oModelFragmento = this._Fragmento[sNombreFragmento].getModel();

            if (oModel && oPropiedades) {
                Object.keys(oPropiedades).forEach(sKey => {
                    var sPropiedadModeloFragmento = sKey;
                    var sPropiedad = oPropiedades[sKey];

                    var oElement = oModelFragmento.getProperty(sPath);
                    var sValue = oElement[sPropiedadModeloFragmento];
                    oModel.setProperty(sPropiedad, sValue);
                });
            }

            this.onCerrarFragmento(sNombreFragmento);
        },



        onOpenDialog: function(id, path, callback = function() {}) {
            if (id == "") return;
            if (path == "") return;
            var othat = this;
            if (!othat._localFragmento[id]) {
                othat._localFragmento[id] = {};
                othat._localFragmento[id].fragment = sap.ui.xmlfragment(othat.oView.getView().getId(), path, othat);
                othat.oView.getView().addDependent(othat._localFragmento[id].fragment);
                othat._localFragmento[id].callback = callback;
            }
            othat._localFragmento[id].fragment.open();
        },

        onAfterCloseDialog: function(id) {
            this._localFragmento[id].fragment.destroy();
            this._localFragmento[id].callback();
            delete this._localFragmento[id];
        },

        onCloseDialog: function(id) {
            this._localFragmento[id].fragment.close();
        },

        _processSuccessOdata: function(oHeader) {
            var sMessage = "";
            var sErrorMessage = "";
            var dataReturn = {};
            try {
                var oSuccess = JSON.parse(oHeader.headers["sap-message"]);
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
                sMessage = "Se ha creado el Pallet correctamente";
            }
            dataReturn.success = sMessage;
            dataReturn.error = sErrorMessage;
            return dataReturn;
        },

        _processErrorOdata: function(error) {
            if (error) {
                if (error.responseText) {
                    var obj = JSON.parse(error.responseText);
                    if (obj.error !== undefined) {

                        if (obj.error.innererror) {
                            if (obj.error.innererror.errordetails) {
                                if (obj.error.innererror.errordetails.length > 0) {
                                    var msgReturn = "";
                                    for (var index = 0; index < obj.error.innererror.errordetails.length; index++) {
                                        if (obj.error.innererror.errordetails[index].message &&
                                            obj.error.innererror.errordetails[index].code != "/IWBEP/CX_MGW_TECH_EXCEPTION") {
                                            if (msgReturn != "") {
                                                msgReturn = msgReturn + "\r\n";
                                            }
                                            msgReturn = msgReturn + obj.error.innererror.errordetails[index].message;
                                        }
                                    }
                                    if (msgReturn != "") { return msgReturn; }
                                }
                            }
                        }
                        if (obj.error.message) {
                            return obj.error.message.value
                        }
                    }
                }
                if (error.message) {
                    return error.message.value
                }
            }
            return "";
        }

    });
});