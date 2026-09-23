sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
], function(MessageBox, Controller, formatter) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.SplitPalletsEWM.controller.SplitPalletsEWM", {

        formatter: formatter,
        dataBus: {},
        scope: {
            "totalTareasPallets": 0,
            "btnCrearPallet": true,
            "btnAgregarPosiciones": true,
            "activarCabecera": true,
            "SlcImprt": "",
            "SlcFecha": ""
        },
        agregarPosiciones: [],
        _Fragmento: new Object(),

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "SplitPalletsEWMView", this._busSuscribe, this);

            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0012_SRV", { "useBatch": false });
            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelDetail, "detail");

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");

            this.onLoadDetail();
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onLoadDetail: function() {
            sap.ui.core.BusyIndicator.show(0);
            this.getView().byId("txtSearch").setValue("");
            var othat = this;
            this.scope.totalTareasPallets = 0;
            var oModelService = this.getView().getModel('service');
            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin                        
            oModelService.read("/ObtenerPalletsSet ", {
                //DG - Inicio
                filters: [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, "'"+sCentro+"'")],
                //DG - Fin                     	
                success: function(result, response) {
                    var oModel = new sap.ui.model.json.JSONModel(result);
                    oModel.setSizeLimit(result.results.length);
                    othat.getView().setModel(oModel, "detail");
                    othat.scope.totalTareasPallets = result.results.length;
                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(error) {
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "detail");
                    console.log(error);
                    othat.scope.totalTareasPallets = 0;
                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        handleFilterPallets: function(event) {
            var sSearch = event.getSource().getValue().toString().toUpperCase();
            var oBinding = this.getView().byId("idPalletsTable").getBinding("items");
            if (sSearch === "") {
                oBinding.filter([]);
                this.scope.totalTareasPallets = oBinding.aIndices.length;
                var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
                this.getView().setModel(oModelScope, "scope");
                return;
            }
            var oFilter;
            var aFilters = [];

            aFilters.push(new sap.ui.model.Filter({
                path: "NRO_PALLET",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "PROD_DESCR",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "PEDIDO",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "CAJAS_PALLET",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "MAX_PALLETS",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "CJ_FALTANTES",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "FECHA_EMPAQUE",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));

            var oFilter = new sap.ui.model.Filter(aFilters, false);
            oBinding.filter(oFilter);
            this.scope.totalTareasPallets = oBinding.aIndices.length;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
        },

        onShowPallet: async function(event) {
            var othat = this;
            this._getDialogCrearPallet().open();
            sap.ui.core.BusyIndicator.show(0);
            var oContext = event.getSource().getBindingContext('detail');
            var oModelService = this.getView().getModel('service');
            var othat = this;
            var oModel = new sap.ui.model.json.JSONModel();
            othat.getView().setModel(oModel, "posiciones");
            this.scope.btnCrearPallet = false;
            this.scope.btnAgregarPosiciones = false;
            this.scope.SlcImprt = "";
            this.scope.SlcFecha = "";
            this.scope.palletSelected = JSON.parse(JSON.stringify(oContext.getObject()));
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.agregarPosiciones = [];
            var oModelAgregarPosiciones = new sap.ui.model.json.JSONModel(this.agregarPosiciones);
            this.getView().setModel(oModelAgregarPosiciones, "agregarPosiciones");
            oModelService.read("/ObtenerPosicionesPalletSet", {
                filters: [new sap.ui.model.Filter("I_VENUM", sap.ui.model.FilterOperator.EQ, oContext.getProperty('VENUM'))],
                success: function(result, response) {
                    result.results.map(function(obj) {
                        obj.visible = true;
                        obj.check = false;
                        obj.cant = "";
                        obj.CAJAS_PALLET_ORIGINAL = obj.CAJAS_PALLET;
                        return obj;
                    });
                    var oModel = new sap.ui.model.json.JSONModel(result.results);
                    othat.getView().setModel(oModel, "posiciones");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(error) {
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });

            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin 
            var oDataB = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0001_SRV", { "useBatch": false });
            var oResponseImpresora = await new Promise(resolve => {
                oDataB.read("/Grupo_ImpresorasSet", {
                    //DG - Inicio
                    filters: [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)],
                    //DG - Fin                 	
                    "success": function(response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": function(response) {
                        resolve([]);
                    }
                });
            });
            this.getView().setModel(new sap.ui.model.json.JSONModel(oResponseImpresora), "mListaGrupoImpresora");
        },

        handleFilterPosiciones: function(event) {
            var sSearch = event.getSource().getValue().toString().toUpperCase();
            var oBinding = this.getView().byId("idPalletsPosicionesTable").getBinding("items");
            if (sSearch === "") {
                oBinding.filter([]);
                return;
            }
            var oFilter;
            var aFilters = [];

            aFilters.push(new sap.ui.model.Filter({
                path: "NRO_PALLET",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "PROD_DESCR",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "KUNNR",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "NAME_ORG1",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "MODULO",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "FECHA_EMPAQUE",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "CAJAS_PALLET",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "CJ_FALTANTES",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "MAX_PALLETS",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));

            var oFilter = new sap.ui.model.Filter(aFilters, false);
            oBinding.filter(oFilter);
        },

        noSuperaMaximo: function(oEvent) {
            var oSource = oEvent.getSource();
            var sValue = oSource.getValue();
            var nValueIngresado = Number(sValue);
            var index = parseInt(oEvent.getSource().getBindingContext("posiciones").getPath().replace("/", ""));
            var oModelRehabilitar = this.getView().getModel("posiciones").getData();
            if (isNaN(nValueIngresado)) {
                oSource.setValue("");
                oModelRehabilitar[index].CAJAS_PALLET = oModelRehabilitar[index].CAJAS_PALLET_ORIGINAL;
                this.getView().getModel("posiciones").refresh();
                return;
            }
            if (nValueIngresado <= 0) {
                oSource.setValue("");
                oModelRehabilitar[index].CAJAS_PALLET = oModelRehabilitar[index].CAJAS_PALLET_ORIGINAL;
                this.getView().getModel("posiciones").refresh();
                return;
            }
            var nCajasEnPallet = Number(oModelRehabilitar[index].CAJAS_PALLET_ORIGINAL);
            var nResultado = nCajasEnPallet - nValueIngresado;
            if (nResultado < 0) {
                sap.m.MessageToast.show("La cantidad no puede superar el Maximo de cajas de la Paleta.");
                oSource.setValue("");
                oModelRehabilitar[index].CAJAS_PALLET = oModelRehabilitar[index].CAJAS_PALLET_ORIGINAL;
                this.getView().getModel("posiciones").refresh();
                return;
            }
            oModelRehabilitar[index].CAJAS_PALLET = nResultado;
            this.getView().getModel("posiciones").refresh();
        },

        onSelectPosicion: function() {
            var oModelRehabilitar = this.getView().getModel("posiciones").getData();
            this.scope.btnAgregarPosiciones = false;
            for (let index = 0; index < oModelRehabilitar.length; index++) {
                if (oModelRehabilitar[index].check) {
                    this.scope.btnAgregarPosiciones = true;
                }
            }
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
        },

        onAgregarPosiciones: function() {
            var oModelRehabilitar = this.getView().getModel("posiciones").getData();
            for (let index = 0; index < oModelRehabilitar.length; index++) {
                if (oModelRehabilitar[index].check && oModelRehabilitar[index].visible) {
                    if (parseInt(oModelRehabilitar[index].cant) > 0) {
                        this.agregarPosiciones.push(JSON.parse(JSON.stringify(oModelRehabilitar[index])));
                        oModelRehabilitar[index].visible = false;
                    } else {
                        sap.m.MessageToast.show("Existen posiciones sin cantidad de cajas, serán omitidas");
                    }
                }
            }
            this.getView().getModel("posiciones").refresh();
            var oModelAgregarPosiciones = new sap.ui.model.json.JSONModel(this.agregarPosiciones);
            this.getView().setModel(oModelAgregarPosiciones, "agregarPosiciones");
            this.getView().getModel("agregarPosiciones").refresh();
            this.scope.btnCrearPallet = (this.agregarPosiciones.length > 0) ? true : false;
            this.getView().getModel("scope").refresh();
        },

        handleFilterAgregarPosiciones: function(event) {
            var sSearch = event.getSource().getValue().toString().toUpperCase();
            var oBinding = this.getView().byId("idAgregarPosicionesTable").getBinding("items");
            if (sSearch === "") {
                oBinding.filter([]);
                return;
            }
            var oFilter;
            var aFilters = [];

            aFilters.push(new sap.ui.model.Filter({
                path: "NRO_PALLET",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "PROD_DESCR",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "KUNNR",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "NAME_ORG1",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "MODULO",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "FECHA_EMPAQUE",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "CAJAS_PALLET",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "CJ_FALTANTES",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            aFilters.push(new sap.ui.model.Filter({
                path: "MAX_PALLETS",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));

            var oFilter = new sap.ui.model.Filter(aFilters, false);
            oBinding.filter(oFilter);
        },

        onDeleteAgregarPosiciones: function(event) {
            var deleteRecord = parseInt(event.getSource().getBindingContext("agregarPosiciones").getPath().replace("/", ""));
            var othat = this;
            var oModel = this.getView().getModel("posiciones");
            oModel.getData().find(function(val) {
                if (val.VENUM === othat.agregarPosiciones[deleteRecord].VENUM && val.VEPOS === othat.agregarPosiciones[deleteRecord].VEPOS && val.NRO_PALLET === othat.agregarPosiciones[deleteRecord].NRO_PALLET) {
                    val.visible = true;
                }
            });
            this.getView().getModel("posiciones").refresh();
            this.agregarPosiciones.splice(deleteRecord, 1);
            var oModelAgregarPosiciones = new sap.ui.model.json.JSONModel(this.agregarPosiciones);
            this.getView().setModel(oModelAgregarPosiciones, "agregarPosiciones");
            this.getView().getModel("agregarPosiciones").refresh();
            this.scope.btnCrearPallet = (this.agregarPosiciones.length > 0) ? true : false;
            this.getView().getModel("scope").refresh();
        },

        onAbrirAyudaBusquedaGrupoImpresora: function(oEvent) {
            var oView = this.getView();
            var sNombreFragmento = "AyudaGrupoImpresora";
            var sPath = "AvocadoProyecto.AvocadoProyecto.modules.SplitPalletsEWM.fragments." + sNombreFragmento;
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

        onCerrarFragmento: function(sNombreFragmento) {
            this._Fragmento[sNombreFragmento].destroy();
            delete this._Fragmento[sNombreFragmento];
        },

        onAgregarValorMatchcodeImpresora: function(oEvent) {
            var oCore = sap.ui.getCore();
            var oItem = oEvent.getParameter("selectedItem");
            var oSelected = oItem.getTitle();
            this.scope.SlcImprt = oSelected;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.onCerrarFragmento("AyudaGrupoImpresora");
        },

        onFiltrarDatosMatchcodeImpresora: function(oEvent) {
            var oSource = oEvent.getSource();
            var sValue = oEvent.getParameter("value");
            var oFiltros = new Array(
                new sap.ui.model.Filter("ZZ_GRUPO", sap.ui.model.FilterOperator.Contains, sValue)
            );
            var oBinding = oSource.getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },

        onCrearPallet: function() {
            var othat = this;
            if (othat.scope.SlcImprt == "") {
                sap.m.MessageToast.show("Es necesario seleccionar una impresora.");
                return;
            }
            /*
            if (othat.scope.SlcFecha == "") {
                sap.m.MessageToast.show("Es necesaria una Fecha de empaque.");
                return;
            }
            */
            sap.ui.core.BusyIndicator.show(0);
            var data = {};
            data.N_GR_IMP = [];
            data.N_GR_IMP.push({ "GR_IMP": othat.scope.SlcImprt });
            data.N_EMBALAR = [];
            for (var index = 0; index < othat.agregarPosiciones.length; index++) {
                var dataPush = {};
                dataPush.VENUM = othat.agregarPosiciones[index].VENUM;
                dataPush.VEPOS = othat.agregarPosiciones[index].VEPOS;
                dataPush.CANTIDAD = othat.agregarPosiciones[index].cant;
                dataPush.FECHA_EMPAQUE = othat.agregarPosiciones[index].FECHA_EMPAQUE;
                //dataPush.FECHA_EMPAQUE = othat.scope.SlcFecha;
                data.N_EMBALAR.push(dataPush);
            }
            var oModelService = this.getView().getModel('service');
            oModelService.create("/EmbalarPalletsSet", data, {
                success: async function(oResponse, oHeader) {
                    sap.ui.core.BusyIndicator.hide();
                    var msgError = othat._processErrorOdata(oResponse);
                    if (msgError != "") {
                        MessageBox.error(
                            msgError, {
                                styleClass: "sapUiSizeCompact",
                                onClose: function(oAction) {
                                    othat.onCloseDialogCrearPallet();
                                }
                            }
                        );
                    } else {
                        var sMessage = "";
                        var sErrorMessage = "";
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
                        MessageBox.success(
                            sMessage, {
                                styleClass: "sapUiSizeCompact",
                                onClose: function(oAction) {
                                    if (sErrorMessage != "") {
                                        MessageBox.error(
                                            sErrorMessage, {
                                                styleClass: "sapUiSizeCompact",
                                                onClose: function(oAction) {
                                                    othat.onCloseDialogCrearPallet();
                                                }
                                            }
                                        );
                                    } else {
                                        othat.onCloseDialogCrearPallet();
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
                            onClose: function(oAction) {
                                othat.onCloseDialogCrearPallet();
                            }
                        }
                    );
                }
            });
        },

        _getDialogCrearPallet: function() {
            if (!this.oDialogCrearPallet) {
                this.oDialogCrearPallet = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.SplitPalletsEWM.fragments.crearPallet', this);
                this.getView().addDependent(this.oDialogCrearPallet);
            }
            return this.oDialogCrearPallet;
        },

        onCloseDialogCrearPallet: function() {
            this._getDialogCrearPallet().close();
        },

        onAfterCloseDialogCrearPallet: function() {
            this.onLoadDetail();
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