sap.ui.define([
    'sap/m/MessageBox',
], function(
    MessageBox
) {
    "use strict";

    return {

        _CallListConfirmarCamion: async function(oThat) {
            return new Promise(resolve => {
                sap.ui.core.BusyIndicator.show(0);
                var oView = oThat.getView();
                var vectorError = {
                    "ERRORES2": []
                };
                var date = new Date();
                var year = date.getFullYear();
                var day = date.getDate();
                var month = date.getMonth() + 1;

                if (month.toString().length === 1) {
                    month = "0" + month;
                }

                if (day.toString().length === 1) {
                    date = year + "0" + day + "" + month;
                } else {
                    date = year + "" + day + "" + month;
                }

                //DG - Inicio
                var sCentro = oThat.getView().getModel("mModeloCentro").getData().Werks;
                var texto = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('C-" + date + "-" + sCentro + "---')/$value";
                // var texto = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('C-" + date + "-1401---')/$value";
                //DG - Fin

                var oModel = new sap.ui.model.json.JSONModel(texto, false);
                oThat.getView().setModel(oModel);

                oModel.attachRequestCompleted(function() {
                    var cont = oModel.getProperty("/ITAB");
                    oThat.JSONprueba = oModel.getJSON();

                    if (cont === null || cont === undefined) {
                        var llave = {};
                        llave.subtitle = "Error de conexión en el enlace: " + texto;
                        llave.title = "Mensaje de error Nro " + 1;
                        llave.type = "Error";
                        vectorError.push(llave);
                        oView.byId("idButtonError").setVisible(true);
                        oView.byId("idButtonError").setText("" + vectorError.length);
                    }

                    sap.ui.core.BusyIndicator.hide();
                }.bind(oThat));
            });
        },

        _CallListPaletsProductoTerminado: async function(oThat) {
            return new Promise(resolve => {
                sap.ui.core.BusyIndicator.show(0);
                var oView = oThat.getView();
                var vectorError = {
                    "ERRORES2": []
                };
                var date = new Date();
                var year = date.getFullYear();
                var day = date.getDate();
                var month = date.getMonth() + 1;

                if (month.toString().length === 1) {
                    month = "0" + month;
                }

                if (day.toString().length === 1) {
                    date = year + "0" + day + "" + month;
                } else {
                    date = year + "" + day + "" + month;
                }

                //DG - Inicio
                const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
                // var texto5 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CP-" + date + "-1401---')/$value";
                var texto5 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CP-" + date + "-" + sCentro + "---')/$value";
                //DG - Fin

                var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
                oThat.getView().setModel(oModelC, "CP");

                oModelC.attachRequestCompleted(function() {
                    try {
                        var myParam = oThat.getView().getModel("myParam");
                        var cont = oModelC.getProperty("/ITAB");
                        var llave = {};

                        if (cont === null || cont === undefined) {
                            llave = {};
                            llave.subtitle = "Error de conexión en el enlace:" + texto5;
                            llave.title = "Mensaje de error Nro " + 5;
                            llave.type = "Error";
                            vectorError.push(llave);
                            oView.byId("idButtonError").setVisible(true);
                            oView.byId("idButtonError").setText("" + vectorError.length);
                        } else {
                            cont = oModelC.getProperty("/ITAB/length");

                            var lenghtV = oModelC.getProperty("/ITAB/length");
                            var vector = [];

                            for (var i = 0; i < lenghtV; i++) {
                                llave = {};
                                llave.ELIMINAR = false;
                                llave.BINS = oModelC.getProperty("/ITAB/" + i + "/BINS").toString();
                                llave.DESCOR = oModelC.getProperty("/ITAB/" + i + "/DESCOR").toString();
                                llave.DESC_VAR = oModelC.getProperty("/ITAB/" + i + "/DESC_VAR").toString();
                                llave.GUIA = oModelC.getProperty("/ITAB/" + i + "/GUIA").toString();
                                llave.IND_MAT = oModelC.getProperty("/ITAB/" + i + "/IND_MAT").toString();
                                llave.JABAS = oModelC.getProperty("/ITAB/" + i + "/JABAS").toString();
                                llave.PALLETS = oModelC.getProperty("/ITAB/" + i + "/PALLETS").toString();
                                llave.PARTNER = oModelC.getProperty("/ITAB/" + i + "/PARTNER").toString();
                                llave.VARIEDAD = oModelC.getProperty("/ITAB/" + i + "/VARIEDAD").toString();
                                llave.VBELN = oModelC.getProperty("/ITAB/" + i + "/VBELN").toString();
                                llave.WERKS = oModelC.getProperty("/ITAB/" + i + "/WERKS").toString();
                                llave.FEC_REC = oModelC.getProperty("/ITAB/" + i + "/FEC_REC").toString();
                                llave.TXT_EMP = oModelC.getProperty("/ITAB/" + i + "/TXT_EMP").toString();
                                llave.MODULO = oModelC.getProperty("/ITAB/" + i + "/MODULO").toString();
                                llave.TXT_STA = oModelC.getProperty("/ITAB/" + i + "/TXT_STA").toString();
                                vector.push(llave);
                            }

                            myParam.setProperty("/ITAB", vector);
                            oThat.getView().setModel(myParam, "CP");
                        }

                        sap.ui.core.BusyIndicator.hide();
                    } catch (err) {
                        sap.ui.core.BusyIndicator.hide();
                    }
                }.bind(oThat));
            });
        }

    };
});