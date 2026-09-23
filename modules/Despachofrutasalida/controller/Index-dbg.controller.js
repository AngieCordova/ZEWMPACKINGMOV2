sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function (Controller, formatter, JSONModel, MensajesObject) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.Despachofrutasalida.controller.Index", {

        formatter: formatter,
        dataBus: {},
        listinicio: 0,
        oGlobalFechaD: "",
        oGlobalFechaH: "",
        oGlobalFechaZ: "",

        idpedido: "",
        scopeDS: {
            "IdPedido": "",

        },
        onInit: async function () {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "DespachofrutasalidaIndexView", this._busSuscribe, this);

            var oView = this.getView();
            var oTable = oView.byId("table-pedidos_despachod");
            var oThis = this;
            var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0005_SRV");

            oTable.setBusyIndicatorDelay(100);
            oTable.setBusy(true);
            //DG - Inicio
            var sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin
            var oResponse = await new Promise(resolve => {
                oData.read("/PedidosSet", {
                    //DG - Inicio
                    filters: [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)],
                    //DG - Fin&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    "success": function (response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": async function (error) {
                        resolve([]);
                    }
                });
            });

            oTable.setBusy(false);

            oView.setModel(oData, "ZEWM_0005");

            oView.setModel(new JSONModel(oResponse), "mListaContenedoresAsignar");

            var oThis = this;
            var oModelz = oThis.getView().getModel("myParam");
            this.funFechaActual();
            //DG - Inicio
            // var texto7 = "/sap/bc/ZPPWS_DESP_IND/G_DESPA_LIST/1401/T/T/"+this.oGlobalFechaD+"/"+this.oGlobalFechaH+"/P06/P07/P08";
            var texto7 = "/sap/bc/ZPPWS_DESP_IND/G_DESPA_LIST/" + sCentro + "/T/T/" + this.oGlobalFechaD + "/" + this.oGlobalFechaH + "/P06/P07/P08";
            //DG - Fin
            var oModelC2 = new sap.ui.model.json.JSONModel(texto7, false);
            console.log(oModelC2);
            oModelC2.attachRequestCompleted(function () {
                try {

                    var cont2 = oModelC2.getProperty("/ITAB");
                    console.log(cont2);
                    oModelz.setProperty("/mListaPedDespacho", cont2);

                } catch (err) {

                }
            }.bind(this));
            var oThis = this;
            var oModel = oThis.getView().getModel("myParam");
            var oDateDesde = new Date();
            var oDateHasta = new Date();
            oDateDesde.setDate(oDateHasta.getDate() - 30);
            oModel.setProperty("/fechaDesdeV1", oDateDesde);
            oModel.setProperty("/fechaHastaV1", oDateHasta);
            var texto5 = "/sap/bc/ZPPWS_DESP_IND/G_CEN_LIST/P01/P02/P03/P04/P05/P06/P07/P08";
            var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
            console.log(oModelC);
            oModelC.attachRequestCompleted(function () {
                try {

                    var cont = oModelC.getProperty("/ITAB");
                    console.log(cont);
                    oModel.setProperty("/tbl_T_CENTRO_ResultadoV1", cont);
                    //DG - Inicio
                    oModel.setProperty("/tbl_T_CENTRO_ResultadodefaultV1", sCentro);
                    //    oModel.setProperty("/tbl_T_CENTRO_ResultadodefaultV1", "1401");
                    //DG - Fin
                    //(this.listinicio1==0)?sap.ui.getCore().byId("idcentro").setSelectedKey("1401"):"";
                    //this.listinicio1=1;

                } catch (err) {

                }
            }.bind(this));
            var texto4 = "/sap/bc/ZPPWS_DESP_IND/G_ESTDESP_LIST/P01/P02/P03/P04/P05/P06/P07/P08";
            var oModelC4 = new sap.ui.model.json.JSONModel(texto4, false);
            console.log(oModelC4);
            oModelC4.attachRequestCompleted(function () {
                try {

                    var cont4 = oModelC4.getProperty("/ITAB");
                    console.log(cont4);
                    oModel.setProperty("/tbl_T_ESTADO_ResultadoV1", cont4);
                    oModel.setProperty("/tbl_T_ESTADO_ResultadodefaultV1", "T");
                    //(this.listinicio1==0)?sap.ui.getCore().byId("idcentro").setSelectedKey("1401"):"";
                    //this.listinicio1=1;

                } catch (err) {

                }
            }.bind(this));
            var texto6 = "/sap/bc/ZPPWS_DESP_IND/G_TIPDOC_LIST/P01/P02/P03/P04/P05/P06/P07/P08";
            var oModelC1 = new sap.ui.model.json.JSONModel(texto6, false);
            console.log(oModelC1);
            oModelC1.attachRequestCompleted(function () {
                try {

                    var cont1 = oModelC1.getProperty("/ITAB");
                    console.log(cont1);
                    oModel.setProperty("/tbl_T_TIPO_ResultadoV1", cont1);
                    oModel.setProperty("/tbl_T_TIPO_ResultadodefaultV1", "T");
                    //(this.listinicio2==0)?sap.ui.getCore().byId("idtipodoc").setSelectedKeys("T"):"";
                    //this.listinicio2=1;

                } catch (err) {

                }
            }.bind(this));

        },
        funFechaActual: function () {
            var oDateDesde = new Date();
            var oDateHasta = new Date();
            oDateDesde.setDate(oDateHasta.getDate() - 30);
            // Llamar modelo
            var oThis = this;
            var oModel = oThis.getView().getModel("myParam");
            var oFechaSistema = new Date();

            var oAnio = oFechaSistema.getFullYear();
            var oMes = oFechaSistema.getMonth() + 1;
            var oMesD = oDateDesde.getMonth() + 1;
            var oMesH = oDateHasta.getMonth() + 1;
            var oDia = oFechaSistema.getDate();


            oAnio = oAnio.toString();
            oMes = oMes.toString();
            oDia = oDia.toString();

            var oAnioD = oDateDesde.getFullYear().toString();
            oMesD = oMesD.toString();
            var oDiaD = oDateDesde.getDate().toString();

            var oAnioH = oDateHasta.getFullYear().toString();
            oMesH = oMesH.toString();
            var oDiaH = oDateHasta.getDate().toString();

            if (oDia.length === 1) {
                oDia = "0" + oDia;
            }
            if (oMes.length === 1) {
                oMes = "0" + oMes;
            }

            if (oDiaD.length === 1) {
                oDiaD = "0" + oDiaD;
            }
            if (oMesD.length === 1) {
                oMesD = "0" + oMesD;
            }
            if (oDiaH.length === 1) {
                oDiaH = "0" + oDiaH;
            }

            if (oMesH.length === 1) {
                oMesH = "0" + oMesH;
            }
            var oFechaZ = oAnio.toString() + oMes + oDia;
            var oFechaD = oAnioD.toString() + oMesD + oDiaD;
            var oFechaH = oAnioH.toString() + oMesH + oDiaH;
            this.oGlobalFechaZ = oFechaZ;
            this.oGlobalFechaD = oFechaD;
            this.oGlobalFechaH = oFechaH;

            return oFechaZ;
        },
        _busSuscribe: function (channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function () {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },
        onCellClick: function (oEvent) {

            var object = oEvent.getSource().getBindingContext("myParam").getObject();//oBinding.getObject();

            this.onSiguientePaginaGuardado(object);
        },
        onSiguientePaginaGuardado: function (object) {
            this.idpedido = object.NRO_DOC;
            this.scopeDS.IdPedido = object.NRO_DOC;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scopeDS);
            this.getView().setModel(oModelScope, "scopeDS");
            this._getDialogReporteCamion().open();
        },
        _getDialogReporteCamion: function () {
            if (!this.oDialogReporteCamion) {
                this.oDialogReporteCamion = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.Despachofrutasalida.fragments.DialogFilter', this);
                this.getView().addDependent(this.oDialogReporteCamion);
            }
            return this.oDialogReporteCamion;
        },
        onCloseDialogReporteCamion: function () {
            this._getDialogReporteCamion().close();
        },
        onprueba: function (oEvent) {
            var oThis = this;
            var texto5 = "/sap/bc/ZPPWS_DESP_IND/G_CEN_LIST/P01/P02/P03/P04/P05/P06/P07/P08";
            var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
            console.log(oModelC);
            oModelC.attachRequestCompleted(function () {
                try {

                    var cont = oModelC.getProperty("/ITAB");
                    console.log(oModelC.getProperty("/ITAB"));

                } catch (err) {

                }
            }.bind(this));
        },
        onRefresh: function (oEvent) {
            var oThis = this;
            try {
                var oModelz = oThis.getView().getModel("myParam");
                var ocentro = oModelz.getProperty("/tbl_T_CENTRO_ResultadodefaultV1");
                var otipodef = oModelz.getProperty("/tbl_T_TIPO_ResultadodefaultV1");
                var oestadodef = oModelz.getProperty("/tbl_T_ESTADO_ResultadodefaultV1");
                var oFechaDesdeV = (oModelz.getProperty("/fechaDesdeVV1") == undefined) ? this.oGlobalFechaD : oModelz.getProperty("/fechaDesdeVV1");
                var oFechaHastaV = (oModelz.getProperty("/fechaHastaVV1") == undefined) ? this.oGlobalFechaH : oModelz.getProperty("/fechaHastaVV1");

                var otipo = otipodef.toString().replace(/,/g, "");
                var oModel = oThis.getView().getModel("myParam");
                console.log(otipodef);
                ///sap/bc/ZPPWS_DESP_IND/G_DESPA_LIST/1401/T/T/20220101/20220130/P06/P07/P08
                var texto7 = "/sap/bc/ZPPWS_DESP_IND/G_DESPA_LIST/" + ocentro + "/" + otipo + "/" + oestadodef + "/" + oFechaDesdeV + "/" + oFechaHastaV + "/P06/P07/P08";
                var oModelC2 = new sap.ui.model.json.JSONModel(texto7, false);
                console.log(oModelC2);
                oModelC2.attachRequestCompleted(function (oEvent) {
                    try {

                        var cont2 = oModelC2.getProperty("/ITAB");
                        console.log(cont2);
                        if (cont2 == undefined) {
                            var cont20e = oEvent.mParameters.errorobject.responseText;
                            var oVectorSis = JSON.parse(cont20e);
                            var vector = [];
                            var llave = {};
                            console.log(JSON.parse(cont20e));
                            for (var r = 0; r < oVectorSis.ITAB.length; r++) {
                                llave = {};
                                if (oVectorSis.ITAB[r].TYPE === "E") {
                                    llave.type = "Error";
                                    llave.title = "Mensaje de error";
                                    llave.subtitle = oVectorSis.ITAB[r].MESSAGE;
                                    llave.subdetalle = "";
                                    vector.push(llave);
                                }
                            }
                            console.log(vector);
                            oModel.setProperty("/ERRORES2", vector);
                            this.handleMessageViewPresstras();
                            oModelz.setProperty("/mListaPedDespacho", []);
                        } else {
                            oModelz.setProperty("/mListaPedDespacho", cont2);
                        }



                    } catch (err) {

                    }
                }.bind(this));
            } catch (err) {
                sap.m.MessageToast.show("Se requiere realizar un búsqueda.");
            }

        },
        onactualiza: function () {

            var oThis = this;
            try {
                var oModelz = oThis.getView().getModel("myParam");
                var ocentro = oModelz.getProperty("/tbl_T_CENTRO_ResultadodefaultV1");
                var otipodef = oModelz.getProperty("/tbl_T_TIPO_ResultadodefaultV1");
                var oestadodef = oModelz.getProperty("/tbl_T_ESTADO_ResultadodefaultV1");
                var oFechaDesdeV = (oModelz.getProperty("/fechaDesdeVV1") == undefined) ? this.oGlobalFechaD : oModelz.getProperty("/fechaDesdeVV1");
                var oFechaHastaV = (oModelz.getProperty("/fechaHastaVV1") == undefined) ? this.oGlobalFechaH : oModelz.getProperty("/fechaHastaVV1");

                var otipo = otipodef.toString().replace(/,/g, "");
                var oModel = oThis.getView().getModel("myParam");
                console.log(otipodef);
                ///sap/bc/ZPPWS_DESP_IND/G_DESPA_LIST/1401/T/T/20220101/20220130/P06/P07/P08
                var texto7 = "/sap/bc/ZPPWS_DESP_IND/G_DESPA_LIST/" + ocentro + "/" + otipo + "/" + oestadodef + "/" + oFechaDesdeV + "/" + oFechaHastaV + "/P06/P07/P08";
                var oModelC2 = new sap.ui.model.json.JSONModel(texto7, false);
                console.log(oModelC2);
                oModelC2.attachRequestCompleted(function (oEvent) {
                    try {

                        var cont2 = oModelC2.getProperty("/ITAB");
                        console.log(cont2);
                        if (cont2 == undefined) {
                            var cont20e = oEvent.mParameters.errorobject.responseText;
                            var oVectorSis = JSON.parse(cont20e);
                            var vector = [];
                            var llave = {};
                            console.log(JSON.parse(cont20e));
                            for (var r = 0; r < oVectorSis.ITAB.length; r++) {
                                llave = {};
                                if (oVectorSis.ITAB[r].TYPE === "E") {
                                    llave.type = "Error";
                                    llave.title = "Mensaje de error";
                                    llave.subtitle = oVectorSis.ITAB[r].MESSAGE;
                                    llave.subdetalle = "";
                                    vector.push(llave);
                                }
                            }
                            console.log(vector);
                            oModel.setProperty("/ERRORES2", vector);

                            oModelz.setProperty("/mListaPedDespacho", []);
                        } else {
                            oModelz.setProperty("/mListaPedDespacho", cont2);
                        }



                    } catch (err) {

                    }
                }.bind(this));
            } catch (err) {
                sap.m.MessageToast.show("Se requiere realizar un búsqueda.");
            }

        },
        onFiltros: function (oEvent) {

            var oThis = this;
            var oModel = oThis.getView().getModel("myParam");

            sap.ui.getCore().setModel(oModel);
            var oApproveDialog = new sap.m.Dialog({
                type: "Message",
                contentWidth: "700px",
                title: "Filtros",
                content: [
                    new sap.m.Label({
                        text: "Centro",

                    }),
                    new sap.m.ComboBox({
                        id: "idcentro",

                        items: {
                            path: "/tbl_T_CENTRO_ResultadoV1",
                            template: new sap.ui.core.Item({
                                key: "{WERKS}",
                                text: "{WERKS} | {NAME1_WERKS}"
                            })
                        },
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: "Tipo de documento",
                        labelFor: "idtipodoc"
                    }),
                    new sap.m.MultiComboBox({
                        id: "idtipodoc",
                        selectionFinish: function (oEvent) {
                            var selectedItems = oEvent.getParameter("selectedItems");
                            var messageText = "Event 'selectionFinished': [";

                            for (var i = 0; i < selectedItems.length; i++) {
                                messageText += "'" + selectedItems[i].getKey() + "'";
                                if (i != selectedItems.length - 1) {
                                    messageText += ",";
                                }
                            }

                            messageText += "]";
                            console.log(messageText);
                            if (selectedItems.length == 0) {
                                sap.ui.getCore().byId("idFiltrarDatos").setEnabled(false);
                            } else {
                                sap.ui.getCore().byId("idFiltrarDatos").setEnabled(true);
                            }

                        },
                        items: {
                            path: "/tbl_T_TIPO_ResultadoV1",
                            template: new sap.ui.core.Item({
                                key: "{TIP_DOC}",
                                text: "{TIP_DOC}: {TIP_DOC_DES}"
                            })
                        },
                        width: "100%"
                    }),

                    new sap.m.Label({
                        text: "Estado",

                    }),
                    new sap.m.MultiComboBox({
                        id: "idestado",
                        selectionFinish: function (oEvent) {
                            var selectedItems = oEvent.getParameter("selectedItems");
                            var messageText = "Event 'selectionFinished': [";

                            for (var i = 0; i < selectedItems.length; i++) {
                                messageText += "'" + selectedItems[i].getKey() + "'";
                                if (i != selectedItems.length - 1) {
                                    messageText += ",";
                                }
                            }

                            messageText += "]";
                            console.log(messageText);
                            if (selectedItems.length == 0) {
                                sap.ui.getCore().byId("idFiltrarDatos").setEnabled(false);
                            } else {
                                sap.ui.getCore().byId("idFiltrarDatos").setEnabled(true);
                            }

                        },
                        items: {
                            path: "/tbl_T_ESTADO_ResultadoV1",
                            template: new sap.ui.core.Item({
                                key: "{EST_DOC}",
                                text: "{EST_DOC}: {EST_DOC_DES}"
                            })
                        },
                        width: "100%"
                    }),

                    new sap.m.Label({
                        text: "Fecha",
                        wrapping: true,
                        width: "100%"
                    }),
                    new sap.m.Toolbar({
                        height: "auto",
                        width: "100%",
                        content: [new sap.m.Label({
                            text: "Fecha desde: ",
                            width: "40%",
                            textAlign: "Left",
                            design: "Bold"
                        }),
                        new sap.m.DatePicker("idFecDesdePED", {
                            valueStateText: "El campo fecha desde no debe estar vacío.",
                            valueFormat: "yyyyMMdd",
                            displayFormat: "dd/MM/yyyy",
                            dateValue: oModel.getProperty("/fechaDesdeV1"),
                            width: "60%",
                            change: function (evt) {
                                var oFechaRangoInicio = evt.getSource().getValue();
                                var oFechaRangoHasta = sap.ui.getCore().byId("idFecHastaPED").getValue();
                                if (oFechaRangoInicio <= oFechaRangoHasta) {
                                    sap.ui.getCore().byId("idMensaje").setVisible(false);
                                    sap.ui.getCore().byId("idFiltrarDatos").setEnabled(true);
                                } else {
                                    sap.ui.getCore().byId("idMensaje").setVisible(true);
                                    sap.ui.getCore().byId("idFiltrarDatos").setEnabled(false);
                                }



                            }.bind(this)
                        })]
                    }),
                    new sap.m.Toolbar({
                        height: "auto",
                        width: "100%",
                        content: [new sap.m.Label({
                            text: "Fecha hasta: ",
                            width: "40%",
                            textAlign: "Left",

                        }).addStyleClass("lbltxtGen"),
                        new sap.m.DatePicker("idFecHastaPED", {
                            valueStateText: "El campo fecha hasta no debe estar vacío.",
                            valueFormat: "yyyyMMdd",
                            displayFormat: "dd/MM/yyyy",
                            dateValue: oModel.getProperty("/fechaHastaV1"),
                            width: "60%",
                            change: function (evt) {
                                var oFechaRangoInicio = sap.ui.getCore().byId("idFecDesdePED").getValue();
                                var oFechaRangoHasta = evt.getSource().getValue();
                                if (oFechaRangoInicio <= oFechaRangoHasta) {
                                    sap.ui.getCore().byId("idMensaje").setVisible(false);
                                    sap.ui.getCore().byId("idFiltrarDatos").setEnabled(true);
                                } else {
                                    sap.ui.getCore().byId("idMensaje").setVisible(true);
                                    sap.ui.getCore().byId("idFiltrarDatos").setEnabled(false);
                                }


                            }.bind(this)
                        }).addStyleClass("dpGen")]
                    }).addStyleClass("sapUiTinyMarginTop"),
                    new sap.m.MessageStrip("idMensaje", {
                        text: "La fecha inicial es mayor que la fecha final",
                        visible: false,
                        type: "Error"
                    }).addStyleClass("sapUiTinyMarginTop"),
                ],
                afterOpen: function () {
                    //DG - Inicio
                    const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
                    //DG - Fin
                    var ocentrodef = oModel.getProperty("/tbl_T_CENTRO_ResultadodefaultV1");
                    //DG - Inicio&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    // (this.listinicio1 == 0) ? sap.ui.getCore().byId("idcentro").setSelectedKey("1401") : sap.ui.getCore().byId("idcentro").setSelectedKey(ocentrodef);
                    (this.listinicio1 == 0) ? sap.ui.getCore().byId("idcentro").setSelectedKey(sCentro) : sap.ui.getCore().byId("idcentro").setSelectedKey(ocentrodef);
                    //DG - Fin
                    this.listinicio1 = 1;
                    var otipodef = oModel.getProperty("/tbl_T_TIPO_ResultadodefaultV1");
                    (this.listinicio2 == 0) ? sap.ui.getCore().byId("idtipodoc").setSelectedKeys("T") : sap.ui.getCore().byId("idtipodoc").setSelectedKeys(otipodef);
                    this.listinicio2 = 1;
                    var oestadodef = oModel.getProperty("/tbl_T_ESTADO_ResultadodefaultV1");
                    (this.listinicio1 == 0) ? sap.ui.getCore().byId("idestado").setSelectedKeys("T") : sap.ui.getCore().byId("idestado").setSelectedKeys(oestadodef);
                    this.listinicio1 = 1;
                    sap.ui.getCore().byId("idFecDesdePED").setEnabled(true);
                    sap.ui.getCore().byId("idFecHastaPED").setEnabled(true);

                },
                beginButton: new sap.m.Button("idFiltrarDatos", {

                    enabled: true,
                    text: 'Buscar pedido',
                    press: function () {
                        var oValidarFecha = true;

                        var inputs = [
                            sap.ui.getCore().byId("idcentro"),
                            sap.ui.getCore().byId("idFecDesdePED"),
                            sap.ui.getCore().byId("idFecHastaPED")
                        ];
                        jQuery.each(inputs, function (i, input) {
                            if (!input.getValue()) {
                                input.setValueState("Error");
                                oValidarFecha = false;
                            } else {
                                input.setValueState("None");
                            }
                        });

                        //othat._desasignarSearch(sap.ui.getCore().byId("idcentro").getValue());
                        if (oValidarFecha) {
                            var oFechaDesde = sap.ui.getCore().byId("idFecDesdePED").getDateValue();
                            var oFechaHasta = sap.ui.getCore().byId("idFecHastaPED").getDateValue();
                            var oFechaDesdeV = sap.ui.getCore().byId("idFecDesdePED").getValue();
                            var oFecHastaV = sap.ui.getCore().byId("idFecHastaPED").getValue();
                            var oCentro = sap.ui.getCore().byId("idcentro").getSelectedKey();
                            var oEstado = sap.ui.getCore().byId("idestado").getSelectedKeys();
                            var oTipos = sap.ui.getCore().byId("idtipodoc").getSelectedKeys();
                            oModel.setProperty("/fechaDesdeV1", oFechaDesde);
                            oModel.setProperty("/fechaHastaV1", oFechaHasta);
                            oModel.setProperty("/fechaDesdeVV1", oFechaDesdeV);
                            oModel.setProperty("/fechaHastaVV1", oFecHastaV);
                            oModel.setProperty("/tbl_T_CENTRO_ResultadodefaultV1", oCentro);
                            oModel.setProperty("/tbl_T_TIPO_ResultadodefaultV1", oTipos);
                            oModel.setProperty("/tbl_T_ESTADO_ResultadodefaultV1", oEstado);
                            //sap.ui.getCore().byId("idcentro").setSelectedKey(oCentro);
                            if (oFechaDesdeV <= oFecHastaV || oFechaDesdeV == oFecHastaV) {
                                console.log(sap.ui.getCore().byId("idcentro").getSelectedKey());
                                sap.ui.getCore().byId("idtipodoc").getSelectedKeys()
                                var oThis = this;
                                var oModelz = this.getView().getModel("myParam");
                                var otipodef = oModelz.getProperty("/tbl_T_TIPO_ResultadodefaultV1");
                                ///sap/bc/ZPPWS_DESP_IND/G_DESPA_LIST/1401/T/T/20220101/20220130/P06/P07/P08
                                var texto00 = "/sap/bc/ZPPWS_DESP_IND/G_DESPA_LIST/" + oCentro + "/" + otipodef + "/" + oEstado + "/" + oFechaDesdeV + "/" + oFecHastaV + "/P06/P07/P08";
                                var oModelC20 = new sap.ui.model.json.JSONModel(texto00, false);
                                console.log(oModelC20);
                                oModelC20.attachRequestCompleted(function (oEvent) {
                                    try {

                                        var cont20 = oModelC20.getProperty("/ITAB");
                                        if (cont20 == undefined) {
                                            var cont20e = oEvent.mParameters.errorobject.responseText;
                                            var oVectorSis = JSON.parse(cont20e);
                                            var vector = [];
                                            var llave = {};
                                            console.log(JSON.parse(cont20e));
                                            for (var r = 0; r < oVectorSis.ITAB.length; r++) {
                                                llave = {};
                                                if (oVectorSis.ITAB[r].TYPE === "E") {
                                                    llave.type = "Error";
                                                    llave.title = "Mensaje de error";
                                                    llave.subtitle = oVectorSis.ITAB[r].MESSAGE;
                                                    llave.subdetalle = "";
                                                    vector.push(llave);
                                                }
                                                if (oVectorSis.ITAB[r].TYPE == "W") {
                                                    llave.type = "Warning";
                                                    llave.title = "Mensaje de alerta";
                                                    llave.subtitle = oVectorSis.ITAB[r].MESSAGE;
                                                    llave.subdetalle = "";
                                                    vector.push(llave);
                                                }
                                            }
                                            console.log(vector);
                                            oModel.setProperty("/ERRORES2", vector);
                                            this.handleMessageViewPresstras();
                                            oModelz.setProperty("/mListaPedDespacho", []);
                                        }
                                        //var filter= sap.ui.getCore().byId("idtipodoc").getSelectedKeys();
                                        //var arrayf= (filter.find((x)=>x!="T"))?cont20.filter(e=>filter.find(x=>x === e.TIP_DOC)):cont20;
                                        oModelz.setProperty("/mListaPedDespacho", cont20);

                                    } catch (err) {
                                        console.log(err);
                                        console.log("error sin datos");
                                        oModelz.setProperty("/mListaPedDespacho", []);
                                    }
                                }.bind(this));

                            } else {

                            }
                        } else {
                            sap.m.MessageToast.show("Se requiere ingresar todos los campos.");
                        }



                        oApproveDialog.close();
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    text: 'Cancelar',
                    press: function () {
                        oApproveDialog.close();
                    }
                }),
                afterClose: function () {
                    oApproveDialog.destroy();
                }
            });

            oApproveDialog.open();


        },

        onFiltrarTabla: function (oEvent) {
            var oSource = oEvent.getSource();
            var oValue = oSource.getValue();


            var oFilter;
            var orFilter = [];
            oFilter = new sap.ui.model.Filter("TIP_DOC_DES", sap.ui.model.FilterOperator.Contains, oValue.toString());
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("NRO_DOC", sap.ui.model.FilterOperator.Contains, oValue.toString());
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("XBLNR", sap.ui.model.FilterOperator.Contains, oValue.toString());
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("EST_DOC_DES", sap.ui.model.FilterOperator.Contains, oValue.toString());
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("TRANSPORTISTA", sap.ui.model.FilterOperator.Contains, oValue.toString());
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("NAME1", sap.ui.model.FilterOperator.Contains, oValue.toString());
            orFilter.push(oFilter);
            var oTable = this.getView().byId("table-pedidos_despachod");
            var binding = oTable.getBinding("items");
            binding.filter(new sap.ui.model.Filter(orFilter, false), "Application");
        },
        handleMessageViewPresstras: function () {

            var oThis = this;
            var oModel = this.getView().getModel("myParam");
            var oMessageTemplate = new sap.m.MessageItem({
                type: "{type}",
                title: '{title}',
                subtitle: '{subtitle}'
            });
            var oMessageView = new sap.m.MessageView({
                showDetailsPageHeader: true,
                items: {
                    path: "/ERRORES2",
                    template: oMessageTemplate
                }
            });
            var conteo = oModel.getProperty("/ERRORES2").length + 1;
            var tamaño = (conteo > 0) ? 54 * conteo : 2;

            oMessageView.setModel(oModel);
            var dialogError = new sap.m.Dialog({
                title: "Bandeja de mensajes",
                draggable: true,
                resizable: true,

                horizontalScrolling: true,
                content: oMessageView,
                state: 'None',
                beginButton: new sap.m.Button({
                    press: function () {
                        console.log("okey")
                        dialogError.close();
                    }.bind(this),
                    text: "Cerrar"
                }).addStyleClass("btnGen"),
                afterClose: function () {
                    dialogError.destroy();
                },
                contentHeight: tamaño.toString() + "px",
                contentWidth: "640px",
                verticalScrolling: false
            });
            dialogError.open();
        },
        onDespachar: function (oEvent) {
            console.log(oEvent)
            var mensaje = "¿Está seguro de dar salida al contenedor?";

            this.onmensaje(mensaje, "1");
        },
        onRevertir: function (oEvent) {
            console.log(oEvent)
            var mensaje = "¿Está seguro de revertir?";
            this.onmensaje(mensaje, "2");
        },
        onAnular: function (oEvent) {
            console.log(oEvent)
            var mensaje = "¿Está seguro de anular?";
            this.onmensaje(mensaje, "3");
        },
        onmensaje: function (mensaje, id) {
            var oDialog = new sap.m.Dialog({
                title: "Confirmación",
                type: "Message",
                state: "None",
                draggable: false,
                resizable: false,
                contentWidth: "180px",
                content: [
                    new sap.ui.layout.VerticalLayout({
                        width: "100%",
                        content: [
                            new sap.ui.layout.Grid({
                                containerQuery: true,
                                defaultSpan: "XL12 L12 M12 S12",
                                content: [
                                    new sap.m.HBox({
                                        items: [
                                            new sap.m.VBox({
                                                width: "100%",
                                                alignItems: "Center",
                                                items: [
                                                    new sap.m.Label({
                                                        text: mensaje,
                                                        textAlign: "Center",
                                                        wrapping: true,
                                                        width: "100%"
                                                    })
                                                ]
                                            })
                                        ],
                                        layoutData: new sap.ui.layout.GridData({
                                            span: "XL12 L12 M12 S12"
                                        })
                                    })
                                ]
                            })
                        ]
                    })
                ],
                beginButton: new sap.m.Button({
                    press: function () {
                        oDialog.close();
                        oDialog.destroy();
                        var oModel = this.getView().getModel("myParam");
                        var oModelP1 = this.getView().getModel("myParam");
                        var ocentrodef = oModelP1.getProperty("/tbl_T_CENTRO_ResultadodefaultV1");
                        var opedidodef = this.idpedido;
                        var prueba = {};
                        sap.ui.core.BusyIndicator.show(0);
                        if (id == "1") {
                            var texto = "/sap/bc/ZPPWS_DESP_IND/P_DESPA_SAVE/" + ocentrodef + "/" + opedidodef + "/P03/P04/P05/P06/P07/P08"
                        } else if (id == "2") {
                            var texto = "/sap/bc/ZPPWS_DESP_IND/P_REVE_SAVE/" + ocentrodef + "/" + opedidodef + "/P03/P04/P05/P06/P07/P08"
                        } else if (id == "3") {
                            var texto = "/sap/bc/ZPPWS_DESP_IND/P_ANUL_SAVE/" + ocentrodef + "/" + opedidodef + "/P03/P04/P05/P06/P07/P08"
                        }
                        $.ajax(texto, {
                            type: 'POST',
                            data: prueba,

                            success: function (response) {
                                console.log(response);
                                sap.ui.core.BusyIndicator.hide();

                                var oVectorSis = response;
                                var vector = [];
                                var llave = {};

                                for (var r = 0; r < oVectorSis.ITAB.length; r++) {
                                    llave = {};
                                    if (oVectorSis.ITAB[r].TYPE === "E") {
                                        llave.type = "Error";
                                        llave.title = "Mensaje de error";
                                        llave.subtitle = oVectorSis.ITAB[r].MESSAGE;
                                        llave.subdetalle = "";
                                        vector.push(llave);
                                    }
                                    if (oVectorSis.ITAB[r].TYPE === "W") {
                                        llave.type = "Warning";
                                        llave.title = "Mensaje de alerta";
                                        llave.subtitle = oVectorSis.ITAB[r].MESSAGE;
                                        llave.subdetalle = "";
                                        vector.push(llave);
                                    }
                                    if (oVectorSis.ITAB[r].TYPE === "S") {
                                        llave.type = "Success";
                                        llave.title = "Mensaje de éxito";
                                        llave.subtitle = oVectorSis.ITAB[r].MESSAGE;
                                        llave.subdetalle = "";
                                        vector.push(llave);
                                    }
                                }
                                console.log(vector);
                                oModel.setProperty("/ERRORES2", vector);
                                this.handleMessageViewPresstras();
                                this.onactualiza();
                            }.bind(this),
                            error: function (response) {
                                console.log(response);
                                sap.ui.core.BusyIndicator.hide();
                                console.log(response);
                                var oVectorSis = response.responseJSON;
                                var vector = [];
                                var llave = {};

                                for (var r = 0; r < oVectorSis.ITAB.length; r++) {
                                    llave = {};
                                    if (oVectorSis.ITAB[r].TYPE === "E") {
                                        llave.type = "Error";
                                        llave.title = "Mensaje de error";
                                        llave.subtitle = oVectorSis.ITAB[r].MESSAGE;
                                        llave.subdetalle = "";
                                        vector.push(llave);
                                    }
                                    if (oVectorSis.ITAB[r].TYPE === "W") {
                                        llave.type = "Warning";
                                        llave.title = "Mensaje de alerta";
                                        llave.subtitle = oVectorSis.ITAB[r].MESSAGE;
                                        llave.subdetalle = "";
                                        vector.push(llave);
                                    }
                                    if (oVectorSis.ITAB[r].TYPE === "S") {
                                        llave.type = "Success";
                                        llave.title = "Mensaje de éxito";
                                        llave.subtitle = oVectorSis.ITAB[r].MESSAGE;
                                        llave.subdetalle = "";
                                        vector.push(llave);
                                    }
                                }
                                console.log(vector);
                                oModel.setProperty("/ERRORES2", vector);
                                this.handleMessageViewPresstras();
                            }.bind(this)
                        });





                    }.bind(this),
                    text: "SI"
                }),
                endButton: new sap.m.Button({
                    press: function () {
                        oDialog.close();
                        oDialog.destroy();

                    }.bind(this),
                    text: "NO"
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
        },

    });
});