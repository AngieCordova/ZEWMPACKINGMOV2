sap.ui.define([
        'sap/m/MessageBox',
        "sap/ui/core/mvc/Controller",
        "../model/formatter",
        'sap/ui/core/Fragment',
        'sap/ui/model/json/JSONModel',
        'sap/m/ColumnListItem',
        'sap/m/Label',
        'sap/m/Token',
        'sap/ui/core/Fragment',
        "sap/ui/unified/Calendar",
        'sap/ui/unified/DateRange'
    ],

    /**
     * 
     * @param {typeof sap.m.MessageBox} MessageBox 
     * @param {typeof sap.ui.core.mvc.Controller } Controller  
     * @param {typeof sap.ui.core.Fragment} Fragment 
     * @param {typeof sap.ui.unified.Calendar} Calendar
     * @returns 
     */

    function(MessageBox, Controller, formatter, Fragment, JSONModel, Calendar, DateRange) {
        "use strict";

        return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.zonaFull.controller.zonaFull", {

            oView: new Object(),
            idMasterDialog: "zonaFullFragment",
            _localFragmento: new Object(),
            _Fragmento: new Object(),
            formatter: formatter,
            _oDestinosModel: new sap.ui.model.json.JSONModel(),
            scope: {},
            selectedRowMC: '',
            initDialog: function(othat) {
                this.oView = othat;
            },

            onCreateMasterDialog: function() {
                var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0028_SRV", { "useBatch": false });
                this.oView.getView().setModel(oModelService, "service");
                //+CML SR-122198
                this.oView.getView().setModel(new sap.ui.model.json.JSONModel(), "constantes");
                
            },

            onAfterCloseMasterDialog: function() {
                //-!-  Comm-cbs-doc : se limpia los datos y se destruye el dialog  [Besmit-09082021]            
                this.oView.getView().setModel(null, "service");
                this.oView.getView().setModel(null, "scopeTPR");
                this.oView.getView().setModel(null, "posTPR");
                this.oView.getView().setModel(null, "RepIngresoSalidaZF");
                this.oView.closeSplitDialogRouter(this.idMasterDialog, function() { console.log('cerrado'); });
            },

            onCloseMasterDialog: function() {
                this.oView._Fragmento[this.idMasterDialog].close();
            },

            //-------------------------------------------------------------------
            //-!-  Comm-cbs-doc : Dar Ingreso o Reubicar en ZF  [Besmit-09082021]
            onShowVisualizarIngresoSalZF: function() {
                this.scope = {
                    'activeGuardar': false,
                };
                var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
                this.oView.getView().setModel(oModelScope, "scopeZF");
                this.onOpenDialog('ingresoSalidaZF', 'AvocadoProyecto.AvocadoProyecto.modules.zonaFull.fragments.ingresoSalidaZF');
                this.onLoadContenedores("1")
                    //this.onLoadDestino();
            },

            onLoadContenedores: function(opcion) {
                sap.ui.core.BusyIndicator.show(0);
                
                const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks; //SCH-EWM Avopack Guatemala 2024
                var othat = this;
                var oModel = new sap.ui.model.json.JSONModel([]);
                othat.oView.getView().setModel(oModel, "RepIngresoSalidaZF");
                var oModelService = othat.oView.getView().getModel('service');
                oModelService.read("/RepIngresoSalidaSet", {
                    filters: [new sap.ui.model.Filter("I_ACCION", sap.ui.model.FilterOperator.EQ, opcion),
                    	      new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)], //SCH-EWM Avopack Guatemala 2024
                    success: function(result, response) {
                        result.results.map(function(item) {
                            item.check = false;
                            item.UBICACION_BKP = (item.UBICACION != '') ? item.UBICACION : '';
                        });

                        var oModel = new sap.ui.model.json.JSONModel(result);
                        othat.oView.getView().setModel(oModel, "RepIngresoSalidaZF");
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function(error) {
                        console.log(error);
                        sap.ui.core.BusyIndicator.hide();
                    }
                })
            },

            onFiltrarTabla: function(oEvent) {
                var oSource = oEvent.getSource();
                var oValue = oSource.getValue();
                var oTable = oSource.getParent().getParent();
                var binding = oTable.getBinding("items");

                var oFiltros = new Array(
                    new sap.ui.model.Filter("ZZ_CODRSERVA", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("ZZ_CONTENEDOR", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("ZZ_NUMORDEN", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("ZZ_VIAJE", sap.ui.model.FilterOperator.Contains, oValue)
                );
                if (oTable.getId().indexOf("idContenedores") > -1) {
                    oFiltros.push(new sap.ui.model.Filter("UBICACION_BKP", sap.ui.model.FilterOperator.Contains, oValue))
                }
                
                if (oTable.getId().indexOf("idContenedoresSalida") > -1) {
                    oFiltros.push(new sap.ui.model.Filter("ENTREGA_SAP", sap.ui.model.FilterOperator.Contains, oValue))
                }
                //var oTable = this.getView().byId("table-pedidos_despacho");
                binding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
            },

            onCheckInRow: function(oEvent) {
                var oSource = oEvent.getSource();
                var oRowParent = oSource.getParent();

                const is_selected = oSource.getSelected();

                var oContextSelected = oSource.getBindingContext("RepIngresoSalidaZF");
                var sPathSelected = oContextSelected.getPath();

                //+CML SR-122198
                this.oView.getView().getModel("constantes").setProperty("/ContenedorSeleccionado", sPathSelected.split("/")[2]);

                var oTable = oRowParent.getParent();
                var oItems = oTable.getItems();

                oItems.forEach((row, index) => {
                    var sPath = row.getBindingContextPath();
                    var es_fila_seleccionada = sPath == sPathSelected;

                    var oCells = row.getCells();
                    var oCheckbox = oCells[0];

                    var habilitar = false;
                    if (es_fila_seleccionada) {
                        habilitar = is_selected ? true : false;
                    } else {
                        oCheckbox.setSelected(false)
                    }

                });

                var oView = this.oView.getView();
                var oModel = oView.getModel("RepIngresoSalidaZF");
                var list = oModel.getData();
                list.results.map(function(item) {
                    item.UBICACION_BKP = (item.UBICACION != '') ? item.UBICACION : '';
                });
                oModel.refresh();

                var oFound = list.results.find(function(item) {
                    return item.check == true;
                });
                if (oFound) {
                    this.scope.activeGuardar = (oFound.UBICACION_BKP != '') ? true : false;
                } else { this.scope.activeGuardar = false; }
                oView.getModel("scopeZF").refresh();
            },

            onValueHelpRequested: function(oEvent) {
                //+CML SR-122198
                //this.selectedRowMC = oEvent.getSource().getBindingContext('RepIngresoSalidaZF').sPath.split("/")[2];
                this.onOpenDialog('ayudaDestinoZF', 'AvocadoProyecto.AvocadoProyecto.modules.zonaFull.fragments.AyudaDestino');
                sap.ui.core.BusyIndicator.show(0);
                var othat = this;
              //SCH - Inicio
                const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
                var oFiltros = new Array(                        
                        new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)                       
                    );
                //SCH - Fin
                var oModel = new sap.ui.model.json.JSONModel([]);
                othat.oView.getView().setModel(oModel, "AyudaUbicacionZF");
                var oModelService = othat.oView.getView().getModel('service');
                oModelService.read("/AyudaUbicacionZFSet", {
                	//SCH - Inicio
                	filters: oFiltros,
                	//SCH - Inicio
                    success: function(result, response) {
                        var oModel = new sap.ui.model.json.JSONModel(result.results);
                        othat.oView.getView().setModel(oModel, "AyudaUbicacionZF");
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function(error) {
                        console.log(error);
                        sap.ui.core.BusyIndicator.hide();
                    }
                })
            },

            onFiltrarMatchcode: function(oEvent, oFields) {
                var oSource = oEvent.getSource();
                var sValue = oEvent.getParameter("value");
                var oFiltros = new Array();
                if (!oFields) return;
                try {
                    oFields.forEach(field => {
                        oFiltros.push(
                            new sap.ui.model.Filter(field, sap.ui.model.FilterOperator.Contains, sValue)
                        );
                    });
                    var oBinding = oSource.getBinding("items");
                    oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
                } catch (e) {}
            },

            onAgregarMCUbicacionZF: function(oEvent) {
                var oView = this.oView.getView();
                var oModel = oView.getModel("RepIngresoSalidaZF");

                var oItem = oEvent.getParameter("selectedItem");
                var oBinding = oItem.getBindingContext("AyudaUbicacionZF");
                var oElement = oBinding.getObject();
                var list = oModel.getData();
                //+CML SR-122198
                let sSelectedItemIndex = this.oView.getView().getModel("constantes").getProperty("/ContenedorSeleccionado");
                list.results[sSelectedItemIndex].UBICACION_BKP = oElement.UBICACION;
                //list.results[this.selectedRowMC].UBICACION_BKP = oElement.UBICACION;
                oModel.refresh();
                this.scope.activeGuardar = true;
                oView.getModel("scopeZF").refresh();
            },

            onSaveSalidaZF: function(oEvent) {
            	//SCH - Inicio
                const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
                //SCH - Fin
                var oView = this.oView.getView();
                var oModel = oView.getModel("RepIngresoSalidaZF");
                var list = oModel.getData();
                var oFound = list.results.find(function(item) {
                    return item.check == true;
                });
                if (!oFound) return;
                var othat = this;
                var data = {};
                data = JSON.parse(JSON.stringify(oFound));
                var oMensaje = "El contenedor " + data.ZZ_CONTENEDOR + " seleccionado será ingresado a la ubicación " + data.UBICACION_BKP;
                if (data.UBICACION != "" && data.UBICACION != "PENDIENTE") {
                    oMensaje = "El contenedor " + data.ZZ_CONTENEDOR + " ya cuenta con ubicación, desea remplazarla?";
                }
                data.UBICACION = data.UBICACION_BKP;
                data.I_ACCION = "1";
              //SCH - Inicio
                data.I_WERKS = sCentro;
              //SCH - Fin
                delete data.UBICACION_BKP;
                delete data.__metadata;
                delete data.check;

                MessageBox.warning(
                    oMensaje, {
                        title: "Confirmar",
                        actions: ["Cancelar", "CONFIRMAR"],
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oAction) {
                            if (oAction != "CONFIRMAR") return;

                            sap.ui.core.BusyIndicator.show(0);
                            var oModelService = othat.oView.getView().getModel('service');
                            oModelService.create("/GuardarIngresoSalidaZFSet", data, {
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
                                        MessageBox.success(
                                            "Se ha reubicado el contenedor correctamente", {
                                                styleClass: "sapUiSizeCompact",
                                                onClose: function(oAction) {
                                                    othat.onLoadContenedores("1");
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

                        }
                    }
                );
            },

            //-----------------------------------------------------------------
            //-!-  Comm-cbs-doc : Salida Desde ZF a Despacho  [Besmit-10082021]

            onShowVisualizarSalidaZFaDesp: function() {
                this.oView.getView().setModel(oModelScope, "scopeZF");
                this.onOpenDialog('salidaZFaDespacho', 'AvocadoProyecto.AvocadoProyecto.modules.zonaFull.fragments.salidaZFaDespacho');
                this.onLoadContenedores("2");
                this.scope = {
                    'activeGuardar': false,
                    'fechaEntregaMinDate': new Date(),
                };
                var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
                this.oView.getView().setModel(oModelScope, "scopeZF");
                // this.onLoadDestino();
            },

            onCheckInRowSalDesp: function(oEvent) {
                var oSource = oEvent.getSource();
                var oRowParent = oSource.getParent();

                const is_selected = oSource.getSelected();

                var oContextSelected = oSource.getBindingContext("RepIngresoSalidaZF");
                var sPathSelected = oContextSelected.getPath();

                var oTable = oRowParent.getParent();
                var oItems = oTable.getItems();

                oItems.forEach((row, index) => {
                    var sPath = row.getBindingContextPath();
                    var es_fila_seleccionada = sPath == sPathSelected;

                    var oCells = row.getCells();
                    var oCheckbox = oCells[0];

                    var habilitar = false;
                    if (es_fila_seleccionada) {
                        habilitar = is_selected ? true : false;
                    } else {
                        oCheckbox.setSelected(false)
                    }

                });

                var oView = this.oView.getView();
                var oModel = oView.getModel("RepIngresoSalidaZF");
                var list = oModel.getData();

                var oFound = list.results.find(function(item) {
                    return item.check == true;
                });
                if (oFound) {
                    this.scope.activeGuardar = true;
                } else { this.scope.activeGuardar = false; }
                oView.getModel("scopeZF").refresh();
            },

            onSaveSalidaZFDespacho: function() {
                this.onOpenDialog('slcCalendarZF', 'AvocadoProyecto.AvocadoProyecto.modules.zonaFull.fragments.slcCalendar');
                if (this.byId("dpSalidaZFDespacho")) {
                    var oCalendar = this.byId("dpSalidaZFDespacho");
                    oCalendar.removeAllSelectedDates();
                    oCalendar.addSelectedDate(new sap.ui.unified.DateRange({ startDate: new Date() }))
                } else {
                    console.log("Error al generar el calendario");
                }
            },

            onSaveSalidaZFDespachoConfirm: function() {
                if (this.byId("dpSalidaZFDespacho")) {
                    var oCalendar = this.byId("dpSalidaZFDespacho");
                    if (!oCalendar.getSelectedDates()[0]) {
                        sap.m.MessageToast.show("Debe seleccionar una fecha");
                        return;
                    }
                    var dateSlc = oCalendar.getSelectedDates()[0].getStartDate();
                    var dateSlcFormat = dateSlc.getFullYear() + (((dateSlc.getMonth() + 1) < 10) ? '0' : '') + (dateSlc.getMonth() + 1) + ((dateSlc.getDate() < 10) ? '0' : '') + dateSlc.getDate();

                    var oView = this.oView.getView();
                    var oModel = oView.getModel("RepIngresoSalidaZF");
                    var list = oModel.getData();
                    var oFound = list.results.find(function(item) {
                        return item.check == true;
                    });
                    if (!oFound) return;
                    var othat = this;
                    var data = {};
                    data = JSON.parse(JSON.stringify(oFound));
                    data.I_ACCION = "2";
                    data.FECHA_ENTREGA = dateSlcFormat;
                  //SCH-Inicio
                    const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
                    data.I_WERKS = sCentro;
                  //SCH-Fin                     
                    delete data.UBICACION_BKP;
                    delete data.__metadata;
                    delete data.check;
                  
                    sap.ui.core.BusyIndicator.show(0);
                    var oModelService = othat.oView.getView().getModel('service');
                    oModelService.create("/GuardarIngresoSalidaZFSet", data, {
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
                                MessageBox.success(
                                    "Se ha asignado la Fecha de Entrega al contenedor correctamente", {
                                        styleClass: "sapUiSizeCompact",
                                        onClose: function(oAction) {
                                            othat.onCloseDialog('slcCalendarZF')
                                            othat.onLoadContenedores("2");
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

                } else {
                    console.log("Error al obtener la fecha");
                }
            },

            //--------------------------------------------------------------------
            //-!-  Comm-cbs-doc : Manejo interno de los DIALOGS  [Besmit-09082021]           
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
                if (this._localFragmento[id] && this._localFragmento[id].fragment) {
                    this._localFragmento[id].fragment.destroy();
                    this._localFragmento[id].callback();
                    delete this._localFragmento[id];
                }
            },

            onCloseDialog: function(id) {
                if (this._localFragmento[id] && this._localFragmento[id].fragment) this._localFragmento[id].fragment.close();
            },

            //--------------------------------------------------------------------
            //-!-  Comm-cbs-doc : Funciones internas  [Besmit-10082021]            
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