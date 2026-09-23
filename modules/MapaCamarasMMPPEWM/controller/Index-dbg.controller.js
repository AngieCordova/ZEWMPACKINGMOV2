sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function (Controller, formatter, JSONModel, MensajesObject) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.MapaCamarasMMPPEWM.controller.Index", {

        formatter: formatter,
        scope: {
            "filtrado": {},
            "blnShowButton": true,    //SCH 30.04.2025-Mostrar ubicaciones
        },
        dataBus: {},
        arrData: [],
        arrDataIzq: [],
        arrDataDer: [],

        onAfterRendering: function () { },

        onInit: function () {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "MapaCamarasMMPPEWM", this._busSuscribe, this);

            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0020_SRV", { "useBatch": false });
            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelDetail, "camarasIzq");
            this.getView().setModel(oModelDetail, "camarasDer");
                       
            //Inicio-//SCH 30.04.2025-Mostrar ubicaciones
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            this.scope.blnShowButton = sCentro === '1401' ? true : false;   
            
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");            
            
            //Fin-//SCH 30.04.2025-Mostrar ubicaciones
            
        },

        _busSuscribe: function (channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function () {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        handleFilter: function () {
            sap.ui.core.BusyIndicator.show(0);
            /*
            for (let i in this.scope.filtrado) {
                console.log(i);
                console.log(this.scope.filtrado[i]);
            }
            */
            var othat = this;
            for (let i in othat.scope.filtrado) {
                if (othat.scope.filtrado[i] && othat.scope.filtrado[i] != "") {
                    othat.arrDataDer.forEach(function (element) {
                        element.rows.forEach(function (rows) {
                            /*
                            console.log("--------------------");
                            console.log("Dato " + rows[i].toString().toUpperCase());
                            console.log("Filtro " + othat.scope.filtrado[i].toString().toUpperCase());
                            console.log("indexOf");
                            console.log(rows[i].toString().toUpperCase().indexOf(othat.scope.filtrado[i].toString().toUpperCase()));
                            */
                            if (rows[i].toString().toUpperCase().indexOf(othat.scope.filtrado[i].toString().toUpperCase()) >= 0) {
                                rows.visible = true;
                                rows.blink = "ACTIVO";
                            } else {
                                rows.visible = false;
                                rows.blink = "";
                            }
                        });
                    });

                    othat.arrDataIzq.forEach(function (element) {
                        element.rows.forEach(function (rows) {
                            if (rows[i].toString().toUpperCase().indexOf(othat.scope.filtrado[i].toString().toUpperCase()) >= 0) {
                                rows.visible = true;
                                rows.blink = "ACTIVO";
                            } else {
                                rows.visible = false;
                                rows.blink = "";
                            }
                        });
                    });

                }
            }
            var oModelIzq = new sap.ui.model.json.JSONModel(othat.arrDataIzq);
            othat.getView().setModel(oModelIzq, "camarasIzq");
            var oModelDer = new sap.ui.model.json.JSONModel(othat.arrDataDer);
            othat.getView().setModel(oModelDer, "camarasDer");
            sap.ui.core.BusyIndicator.hide();
        },

        handleCleanFilter: function () {
            sap.ui.core.BusyIndicator.show(0);
            var othat = this;
            for (let i in othat.scope.filtrado) {
                othat.scope.filtrado[i] = "";
            }
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            othat.arrDataIzq.forEach(function (element) {
                element.rows.forEach(function (rows) {
                    rows.visible = true;
                    rows.blink = "";
                });
            });
            othat.arrDataDer.forEach(function (element) {
                element.rows.forEach(function (rows) {
                    rows.visible = true;
                    rows.blink = "";
                });
            });
            var oModelIzq = new sap.ui.model.json.JSONModel(othat.arrDataIzq);
            othat.getView().setModel(oModelIzq, "camarasIzq");
            var oModelDer = new sap.ui.model.json.JSONModel(othat.arrDataDer);
            othat.getView().setModel(oModelDer, "camarasDer");
            sap.ui.core.BusyIndicator.hide();
        },

        onSelectUbicacion: function (sUbicacion) {
            sap.ui.core.BusyIndicator.show(0);
            var othat = this;
            for (let i in othat.scope.filtrado) {
                othat.scope.filtrado[i] = "";
            }
            othat.arrDataIzq = [];
            othat.arrDataDer = [];
            var oModel = new sap.ui.model.json.JSONModel(othat.arrData);
            othat.getView().setModel(oModel, "camarasIzq");
            othat.getView().setModel(oModel, "camarasDer");
            this.scope.ubicacion = sUbicacion;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            var oModelService = this.getView().getModel('service');
            //DG - Inicio
            // debugger
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin
            oModelService.read("/CamarasSet", {
                //DG - Inicio
                // filters: [new sap.ui.model.Filter("I_lgpla", sap.ui.model.FilterOperator.EQ, sUbicacion)],
                filters: [new sap.ui.model.Filter("I_lgpla", sap.ui.model.FilterOperator.EQ, sUbicacion),
                new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)],
                //DG - Fin
                success: function (result, response) {
                    var data = {};
                    result.results.forEach(function (camara) {
                        if (camara.Zlado != 'DE') {
                            if (data[camara.Ubicacion] == undefined) { data[camara.Ubicacion] = []; }
                            camara.visible = true;
                            camara.blink = "";
                            data[camara.Ubicacion].push(camara);
                        }
                    });
                    for (let i in data) {
                        var objtmp = { 'name': i, 'rows': data[i] };
                        othat.arrDataIzq.push(objtmp);
                    }
                    //console.log(othat.arrDataIzq);
                    var oModelIzq = new sap.ui.model.json.JSONModel(othat.arrDataIzq);
                    othat.getView().setModel(oModelIzq, "camarasIzq");

                    var data = {};
                    result.results.forEach(function (camara) {
                        if (camara.Zlado == 'DE') {
                            if (data[camara.Ubicacion] == undefined) { data[camara.Ubicacion] = []; }
                            camara.visible = true;
                            camara.blink = "";
                            data[camara.Ubicacion].push(camara);
                        }
                    });
                    for (let i in data) {
                        var objtmp = { 'name': i, 'rows': data[i] };
                        othat.arrDataDer.push(objtmp);
                    }
                    //console.log(othat.arrDataDer);
                    var oModelDer = new sap.ui.model.json.JSONModel(othat.arrDataDer);
                    othat.getView().setModel(oModelDer, "camarasDer");

                    sap.ui.core.BusyIndicator.hide();
                },
                error: function (error) {
                    console.log(error);
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        onShowUbicacion: function (sUbicacion, sPosicion, sZlado) {
            this._getDialog().open();
            let dataSearch = [];
            if (sZlado == 'DE') {
                dataSearch = this.arrDataDer;
            } else {
                dataSearch = this.arrDataIzq;
            }
            const found = dataSearch.find(val => val.name == sUbicacion);
            const aNav = found.rows.find(val => val.Posicion == sPosicion);
            var oModel = new sap.ui.model.json.JSONModel(JSON.parse(JSON.stringify(aNav)));
            this.getView().setModel(oModel, "dialogData");
        },

        _getDialog: function () {
            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.MapaCamarasMMPPEWM.fragments.AsignarModal', this);
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