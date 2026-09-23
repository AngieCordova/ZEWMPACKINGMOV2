sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
], function(MessageBox, Controller, formatter) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.BASCValContEWM.controller.BASCValContEWM", {

        formatter: formatter,
        dataBus: {},
        scope: {
            "filtrado": {
                "fechaDesde": "",
                "fechaHasta": "",
                "totalRows": 0
            },
            conforme: [],
            noConforme: [],
            noConformeFields: []
        },

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "BASCValContEWMView", this._busSuscribe, this);

            //var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0008_SRV", { defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put, "useBatch": false });
            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0024_SRV_03", { "useBatch": false });

            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel([]);
            this.getView().setModel(oModelDetail, "contenedores");

            //this.onLoadContenedores();
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onFilterClean: function() {
            this.scope.filtrado.fechaDesde = "";
            this.scope.filtrado.fechaHasta = "";
            this.scope.filtrado.totalRows = 0;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            var oModel = new sap.ui.model.json.JSONModel([]);
            this.getView().setModel(oModel, "contenedores");
        },

        onFilter: function() {
            /*
            let fechaDesde = this.scope.filtrado.fechaDesde;
            let fechaHasta = this.scope.filtrado.fechaHasta;
            */

            var aFilters = [];
            if (this.scope.filtrado.fechaDesde != "") {
                let fechaDesde = this.getView().byId("txtInpFilter").getDateValue();
                fechaDesde.setUTCHours(0, 0, 0, 0);
                aFilters.push(new sap.ui.model.Filter("EstadoA11Fecha", sap.ui.model.FilterOperator.GE, fechaDesde));
            }
            if (this.scope.filtrado.fechaHasta != "") {
                let fechaHasta = this.getView().byId("txtInpFilter2").getDateValue();
                fechaHasta.setUTCHours(0, 0, 0, 0);
                aFilters.push(new sap.ui.model.Filter("EstadoA11Fecha", sap.ui.model.FilterOperator.LE, fechaHasta));
            }
            
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            aFilters.push(new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro));
            
            let oFilter = [];
            oFilter.push(new sap.ui.model.Filter(aFilters, true));
            
            sap.ui.core.BusyIndicator.show(0);
            var othat = this;
            var oModelService = this.getView().getModel('service');
            oModelService.read("/ObtenerPrecintosSet", {
                filters: oFilter,
                success: function(result, response) {
                    result.results.map(function(obj) {
                        obj.DarSalida = false;
                        return obj;
                    });
                    othat.scope.filtrado.totalRows = result.results.length;
                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");
                    var oModel = new sap.ui.model.json.JSONModel(result.results);
                    othat.getView().setModel(oModel, "contenedores");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(error) {
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "contenedores");
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        onOpenTransporte: function(event) {
            var oContext = event.getSource().getBindingContext('contenedores');
            var index = parseInt(oContext.getPath().replace("/", ""));
            var oModel = new sap.ui.model.json.JSONModel(oContext.oModel.oData[index]);

            let arrCampos = {
                "Conductor": "St01",
                "Contenedor": "St02",
                "Booking": "St03",
                "Senasa": "St04",
                "Planta": "St05",
                "Aduana": "St06",
                "Linea": "St07",
                "Operador": "St08",
                "PlacaTracto": "St09",
                "PlacaCarreta": "St10",
                "CertifInscrip": "St11",
                "Licencia": "St12",
                "NroDespacho": "St13",
                "MarcaVehiculo": "St14"
            };

            this.scope.conforme = [];
            this.scope.noConforme = [];
            this.scope.noConformeFields = {};

            for (var campo in arrCampos) {
                if (oContext.oModel.oData[index][arrCampos[campo]] == "1") {
                    this.scope.conforme[campo] = true;
                    this.scope.noConforme[campo] = false;
                } else {
                    this.scope.conforme[campo] = false;
                    this.scope.noConforme[campo] = true;
                }
            }

            let aCampos = Object.keys(oModel.getData());
            let aCamposCorreccion = ["CorConductor", "CorContenedor", "CorBooking", "CorSenasa",
             "CorPlanta", "CorAduana", "CorLinea", "CorOperador", "CorPlacaTracto", "CorPlacaCarreta",
              "CorCertifInscrip", "CorLicencia", "CorNroDespacho", "CorMarcaVehiculo"];

            for (let sCampoCorreccion of aCampos){
                if (aCamposCorreccion.includes(sCampoCorreccion)){
                    this.scope.noConformeFields[sCampoCorreccion] = oModel.getData()[sCampoCorreccion];
                }
            }

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.getView().setModel(oModel, "contenedor");
            this._getDialogTransporte().open();
        },

        onGuardarValidacion: function() {
            let totalElementos = 14;

            let sumConforme = 0;
            for (var key in this.scope.conforme) {
                if (this.scope.conforme[key]) { sumConforme++; }
            }

            let sumNoConforme = 0;
            for (var key in this.scope.noConforme) {
                if (this.scope.noConforme[key]) { sumNoConforme++; }
            }

            if ((sumNoConforme + sumConforme) != totalElementos) {
                sap.m.MessageToast.show("Es necesario marcar si se esta (o no) conforme en cada elemento");
                return;
            }

            var othat = this;
            var oModelCont = this.getView().getModel('contenedor');

            var data = {};
            data.Pedido = oModelCont.getData().Pedido;
            data.Conductor = oModelCont.getData().Conductor;
            data.Contenedor = oModelCont.getData().Contenedor;
            data.Booking = oModelCont.getData().Booking;
            data.Senasa = oModelCont.getData().Senasa;
            data.Planta = oModelCont.getData().Planta;
            data.Aduana = oModelCont.getData().Aduana;
            data.Linea = oModelCont.getData().Linea;
            data.Operador = oModelCont.getData().Operador;
            data.PlacaTracto = oModelCont.getData().PlacaTracto;
            data.PlacaCarreta = oModelCont.getData().PlacaCarreta;
            data.CertifInscrip = oModelCont.getData().CertifInscrip;
            data.Licencia = oModelCont.getData().Licencia;
            data.NroDespacho = oModelCont.getData().NroDespacho;
            data.MarcaVehiculo = oModelCont.getData().MarcaVehiculo;
            data.StatusSalida = '';

            data.CorConductor = this.scope.noConformeFields?.CorConductor;
            data.CorContenedor = this.scope.noConformeFields?.CorContenedor;
            data.CorBooking = this.scope.noConformeFields?.CorBooking;
            data.CorSenasa = this.scope.noConformeFields?.CorSenasa;
            data.CorPlanta = this.scope.noConformeFields?.CorPlanta;
            data.CorAduana = this.scope.noConformeFields?.CorAduana;
            data.CorLinea = this.scope.noConformeFields?.CorLinea;
            data.CorOperador = this.scope.noConformeFields?.CorOperador;
            data.CorPlacaTracto = this.scope.noConformeFields?.CorPlacaTracto;
            data.CorPlacaCarreta = this.scope.noConformeFields?.CorPlacaCarreta;
            data.CorCertifInscrip = this.scope.noConformeFields?.CorCertifInscrip;
            data.CorLicencia = this.scope.noConformeFields?.CorLicencia;
            data.CorNroDespacho = this.scope.noConformeFields?.CorNroDespacho;
            data.CorMarcaVehiculo = this.scope.noConformeFields?.CorMarcaVehiculo;

            data.St01 = (this.scope.conforme.Conductor) ? '1' : '0';
            data.St02 = (this.scope.conforme.Contenedor) ? '1' : '0';
            data.St03 = (this.scope.conforme.Booking) ? '1' : '0';
            data.St04 = (this.scope.conforme.Senasa) ? '1' : '0';
            data.St05 = (this.scope.conforme.Planta) ? '1' : '0';
            data.St06 = (this.scope.conforme.Aduana) ? '1' : '0';
            data.St07 = (this.scope.conforme.Linea) ? '1' : '0';
            data.St08 = (this.scope.conforme.Operador) ? '1' : '0';
            data.St09 = (this.scope.conforme.PlacaTracto) ? '1' : '0';
            data.St10 = (this.scope.conforme.PlacaCarreta) ? '1' : '0';
            data.St11 = (this.scope.conforme.CertifInscrip) ? '1' : '0';
            data.St12 = (this.scope.conforme.Licencia) ? '1' : '0';
            data.St13 = (this.scope.conforme.NroDespacho) ? '1' : '0';
            data.St14 = (this.scope.conforme.MarcaVehiculo) ? '1' : '0';

            sap.ui.core.BusyIndicator.show(0);
            var oModelService = this.getView().getModel('service');
            oModelService.create("/GuardarPrecintosSet", data, {
                success: function(oResponse, oHeader) {
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
                        othat.onCloseDialogTransporte(true);
                    }
                },
                error: function(oError, oHeader) {
                    console.log(oError);
                    sap.ui.core.BusyIndicator.hide();
                    var msgError = othat._processErrorOdata(oError);
                    MessageBox.error(
                        msgError, {
                            styleClass: "sapUiSizeCompact",
                            onClose: function(oAction) {

                            }
                        }
                    );
                }
            });
        },

        onDarSalida: async function() {
            let othat = this;
            let oModelCont = this.getView().getModel('contenedores').getData();

            let contForSend = [];
            contForSend = oModelCont.filter(function(obj) {
                return obj.DarSalida;
            });

            if (contForSend.length < 1) {
                sap.m.MessageToast.show("Es necesario seleccionar al menos un elemento");
                return;
            }

            let sOdata = "/GuardarPrecintosSet";
            let arrPromises = []

            contForSend.forEach(element => {
                arrPromises.push(_ => new Promise((resolve, reject) => {
                    const oModelService = othat.getView().getModel('service');
                    let dataSend = {};

                    dataSend.Pedido = element.Pedido;
                    dataSend.Conductor = element.Conductor;
                    dataSend.Contenedor = element.Contenedor;
                    dataSend.Booking = element.Booking;
                    dataSend.Senasa = element.Senasa;
                    dataSend.Planta = element.Planta;
                    dataSend.Aduana = element.Aduana;
                    dataSend.Linea = element.Linea;
                    dataSend.Operador = element.Operador;
                    dataSend.PlacaTracto = element.PlacaTracto;
                    dataSend.PlacaCarreta = element.PlacaCarreta;
                    dataSend.CertifInscrip = element.CertifInscrip;
                    dataSend.Licencia = element.Licencia;
                    dataSend.NroDespacho = element.NroDespacho;
                    dataSend.MarcaVehiculo = element.MarcaVehiculo;
                    dataSend.StatusSalida = "S";
                    dataSend.St01 = element.St01;
                    dataSend.St02 = element.St02;
                    dataSend.St03 = element.St03;
                    dataSend.St04 = element.St04;
                    dataSend.St05 = element.St05;
                    dataSend.St06 = element.St06;
                    dataSend.St07 = element.St07;
                    dataSend.St08 = element.St08;
                    dataSend.St09 = element.St09;
                    dataSend.St10 = element.St10;
                    dataSend.St11 = element.St11;
                    dataSend.St12 = element.St12;
                    dataSend.St13 = element.St13;
                    dataSend.St14 = element.St14;

                    //const oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0024_SRV_03", { defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put, "useBatch": false });
                    oModelService.create(sOdata, dataSend, {
                        success: async function(oResponse, oHeader) {
                            resolve(oResponse);
                        },
                        error: function(error) {
                            resolve(error);
                        }
                    });
                }));
            });

            let responses = [];
            sap.ui.core.BusyIndicator.show(0);
            for (let promise of arrPromises) {
                responses.push(await promise());
            }
            sap.ui.core.BusyIndicator.hide();

            var msgError = "";
            let msgSuccess = 0;
            responses.forEach(oResponse => {
                let msg = othat._processErrorOdata(oResponse);
                if (msg != "") {
                    msgError += msg + "\n\r";
                } else {
                    msgSuccess++;
                }
            });

            if (msgError != "") {
                if (msgSuccess > 0) {
                    msgError = "Algunas solicitudes pudieron guardarse, sin embargo, se tuvieron los siguientes errores: \n\r" + msgError;
                }
                MessageBox.error(
                    msgError, {
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oAction) {
                            othat.onFilter();
                        }
                    }
                );
            } else {
                MessageBox.success(
                    "La salida fue exitosa", {
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oAction) {
                            othat.onFilter();
                        }
                    }
                );
            }
        },


        _getDialogTransporte: function() {
            if (!this.oDialogTransporte) {
                this.oDialogTransporte = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.BASCValContEWM.fragments.DetailBASC', this);
                this.getView().addDependent(this.oDialogTransporte);
            }
            return this.oDialogTransporte;
        },

        onCloseDialogTransporte: function(reload = false) {
            this._getDialogTransporte().close();
            if (typeof reload === "boolean" && reload) {
                this.onFilter();
            }
        },

        onAfterCloseDialogTransporte: function(reload = false) {
            this._getDialogTransporte().destroy();
            delete this.oDialogTransporte;
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
        },
        onChangeConformidad: function(oEvent){
            /* let sPropiedad = oEvent.getSource().data().propiedadRelacionada
            delete this.getView().getModel("scope").getData().noConformeFields[sPropiedad];
            this.getView().getModel("scope").refresh(); */
        }

    });

});