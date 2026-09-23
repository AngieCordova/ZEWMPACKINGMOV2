sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageBox',
    "./supportAdjustHome",
    //DG - Inicio
    "./LogicaSeleccionarCentro",
    //DG - Fin
    //SCH-Inicio
    "sap/m/MessageToast",
    "sap/m/library",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
    //SCH-Fin
], function (Controller, JSONModel, MessageBox, supportAdjustHome, LogicaSeleccionarCentro,
         MessageToast,  mobileLibrary, Dialog, Button, Text) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.controller.MenuSplitAvocado", {
        valor: "0",
        JSONprueba: "",
        prueba: "0",
        MODULO: "",
        FECHA: "",
        PARTNER: "",
        _Fragmento: new Object(),

        //DG - Inicio
        onAfterRendering: function (oEvent) {
          this._obtenerUserData();
            if (this.oOpen !== true) {
                this.oOpen = true;
                this._abrirDialogoSeleccionarCentro();
            }
        },

        _obtenerUserData: function () {
            var othat = this;
            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0030_SRV", { "useBatch": false });
            oModelService.read("/UserDataSet('X')", {
                success: function (result, response) {
                    debugger;
                    othat.getView().setModel(new JSONModel(response.data), "mModeloUsuario");
                    sap.ui.getCore().setModel(new JSONModel(response.data), "mModeloUsuario");
                },
                error: function (error) {
                    console.log(error);
                }
            });
        },
        //DG - Fin

        onPressDelete: function () {
            var myParam = this.getView().getModel("myParam");
            var itab = myParam.getProperty("/ITAB");
            var vector = [];
            var llave = {};
            for (var i = 0; i < itab.length; i++) {
                if (itab[i].ELIMINAR) {
                    llave = {};
                    llave.GUIA = itab[i].GUIA;
                    llave.FEC_REC = itab[i].FEC_REC;
                    llave.PARTNER = itab[i].PARTNER;
                    llave.TXT_EMP = itab[i].TXT_EMP;
                    llave.MODULO = itab[i].MODULO;
                    llave.PALLETS = itab[i].PALLETS;
                    llave.CANT = "";
                    llave.KUNNR = "";
                    llave.MATNR = "";
                    llave.CODSKY = "";
                    vector.push(llave);
                }
            }
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
            var T_BINES = [];
            var row = {};
            row.COMENT = "";
            row.PARAM = "QT-" + date + "-1401---";
            row.VECTOR = [];
            row.PALETA = vector;
            T_BINES.push(row);
            T_BINES = JSON.stringify(T_BINES);
            var oThis = this;

            var oDialog = new sap.m.Dialog("Dialog2", {

                title: "Confirmar",
                contentWidth: "540px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: "Está seguro que desea quitar los módulos seleccionados?",
                        textAlign: "Center"
                    }),
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Button({
                        text: "Sí",
                        type: "Emphasized",
                        width: "100%",
                        press: function () {
                            sap.ui.core.BusyIndicator.show(0);
                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                type: 'GET',
                                async: false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                },
                                complete: function (xhr) {
                                    var token = xhr.getResponseHeader("X-CSRF-Token");

                                    //         $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/CP/" + VBELN + "/" + WERKS, {
                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                        type: 'POST',
                                        data: T_BINES,
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('X-CSRF-Token', token);
                                        },
                                        success: function (response) {
                                            sap.ui.core.BusyIndicator.hide();
                                            console.log(response);
                                            var contador = 0;
                                            var date = new Date();
                                            var year = date.getFullYear();
                                            var day = date.getDate();
                                            var month = date.getMonth() + 1;
                                            var oView = oThis.getView();
                                            date = year + "" + day + "" + month;
                                            var texto5 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CP-" + date + "-1401---')/$value";
                                            var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
                                            oThis.getView().setModel(oModelC, "CP");
                                            oModelC.attachRequestCompleted(function () {
                                                var vectorError = {
                                                    "ERRORES2": []
                                                };
                                                var myParam = oThis.getView().getModel("myParam");
                                                var cont = oModelC.getProperty("/ITAB");

                                                var llave = {};

                                                if (cont === null || cont === undefined) {
                                                    llave = {};
                                                    llave.subtitle = "Error de conexión en el enlace:" + texto5;
                                                    llave.title = "Mensaje de error Nro " + 5;
                                                    llave.type = "Error";
                                                    vectorError.push(llave);
                                                    contador++;
                                                    oView.byId("idButtonError").setVisible(true);
                                                    oView.byId("idButtonError").setText("" + contador);
                                                    oView.byId("GenericTile6").setSubheader("Se ha generado un error");
                                                } else {
                                                    cont = oModelC.getProperty("/ITAB/length");

                                                    oView.byId("GenericTile6").setSubheader("Tienes " + cont + " tareas");
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
                                                    oThis.getView().setModel(myParam, "CP");
                                                }
                                            }.bind(this));
                                            oThis.getView().getModel("CP").refresh();
                                            oThis.byId("idPaletTable").getBinding("items").refresh(true);
                                            var dialog = new sap.m.Dialog({
                                                title: 'Eliminado',
                                                type: 'Message',
                                                state: 'Success',
                                                content: new sap.m.Text({
                                                    text: 'Se quitaron correctamente los módulos seleccionados.'
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });

                                            dialog.open();
                                        }.bind(this),
                                        error: function (response) {
                                            sap.ui.core.BusyIndicator.hide();
                                            oThis.byId("idPaletTable").getBinding("items").refresh(true);
                                            var respuesta2 = "No se eliminaron correctamente los pallets seleccionados .";
                                            try {
                                                var respuesta = response.responseText.toString();
                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                respuesta = respuesta[1];
                                                respuesta = respuesta.split('</message>');
                                                respuesta = respuesta[0];
                                                respuesta2 = respuesta;
                                            } catch (err) {
                                                console.log(err);
                                            }
                                            var dialog = new sap.m.Dialog({
                                                title: 'Error generado',
                                                type: 'Message',
                                                state: 'Error',
                                                content: new sap.m.Text({
                                                    text: respuesta2
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }.bind(this)
                                    });

                                },
                                success: function (response) { },
                                error: function (response) {

                                    console.log(response);
                                }
                            });
                            oDialog.close();
                        }.bind(this)
                    }),
                    new sap.m.Button({
                        text: "No",
                        width: "100%",
                        press: function () {
                            oDialog.close();
                        }
                    })
                ],
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();

        },

        onPressRefrescarGuias: function () {
            sap.ui.core.BusyIndicator.show(0);
            var oThat = this;
            var oView = oThat.getView();
            var vectorError = {
                "ERRORES2": []
            };
            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            // var texto10 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('STGR-----')/$value";
            var texto10 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('STGR--" + sCentro + "---')/$value";
            //DG - Fin
            var oModelSG = new sap.ui.model.json.JSONModel(texto10, false);
            //console.log(oModelSG);
            this.getView().setModel(oModelSG, "STGR");
            oModelSG.attachRequestCompleted(function () {
                var cont = oModelSG.getProperty("/ITAB");
                //console.log(cont);
                if (cont === null || cont === undefined) {
                    var llave = {};
                    llave.subtitle = "Error de conexión en el enlace:" + texto10;
                    llave.title = "Mensaje de error Nro " + 8;
                    llave.type = "Error";
                    vectorError.push(llave);
                    oView.byId("idButtonError").setVisible(true);
                    oView.byId("idButtonError").setText("" + vectorError.length);
                    oView.byId("GenericTile10").setSubheader("Se ha generado un error");
                } else {
                    cont = oModelSG.getProperty("/ITAB/length");
                    // oView.byId("GenericTile10").setSubheader("Tienes " + cont + " tareas");
                }
                sap.ui.core.BusyIndicator.hide();
            }.bind(this));
        },

        onPressActualizarTableHULineaEmpa: function () {

            var contador = 0;
            var oView = this.getView();

            var vectorError = {
                "ERRORES2": []
            };
            var oModelM = new sap.ui.model.json.JSONModel(vectorError);
            oView.setModel(oModelM, "myError");
            vectorError = oModelM.getProperty("/ERRORES2");

            var oThis = this;

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

            var texto5 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('ZV-" + date + "-1401---')/$value";
            var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
            //  this.getView().setModel(oModelC, "CP");
            oModelC.attachRequestCompleted(function () {
                try {
                    var myParamZ = oThis.getView().getModel("ZV");
                    var cont = oModelC.getProperty("/ITAB");
                    //console.log("CP");
                    console.log(cont);
                    if (cont === null || cont === undefined) {
                        var llaveZ = {};
                        llaveZ.subtitle = "Error de conexión en el enlace:" + texto5;
                        llaveZ.title = "Mensaje de error Nro " + 4;
                        llaveZ.type = "Error";
                        vectorError.push(llaveZ);
                        contador++;
                        oView.byId("idButtonError").setVisible(true);
                        oView.byId("idButtonError").setText("" + contador);
                        oView.byId("GenericTile5").setSubheader("Se ha generado un error");
                    } else {
                        cont = oModelC.getProperty("/ITAB/length");

                        oView.byId("GenericTile5").setSubheader("Tienes " + cont + " tareas");

                        var lenghtVV = oModelC.getProperty("/ITAB/length");
                        var vectorZ = [];

                        for (var i = 0; i < lenghtVV; i++) {
                            llaveZ = {};
                            llaveZ.ELIMINAR = false;
                            llaveZ.BINS = oModelC.getProperty("/ITAB/" + i + "/BINS").toString();
                            llaveZ.DESCOR = oModelC.getProperty("/ITAB/" + i + "/DESCOR").toString();
                            llaveZ.DESC_VAR = oModelC.getProperty("/ITAB/" + i + "/DESC_VAR").toString();
                            llaveZ.GUIA = oModelC.getProperty("/ITAB/" + i + "/GUIA").toString();
                            llaveZ.IND_MAT = oModelC.getProperty("/ITAB/" + i + "/IND_MAT").toString();
                            llaveZ.JABAS = oModelC.getProperty("/ITAB/" + i + "/JABAS").toString();
                            llaveZ.PALLETS = oModelC.getProperty("/ITAB/" + i + "/PALLETS").toString();
                            llaveZ.PARTNER = oModelC.getProperty("/ITAB/" + i + "/PARTNER").toString();
                            llaveZ.VARIEDAD = oModelC.getProperty("/ITAB/" + i + "/VARIEDAD").toString();
                            llaveZ.VBELN = oModelC.getProperty("/ITAB/" + i + "/VBELN").toString();
                            llaveZ.WERKS = oModelC.getProperty("/ITAB/" + i + "/WERKS").toString();
                            llaveZ.FEC_REC = oModelC.getProperty("/ITAB/" + i + "/FEC_REC").toString();
                            llaveZ.TXT_EMP = oModelC.getProperty("/ITAB/" + i + "/TXT_EMP").toString();
                            llaveZ.MODULO = oModelC.getProperty("/ITAB/" + i + "/MODULO").toString();
                            llaveZ.TXT_STA = oModelC.getProperty("/ITAB/" + i + "/TXT_STA").toString();
                            vectorZ.push(llaveZ);
                        }
                        console.log(vectorZ);
                        myParamZ.setProperty("/ITAB", vectorZ);
                        //  oThis.getView().setModel(myParamZ, "CP");
                    }
                    sap.ui.core.BusyIndicator.hide();
                } catch (err) {
                    sap.ui.core.BusyIndicator.hide();
                }
            }.bind(this));
        },

        onPressActualizarTablePaletCrear: function () {

            var contador = 0;
            var oView = this.getView();

            var vectorError = {
                "ERRORES2": []
            };
            var oModelM = new sap.ui.model.json.JSONModel(vectorError);
            oView.setModel(oModelM, "myError");
            vectorError = oModelM.getProperty("/ERRORES2");

            var oThis = this;

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

            var texto5 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CP-" + date + "-1401---')/$value";
            var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
            //  this.getView().setModel(oModelC, "CP");
            oModelC.attachRequestCompleted(function () {
                try {
                    var myParamZ = oThis.getView().getModel("CP");
                    var cont = oModelC.getProperty("/ITAB");
                    console.log("CP");
                    console.log(cont);
                    if (cont === null || cont === undefined) {
                        var llaveZ = {};
                        llaveZ.subtitle = "Error de conexión en el enlace:" + texto5;
                        llaveZ.title = "Mensaje de error Nro " + 4;
                        llaveZ.type = "Error";
                        vectorError.push(llaveZ);
                        contador++;
                        oView.byId("idButtonError").setVisible(true);
                        oView.byId("idButtonError").setText("" + contador);
                        oView.byId("GenericTile5").setSubheader("Se ha generado un error");
                    } else {
                        cont = oModelC.getProperty("/ITAB/length");

                        oView.byId("GenericTile5").setSubheader("Tienes " + cont + " tareas");

                        var lenghtVV = oModelC.getProperty("/ITAB/length");
                        var vectorZ = [];

                        for (var i = 0; i < lenghtVV; i++) {
                            llaveZ = {};
                            llaveZ.ELIMINAR = false;
                            llaveZ.BINS = oModelC.getProperty("/ITAB/" + i + "/BINS").toString();
                            llaveZ.DESCOR = oModelC.getProperty("/ITAB/" + i + "/DESCOR").toString();
                            llaveZ.DESC_VAR = oModelC.getProperty("/ITAB/" + i + "/DESC_VAR").toString();
                            llaveZ.GUIA = oModelC.getProperty("/ITAB/" + i + "/GUIA").toString();
                            llaveZ.IND_MAT = oModelC.getProperty("/ITAB/" + i + "/IND_MAT").toString();
                            llaveZ.JABAS = oModelC.getProperty("/ITAB/" + i + "/JABAS").toString();
                            llaveZ.PALLETS = oModelC.getProperty("/ITAB/" + i + "/PALLETS").toString();
                            llaveZ.PARTNER = oModelC.getProperty("/ITAB/" + i + "/PARTNER").toString();
                            llaveZ.VARIEDAD = oModelC.getProperty("/ITAB/" + i + "/VARIEDAD").toString();
                            llaveZ.VBELN = oModelC.getProperty("/ITAB/" + i + "/VBELN").toString();
                            llaveZ.WERKS = oModelC.getProperty("/ITAB/" + i + "/WERKS").toString();
                            llaveZ.FEC_REC = oModelC.getProperty("/ITAB/" + i + "/FEC_REC").toString();
                            llaveZ.TXT_EMP = oModelC.getProperty("/ITAB/" + i + "/TXT_EMP").toString();
                            llaveZ.MODULO = oModelC.getProperty("/ITAB/" + i + "/MODULO").toString();
                            llaveZ.TXT_STA = oModelC.getProperty("/ITAB/" + i + "/TXT_STA").toString();
                            vectorZ.push(llaveZ);
                        }
                        console.log(vectorZ);
                        myParamZ.setProperty("/ITAB", vectorZ);
                        //  oThis.getView().setModel(myParamZ, "CP");
                    }
                    sap.ui.core.BusyIndicator.hide();
                } catch (err) {
                    sap.ui.core.BusyIndicator.hide();
                }
            }.bind(this));
        },

        onPressActualizarTableAlmacenarHU: function () {

            var contador = 0;
            var oView = this.getView();

            var vectorError = {
                "ERRORES2": []
            };
            var oModelM = new sap.ui.model.json.JSONModel(vectorError);
            oView.setModel(oModelM, "myError");
            vectorError = oModelM.getProperty("/ERRORES2");

            var oThis = this;

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

            var texto5 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('A-" + date + "-1401---')/$value";
            var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
            //  this.getView().setModel(oModelC, "CP");
            oModelC.attachRequestCompleted(function () {
                try {
                    var myParamZ = oThis.getView().getModel("A");
                    var cont = oModelC.getProperty("/ITAB");
                    //console.log("CP");
                    console.log(cont);
                    if (cont === null || cont === undefined) {
                        var llaveZ = {};
                        llaveZ.subtitle = "Error de conexión en el enlace:" + texto5;
                        llaveZ.title = "Mensaje de error Nro " + 4;
                        llaveZ.type = "Error";
                        vectorError.push(llaveZ);
                        contador++;
                        oView.byId("idButtonError").setVisible(true);
                        oView.byId("idButtonError").setText("" + contador);
                        oView.byId("GenericTile5").setSubheader("Se ha generado un error");
                    } else {
                        cont = oModelC.getProperty("/ITAB/length");

                        oView.byId("GenericTile5").setSubheader("Tienes " + cont + " tareas");

                        var lenghtVV = oModelC.getProperty("/ITAB/length");
                        var vectorZ = [];

                        for (var i = 0; i < lenghtVV; i++) {
                            llaveZ = {};
                            llaveZ.ELIMINAR = false;
                            llaveZ.BINS = oModelC.getProperty("/ITAB/" + i + "/BINS").toString();
                            llaveZ.DESCOR = oModelC.getProperty("/ITAB/" + i + "/DESCOR").toString();
                            llaveZ.DESC_VAR = oModelC.getProperty("/ITAB/" + i + "/DESC_VAR").toString();
                            llaveZ.GUIA = oModelC.getProperty("/ITAB/" + i + "/GUIA").toString();
                            llaveZ.IND_MAT = oModelC.getProperty("/ITAB/" + i + "/IND_MAT").toString();
                            llaveZ.JABAS = oModelC.getProperty("/ITAB/" + i + "/JABAS").toString();
                            llaveZ.PALLETS = oModelC.getProperty("/ITAB/" + i + "/PALLETS").toString();
                            llaveZ.PARTNER = oModelC.getProperty("/ITAB/" + i + "/PARTNER").toString();
                            llaveZ.VARIEDAD = oModelC.getProperty("/ITAB/" + i + "/VARIEDAD").toString();
                            llaveZ.VBELN = oModelC.getProperty("/ITAB/" + i + "/VBELN").toString();
                            llaveZ.WERKS = oModelC.getProperty("/ITAB/" + i + "/WERKS").toString();
                            llaveZ.FEC_REC = oModelC.getProperty("/ITAB/" + i + "/FEC_REC").toString();
                            llaveZ.TXT_EMP = oModelC.getProperty("/ITAB/" + i + "/TXT_EMP").toString();
                            llaveZ.MODULO = oModelC.getProperty("/ITAB/" + i + "/MODULO").toString();
                            llaveZ.TXT_STA = oModelC.getProperty("/ITAB/" + i + "/TXT_STA").toString();
                            vectorZ.push(llaveZ);
                        }
                        console.log(vectorZ);
                        myParamZ.setProperty("/ITAB", vectorZ);
                        //  oThis.getView().setModel(myParamZ, "CP");
                    }
                    sap.ui.core.BusyIndicator.hide();
                } catch (err) {
                    sap.ui.core.BusyIndicator.hide();
                }
            }.bind(this));
        },

        onPressActualizarTableStageMod: function () {

            var contador = 0;
            var oView = this.getView();

            var vectorError = {
                "ERRORES2": []
            };
            var oModelM = new sap.ui.model.json.JSONModel(vectorError);
            oView.setModel(oModelM, "myError");
            vectorError = oModelM.getProperty("/ERRORES2");

            var oThis = this;

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

            var texto5 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('TP-" + date + "-1401---')/$value";
            var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
            //  this.getView().setModel(oModelC, "CP");
            oModelC.attachRequestCompleted(function () {
                try {
                    var myParamZ = oThis.getView().getModel("TP");
                    var cont = oModelC.getProperty("/ITAB");
                    //console.log("CP");
                    console.log(cont);
                    if (cont === null || cont === undefined) {
                        var llaveZ = {};
                        llaveZ.subtitle = "Error de conexión en el enlace:" + texto5;
                        llaveZ.title = "Mensaje de error Nro " + 4;
                        llaveZ.type = "Error";
                        vectorError.push(llaveZ);
                        contador++;
                        oView.byId("idButtonError").setVisible(true);
                        oView.byId("idButtonError").setText("" + contador);
                        oView.byId("GenericTile5").setSubheader("Se ha generado un error");
                    } else {
                        cont = oModelC.getProperty("/ITAB/length");

                        oView.byId("GenericTile5").setSubheader("Tienes " + cont + " tareas");

                        var lenghtVV = oModelC.getProperty("/ITAB/length");
                        var vectorZ = [];

                        for (var i = 0; i < lenghtVV; i++) {
                            llaveZ = {};
                            llaveZ.ELIMINAR = false;
                            llaveZ.BINS = oModelC.getProperty("/ITAB/" + i + "/BINS").toString();
                            llaveZ.DESCOR = oModelC.getProperty("/ITAB/" + i + "/DESCOR").toString();
                            llaveZ.DESC_VAR = oModelC.getProperty("/ITAB/" + i + "/DESC_VAR").toString();
                            llaveZ.GUIA = oModelC.getProperty("/ITAB/" + i + "/GUIA").toString();
                            llaveZ.IND_MAT = oModelC.getProperty("/ITAB/" + i + "/IND_MAT").toString();
                            llaveZ.JABAS = oModelC.getProperty("/ITAB/" + i + "/JABAS").toString();
                            llaveZ.PALLETS = oModelC.getProperty("/ITAB/" + i + "/PALLETS").toString();
                            llaveZ.PARTNER = oModelC.getProperty("/ITAB/" + i + "/PARTNER").toString();
                            llaveZ.VARIEDAD = oModelC.getProperty("/ITAB/" + i + "/VARIEDAD").toString();
                            llaveZ.VBELN = oModelC.getProperty("/ITAB/" + i + "/VBELN").toString();
                            llaveZ.WERKS = oModelC.getProperty("/ITAB/" + i + "/WERKS").toString();
                            llaveZ.FEC_REC = oModelC.getProperty("/ITAB/" + i + "/FEC_REC").toString();
                            llaveZ.TXT_EMP = oModelC.getProperty("/ITAB/" + i + "/TXT_EMP").toString();
                            llaveZ.MODULO = oModelC.getProperty("/ITAB/" + i + "/MODULO").toString();
                            llaveZ.TXT_STA = oModelC.getProperty("/ITAB/" + i + "/TXT_STA").toString();
                            vectorZ.push(llaveZ);
                        }
                        console.log(vectorZ);
                        myParamZ.setProperty("/ITAB", vectorZ);
                        //  oThis.getView().setModel(myParamZ, "CP");
                    }
                    sap.ui.core.BusyIndicator.hide();
                } catch (err) {
                    sap.ui.core.BusyIndicator.hide();
                }
            }.bind(this));
        },

        onPressActualizarSTMPOS: function () {

            var contador = 0;
            var oView = this.getView();

            var oThis = this;

            var myParam = this.getView().getModel("TP");
            var itab1 = myParam.getProperty("/ITAB");
            var vector1 = [];
            var llave1 = {};
            for (var i = 0; i < itab1.length; i++) {
                if (itab1[i].ACTUALIZARSTM) {
                    llave1 = {};
                    llave1.GUIA = itab1[i].GUIA;
                    llave1.FEC_REC = "";
                    llave1.DESC_VAR = "";
                    llave1.PARTNER = "";
                    llave1.TXT_EMP = "";
                    llave1.MODULO = itab1[i].MODULO;
                    llave1.PALLETS = "";
                    llave1.CANT = "";
                    llave1.KUNNR = "";
                    llave1.PEDIDO = itab1[i].VBELN;
                    llave1.MATNR = itab1[i].VARIEDAD;
                    llave1.CODSKY = "";
                    vector1.push(llave1);
                }
            }
            console.log(vector1);

            /////////////////////////////////////////////////

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
            var T_BINES = [];
            var row = {};
            row.COMENT = "";
            row.PARAM = "SMAC-" + date + "-1401---";
            row.VECTOR = [];
            row.PALETA = vector1;
            T_BINES.push(row);
            T_BINES = JSON.stringify(T_BINES);
            console.log(T_BINES);
            var oThis = this;

            var oDialog = new sap.m.Dialog("Dialog2", {
                title: "Confirmar",
                contentWidth: "540px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: "Está seguro(a) que desea pasar al estado siguiente la guía seleccionada(s)?",
                        textAlign: "Center"
                    }),
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Button({
                        text: "Sí",
                        type: "Emphasized",
                        width: "100%",
                        press: function () {
                            sap.ui.core.BusyIndicator.show(0);


                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                type: 'GET',
                                async: false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                },
                                complete: function (xhr) {
                                    var token = xhr.getResponseHeader("X-CSRF-Token");

                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                        type: 'POST',
                                        data: T_BINES,
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('X-CSRF-Token', token);
                                        },
                                        success: function (response) {
                                            sap.ui.core.BusyIndicator.hide();

                                            contador = 0;
                                            date = new Date();
                                            year = date.getFullYear();
                                            day = date.getDate();
                                            month = date.getMonth() + 1;
                                            oView = oThis.getView();
                                            date = year + "" + day + "" + month;
                                            var texto3 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('TP-" + date + "-1401---')/$value";
                                            var oModelT = new sap.ui.model.json.JSONModel(texto3, false);
                                            //  this.getView().setModel(oModelT, "TP");
                                            oModelT.attachRequestCompleted(function () {
                                                var vectorError = {
                                                    "ERRORES2": []
                                                };
                                                var myParamT = oThis.getView().getModel("TP");
                                                var cont = oModelT.getProperty("/ITAB");
                                                console.log("TP");
                                                console.log(cont);
                                                var llaveT = {};
                                                if (cont === null || cont === undefined) {
                                                    llaveT = {};
                                                    llaveT.subtitle = "Error de conexión en el enlace:" + texto3;
                                                    llaveT.title = "Mensaje de error Nro " + 3;
                                                    llaveT.type = "Error";
                                                    vectorError.push(llaveT);
                                                    contador++;
                                                    oView.byId("idButtonError").setVisible(true);
                                                    oView.byId("idButtonError").setText("" + contador);
                                                    oView.byId("GenericTile4").setSubheader("Se ha generado un error");
                                                } else {
                                                    cont = oModelT.getProperty("/ITAB/length");

                                                    oView.byId("GenericTile4").setSubheader("Tienes " + cont + " tareas");
                                                    var lenghtVV = oModelT.getProperty("/ITAB/length");
                                                    var vectorT = [];
                                                    for (i = 0; i < lenghtVV; i++) {
                                                        llaveT = {};
                                                        llaveT.ACTUALIZARSTM = false;
                                                        llaveT.BINS = oModelT.getProperty("/ITAB/" + i + "/BINS").toString();
                                                        llaveT.DESCOR = oModelT.getProperty("/ITAB/" + i + "/DESCOR").toString();
                                                        llaveT.DESC_VAR = oModelT.getProperty("/ITAB/" + i + "/DESC_VAR").toString();
                                                        llaveT.GUIA = oModelT.getProperty("/ITAB/" + i + "/GUIA").toString();
                                                        llaveT.IND_MAT = oModelT.getProperty("/ITAB/" + i + "/IND_MAT").toString();
                                                        llaveT.JABAS = oModelT.getProperty("/ITAB/" + i + "/JABAS").toString();
                                                        llaveT.PALLETS = oModelT.getProperty("/ITAB/" + i + "/PALLETS").toString();
                                                        llaveT.PARTNER = oModelT.getProperty("/ITAB/" + i + "/PARTNER").toString();
                                                        llaveT.VARIEDAD = oModelT.getProperty("/ITAB/" + i + "/VARIEDAD").toString();
                                                        llaveT.VBELN = oModelT.getProperty("/ITAB/" + i + "/VBELN").toString();
                                                        llaveT.WERKS = oModelT.getProperty("/ITAB/" + i + "/WERKS").toString();
                                                        llaveT.FEC_REC = oModelT.getProperty("/ITAB/" + i + "/FEC_REC").toString();
                                                        llaveT.TXT_EMP = oModelT.getProperty("/ITAB/" + i + "/TXT_EMP").toString();
                                                        llaveT.MODULO = oModelT.getProperty("/ITAB/" + i + "/MODULO").toString();
                                                        llaveT.TXT_STA = oModelT.getProperty("/ITAB/" + i + "/TXT_STA").toString();
                                                        vectorT.push(llaveT);
                                                    }
                                                    console.log(vectorT);
                                                    myParamT.setProperty("/ITAB", vectorT);
                                                    //  oThis.getView().setModel(myParamT, "TP");
                                                    //      oThis.getView().getModel("TP").refresh();
                                                    //oThis.byId("idGuiaTable").getBinding("items").refresh(true);
                                                    var dialog = new sap.m.Dialog({
                                                        title: 'Éxito',
                                                        type: 'Message',
                                                        state: 'Success',
                                                        content: new sap.m.Text({
                                                            text: "Se realizo la acción 'Estado Sgte.' con éxito."
                                                        }),
                                                        beginButton: new sap.m.Button({
                                                            text: 'Aceptar',
                                                            type: 'Emphasized',
                                                            press: function () {
                                                                oThis.byId("idBinsTable").getBinding("items").refresh(true);
                                                                oThis.onPressActualizarTablePaletCrear();
                                                                oThis.onPressActualizarTableHULineaEmpa();
                                                                dialog.close();
                                                            }.bind(this)
                                                        }),
                                                        afterClose: function () {
                                                            dialog.destroy();
                                                        }
                                                    });
                                                    dialog.open();

                                                }
                                            }.bind(this));


                                        }.bind(this),
                                        error: function (response) {
                                            console.log(response);
                                            sap.ui.core.BusyIndicator.hide();
                                            oThis.byId("idGuiaTable").getBinding("items").refresh(true);
                                            oThis.byId("idPaletTable").getBinding("items").refresh(true);
                                            var respuesta2 = "No se realizo la acción 'Estado Sgte'.";
                                            try {
                                                var respuesta = response.responseText.toString();
                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                respuesta = respuesta[1];
                                                respuesta = respuesta.split('</message>');
                                                respuesta = respuesta[0];
                                                respuesta2 = respuesta;
                                            } catch (err) {
                                                console.log(err);
                                            }
                                            var dialog = new sap.m.Dialog({
                                                title: 'Error generado',
                                                type: 'Message',
                                                state: 'Error',
                                                content: new sap.m.Text({
                                                    text: respuesta2
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }.bind(this)
                                    });
                                }.bind(this),
                                success: function (response) { },
                                error: function (response) {

                                    console.log(response);
                                }
                            });
                            oDialog.close();
                        }.bind(this)
                    }),
                    new sap.m.Button({
                        text: "No",
                        width: "100%",
                        press: function () {
                            oDialog.close();
                        }
                    })
                ],
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
        },

        onPressActualizarHULEANT: function () {

            var contador = 0;
            var oView = this.getView();

            var oThis = this;

            var myParam = this.getView().getModel("ZV");
            console.log(myParam);
            var itab1 = myParam.getProperty("/ITAB");
            var vector1 = [];
            var llave1 = {};
            for (var i = 0; i < itab1.length; i++) {
                if (itab1[i].ACTUALIZARHULE) {
                    llave1 = {};
                    llave1.GUIA = itab1[i].GUIA;
                    llave1.FEC_REC = "";
                    llave1.DESC_VAR = "";
                    llave1.PARTNER = itab1[i].PARTNER;
                    llave1.TXT_EMP = "";
                    llave1.MODULO = itab1[i].MODULO;
                    llave1.PALLETS = "";
                    llave1.CANT = "";
                    llave1.KUNNR = "";
                    llave1.PEDIDO = itab1[i].VBELN;
                    llave1.MATNR = itab1[i].VARIEDAD;
                    llave1.CODSKY = "";
                    vector1.push(llave1);
                }
            }
            console.log(vector1);

            /////////////////////////////////////////////////

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
            var T_BINES = [];
            var row = {};
            row.COMENT = "";
            row.PARAM = "HLERV-" + date + "-1401---";
            row.VECTOR = [];
            row.PALETA = vector1;
            T_BINES.push(row);
            T_BINES = JSON.stringify(T_BINES);
            console.log(T_BINES);
            var oThis = this;

            var oDialog = new sap.m.Dialog("Dialog2", {
                title: "Confirmar",
                contentWidth: "540px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: "Está seguro(a) que desea volver al estado anterior la guía seleccionada(s)?",
                        textAlign: "Center"
                    }),
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Button({
                        text: "Sí",
                        type: "Emphasized",
                        width: "100%",
                        press: function () {
                            sap.ui.core.BusyIndicator.show(0);

                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                type: 'GET',
                                async: false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                },
                                complete: function (xhr) {
                                    var token = xhr.getResponseHeader("X-CSRF-Token");

                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                        type: 'POST',
                                        data: T_BINES,
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('X-CSRF-Token', token);
                                        },
                                        success: function (response) {
                                            sap.ui.core.BusyIndicator.hide();

                                            contador = 0;
                                            date = new Date();
                                            year = date.getFullYear();
                                            day = date.getDate();
                                            month = date.getMonth() + 1;
                                            oView = oThis.getView();
                                            date = year + "" + day + "" + month;
                                            var texto3 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('ZV-" + date + "-1401---')/$value";
                                            var oModelT = new sap.ui.model.json.JSONModel(texto3, false);
                                            //  this.getView().setModel(oModelT, "TP");
                                            oModelT.attachRequestCompleted(function () {
                                                var vectorError = {
                                                    "ERRORES2": []
                                                };
                                                var myParamT = oThis.getView().getModel("ZV");
                                                var cont = oModelT.getProperty("/ITAB");
                                                console.log("TP");
                                                console.log(cont);
                                                var llaveT = {};
                                                if (cont === null || cont === undefined) {
                                                    llaveT = {};
                                                    llaveT.subtitle = "Error de conexión en el enlace:" + texto3;
                                                    llaveT.title = "Mensaje de error Nro " + 3;
                                                    llaveT.type = "Error";
                                                    vectorError.push(llaveT);
                                                    contador++;
                                                    oView.byId("idButtonError").setVisible(true);
                                                    oView.byId("idButtonError").setText("" + contador);
                                                    oView.byId("GenericTile4").setSubheader("Se ha generado un error");
                                                } else {
                                                    cont = oModelT.getProperty("/ITAB/length");

                                                    oView.byId("GenericTile4").setSubheader("Tienes " + cont + " tareas");
                                                    var lenghtVV = oModelT.getProperty("/ITAB/length");
                                                    var vectorT = [];
                                                    for (i = 0; i < lenghtVV; i++) {
                                                        llaveT = {};
                                                        llaveT.ACTUALIZARSTM = false;
                                                        llaveT.BINS = oModelT.getProperty("/ITAB/" + i + "/BINS").toString();
                                                        llaveT.DESCOR = oModelT.getProperty("/ITAB/" + i + "/DESCOR").toString();
                                                        llaveT.DESC_VAR = oModelT.getProperty("/ITAB/" + i + "/DESC_VAR").toString();
                                                        llaveT.GUIA = oModelT.getProperty("/ITAB/" + i + "/GUIA").toString();
                                                        llaveT.IND_MAT = oModelT.getProperty("/ITAB/" + i + "/IND_MAT").toString();
                                                        llaveT.JABAS = oModelT.getProperty("/ITAB/" + i + "/JABAS").toString();
                                                        llaveT.PALLETS = oModelT.getProperty("/ITAB/" + i + "/PALLETS").toString();
                                                        llaveT.PARTNER = oModelT.getProperty("/ITAB/" + i + "/PARTNER").toString();
                                                        llaveT.VARIEDAD = oModelT.getProperty("/ITAB/" + i + "/VARIEDAD").toString();
                                                        llaveT.VBELN = oModelT.getProperty("/ITAB/" + i + "/VBELN").toString();
                                                        llaveT.WERKS = oModelT.getProperty("/ITAB/" + i + "/WERKS").toString();
                                                        llaveT.FEC_REC = oModelT.getProperty("/ITAB/" + i + "/FEC_REC").toString();
                                                        llaveT.TXT_EMP = oModelT.getProperty("/ITAB/" + i + "/TXT_EMP").toString();
                                                        llaveT.MODULO = oModelT.getProperty("/ITAB/" + i + "/MODULO").toString();
                                                        llaveT.TXT_STA = oModelT.getProperty("/ITAB/" + i + "/TXT_STA").toString();
                                                        vectorT.push(llaveT);
                                                    }
                                                    console.log(vectorT);
                                                    myParamT.setProperty("/ITAB", vectorT);
                                                    //  oThis.getView().setModel(myParamT, "TP");
                                                    //      oThis.getView().getModel("TP").refresh();
                                                    //oThis.byId("idGuiaTable").getBinding("items").refresh(true);
                                                    var dialog = new sap.m.Dialog({
                                                        title: 'Éxito',
                                                        type: 'Message',
                                                        state: 'Success',
                                                        content: new sap.m.Text({
                                                            text: "Se realizo la acción 'Estado Ant.' con éxito."
                                                        }),
                                                        beginButton: new sap.m.Button({
                                                            text: 'Aceptar',
                                                            type: 'Emphasized',
                                                            press: function () {
                                                                oThis.byId("idBinsTable").getBinding("items").refresh(true);
                                                                oThis.onPressActualizarTableStageMod();
                                                                oThis.onPressActualizarTablePaletCrear();
                                                                dialog.close();
                                                            }.bind(this)
                                                        }),
                                                        afterClose: function () {
                                                            dialog.destroy();
                                                        }
                                                    });
                                                    dialog.open();

                                                }
                                            }.bind(this));

                                        }.bind(this),
                                        error: function (response) {
                                            console.log(response);
                                            sap.ui.core.BusyIndicator.hide();
                                            oThis.byId("idGuiaTable").getBinding("items").refresh(true);
                                            oThis.byId("idPaletTable").getBinding("items").refresh(true);
                                            var respuesta2 = "No se realizo la acción 'Estado Ant'.";
                                            try {
                                                var respuesta = response.responseText.toString();
                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                respuesta = respuesta[1];
                                                respuesta = respuesta.split('</message>');
                                                respuesta = respuesta[0];
                                                respuesta2 = respuesta;
                                            } catch (err) {
                                                console.log(err);
                                            }
                                            var dialog = new sap.m.Dialog({
                                                title: 'Error generado',
                                                type: 'Message',
                                                state: 'Error',
                                                content: new sap.m.Text({
                                                    text: respuesta2
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }.bind(this)
                                    });
                                }.bind(this),
                                success: function (response) { },
                                error: function (response) {

                                    console.log(response);
                                }
                            });
                            oDialog.close();
                        }.bind(this)
                    }),
                    new sap.m.Button({
                        text: "No",
                        width: "100%",
                        press: function () {
                            oDialog.close();
                        }
                    })
                ],
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
        },

        onPressActualizarHULEPOS: function () {

            var contador = 0;
            var oView = this.getView();

            var oThis = this;

            var myParam = this.getView().getModel("ZV");
            console.log(myParam);
            var itab1 = myParam.getProperty("/ITAB");
            console.log(itab1);
            var vector1 = [];
            var llave1 = {};
            for (var i = 0; i < itab1.length; i++) {
                if (itab1[i].ACTUALIZARHULE) {
                    llave1 = {};
                    llave1.GUIA = itab1[i].GUIA;
                    llave1.FEC_REC = "";
                    llave1.DESC_VAR = "";
                    llave1.PARTNER = itab1[i].PARTNER;
                    llave1.TXT_EMP = "";
                    llave1.MODULO = itab1[i].MODULO;
                    llave1.PALLETS = "";
                    llave1.CANT = "";
                    llave1.KUNNR = "";
                    llave1.PEDIDO = itab1[i].VBELN;
                    llave1.MATNR = itab1[i].VARIEDAD;
                    llave1.CODSKY = "";
                    vector1.push(llave1);
                }
            }
            console.log(vector1);

            /////////////////////////////////////////////////

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
            var T_BINES = [];
            var row = {};
            row.COMENT = "";
            row.PARAM = "HLEAC-" + date + "-1401---";
            row.VECTOR = [];
            row.PALETA = vector1;
            T_BINES.push(row);
            T_BINES = JSON.stringify(T_BINES);
            console.log(T_BINES);
            var oThis = this;

            var oDialog = new sap.m.Dialog("Dialog2", {
                title: "Confirmar",
                contentWidth: "540px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: "Está seguro(a) que desea pasar al estado siguiente la guía seleccionada(s)?",
                        textAlign: "Center"
                    }),
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Button({
                        text: "Sí",
                        type: "Emphasized",
                        width: "100%",
                        press: function () {
                            sap.ui.core.BusyIndicator.show(0);

                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                type: 'GET',
                                async: false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                },
                                complete: function (xhr) {
                                    var token = xhr.getResponseHeader("X-CSRF-Token");

                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                        type: 'POST',
                                        data: T_BINES,
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('X-CSRF-Token', token);
                                        },
                                        success: function (response) {
                                            console.log(response);
                                            sap.ui.core.BusyIndicator.hide();

                                            contador = 0;
                                            date = new Date();
                                            year = date.getFullYear();
                                            day = date.getDate();
                                            month = date.getMonth() + 1;
                                            oView = oThis.getView();
                                            date = year + "" + day + "" + month;
                                            var texto3 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('ZV-" + date + "-1401---')/$value";
                                            var oModelT = new sap.ui.model.json.JSONModel(texto3, false);

                                            var respuesta2 = "Se realizo la acción 'Estado Sgte.' con éxito.";
                                            try {
                                                var respuesta = response.responseText.toString();
                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                respuesta = respuesta[1];
                                                respuesta = respuesta.split('</message>');
                                                respuesta = respuesta[0];
                                                respuesta2 = respuesta;
                                            } catch (err) {
                                                console.log(err);
                                            }

                                            //  this.getView().setModel(oModelT, "TP");
                                            oModelT.attachRequestCompleted(function () {
                                                var vectorError = {
                                                    "ERRORES2": []
                                                };
                                                var myParamT = oThis.getView().getModel("ZV");
                                                var cont = oModelT.getProperty("/ITAB");
                                                console.log("TP");
                                                console.log(cont);
                                                var llaveT = {};
                                                if (cont === null || cont === undefined) {
                                                    llaveT = {};
                                                    llaveT.subtitle = "Error de conexión en el enlace:" + texto3;
                                                    llaveT.title = "Mensaje de error Nro " + 3;
                                                    llaveT.type = "Error";
                                                    vectorError.push(llaveT);
                                                    contador++;
                                                    oView.byId("idButtonError").setVisible(true);
                                                    oView.byId("idButtonError").setText("" + contador);
                                                    oView.byId("GenericTile4").setSubheader("Se ha generado un error");
                                                } else {
                                                    cont = oModelT.getProperty("/ITAB/length");

                                                    oView.byId("GenericTile4").setSubheader("Tienes " + cont + " tareas");
                                                    var lenghtVV = oModelT.getProperty("/ITAB/length");
                                                    var vectorT = [];
                                                    for (i = 0; i < lenghtVV; i++) {
                                                        llaveT = {};
                                                        llaveT.ACTUALIZARSTM = false;
                                                        llaveT.BINS = oModelT.getProperty("/ITAB/" + i + "/BINS").toString();
                                                        llaveT.DESCOR = oModelT.getProperty("/ITAB/" + i + "/DESCOR").toString();
                                                        llaveT.DESC_VAR = oModelT.getProperty("/ITAB/" + i + "/DESC_VAR").toString();
                                                        llaveT.GUIA = oModelT.getProperty("/ITAB/" + i + "/GUIA").toString();
                                                        llaveT.IND_MAT = oModelT.getProperty("/ITAB/" + i + "/IND_MAT").toString();
                                                        llaveT.JABAS = oModelT.getProperty("/ITAB/" + i + "/JABAS").toString();
                                                        llaveT.PALLETS = oModelT.getProperty("/ITAB/" + i + "/PALLETS").toString();
                                                        llaveT.PARTNER = oModelT.getProperty("/ITAB/" + i + "/PARTNER").toString();
                                                        llaveT.VARIEDAD = oModelT.getProperty("/ITAB/" + i + "/VARIEDAD").toString();
                                                        llaveT.VBELN = oModelT.getProperty("/ITAB/" + i + "/VBELN").toString();
                                                        llaveT.WERKS = oModelT.getProperty("/ITAB/" + i + "/WERKS").toString();
                                                        llaveT.FEC_REC = oModelT.getProperty("/ITAB/" + i + "/FEC_REC").toString();
                                                        llaveT.TXT_EMP = oModelT.getProperty("/ITAB/" + i + "/TXT_EMP").toString();
                                                        llaveT.MODULO = oModelT.getProperty("/ITAB/" + i + "/MODULO").toString();
                                                        llaveT.TXT_STA = oModelT.getProperty("/ITAB/" + i + "/TXT_STA").toString();
                                                        vectorT.push(llaveT);
                                                    }
                                                    console.log(vectorT);
                                                    myParamT.setProperty("/ITAB", vectorT);
                                                    //  oThis.getView().setModel(myParamT, "TP");
                                                    //      oThis.getView().getModel("TP").refresh();
                                                    //oThis.byId("idGuiaTable").getBinding("items").refresh(true);
                                                    var dialog = new sap.m.Dialog({
                                                        title: 'Éxito',
                                                        type: 'Message',
                                                        state: 'Success',
                                                        content: new sap.m.Text({
                                                            text: respuesta2
                                                        }),
                                                        beginButton: new sap.m.Button({
                                                            text: 'Aceptar',
                                                            type: 'Emphasized',
                                                            press: function () {
                                                                oThis.byId("idBinsTable").getBinding("items").refresh(true);
                                                                oThis.onPressActualizarTablePaletCrear();
                                                                dialog.close();
                                                            }.bind(this)
                                                        }),
                                                        afterClose: function () {
                                                            dialog.destroy();
                                                        }
                                                    });
                                                    dialog.open();

                                                }
                                            }.bind(this));

                                        }.bind(this),
                                        error: function (response) {
                                            console.log(response);
                                            sap.ui.core.BusyIndicator.hide();
                                            oThis.byId("idGuiaTable").getBinding("items").refresh(true);
                                            oThis.byId("idPaletTable").getBinding("items").refresh(true);
                                            var respuesta2 = "No se realizo la acción 'Estado Sgte'.";
                                            try {
                                                var respuesta = response.responseText.toString();
                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                respuesta = respuesta[1];
                                                respuesta = respuesta.split('</message>');
                                                respuesta = respuesta[0];
                                                respuesta2 = respuesta;
                                            } catch (err) {
                                                console.log(err);
                                            }
                                            var dialog = new sap.m.Dialog({
                                                title: 'Error generado',
                                                type: 'Message',
                                                state: 'Error',
                                                content: new sap.m.Text({
                                                    text: respuesta2
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }.bind(this)
                                    });
                                }.bind(this),
                                success: function (response) { },
                                error: function (response) {

                                    console.log(response);
                                }
                            });
                            oDialog.close();
                        }.bind(this)
                    }),
                    new sap.m.Button({
                        text: "No",
                        width: "100%",
                        press: function () {
                            oDialog.close();
                        }
                    })
                ],
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
        },

        _loadTareasTitle: async function () {
            var othat = this;
            /*
               "CBS_DOC_Comentario" : "Se quita el obtener el total de tareas para la aplicación 'Stage módulo EWM'"
            */
            //----------------- Stage módulo EWM
            /*
            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0009_SRV", { "useBatch": false });
            oModelService.read("/ReporteGuiaSet/$count", {
                success: function(result, response) {
                    othat.getView().byId("GenericTile20").setSubheader("Tienes " + result + " tareas");
                },
                error: function(error) {
                    console.log(error);
                }
            });
            */
            /*
               "CBS_DOC_Comentario" : "Se quita el obtener el total de tareas para la aplicación 'Recibir Hu's EWM'"
            */
            //------------------ Recibir Hu's EWM
            /*
            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0002_SRV", { "useBatch": false });
            oModelService.read("/GuiaRemisionSet/$count", {
                success: function(result, response) {
                    othat.getView().byId("GenericTile11").setSubheader("Tienes " + result + " tareas");
                },
                error: function(error) {
                    console.log(error);
                }
            });
            */
            /*
               "CBS_DOC_Comentario" : "Se quita el obtener el total de tareas para la aplicación 'Trasladar Hu's EWM'"
            */
            //---------------------- Trasladar Hu's EWM
            /*
               var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0004_SRV", { "useBatch": false });
            oModelService.read("/GuiaRemisionSet/$count", {
                success: function(result, response) {
                    othat.getView().byId("GenericTile13").setSubheader("Tienes " + result + " tareas");
                },
                error: function(error) {
                    console.log(error);
                }
            });
            */
        },

        onInit: function () {

            //sap.ui.core.BusyIndicator.show(0);
            this._loadTareasTitle();
            try {
                var contador = 0;
                var oView = this.getView();

                var vectorError = {
                    "ERRORES2": []
                };
                var oModelM = new sap.ui.model.json.JSONModel(vectorError);
                oView.setModel(oModelM, "myError");
                vectorError = oModelM.getProperty("/ERRORES2");

                var oThis = this;
                /*  var texto = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('C')/$value";
                 var oModelZ = new sap.ui.model.json.JSONModel(texto, false);
                 this.getView().setModel(oModelZ,"ZE");
                 oModelZ.attachRequestCompleted(function() {
                       console.log(oModelZ.getJSON());
                 });*/

                // var texto = "https://54.152.155.173:8003/sap/bc/zppgw_packing/Guia/C/20180420/1401";
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
                //console.log(date);
                /*
                   "CBS_DOC_Comentario" : "Se hace la obtención de todos los datos y el número de tareas de la app 'Confirmar Camión'"
                */
                /*
                 var texto = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('C-" + date + "-1401---')/$value";
                 var oModel = new sap.ui.model.json.JSONModel(texto, false);
                 this.getView().setModel(oModel);
                 oModel.attachRequestCompleted(function() {

                     var cont = oModel.getProperty("/ITAB");
                     console.log(cont);
                     oThis.JSONprueba = oModel.getJSON();
                     if (cont === null || cont === undefined) {
                         var llave = {};
                         llave.subtitle = "Error de conexión en el enlace: " + texto;
                         llave.title = "Mensaje de error Nro " + 1;
                         llave.type = "Error";
                         vectorError.push(llave);
                         contador++;
                         oView.byId("idButtonError").setVisible(true);
                         oView.byId("idButtonError").setText("" + contador);
                         oView.byId("GenericTile1").setSubheader("Se ha generado un error");
                     } else {
                         cont = oModel.getProperty("/ITAB/length");
                         oView.byId("GenericTile1").setSubheader("Tienes " + cont + " tareas");
                     }
                 }.bind(this));
                 */

                /*
                   "CBS_DOC_Comentario" : "Se oculta la obtención de información de la app 'Recepcionar Camión'"
                */
                //   var texto2 = "https://54.152.155.173:8003/sap/bc/zppgw_packing/Guia/R/20180309/1401";
                /*
                var texto2 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('R-" + date + "-1401---')/$value";
                var oModelR = new sap.ui.model.json.JSONModel(texto2, false);
                this.getView().setModel(oModelR, "R");
                oModelR.attachRequestCompleted(function() {
                    var cont = oModelR.getProperty("/ITAB");
                    console.log(cont);
                    if (cont === null || cont === undefined) {
                        var llave = {};
                        llave.subtitle = "Error de conexión en el enlace:" + texto2;
                        llave.title = "Mensaje de error Nro " + 2;
                        llave.type = "Error";
                        vectorError.push(llave);
                        contador++;
                        oView.byId("idButtonError").setVisible(true);
                        oView.byId("idButtonError").setText("" + contador);
                        oView.byId("GenericTile2").setSubheader("Se ha generado un error");
                    } else {
                        cont = oModelR.getProperty("/ITAB/length");
                        oView.byId("GenericTile2").setSubheader("Tienes " + cont + " tareas");
                    }
                }.bind(this));
                */

                /*
                   "CBS_DOC_Comentario" : "Se oculta la obtención de información de la app 'Stage módulo'"
                */
                // var texto3 = "http://54.152.155.173:8192/sap/bc/zppgw_packing/Guia/TP/20180309/1401";
                /*
                var texto3 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('TP-" + date + "-1401---')/$value";
                var oModelT = new sap.ui.model.json.JSONModel(texto3, false);
                this.getView().setModel(oModelT, "TP");
                oModelT.attachRequestCompleted(function() {
                    var cont = oModelT.getProperty("/ITAB");
                    console.log(cont);
                    if (cont === null || cont === undefined) {
                        var llave = {};
                        llave.subtitle = "Error de conexión en el enlace:" + texto3;
                        llave.title = "Mensaje de error Nro " + 3;
                        llave.type = "Error";
                        vectorError.push(llave);
                        contador++;
                        oView.byId("idButtonError").setVisible(true);
                        oView.byId("idButtonError").setText("" + contador);
                        oView.byId("GenericTile4").setSubheader("Se ha generado un error");
                    } else {
                        cont = oModelT.getProperty("/ITAB/length");

                        oView.byId("GenericTile4").setSubheader("Tienes " + cont + " tareas");
                    }
                }.bind(this));
                */

                /*
                   "CBS_DOC_Comentario" : "Se hace la obtención de todos los datos y el número de tareas de la app 'HU's a Línea de empaque'"
                */
                //var texto4 = "http://54.152.155.173:8192/sap/bc/zppgw_packing/Guia/ZV/20180309/1401";
                /*
                var texto4 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('ZV-" + date + "-1401---')/$value";
                var oModelZ = new sap.ui.model.json.JSONModel(texto4, false);
                this.getView().setModel(oModelZ, "ZV");
                oModelZ.attachRequestCompleted(function() {

                    var cont = oModelZ.getProperty("/ITAB");
                    console.log(cont);
                    if (cont === null || cont === undefined) {
                        var llave = {};
                        llave.subtitle = "Error de conexión en el enlace:" + texto4;
                        llave.title = "Mensaje de error Nro " + 4;
                        llave.type = "Error";
                        vectorError.push(llave);
                        contador++;
                        oView.byId("idButtonError").setVisible(true);
                        oView.byId("idButtonError").setText("" + contador);
                        oView.byId("GenericTile5").setSubheader("Se ha generado un error");
                    } else {
                        cont = oModelZ.getProperty("/ITAB/length");
                        oView.byId("GenericTile5").setSubheader("Tienes " + cont + " tareas");
                    }
                }.bind(this));
                */


                /*
                   "CBS_DOC_Comentario" : "Se hace la obtención de todos los datos y el número de tareas de la app 'Crear pallets de producto terminado'"
                */
                // var texto5 = "http://54.152.155.173:8192/sap/bc/zppgw_packing/Guia/CP/20180309/1401";
                /*
                var texto5 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CP-" + date + "-1401---')/$value";
                var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
                this.getView().setModel(oModelC, "CP");
                console.log(oModelC);
                oModelC.attachRequestCompleted(function() {
                    try {
                        var myParam = oThis.getView().getModel("myParam");
                        var cont = oModelC.getProperty("/ITAB");
                        console.log(cont);
                        var llave = {};

                        if (cont === null || cont === undefined) {
                            llave = {};
                            llave.subtitle = "Error de conexión en el enlace:" + texto5;
                            llave.title = "Mensaje de error Nro " + 5;
                            llave.type = "Error";
                            vectorError.push(llave);
                            contador++;
                            oView.byId("idButtonError").setVisible(true);
                            oView.byId("idButtonError").setText("" + contador);
                            oView.byId("GenericTile6").setSubheader("Se ha generado un error");
                        } else {
                            cont = oModelC.getProperty("/ITAB/length");

                            oView.byId("GenericTile6").setSubheader("Tienes " + cont + " tareas");
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
                            console.log(vector);
                            myParam.setProperty("/ITAB", vector);
                            oThis.getView().setModel(myParam, "CP");
                        }
                        sap.ui.core.BusyIndicator.hide();
                    } catch (err) {
                        sap.ui.core.BusyIndicator.hide();
                    }
                }.bind(this));
                */

                /*
                   "CBS_DOC_Comentario" : "Se oculta la obtención de información de la app 'Almacenar HU's'"
                */
                //    var texto6 = "http://54.152.155.173:8192/sap/bc/zppgw_packing/Guia/A/20180309/1401";
                /*
                var texto6 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('A-" + date + "-1401---')/$value";
                var oModelA = new sap.ui.model.json.JSONModel(texto6, false);
                this.getView().setModel(oModelA, "A");
                oModelA.attachRequestCompleted(function() {

                    var cont = oModelA.getProperty("/ITAB");
                    console.log(cont);
                    if (cont === null || cont === undefined) {
                        var llave = {};
                        llave.subtitle = "Error de conexión en el enlace:" + texto6;
                        llave.title = "Mensaje de error Nro " + 6;
                        llave.type = "Error";
                        vectorError.push(llave);
                        contador++;
                        oView.byId("idButtonError").setVisible(true);
                        oView.byId("idButtonError").setText("" + contador);
                        oView.byId("GenericTile3").setSubheader("Se ha generado un error");
                    } else {
                        cont = oModelA.getProperty("/ITAB/length");
                        oView.byId("GenericTile3").setSubheader("Tienes " + cont + " tareas");
                    }
                }.bind(this));
                */

                /*
                   "CBS_DOC_Comentario" : "Se oculta la obtención de información de la app 'Remontar Palet o Paletas Incompletas de producto terminado'"
                */
                /*
                var texto7 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('RM-" + date + "-1401---')/$value";
                var oModelRM = new sap.ui.model.json.JSONModel(texto7, false);
                this.getView().setModel(oModelRM, "RM");
                oModelRM.attachRequestCompleted(function() {
                    var cont = oModelRM.getProperty("/ITAB");
                    console.log(cont);
                    if (cont === null || cont === undefined) {
                        var llave = {};
                        llave.subtitle = "Error de conexión en el enlace:" + texto7;
                        llave.title = "Mensaje de error Nro " + 7;
                        llave.type = "Error";
                        vectorError.push(llave);
                        contador++;
                        oView.byId("idButtonError").setVisible(true);
                        oView.byId("idButtonError").setText("" + contador);
                        oView.byId("GenericTile7").setSubheader("Se ha generado un error");
                    } else {
                        cont = oModelRM.getProperty("/ITAB/length");
                        oView.byId("GenericTile7").setSubheader("Tienes " + cont + " tareas");
                    }
                }.bind(this));
                */

                /*
                   "CBS_DOC_Comentario" : "Se hace la obtención de todos los datos y el número de tareas de la app 'Status de guía'"
                */
                /////////////////////////////////////////////////////////////////////////////////////////////////
                /*
                var texto10 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('STGR-----')/$value";
                var oModelSG = new sap.ui.model.json.JSONModel(texto10, false);
                console.log(oModelSG);
                this.getView().setModel(oModelSG, "STGR");
                oModelSG.attachRequestCompleted(function() {
                    var cont = oModelSG.getProperty("/ITAB");
                    console.log(cont);
                    if (cont === null || cont === undefined) {
                        var llave = {};
                        llave.subtitle = "Error de conexión en el enlace:" + texto10;
                        llave.title = "Mensaje de error Nro " + 8;
                        llave.type = "Error";
                        vectorError.push(llave);
                        contador++;
                        oView.byId("idButtonError").setVisible(true);
                        oView.byId("idButtonError").setText("" + contador);
                        oView.byId("GenericTile10").setSubheader("Se ha generado un error");
                    } else {
                        cont = oModelSG.getProperty("/ITAB/length");
                        // oView.byId("GenericTile10").setSubheader("Tienes " + cont + " tareas");
                    }
                }.bind(this));
                */
                /////////////////////////////////////////////////////////////////////////////////////////////////

                //var sDataPath = jQuery.sap.getModulePath("AvocadoProyecto", "/camiones.json");
                var oModelPf1 = new JSONModel("camiones.json");
                oView.setModel(oModelPf1, "detalle");

                sap.ui.core.BusyIndicator.hide();
            } catch (err) {
                console.log(err);
                sap.ui.core.BusyIndicator.hide();
            }
        },

        pressProbar: function (oEvent) {
            var oData = {
                "Valor1": "valorA",
                "Valor2": "valorB"
            };
            var T_BINES = JSON.stringify(oData);
            var id = "P00003";
            var prueba = this.JSONprueba;
            //"/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('C')/$value"
            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                type: 'GET',
                async: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                },
                complete: function (xhr) {
                    var token = xhr.getResponseHeader("X-CSRF-Token");
                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                        type: 'POST',
                        data: prueba,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('X-CSRF-Token', token);

                        },
                        success: function (response) {
                            console.log(response);
                        }.bind(this),
                        error: function (response) {
                            console.log(response);
                        }.bind(this)
                    });
                },
                success: function (response) {
                    console.log(response);
                },
                error: function (response) {
                    console.log(response);
                }
            });
        },
        handleMessageViewPress: function (oEvent) {
            var oModel = this.getView().getModel("myError");
            var oMessageTemplate = new sap.m.MessageItem({
                type: '{type}',
                title: '{title}',
                subtitle: '{subtitle}'
            });
            var oMessageView = new sap.m.MessageView({
                showDetailsPageHeader: false,
                items: {
                    path: "/ERRORES2",
                    template: oMessageTemplate
                }
            });
            oMessageView.setModel(oModel);
            var dialogError = new sap.m.Dialog({
                resizable: true,
                content: oMessageView,
                state: 'Error',
                beginButton: new sap.m.Button({
                    press: function () {
                        dialogError.close();
                    },
                    text: "Cerrar"
                }),
                customHeader: new sap.m.Bar({
                    contentMiddle: [
                        new sap.m.Text({
                            text: "Error"
                        })
                    ]
                }),
                afterClose: function () {
                    dialogError.destroy();
                },
                contentHeight: "200px",
                contentWidth: "850px",
                verticalScrolling: false
            });
            dialogError.open();
        },
        navPressInicion: function (oEvent) {
            this.onInit();
            this.getSplitAppObj().to(this.createId("detail"));
        },
        onPressInicion: function (oEvent) {

            this.getView().byId("navigationList").setSelectedItem("1");
            this.getSplitAppObj().to(this.createId("detail"));

        },
        /*
           "CBS_DOC_Comentario" : "Ajuste para recarga de datos en la app de Confirmar Camión"
        */
        onPressIngCamion: function (oEvent) {
            this.getView().byId("navigationList").setSelectedItem("2");
            this.getSplitAppObj().to(this.createId("IdIngCamion"));
            supportAdjustHome._CallListConfirmarCamion(this);
        },
        onRefreshIngCamion: function (oEvent) {
            supportAdjustHome._CallListConfirmarCamion(this);
        },

        onPressConfCamion: function (oEvent) {
            this.getView().byId("navigationList").setSelectedItem("3");
            this.getSplitAppObj().to(this.createId("IdCamConf"));
        },
        onPressAlmBins: function (oEvent) {

            this.byId("idStageTable").getBinding("items").refresh(true);
            this.getView().byId("navigationList").setSelectedItem("4");
            this.getSplitAppObj().to(this.createId("IdAlmBins"));
        },
        onPressAlmStage: function (oEvent) {
            this.byId("idStageTable").getBinding("items").refresh(true);
            this.getView().byId("navigationList").setSelectedItem("5");
            this.getSplitAppObj().to(this.createId("IdAlmStage"));
        },

        /*
           "CBS_DOC_Comentario" : "Ajuste para recarga de datos en la app de HU's a Línea de Empaque"
        */
        onPressBinsEmp: function (oEvent) {
            this.getView().byId("navigationList").setSelectedItem("6");
            this.getSplitAppObj().to(this.createId("IdBinsEmp"));
            this.onRefreshHUsaLineaEmpaque();
        },

        /*
           "CBS_DOC_Comentario" : "Ajuste para recarga de datos en la app de Crear Palets de Producto Terminado"
        */
        onPressPaletCrear: function (oEvent) {
            this.getView().byId("navigationList").setSelectedItem("7");
            this.getSplitAppObj().to(this.createId("IdCrearPalet"));
            supportAdjustHome._CallListPaletsProductoTerminado(this);
            this.byId("idPaletTable").getBinding("items").refresh(true);
        },
        onRefreshPaletCrear: function (oEvent) {
            supportAdjustHome._CallListPaletsProductoTerminado(this);
        },

        onPressStatusGuia: function () {
            this.getView().byId("navigationList").setSelectedItem("12");
            this.getSplitAppObj().to(this.createId("IdStatusGuia"));
            this.onPressRefrescarGuias();
            if (this.byId("idPaletTable").getBinding("items")) {
                this.byId("idPaletTable").getBinding("items").refresh(true);
            }
        },
        /**
         * REUBICAR PALLET EWM
         */
        onAbrirReubicarPalletEwm: function () {
            var oView = this.getView();
            var sNombre = "ModalReubicarPalletEwm"
            var sFragmentPath = "AvocadoProyecto.AvocadoProyecto.fragments." + sNombre;

            oView.setModel(new JSONModel([]), "mListaPalletsReubicarEwm");
            oView.setModel(new JSONModel({}), "mHuEscaneadoRemontar");

            if (!this._Fragmento[sNombre]) {
                try {
                    this._Fragmento[sNombre] = sap.ui.xmlfragment(sFragmentPath, this);
                    oView.addDependent(this._Fragmento[sNombre]);
                } catch (e) {
                    debugger
                    //mensaje error
                    return;
                }
            }

            this._Fragmento[sNombre].open();
        },

        onCerrarFragmento: function (sNombre) {
            this._FragmentoAyuda[sNombre].destroy();
            delete this._FragmentoAyuda[sNombre];
        },
        onCerrarFragmentoReubicarPallet:async function (oEvent) {
          var oCore = sap.ui.getCore();
          var oDialog = oCore.byId("dialog-reubicar_pallet_ewm");
          oDialog.close();
        },
        onEscanearListaHuReubicarEwm: async function () {
            var oView = this.getView();
            var oCore = sap.ui.getCore();
            var oDialog = oCore.byId("dialog-reubicar_pallet_ewm");
            var oInputEscanear = oCore.byId("input-escanear_hu_reubicar_pallet_ewm");
            var sValue = oInputEscanear.getValue();

            if (!sValue) {
                MessageBox.error("Debe ingresar un HU para escanear");
                return;
            }

            var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0017_SRV");

            oDialog.setBusy(true);
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks; // Centro GE 2-12-2024
            var sUrl = `/ObtenerDatosDeUbicacionSet(I_HUIDENT='${sValue}',I_WERKS='${sCentro}')`;  // Centro GE 2-12-2024
            var oResponse = await new Promise(resolve => {
                oData.read(sUrl, {
                    "success": function (response, header) {
                        resolve(response);
                    },
                    "error": function (response) {
                        var sMessage = "";
                        try {
                            var oDetails = JSON.parse(response.responseText).error.innererror.errordetails;
                            oDetails.forEach(d => {
                                sMessage += d.message + "\n";
                            });
                        } catch (e) {
                            sMessage = "Ocurrio un error en el servidor";
                        }
                        MessageBox.error(sMessage);
                        resolve(false);
                    }
                })
            });

            oDialog.setBusy(false);

            if (!oResponse) return;

            oCore.byId("input-ubicacion_destino_reubicar_pallet_ewm").setEditable(true);

            oView.getModel("mHuEscaneadoRemontar").setProperty("/LGNUM", oResponse.LGNUM);
            oView.getModel("mHuEscaneadoRemontar").setProperty("/LGTYP", oResponse.LGTYP);
            oView.getModel("mHuEscaneadoRemontar").setProperty("/LGPLA", oResponse.LGPLA);
            oView.getModel("mHuEscaneadoRemontar").setProperty("/CAT", oResponse.CAT);
            oView.getModel("mHuEscaneadoRemontar").setProperty("/HuEscaneado", sValue);
            oView.getModel("mHuEscaneadoRemontar").setProperty("/UbicacionDestPropuesta", "");  //SCH-Proyecto Guatemala
            oView.getModel("mHuEscaneadoRemontar").setProperty("/UbicacionDestino", "");
            oView.getModel("mHuEscaneadoRemontar").setProperty("/HUIDENT", oResponse.HUIDENT);
            //INI TKT 8000018858
             oView.getModel("mHuEscaneadoRemontar").setProperty("/VIAJE", oResponse.VIAJE);
             oView.getModel("mHuEscaneadoRemontar").setProperty("/EXPORTADOR", oResponse.EXPORTADOR);
             oView.getModel("mHuEscaneadoRemontar").setProperty("/TIPO_PALLET", oResponse.TIPO_PALLET);
            //FIN TKT 8000018858
            oView.getModel("mHuEscaneadoRemontar").refresh(true);

            oCore.byId("input-ubicacion_destino_reubicar_pallet_ewm").focus();

            await this.onProponerUbicacionEwm(); //CML
        },

        //Inicio SCH-Proyecto Guatemala
        onProponerUbicacionEwm: async function () {
            var oView = this.getView();
            var oCore = sap.ui.getCore();
            var oDialog = oCore.byId("dialog-reubicar_pallet_ewm");
            var oInputEscanear = oCore.byId("input-escanear_hu_reubicar_pallet_ewm");
            var sValue = oInputEscanear.getValue();

            if (!sValue) {
                MessageBox.error("Debe ingresar un HU para buscar Ubicación Destino");
                return;
            }

            var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0017_SRV");

            oDialog.setBusy(true);
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            let afilters =[new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro),
              new sap.ui.model.Filter("I_HU", sap.ui.model.FilterOperator.EQ, sValue)
            ]
            var sUrl = `/ProponerUbicacionSet`;
            var oResponse = await new Promise(resolve => {
                oData.read(sUrl, {
                  filters: afilters,
                    "success": function (response, header) {
                        resolve(response);
                    },
                    "error": function (response) {
                        var sMessage = "";
                        try {
                            var oDetails = JSON.parse(response.responseText).error.innererror.errordetails;
                            oDetails.forEach(d => {
                                sMessage += d.message + "\n";
                            });
                        } catch (e) {
                            sMessage = "Ocurrio un error en el servidor";
                        }
                        MessageBox.error(sMessage);
                        resolve(false);
                    }
                })
            });

            oDialog.setBusy(false);

            if (!oResponse) return;
            var oModel = new JSONModel(oResponse.results);
            oView.setModel(oModel,"aUbicacionDest")
            //oCore.byId("input-ubicacion_destino_reubicar_pallet_ewm").setEditable(true);

            oView.getModel("mHuEscaneadoRemontar").setProperty("/UbicacionDestPropuesta", oResponse.results[0].E_LGPLA);  //SCH-Proyecto Guatemala
            oView.getModel("mHuEscaneadoRemontar").refresh(true);

           // oCore.byId("input-ubicacion_destino_reubicar_pallet_ewm").focus();
        },

        onAgregarUbicacion: function(oEvent) {
            var sTitle = oEvent.getParameter("selectedItem").getTitle();
            var oView = this.getView();
            oView.getModel("mHuEscaneadoRemontar").setProperty("/UbicacionDestPropuesta", sTitle);
            this._FragmentoUbicacion.close();
        },
        handleValueHelpUbicacion: async function(oEvent){

            var sNombre = "ModalAyudaUbicacion";
            var oView = this.getView();
            let oSource = oEvent.getSource();
            var oCore = sap.ui.getCore();
            var oModel =oView.getModel("aUbicacionDest")
            var nombre_fragmento = "AvocadoProyecto.AvocadoProyecto.fragments." + sNombre;

            if (!this._FragmentoUbicacion) {
                try {
                    this._FragmentoUbicacion = sap.ui.xmlfragment(nombre_fragmento, this);
                    oView.addDependent(this._FragmentoUbicacion);
                } catch (e) {
                    debugger
                    //mensaje error
                    return;
                }
            }

            this._FragmentoUbicacion.open();
            this._FragmentoUbicacion.setModel( oModel );

        },
//Fin SCH-Proyecto Guatemala

//Inicio SCH-Proyecto Guatemala
         oDialogConfirmarUbicacion: async function () {
             var oThis = this;
 	       	 var oView = this.getView();
 	         var oCore = sap.ui.getCore();
 	         var oModel = oView.getModel("mListaPalletsReubicarEwm");
 	         var oDialog = oCore.byId("dialog-reubicar_pallet_ewm");
 	         var oModelDatos = oView.getModel("mHuEscaneadoRemontar");
 	         var oDatos = oModelDatos.getData();
 	
 	
             if (oDatos.UbicacionDestPropuesta !== "" && oDatos.UbicacionDestino !== ""
               && oDatos.UbicacionDestPropuesta !== undefined && oDatos.UbicacionDestino !== undefined  ){ //IF_1
              
 	            if (oDatos.UbicacionDestino !== oDatos.UbicacionDestPropuesta ) { //IF_2
                // shortcut for sap.m.ButtonType
                var ButtonType = mobileLibrary.ButtonType;

                // shortcut for sap.m.DialogType
                var DialogType = mobileLibrary.DialogType;

                if (!this.oApproveDialog) { //IF_3
              this.oApproveDialog = new Dialog({
                type: DialogType.Message,
                title: "Confirmar",
                content: new Text({ text: "¿Seguro que desea guardar en esta ubicación?" }),
                beginButton: new Button({
                  type: ButtonType.Emphasized,
                  text: "Guardar",
                  press: function () {
                    oThis.onGuardarHuEscaneadoParaReubicarEwm();
                    this.oApproveDialog.close();
                  }.bind(this)
                }),
                endButton: new Button({
                  text: "Cancelar",
                  press: function () {
                    this.oApproveDialog.close();
                  }.bind(this)
                })
              });
            } //FIN IF_3

            this.oApproveDialog.open();

 	            } //FIN IF_2
 	           else {
            oThis.onGuardarHuEscaneadoParaReubicarEwm();
          }
             } //FIN IF_1
             else if ( oDatos.UbicacionDestino !== "" && oDatos.UbicacionDestino !== undefined  ) {
               oThis.onGuardarHuEscaneadoParaReubicarEwm();
      }
             else{
              var sMessage = "Debe ingresar Ubicación destino";
                MessageBox.error(sMessage);
                oCore.byId("input-ubicacion_destino_reubicar_pallet_ewm").focus();
                return;
             }

         }, //FIN Function
//Fin SCH-Proyecto Guatemala

        onGuardarHuEscaneadoParaReubicarEwm: async function () {
            var oView = this.getView();
            var oCore = sap.ui.getCore();
            var oModel = oView.getModel("mListaPalletsReubicarEwm");
            var oDialog = oCore.byId("dialog-reubicar_pallet_ewm");
            var oModelDatos = oView.getModel("mHuEscaneadoRemontar");
            var oDatos = oModelDatos.getData();

            var oHuAgregarLista = new Object();

            Object.assign(oHuAgregarLista, oDatos);
            //CML - Inicio
            const sFlagBloq = oDatos.FLAG_BLOQ_UBIC ? "X" : "";
            //CML - Fin
            //DG - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //DG - Fin
            var oJson = {
                "I_HUIDENT": oDatos.HUIDENT,
                "I_LGNUM": oDatos.LGNUM,
                "I_LGTYP": oDatos.LGTYP,
                "I_UBICACION_ORIGEN": oDatos.LGPLA,
                "I_UBICACION_DESTINO": oDatos.UbicacionDestino,
                "I_CAT": oDatos.CAT,
                //DG - Inicio
                "I_WERKS": sCentro,
                //DG - Fin
                //CML - Inicio
                "I_FLAG_BLOQ_UBIC": sFlagBloq
                //CML - Fin
            }

            oDialog.setBusy(true);

            var sUrl = "/ReubicarHUSet";

            var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0017_SRV");

            var oResponse = await new Promise(resolve => {
                oData.create(sUrl, oJson, {
                    "success": function (response, header) {
                        resolve(response);
                    },
                    "error": function (response) {
                        var sMessage = "";
                        try {
                            var oDetails = JSON.parse(response.responseText).error.innererror.errordetails;
                            oDetails.forEach(d => {
                                sMessage += d.message + "\n";
                            });
                        } catch (e) {
                            sMessage = "Ocurrio un error en el servidor";
                        }
                        MessageBox.error(sMessage);
                        resolve(false);
                    }
                })
            });

            oDialog.setBusy(false);

            if (!oResponse) return;

            oCore.byId("input-ubicacion_destino_reubicar_pallet_ewm").setEditable(false);
            oModelDatos.setData({});
            oModelDatos.refresh(true);

            oModel.getData().push(oHuAgregarLista);
            oModel.refresh(true);

            oCore.byId("input-escanear_hu_reubicar_pallet_ewm").setValue("");
            oCore.byId("input-escanear_hu_reubicar_pallet_ewm").focus();
        },
        /**
         * FIN REUBICAR PALLET EWM
         */
        /* INICIO Besmit */
        onSplitRouter: function (id, viewPath, unit) {
            //se crea la vista si no existe
            if (this.getSplitAppObj().getDetailPage(id) === null) {
                try {
                    var view = sap.ui.xmlview(id, viewPath);
                    this.getSplitAppObj().addDetailPage(view);
                } catch (e) {
                    debugger;
                }

            }
            //se envian parametros o eventos
            var params = { splitAppThis: this };
            sap.ui.getCore().getEventBus().publish("splitApp", id, params);
            //se mueve a la vista
            this.getView().byId("navigationList").setSelectedItem(unit);
            this.getSplitAppObj().to(id);
        },

        onSplitDialogRouter: function (id, fragmentPath, controllerPath, unit) {
            var othat = this;
            if (!othat._Fragmento[id]) {
                try {
                    var controller;
                    try {
                        controller = sap.ui.controller(controllerPath);
                        if (controller.initDialog) { controller.initDialog(othat); } else { return; }
                    } catch (ex) {
                        return;
                    }
                    othat._Fragmento[id] = sap.ui.xmlfragment(othat.getView().getId(), fragmentPath, controller);
                    othat.getView().addDependent(othat._Fragmento[id]);
                } catch (e) {
                    debugger
                    //mensaje error
                    return;
                }
            }
            setTimeout(function () {
                othat.getView().byId("navigationList").setSelectedItem(unit);
                othat._Fragmento[id].open();
            }, 100);
        },

        closeSplitDialogRouter: function (sNombreFragmento, callback) {
            this._Fragmento[sNombreFragmento].destroy();
            delete this._Fragmento[sNombreFragmento];
            callback();
        },


        //Solicitud 04/03/2021 HUs a Linea de Empaque, se agrega botón refresh
        onRefreshHUsaLineaEmpaque: function () {
            var vectorError = {
                "ERRORES2": []
            };
            sap.ui.core.BusyIndicator.show(0);
            var oView = this.getView();
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
            // var texto4 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('ZV-" + date + "-1401---')/$value";
            var texto4 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('ZV-" + date + "-" + sCentro + "---')/$value";
            //DG - Fin
            var oModelZ = new sap.ui.model.json.JSONModel(texto4, false);
            this.getView().setModel(oModelZ, "ZV");
            oModelZ.attachRequestCompleted(function () {
                sap.ui.core.BusyIndicator.hide();
                var cont = oModelZ.getProperty("/ITAB");
                //console.log(cont);
                if (cont === null || cont === undefined) {
                    var llave = {};
                    llave.subtitle = "Error de conexión en el enlace:" + texto4;
                    llave.title = "Mensaje de error Nro " + 4;
                    llave.type = "Error";
                    vectorError.push(llave);
                    oView.byId("idButtonError").setVisible(true);
                    oView.byId("idButtonError").setText("" + vectorError.length);
                } else {
                    cont = oModelZ.getProperty("/ITAB/length");
                    //oView.byId("GenericTile5").setSubheader("Tienes " + cont + " tareas");
                }
            }.bind(this));

            this.getView().getModel("ZV").refresh();
            this.byId("idBinsTable").getBinding("items").refresh(true);
        },


        /* FIN Besmit */
        onPressRemontar: function (oEvent) {

            this.getSplitAppObj().to(this.createId("IdRemontar"));
        },
        handleNavButtonPress: function (oEvent) {
            this.getSplitAppObj().backDetail();
        },
        getSplitAppObj: function () {
            var result = this.byId("SplitAppDemo");
            if (!result) {
                jQuery.sap.log.info("SplitApp object can't be found");
            }
            return result;
        },
        oDialogConfirm: function (event) {
            var oThis = this;
            this.valor = "";
            var oContext = event.getSource().getBindingContext("ZV");
            var guia = oContext.getProperty("GUIA").toString();
            var modulo = oContext.getProperty("MODULO").toString();
            var descor = oContext.getProperty("DESCOR").toString();

            var oModel = oThis.getView().getModel("myParam");
            var llave = {};
            var vector = [];
            for (var i = 0; i < 50; i++) {
                llave = {};
                llave.Cliente = i;
                llave.DesCliente = "Cliente T" + i;
                vector.push(llave);
            }
            oModel.setProperty("/Clientes", vector);
            vector = [];
            for (var i = 0; i < 150; i++) {
                llave = {};
                llave.Producto = i;
                llave.DesProducto = "Producti P" + i;
                vector.push(llave);
            }
            oModel.setProperty("/Productos", vector);
            var oDialog = new sap.m.Dialog("Dialog2", {

                title: "Confirmar",
                contentWidth: "540px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: "Estás Seguro Que Desea Empacar guía '",
                        textAlign: "Center"
                    }),

                    new sap.m.Label({
                        text: " " + guia + " ",
                        design: "Bold",
                        textAlign: "Center"
                    }),
                    new sap.m.Label({
                        text: "' Y módulo '",
                        textAlign: "Center"
                    }),
                    new sap.m.Label({
                        text: modulo + "-" + descor + "'",
                        design: "Bold",
                        textAlign: "Center"
                    }),
                    new sap.m.Label({
                        text: "?",
                        textAlign: "Center"
                    }),
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.Button({
                        text: "Sí",
                        type: "Emphasized",
                        width: "100%",
                        press: function () {

                            oThis.oDialogMateria(oContext);
                            oDialog.close();
                        }.bind(this)
                    }),
                    new sap.m.Button({
                        text: "No",
                        width: "100%",
                        press: function () {
                            oDialog.close();
                        }
                    })
                ],
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
        },
        oDialogRemontar: function (event) {
            var oContext = event.getSource().getBindingContext("RM");
            var EXIDV2 = oContext.getProperty("EXIDV2").toString();
            var SONUM = oContext.getProperty("SONUM").toString();
            var MATNR = oContext.getProperty("MATNR").toString();
            var MAKTX = oContext.getProperty("MAKTX").toString();
            var CAJPAL = oContext.getProperty("CAJPAL").toString();
            var MAXPAL = oContext.getProperty("MAXPAL").toString();
            var FALPAL = oContext.getProperty("FALPAL").toString();
            var FECEMP = oContext.getProperty("FECEMP").toString();

            var oTable = new sap.m.Table({
                id: "idTablePalet",
                width: "100%",
                noDataText: "Ningún palet registrado",
                growing: true,
                growingThreshold: 6
            });
            var oTable2 = new sap.m.Table({
                id: "idTablePalet2",
                width: "100%",
                noDataText: "Ningún palet agregado",
                growing: true,
                growingThreshold: 6
            });
            var RmToolbar = new sap.m.Toolbar({
                content: [
                    new sap.m.Button({
                        icon: "sap-icon://add",
                        text: "Remontar Palet",
                        type: "Emphasized",
                        press: function (evt) {
                            var llave = {};

                            var oTable = sap.ui.getCore().byId("idTablePalet");
                            var oTable2 = sap.ui.getCore().byId("idTablePalet2");
                            var oModel = oTable.getModel("data_select2");
                            var vector = oModel.getProperty("/RMDET2");
                            var vector2 = [];

                            var RMDET = oModel.getProperty("/RMDET");
                            var aItems = oTable.getItems();
                            for (var i = 0; i < RMDET.length; i++) {

                                llave = {};
                                llave.ID = oModel.getProperty("/RMDET/" + i + "/ID");
                                llave.SELECT = oModel.getProperty("/RMDET/" + i + "/SELECT");
                                llave.CAJPAL = oModel.getProperty("/RMDET/" + i + "/CAJPAL");
                                llave.CANCAJ = oModel.getProperty("/RMDET/" + i + "/CANCAJ");
                                llave.CHARG = oModel.getProperty("/RMDET/" + i + "/CHARG");
                                llave.DESCOR = oModel.getProperty("/RMDET/" + i + "/DESCOR");
                                llave.EXIDV2 = oModel.getProperty("/RMDET/" + i + "/EXIDV2");
                                llave.FECEMP = oModel.getProperty("/RMDET/" + i + "/FECEMP");
                                llave.MAKTX = oModel.getProperty("/RMDET/" + i + "/MAKTX");
                                llave.MATNR = oModel.getProperty("/RMDET/" + i + "/MATNR");
                                llave.MODULO = oModel.getProperty("/RMDET/" + i + "/MODULO");
                                llave.PARTNER = oModel.getProperty("/RMDET/" + i + "/PARTNER");
                                llave.TXT_EMP = oModel.getProperty("/RMDET/" + i + "/TXT_EMP");
                                if (oModel.getProperty("/RMDET/" + i + "/SELECT")) {
                                    if (oModel.getProperty("/RMDET/" + i + "/CANCAJ").toString() === "0") {
                                        vector2.push(llave);
                                        sap.m.MessageToast.show("La cantidad de cajas no puede tener un valor de '0'.");
                                    } else {
                                        vector.push(llave);
                                    }

                                } else {
                                    vector2.push(llave);
                                }
                            }
                            oModel.setProperty("/RMDET2", vector);
                            oModel.setProperty("/RMDET", vector2);
                            sap.ui.getCore().byId("idTablePalet").getBinding("items").refresh(true);
                            sap.ui.getCore().byId("idPanelTable").setHeaderText("Paletas Incompletas Disponibles (" + vector2.length + ")");
                            sap.ui.getCore().byId("idPanelTable2").setHeaderText("Combinar Pallet Detalles (" + vector.length + ")");
                            oTable2.setModel(sap.ui.getCore().getModel("data_select2"));
                            var columnListItem = new sap.m.ColumnListItem({
                                cells: [
                                    new sap.m.Text({
                                        text: "{EXIDV2}",
                                        textAlign: "Center"
                                    }),
                                    new sap.m.Text({
                                        text: "{MATNR}-{MAKTX}",
                                        textAlign: "Center"
                                    }),
                                    new sap.m.Text({
                                        text: "{PARTNER}",
                                        textAlign: "Center"
                                    }),
                                    new sap.m.Text({
                                        text: "{TXT_EMP}",
                                        textAlign: "Center"
                                    }),
                                    new sap.m.Text({
                                        text: "{MODULO}",
                                        textAlign: "Center"
                                    }),
                                    new sap.m.Text({
                                        text: "{FECEMP}",
                                        textAlign: "Center"
                                    }),
                                    new sap.m.Text({
                                        text: "{CAJPAL}",
                                        textAlign: "Center"
                                    }),
                                    new sap.m.Text({
                                        text: "{CANCAJ}",
                                        textAlign: "Center"
                                    }),
                                    new sap.m.Button({
                                        type: "Reject",
                                        icon: "sap-icon://delete",
                                        press: function (oEvent) {
                                            var llave = {};
                                            var vector = [];
                                            var oContext = oEvent.getSource().getBindingContext();
                                            var ID = oContext.getProperty("ID");
                                            var oTable = sap.ui.getCore().byId("idTablePalet");
                                            var oModel = oTable.getModel("data_select2");
                                            var oTable2 = sap.ui.getCore().byId("idTablePalet2");
                                            var oModel2 = oTable2.getModel("data_select2");
                                            var RMDET = oModel.getProperty("/RMDET");
                                            var RMDET2 = oModel.getProperty("/RMDET2");
                                            for (var i = 0; i < RMDET2.length; i++) {
                                                llave = {};
                                                llave.ID = oModel.getProperty("/RMDET2/" + i + "/ID");
                                                llave.SELECT = oModel.getProperty("/RMDET2/" + i + "/SELECT");
                                                llave.CAJPAL = oModel.getProperty("/RMDET2/" + i + "/CAJPAL");
                                                llave.CANCAJ = oModel.getProperty("/RMDET2/" + i + "/CANCAJ");
                                                llave.CHARG = oModel.getProperty("/RMDET2/" + i + "/CHARG");
                                                llave.DESCOR = oModel.getProperty("/RMDET2/" + i + "/DESCOR");
                                                llave.EXIDV2 = oModel.getProperty("/RMDET2/" + i + "/EXIDV2");
                                                llave.FECEMP = oModel.getProperty("/RMDET2/" + i + "/FECEMP");
                                                llave.MAKTX = oModel.getProperty("/RMDET2/" + i + "/MAKTX");
                                                llave.MATNR = oModel.getProperty("/RMDET2/" + i + "/MATNR");
                                                llave.MODULO = oModel.getProperty("/RMDET2/" + i + "/MODULO");
                                                llave.PARTNER = oModel.getProperty("/RMDET2/" + i + "/PARTNER");
                                                llave.TXT_EMP = oModel.getProperty("/RMDET2/" + i + "/TXT_EMP");
                                                if (ID.toString() === llave.ID.toString()) {
                                                    RMDET.push(llave);
                                                } else {
                                                    vector.push(llave);
                                                }
                                            }
                                            oModel.setProperty("/RMDET2", vector);
                                            sap.ui.getCore().byId("idPanelTable2").setHeaderText("Combinar Pallet Detalles (" + vector.length + ")");
                                            sap.ui.getCore().byId("idPanelTable").setHeaderText("Paletas Incompletas Disponibles (" + RMDET.length + ")");
                                            sap.ui.getCore().byId("idTablePalet").getBinding("items").refresh(true);
                                            sap.ui.getCore().byId("idTablePalet2").getBinding("items").refresh(true);
                                        }
                                    })

                                ]
                            });
                            oTable2.bindAggregation("items", "/RMDET2", columnListItem);

                        }
                    }),
                    new sap.m.ToolbarSeparator({}),
                    new sap.m.SearchField({
                        placeholder: "Filtrar Paletas",
                        search: function (evt) {
                            var valor = evt.getSource().getValue();
                            var filter = new sap.ui.model.Filter("EXIDV2", sap.ui.model.FilterOperator.Contains, valor);
                            var list = sap.ui.getCore().byId("idTablePalet");
                            var binding = list.getBinding("items");
                            binding.filter(filter, "Application");
                        }
                    })
                ]
            });
            oTable.setHeaderToolbar(RmToolbar);
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Seleccionar"
                        })
                    ]
                })
            }));
            var cNumeroPaleta = new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "número de Paleta"
                        })
                    ]
                })
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "número de Paleta"
                        })
                    ]
                })
            }));
            oTable2.addColumn(cNumeroPaleta);
            var cProducto = new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Producto"
                        })
                    ]
                })
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Producto"
                        })
                    ]
                })
            }));
            oTable2.addColumn(cProducto);
            var cIdEmpresa = new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "ID De Empresa Agrícola"
                        })
                    ]
                })
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "ID De Empresa Agrícola"
                        })
                    ]
                })
            }));
            oTable2.addColumn(cIdEmpresa);
            var cEmpresa = new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Empresa Agrícola"
                        })
                    ]
                })
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Empresa Agrícola"
                        })
                    ]
                })
            }));
            oTable2.addColumn(cEmpresa);
            var cModulo = new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Módulo"
                        })
                    ]
                })
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Módulo"
                        })
                    ]
                })
            }));
            oTable2.addColumn(cModulo);
            var cFecha = new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Fecha de Empaque"
                        })
                    ]
                })
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Fecha de Empaque"
                        })
                    ]
                })
            }));
            oTable2.addColumn(cFecha);
            var cCajas = new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Cajas en Paleta"
                        })
                    ]
                })
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Cajas en Paleta"
                        })
                    ]
                })
            }));
            oTable2.addColumn(cCajas);
            var cCantidad = new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Cantidad de Cajas"
                        })
                    ]
                })
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Cantidad de Cajas"
                        })
                    ]
                })
            }));
            oTable2.addColumn(cCantidad);
            oTable2.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Acción"
                        })
                    ]
                })
            }));
            var columnListItem = new sap.m.ColumnListItem({
                cells: [
                    new sap.m.CheckBox({
                        selected: "{SELECT}",
                        valueState: "Warning"
                    }),
                    new sap.m.Text({
                        text: "{EXIDV2}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{MATNR}-{MAKTX}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{PARTNER}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{TXT_EMP}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{MODULO}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{FECEMP}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{CAJPAL}",
                        textAlign: "Center"
                    }),

                    new sap.m.Input({
                        type: "Number",
                        value: "{CANCAJ}",
                        editable: "{SELECT}",
                        liveChange: function (oEvent) {
                            var path = oEvent.getSource().getParent().getBindingContextPath();
                            var oModel = sap.ui.getCore().getModel("data_select2");
                            var oContext = oModel.getProperty(path);
                            var CAJPAL = oContext.CAJPAL;
                            var CANCAJ = oContext.CANCAJ;
                            var valor = oEvent.getSource().getValue();
                            if (valor !== "") {
                                if (parseInt(valor) < 0 || parseInt(valor) > parseInt(CAJPAL)) {
                                    oEvent.getSource().setValue(this.prueba);
                                    sap.m.MessageToast.show("La cantidad no puede ser mayor a las cajas en Paleta.");
                                } else {
                                    this.prueba = valor;
                                }
                            }
                        }.bind(this),
                        change: function (oEvent) {
                            var path = oEvent.getSource().getParent().getBindingContextPath();
                            var oModel = sap.ui.getCore().getModel("data_select2");
                            var oContext = oModel.getProperty(path);
                            var CANCAJ = oContext.CANCAJ;
                            this.prueba = CANCAJ;
                        }.bind(this)
                    })
                ]
            });
            var oModelT = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('RMDET------" + EXIDV2 + "-" + SONUM +
                "')/$value",
                false);
            console.log("RMDET------" + EXIDV2 + "-" + SONUM);
            /* var oModelT = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/TPDET/" + VBELN + "/" +
               MODULO,
               false);*/
            var oThis = this;
            var oDialog = new sap.m.Dialog({

                title: "Remontar Palet",
                contentWidth: "1440px",
                type: "Message",
                content: [
                    new sap.m.Panel({
                        expandable: true,
                        expanded: true,
                        headerText: "Detalles de Paleta",
                        width: "auto",
                        content: [

                            new sap.m.Label({
                                text: "número de Paleta : ",
                                design: "Bold",
                                width: "15%",
                                textAlign: "Right"
                            }),
                            new sap.m.Label({
                                text: EXIDV2,
                                width: "15%"
                            }),
                            new sap.m.Label({
                                text: "",
                                width: "2%"
                            }), new sap.m.Label({
                                text: "Producto : ",
                                design: "Bold",
                                width: "10%",
                                textAlign: "Right"
                            }),
                            new sap.m.Label({
                                text: MATNR + "-" + MAKTX,
                                width: "26%"
                            }), new sap.m.Label({
                                text: "",
                                width: "2%"
                            }), new sap.m.Label({
                                text: "Fecha de producción : ",
                                design: "Bold",
                                width: "15%",
                                textAlign: "Right"
                            }), new sap.m.Label({
                                text: FECEMP,
                                width: "15%"
                            }),
                            new sap.m.Label({
                                width: "100%"
                            })

                            ,
                            new sap.m.Label({
                                text: "Pedido : ",
                                design: "Bold",
                                width: "10%",
                                textAlign: "Right"
                            }),
                            new sap.m.Label({
                                text: SONUM,
                                width: "13%"
                            }),
                            new sap.m.Label({
                                text: "Cajas en Paleta : ",
                                design: "Bold",
                                width: "15%",
                                textAlign: "Right"
                            }),
                            new sap.m.Label({
                                text: CAJPAL,
                                width: "10%"
                            }), new sap.m.Label({
                                text: "Máx. Paleta : ",
                                design: "Bold",
                                width: "14%",
                                textAlign: "Right"
                            }),
                            new sap.m.Label({
                                text: MAXPAL,
                                width: "13%"
                            }), new sap.m.Label({
                                text: "Cajas Faltantes : ",
                                design: "Bold",
                                width: "15%",
                                textAlign: "Right"
                            }), new sap.m.Label({
                                text: FALPAL,
                                width: "10%"
                            })
                        ]
                    }),
                    new sap.m.Panel({
                        id: "idPanelTable",
                        expandable: true,
                        expanded: true,
                        headerText: "Paletas Incompletas Disponibles",
                        width: "auto",
                        content: [
                            oTable
                        ]
                    }),
                    new sap.m.Panel({
                        id: "idPanelTable2",
                        expandable: true,
                        expanded: true,
                        headerText: "Combinar Pallet Detalles",
                        width: "auto",
                        content: [
                            oTable2
                        ]
                    })

                ],
                beginButton: new sap.m.Button({
                    text: 'Guardar',
                    icon: 'sap-icon://save',
                    press: function () {
                        sap.ui.core.BusyIndicator.show(0);
                        var oModelP = this.getView().getModel("myParam");
                        var tabDet = oModelP.getProperty("/binsVector");
                        //  var T_BINES = oModelP.getProperty("/T_BINES");
                        var T_BINES = [];

                        var myParam = this.getView().getModel("myParam");
                        var RMDET2 = myParam.getProperty("/RMDET2");
                        if (RMDET2.length === 0) {
                            sap.ui.core.BusyIndicator.hide();
                            var oDialog3 = new sap.m.Dialog("Dialog", {
                                title: "Alerta",
                                type: "Message",
                                state: "Warning",
                                content: new sap.m.Text({
                                    text: "Se requiere un palet en la tabla 'Combinar Pallet Detalles'"
                                }),
                                afterClose: function () {
                                    oDialog3.destroy();
                                },
                                endButton: new sap.m.Button({
                                    text: 'Aceptar',
                                    type: 'Emphasized',
                                    press: function () {
                                        oDialog3.close();
                                    }
                                })
                            });
                            oDialog3.open();
                        } else {
                            var row = {};
                            row.COMENT = "";
                            row.PARAM = "RM------" + EXIDV2 + "-" + SONUM + "-" + FALPAL;
                            row.VECTOR = [];
                            row.PALETA = [];
                            row.REMDET = RMDET2;
                            T_BINES.push(row);
                            T_BINES = JSON.stringify(T_BINES);

                            var oMessageTemplate = new sap.m.MessageItem({
                                type: '{type}',
                                title: '{title}',
                                subtitle: '{subtitle}'
                            });
                            var oMessageView = new sap.m.MessageView({
                                showDetailsPageHeader: false,
                                items: {
                                    path: "/ERRORES",
                                    template: oMessageTemplate
                                }
                            });
                            oMessageView.setModel(oModelP);
                            var dialogError = new sap.m.Dialog({
                                resizable: true,
                                content: oMessageView,
                                state: 'Error',
                                beginButton: new sap.m.Button({
                                    press: function () {
                                        dialogError.close();
                                    },
                                    text: "Cerrar"
                                }),
                                customHeader: new sap.m.Bar({
                                    contentMiddle: [
                                        new sap.m.Text({
                                            text: "Error"
                                        })
                                    ]
                                }),
                                afterClose: function () {
                                    dialogError.destroy();
                                },
                                contentHeight: "200px",
                                contentWidth: "850px",
                                verticalScrolling: false
                            });

                            console.log(T_BINES);
                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                type: 'GET',
                                async: false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                },
                                complete: function (xhr) {
                                    var token = xhr.getResponseHeader("X-CSRF-Token");
                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                        type: 'POST',
                                        data: T_BINES,
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('X-CSRF-Token', token);

                                        },
                                        success: function (response) {
                                            sap.ui.core.BusyIndicator.hide();
                                            oDialog.close();
                                            console.log(response);
                                            var date = new Date();
                                            var texto7 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('RM-" + date + "-1401---')/$value";
                                            var oModelRM = new sap.ui.model.json.JSONModel(texto7, false);
                                            oThis.getView().setModel(oModelRM, "RM");
                                            oModelRM.attachRequestCompleted(function () {
                                                var cont = oModelRM.getProperty("/ITAB");

                                                if (cont === null || cont === undefined) { } else {
                                                    cont = oModelRM.getProperty("/ITAB/length");
                                                    oThis.getView().byId("GenericTile7").setSubheader("Tienes " + cont + " tareas");
                                                }
                                            }.bind(this));
                                            var dialog = new sap.m.Dialog({
                                                title: 'Remonte generado',
                                                type: 'Message',
                                                state: 'Success',
                                                content: new sap.m.Text({
                                                    text: "Se realizó el remonte correctamente."
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }.bind(this),
                                        error: function (response) {
                                            sap.ui.core.BusyIndicator.hide();
                                            var respuesta2 = "No se guardaron correctamente los palets remontados .";
                                            try {
                                                respuesta2 = response.responseText;
                                                var respuesta = response.responseText.toString();
                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                respuesta = respuesta[1];
                                                respuesta = respuesta.split('</message>');
                                                respuesta = respuesta[0];
                                                respuesta2 = respuesta;
                                            } catch (err) {
                                                console.log(err);
                                            }
                                            var dialog = new sap.m.Dialog({
                                                title: 'Error generado',
                                                type: 'Message',
                                                state: 'Error',
                                                content: new sap.m.Text({
                                                    text: respuesta2
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }.bind(this)
                                    });
                                }.bind(this),
                                success: function (response) { },
                                error: function (response) {
                                    sap.ui.core.BusyIndicator.hide();
                                    console.log(response);
                                }
                            });

                        }
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    text: 'Cerrar',
                    icon: 'sap-icon://decline',
                    press: function () {
                        oDialog.close();
                    }.bind(this)
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
            sap.ui.core.BusyIndicator.show(0);
            oModelT.attachRequestCompleted(function () {
                try {
                    var myParam = this.getView().getModel("myParam");
                    var cont = oModelT.getProperty("/ITAB");
                    console.log(oModelT.getJSON());
                    var llave = {};
                    cont = oModelT.getProperty("/ITAB/length");
                    sap.ui.getCore().byId("idPanelTable").setHeaderText("Paletas Incompletas Disponibles (" + cont + ")");
                    sap.ui.getCore().byId("idPanelTable2").setHeaderText("Combinar Pallet Detalles (" + 0 + ")");
                    var vector = [];
                    for (var i = 0; i < cont; i++) {
                        llave = {};
                        llave.SELECT = false;
                        llave.ID = i;
                        llave.CAJPAL = oModelT.getProperty("/ITAB/" + i + "/CAJPAL").toString();
                        llave.CANCAJ = oModelT.getProperty("/ITAB/" + i + "/CANCAJ").toString();
                        llave.CHARG = oModelT.getProperty("/ITAB/" + i + "/CHARG").toString();
                        llave.DESCOR = oModelT.getProperty("/ITAB/" + i + "/DESCOR").toString();
                        llave.EXIDV2 = oModelT.getProperty("/ITAB/" + i + "/EXIDV2").toString();
                        llave.FECEMP = oModelT.getProperty("/ITAB/" + i + "/FECEMP").toString();
                        llave.MAKTX = oModelT.getProperty("/ITAB/" + i + "/MAKTX").toString();
                        llave.MATNR = oModelT.getProperty("/ITAB/" + i + "/MATNR").toString();
                        llave.MODULO = oModelT.getProperty("/ITAB/" + i + "/MODULO").toString();
                        llave.PARTNER = oModelT.getProperty("/ITAB/" + i + "/PARTNER").toString();
                        llave.TXT_EMP = oModelT.getProperty("/ITAB/" + i + "/TXT_EMP").toString();

                        vector.push(llave);
                    }
                    myParam.setProperty("/RMDET", vector);
                    myParam.setProperty("/RMDET2", []);
                    sap.ui.getCore().setModel(myParam, "data_select2");
                    oTable.setModel(sap.ui.getCore().getModel("data_select2"));
                    oTable.bindAggregation("items", "/RMDET", columnListItem);
                    var binding = oTable.getBinding("items");
                    var SORTKEY = "ID";
                    var DESCENDING = true;
                    var GROUP = false;
                    var aSorter = [];
                    aSorter.push(new sap.ui.model.Sorter(SORTKEY, DESCENDING, GROUP));
                    binding.sort(aSorter);
                    sap.ui.core.BusyIndicator.hide();
                } catch (err) {
                    sap.ui.getCore().byId("idPanelTable").setHeaderText("Paletas Incompletas Disponibles (" + 0 + ")");
                    var cont = oModelT.getProperty("/ITAB/0/MESSAGE");
                    console.log(cont);
                    var dialog = new sap.m.Dialog({
                        title: 'Error generado',
                        type: 'Message',
                        state: 'Error',
                        content: new sap.m.Text({
                            text: cont
                        }),
                        beginButton: new sap.m.Button({
                            text: 'Aceptar',
                            type: 'Emphasized',
                            press: function () {
                                dialog.close();
                            }
                        }),
                        afterClose: function () {
                            dialog.destroy();
                        }
                    });
                    dialog.open();
                    sap.ui.core.BusyIndicator.hide();
                }
            }.bind(this));

        },
        onPressReproceso2: function () {
            var oThis = this;
            oThis.valor = "";
            var oTable = new sap.m.Table({
                id: "idTableModulo2",
                title: "Tabla módulo",
                noDataText: "Ningún código agregado"
                //items:"{/TablaProyeccionData}"
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"

            }));

            var columnListItem = new sap.m.ColumnListItem({
                vAlign: "Middle",
                cells: [
                    new sap.m.Label({
                        text: "{EXIDV2}",
                        design: "Bold"
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://sys-cancel-2",
                        type: "Emphasized",
                        width: "100%",
                        press: function (oEvent) {
                            var oContext = oEvent.getSource().getBindingContext();
                            var path3 = oContext.getPath().toString();
                            var oView = oThis.getView();
                            var oModelP = oView.getModel("myParam");
                            var idx = path3;
                            console.log(idx);
                            var sp_feci = idx.split("/");
                            sp_feci = sp_feci[2];
                            console.log(sp_feci);
                            var tabDet = oModelP.getProperty("/ESCANER");
                            var vector = [];
                            var row = {};
                            for (var i = 0; i < tabDet.length; i++) {
                                if (i !== parseInt(sp_feci)) {
                                    row = {};
                                    row.EXIDV2 = tabDet[i].EXIDV2;
                                    vector.push(tabDet[i]);
                                }
                            }
                            oModelP.setProperty("/ESCANER", vector);
                            /*if (sp_feci !== -1) {
                              var removed = tabDet.splice(sp_feci, 1);
                            }*/
                            sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                            sap.ui.getCore().byId("idEscaneo").setText("Escanear código (" + vector.length + ")");
                        }.bind(this)
                    })
                ]
            });

            var oModel = this.getView().getModel("myParam");
            oModel.setProperty("/ESCANER", []);
            sap.ui.getCore().setModel(oModel, "data_select2");
            oTable.setModel(sap.ui.getCore().getModel("data_select2"));
            oTable.bindAggregation("items", "/ESCANER", columnListItem);

            var inputEscan = new sap.m.Input({
                maxLength: 20,
                id: "escaner2",
                width: "50%"
                /*,
                        liveChange: function(oEvent) {
                          var sNumber = "";
                          var value = oEvent.getSource().getValue();
                          var bNotnumber = isNaN(value);
                          if (bNotnumber === false) {
                            oThis.valor = value;
                            //  sNumber = value;
                          } else {
                            oEvent.getSource().setValue(oThis.valor);
                          }
                        }.bind(this)*/
            });

            inputEscan.onsapenter = (function (oEvent) {
                var oView = oThis.getView();
                var oModelP = oView.getModel("myParam");
                var tabDet = oModelP.getProperty("/ESCANER");
                var escaner = sap.ui.getCore().byId("escaner2").getValue();
                var error = "";

                var row = {};
                if (escaner.length !== 0) {
                    for (var i = 0; i < tabDet.length; i++) {
                        if (escaner === tabDet[i].EXIDV2) {
                            error = "x";
                        }
                    }
                    if (error !== "x") {
                        var bins2 = oModelP.getProperty("/ESCANER");
                        var row = {};
                        row.EXIDV2 = escaner;
                        row.MATNR = "";
                        row.MAKTX = "";
                        row.CHARG = "";
                        row.PARTNER = "";
                        row.TXT_EMP = "";
                        row.MODULO = "";
                        row.DESCOR = "";
                        row.FECEMP = "";
                        row.CAJPAL = "";
                        row.CANCAJ = "";
                        bins2.push(row);
                        //oModelP.setProperty("/binsVector", bins2);
                        sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);

                        sap.ui.getCore().byId("idEscaneo").setText("Escanear código (" + bins2.length + ")");
                        sap.ui.getCore().byId("escaner2").setValue("");
                        sap.ui.getCore().byId("escaner2").focus();
                        oThis.valor = "";
                    } else {
                        var dialog = new sap.m.Dialog({
                            title: 'Alerta',
                            type: 'Message',
                            state: 'Warning',
                            content: new sap.m.Text({
                                text: 'El código actual ya ha sido escaneado y registrado .'
                            }),
                            beginButton: new sap.m.Button({
                                text: 'Aceptar',
                                type: 'Emphasized',
                                press: function () {
                                    dialog.close();
                                }
                            }),
                            afterClose: function () {
                                dialog.destroy();
                            }
                        });

                        dialog.open();
                    }
                } else {
                    var dialog = new sap.m.Dialog({
                        title: 'Alerta',
                        type: 'Message',
                        state: 'Warning',
                        content: new sap.m.Text({
                            text: 'No se ha ingresado Ningún código .'
                        }),
                        beginButton: new sap.m.Button({
                            text: 'Aceptar',
                            type: 'Emphasized',
                            press: function () {
                                dialog.close();
                            }
                        }),
                        afterClose: function () {
                            dialog.destroy();
                        }
                    });

                    dialog.open();
                }

            }.bind(this));
            var oThis = this;
            var oDialog = new sap.m.Dialog("Dialog2", {

                title: "Seleccionar palet para reproceso",
                contentWidth: "640px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.ToolbarSpacer({}),
                    new sap.m.Label({
                        id: "idEscaneo",
                        text: "Escanear código (0)",
                        design: "Bold",
                        width: "100%"
                    }),
                    new sap.m.ToolbarSpacer({}),
                    inputEscan,
                    new sap.m.Button({
                        icon: "sap-icon://add",
                        text: "Ingresar",
                        width: "50%",
                        type: "Emphasized",
                        press: function () {
                            var oView = oThis.getView();
                            var oModelP = oView.getModel("myParam");
                            var tabDet = oModelP.getProperty("/ESCANER");
                            var escaner = sap.ui.getCore().byId("escaner2").getValue();
                            var error = "";

                            var row = {};
                            if (escaner.length !== 0) {
                                for (var i = 0; i < tabDet.length; i++) {
                                    if (escaner === tabDet[i].EXIDV2) {
                                        error = "x";
                                    }
                                }
                                if (error !== "x") {
                                    var bins2 = oModelP.getProperty("/ESCANER");
                                    var row = {};
                                    row.EXIDV2 = escaner;
                                    row.MATNR = "";
                                    row.MAKTX = "";
                                    row.CHARG = "";
                                    row.PARTNER = "";
                                    row.TXT_EMP = "";
                                    row.MODULO = "";
                                    row.DESCOR = "";
                                    row.FECEMP = "";
                                    row.CAJPAL = "";
                                    row.CANCAJ = "";
                                    bins2.push(row);
                                    //oModelP.setProperty("/binsVector", bins2);
                                    sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);

                                    sap.ui.getCore().byId("idEscaneo").setText("Escanear código (" + bins2.length + ")");
                                    sap.ui.getCore().byId("escaner2").setValue("");
                                    sap.ui.getCore().byId("escaner2").focus();
                                    oThis.valor = "";
                                } else {
                                    var dialog = new sap.m.Dialog({
                                        title: 'Alerta',
                                        type: 'Message',
                                        state: 'Warning',
                                        content: new sap.m.Text({
                                            text: 'El código actual ya ha sido escaneado y registrado .'
                                        }),
                                        beginButton: new sap.m.Button({
                                            text: 'Aceptar',
                                            type: 'Emphasized',
                                            press: function () {
                                                dialog.close();
                                            }
                                        }),
                                        afterClose: function () {
                                            dialog.destroy();
                                        }
                                    });

                                    dialog.open();
                                }
                            } else {
                                var dialog = new sap.m.Dialog({
                                    title: 'Alerta',
                                    type: 'Message',
                                    state: 'Warning',
                                    content: new sap.m.Text({
                                        text: 'No se ha ingresado Ningún código .'
                                    }),
                                    beginButton: new sap.m.Button({
                                        text: 'Aceptar',
                                        type: 'Emphasized',
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });

                                dialog.open();
                            }

                        }.bind(this)
                    }),
                    oTable
                ],
                beginButton: new sap.m.Button({
                    icon: "sap-icon://save",
                    text: "Guardar",
                    press: function () {
                        sap.ui.core.BusyIndicator.show(0);
                        var oView = oThis.getView();
                        var oModelP = oView.getModel("myParam");
                        var tabDet = oModelP.getProperty("/ESCANER");
                        var T_BINES = [];
                        var row = {};
                        row.COMENT = "";
                        row.PARAM = "RPTRA------" + "" + "-" + "";
                        row.VECTOR = [];
                        row.PALETA = [];
                        row.REMDET = tabDet;
                        T_BINES.push(row);
                        T_BINES = JSON.stringify(T_BINES);
                        console.log(T_BINES);

                        $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                            type: 'GET',
                            async: false,
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                            },
                            complete: function (xhr) {
                                var token = xhr.getResponseHeader("X-CSRF-Token");
                                $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                    type: 'POST',
                                    data: T_BINES,
                                    beforeSend: function (xhr) {
                                        xhr.setRequestHeader('X-CSRF-Token', token);

                                    },
                                    success: function (response) {

                                        var string = "";
                                        try {

                                            string = response.getElementsByTagName("entry")[0];
                                            string = string.getElementsByTagName("m:properties")[0];
                                            string = string.getElementsByTagName("d:ID")[0].childNodes[0].nodeValue;
                                            console.log(string);

                                        } catch (err) {
                                            string = "Se realizó el reproceso con los códigos escaneados.";
                                        }
                                        console.log(response);
                                        sap.ui.core.BusyIndicator.hide();
                                        oDialog.close();
                                        var dialog = new sap.m.Dialog({
                                            title: 'Reproceso realizado',
                                            type: 'Message',
                                            state: 'Success',
                                            content: new sap.m.Text({
                                                text: string
                                            }),
                                            beginButton: new sap.m.Button({
                                                text: 'Aceptar',
                                                type: 'Emphasized',
                                                press: function () {
                                                    dialog.close();
                                                }
                                            }),
                                            afterClose: function () {
                                                dialog.destroy();
                                            }
                                        });
                                        dialog.open();
                                    }.bind(this),
                                    error: function (response) {
                                        console.log(response);
                                        sap.ui.core.BusyIndicator.hide();
                                        var respuesta2 = "No se realizó correctamente el reproceso .";
                                        try {
                                            respuesta2 = response.responseText;
                                            var respuesta = response.responseText.toString();
                                            respuesta = respuesta.split('<message xml:lang="es">');
                                            respuesta = respuesta[1];
                                            respuesta = respuesta.split('</message>');
                                            respuesta = respuesta[0];
                                            respuesta2 = respuesta;
                                        } catch (err) {
                                            console.log(err);
                                        }
                                        var dialog = new sap.m.Dialog({
                                            title: 'Error generado',
                                            type: 'Message',
                                            state: 'Error',
                                            content: new sap.m.Text({
                                                text: respuesta2
                                            }),
                                            beginButton: new sap.m.Button({
                                                text: 'Aceptar',
                                                type: 'Emphasized',
                                                press: function () {
                                                    dialog.close();
                                                }
                                            }),
                                            afterClose: function () {
                                                dialog.destroy();
                                            }
                                        });
                                        dialog.open();
                                    }.bind(this)
                                });
                            },
                            success: function (response) { },
                            error: function (response) {
                                sap.ui.core.BusyIndicator.hide();
                                console.log(response);
                            }
                        });

                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: "Cancelar",
                    press: function () {

                        oDialog.close();
                    }.bind(this)
                }),
                afterClose: function () {

                    oDialog.destroy();
                }
            });
            oDialog.open();
        },
        onPressMover: function () {
            var oThis = this;
            oThis.valor = "";
            var oTable = new sap.m.Table({
                id: "idTableModulo2",
                title: "Tabla módulo",
                noDataText: "Ningón código agregado"
                //items:"{/TablaProyeccionData}"
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"

            }));

            var columnListItem = new sap.m.ColumnListItem({
                vAlign: "Middle",
                cells: [
                    new sap.m.Label({
                        text: "{EXIDV2}",
                        design: "Bold"
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://sys-cancel-2",
                        type: "Emphasized",
                        width: "100%",
                        press: function (oEvent) {
                            var oContext = oEvent.getSource().getBindingContext();
                            var path3 = oContext.getPath().toString();
                            var oView = oThis.getView();
                            var oModelP = oView.getModel("myParam");
                            var idx = path3;
                            console.log(idx);
                            var sp_feci = idx.split("/");
                            sp_feci = sp_feci[2];
                            console.log(sp_feci);
                            var tabDet = oModelP.getProperty("/ESCANER");
                            var vector = [];
                            var row = {};
                            for (var i = 0; i < tabDet.length; i++) {
                                if (i !== parseInt(sp_feci)) {
                                    row = {};
                                    row.EXIDV2 = tabDet[i].EXIDV2;
                                    vector.push(tabDet[i]);
                                }
                            }
                            oModelP.setProperty("/ESCANER", vector);
                            /*if (sp_feci !== -1) {
                              var removed = tabDet.splice(sp_feci, 1);
                            }*/
                            sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                            sap.ui.getCore().byId("idEscaneo").setText("Escanear Código (" + vector.length + ")");
                        }.bind(this)
                    })
                ]
            });

            var oModel = this.getView().getModel("myParam");
            oModel.setProperty("/ESCANER", []);
            sap.ui.getCore().setModel(oModel, "data_select2");
            oTable.setModel(sap.ui.getCore().getModel("data_select2"));
            oTable.bindAggregation("items", "/ESCANER", columnListItem);

            var inputEscan = new sap.m.Input({
                maxLength: 20,
                id: "escaner2",
                width: "50%"
                /*,
                        liveChange: function(oEvent) {
                          var sNumber = "";
                          var value = oEvent.getSource().getValue();
                          var bNotnumber = isNaN(value);
                          if (bNotnumber === false) {
                            oThis.valor = value;
                            //  sNumber = value;
                          } else {
                            oEvent.getSource().setValue(oThis.valor);
                          }
                        }.bind(this)*/
            });

            inputEscan.onsapenter = (function (oEvent) {
                var oView = oThis.getView();
                var oModelP = oView.getModel("myParam");
                var tabDet = oModelP.getProperty("/ESCANER");
                var escaner = sap.ui.getCore().byId("escaner2").getValue();
                var error = "";

                var row = {};
                if (escaner.length !== 0) {
                    for (var i = 0; i < tabDet.length; i++) {
                        if (escaner === tabDet[i].EXIDV2) {
                            error = "x";
                        }
                    }
                    if (error !== "x") {
                        var bins2 = oModelP.getProperty("/ESCANER");
                        var row = {};
                        row.EXIDV2 = escaner;
                        row.MATNR = "";
                        row.MAKTX = "";
                        row.CHARG = "";
                        row.PARTNER = "";
                        row.TXT_EMP = "";
                        row.MODULO = "";
                        row.DESCOR = "";
                        row.FECEMP = "";
                        row.CAJPAL = "";
                        row.CANCAJ = "";
                        bins2.push(row);
                        //oModelP.setProperty("/binsVector", bins2);
                        sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);

                        sap.ui.getCore().byId("idEscaneo").setText("Escanear Código (" + bins2.length + ")");
                        sap.ui.getCore().byId("escaner2").setValue("");
                        sap.ui.getCore().byId("escaner2").focus();
                        oThis.valor = "";
                    } else {
                        var dialog = new sap.m.Dialog({
                            title: 'Alerta',
                            type: 'Message',
                            state: 'Warning',
                            content: new sap.m.Text({
                                text: 'El código actual ya ha sido escaneado y registrado .'
                            }),
                            beginButton: new sap.m.Button({
                                text: 'Aceptar',
                                type: 'Emphasized',
                                press: function () {
                                    dialog.close();
                                }
                            }),
                            afterClose: function () {
                                dialog.destroy();
                            }
                        });

                        dialog.open();
                    }
                } else {
                    var dialog = new sap.m.Dialog({
                        title: 'Alerta',
                        type: 'Message',
                        state: 'Warning',
                        content: new sap.m.Text({
                            text: 'No se ha ingresado ningón código .'
                        }),
                        beginButton: new sap.m.Button({
                            text: 'Aceptar',
                            type: 'Emphasized',
                            press: function () {
                                dialog.close();
                            }
                        }),
                        afterClose: function () {
                            dialog.destroy();
                        }
                    });

                    dialog.open();
                }

            }.bind(this));
            var oThis = this;
            var oDialog = new sap.m.Dialog("Dialog2", {

                title: "Mover Palet",
                contentWidth: "640px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.ToolbarSpacer({}),
                    new sap.m.Label({
                        id: "idEscaneo",
                        text: "Escanear Código (0)",
                        design: "Bold",
                        width: "100%"
                    }),
                    new sap.m.ToolbarSpacer({}),
                    inputEscan,
                    new sap.m.Button({
                        icon: "sap-icon://add",
                        text: "Ingresar",
                        width: "50%",
                        type: "Emphasized",
                        press: function () {
                            var oView = oThis.getView();
                            var oModelP = oView.getModel("myParam");
                            var tabDet = oModelP.getProperty("/ESCANER");
                            var escaner = sap.ui.getCore().byId("escaner2").getValue();
                            var error = "";

                            var row = {};
                            if (escaner.length !== 0) {
                                for (var i = 0; i < tabDet.length; i++) {
                                    if (escaner === tabDet[i].EXIDV2) {
                                        error = "x";
                                    }
                                }
                                if (error !== "x") {
                                    var bins2 = oModelP.getProperty("/ESCANER");
                                    var row = {};
                                    row.EXIDV2 = escaner;
                                    row.MATNR = "";
                                    row.MAKTX = "";
                                    row.CHARG = "";
                                    row.PARTNER = "";
                                    row.TXT_EMP = "";
                                    row.MODULO = "";
                                    row.DESCOR = "";
                                    row.FECEMP = "";
                                    row.CAJPAL = "";
                                    row.CANCAJ = "";
                                    bins2.push(row);
                                    //oModelP.setProperty("/binsVector", bins2);
                                    sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);

                                    sap.ui.getCore().byId("idEscaneo").setText("Escanear Código (" + bins2.length + ")");
                                    sap.ui.getCore().byId("escaner2").setValue("");
                                    sap.ui.getCore().byId("escaner2").focus();
                                    oThis.valor = "";
                                } else {
                                    var dialog = new sap.m.Dialog({
                                        title: 'Alerta',
                                        type: 'Message',
                                        state: 'Warning',
                                        content: new sap.m.Text({
                                            text: 'El código actual ya ha sido escaneado y registrado .'
                                        }),
                                        beginButton: new sap.m.Button({
                                            text: 'Aceptar',
                                            type: 'Emphasized',
                                            press: function () {
                                                dialog.close();
                                            }
                                        }),
                                        afterClose: function () {
                                            dialog.destroy();
                                        }
                                    });

                                    dialog.open();
                                }
                            } else {
                                var dialog = new sap.m.Dialog({
                                    title: 'Alerta',
                                    type: 'Message',
                                    state: 'Warning',
                                    content: new sap.m.Text({
                                        text: 'No se ha ingresado ningún código .'
                                    }),
                                    beginButton: new sap.m.Button({
                                        text: 'Aceptar',
                                        type: 'Emphasized',
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });

                                dialog.open();
                            }

                        }.bind(this)
                    }),
                    oTable
                ],
                beginButton: new sap.m.Button({
                    icon: "sap-icon://save",
                    text: "Guardar",
                    press: function () {
                        var oView = oThis.getView();
                        var oModelP = oView.getModel("myParam");
                        var tabDet = oModelP.getProperty("/ESCANER");
                        var T_BINES = [];
                        var row = {};
                        row.COMENT = "";
                        row.PARAM = "MP------" + "" + "-" + "";
                        row.VECTOR = [];
                        row.PALETA = [];
                        row.REMDET = tabDet;
                        T_BINES.push(row);
                        T_BINES = JSON.stringify(T_BINES);
                        console.log(T_BINES);

                        $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                            type: 'GET',
                            async: false,
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                            },
                            complete: function (xhr) {
                                var token = xhr.getResponseHeader("X-CSRF-Token");
                                $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                    type: 'POST',
                                    data: T_BINES,
                                    beforeSend: function (xhr) {
                                        xhr.setRequestHeader('X-CSRF-Token', token);

                                    },
                                    success: function (response) {
                                        sap.ui.core.BusyIndicator.hide();
                                        oDialog.close();
                                        var dialog = new sap.m.Dialog({
                                            title: 'Remonte generado',
                                            type: 'Message',
                                            state: 'Success',
                                            content: new sap.m.Text({
                                                text: "Las HU's seleccionadas fueron trasladadas al almacén HU11."
                                            }),
                                            beginButton: new sap.m.Button({
                                                text: 'Aceptar',
                                                type: 'Emphasized',
                                                press: function () {
                                                    dialog.close();
                                                }
                                            }),
                                            afterClose: function () {
                                                dialog.destroy();
                                            }
                                        });
                                        dialog.open();
                                    }.bind(this),
                                    error: function (response) {
                                        console.log(response);
                                        sap.ui.core.BusyIndicator.hide();
                                        var respuesta2 = "No se realizó correctamente el movimiento de palet .";
                                        try {
                                            respuesta2 = response.responseText;
                                            var respuesta = response.responseText.toString();
                                            respuesta = respuesta.split('<message xml:lang="es">');
                                            respuesta = respuesta[1];
                                            respuesta = respuesta.split('</message>');
                                            respuesta = respuesta[0];
                                            respuesta2 = respuesta;
                                        } catch (err) {
                                            console.log(err);
                                        }
                                        var dialog = new sap.m.Dialog({
                                            title: 'Error generado',
                                            type: 'Message',
                                            state: 'Error',
                                            content: new sap.m.Text({
                                                text: respuesta2
                                            }),
                                            beginButton: new sap.m.Button({
                                                text: 'Aceptar',
                                                type: 'Emphasized',
                                                press: function () {
                                                    dialog.close();
                                                }
                                            }),
                                            afterClose: function () {
                                                dialog.destroy();
                                            }
                                        });
                                        dialog.open();
                                    }.bind(this)
                                });
                            },
                            success: function (response) { },
                            error: function (response) {
                                sap.ui.core.BusyIndicator.hide();
                                console.log(response);
                            }
                        });
                        // oDialog.close();

                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: "Cancelar",
                    press: function () {

                        oDialog.close();
                    }.bind(this)
                }),
                afterClose: function () {

                    oDialog.destroy();
                }
            });
            oDialog.open();
        },
        oDialogAsigBins: function (modulo, bins, jabas, pallets, path, path2, varrcentro, varrentrega, varrvariedad, varrLongitudCodigo) {
            var oThis = this;
            oThis.valor = "";
            var total = parseInt(bins) + parseInt(jabas) + parseInt(pallets);

            var oTable = new sap.m.Table({
                id: "idTableModulo2",
                title: "Tabla módulo",
                noDataText: "Ningún módulo registrado"
                //items:"{/TablaProyeccionData}"
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"

            }));

            var columnListItem = new sap.m.ColumnListItem({
                vAlign: "Middle",
                cells: [
                    new sap.m.Label({
                        text: "{Numero}",
                        design: "Bold"
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://sys-cancel-2",
                        type: "Emphasized",
                        width: "100%",
                        press: function (oEvent) {
                            var oContext = oEvent.getSource().getBindingContext();
                            var path3 = oContext.getPath().toString();
                            var oView = oThis.getView();
                            var oModelP = oView.getModel("myParam");
                            var idx = path3;
                            var sp_feci = idx.split("/");
                            sp_feci = sp_feci[4];
                            var tabDet = oModelP.getProperty(path + "/ESCANER");
                            var vector = [];
                            var row = {};
                            for (var i = 0; i < tabDet.length; i++) {
                                if (i !== parseInt(sp_feci)) {
                                    row = {};
                                    row.Numero = tabDet[i].Numero;
                                    vector.push(row);
                                }
                            }
                            oModelP.setProperty(path + "/ESCANER", vector);
                            /*if (sp_feci !== -1) {
                              var removed = tabDet.splice(sp_feci, 1);
                            }*/
                            sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                            var BinsAsig = parseInt(sap.ui.getCore().byId("idValorBinsAsig2").getText());
                            BinsAsig = BinsAsig - 1;
                            sap.ui.getCore().byId("idValorBinsAsig2").setText(BinsAsig.toString());
                        }.bind(this)
                    })
                ]
            });

            var oModel = this.getView().getModel("myParam");
            sap.ui.getCore().setModel(oModel, "data_select2");
            console.log(oModel.getProperty(path + "/ESCANER"));
            oTable.setModel(sap.ui.getCore().getModel("data_select2"));
            oTable.bindAggregation("items", path + "/ESCANER", columnListItem);

            var inputEscan = new sap.m.Input({
                maxLength: parseInt(varrLongitudCodigo, 10),
                id: "escaner2",
                width: "50%",
                liveChange: function (oEvent) {
                    var sNumber = "";
                    var value = oEvent.getSource().getValue();
                    var bNotnumber = isNaN(value);
                    if (bNotnumber === false) {
                        oThis.valor = value;
                        //  sNumber = value;
                    } else {
                        oEvent.getSource().setValue(oThis.valor);
                    }
                }.bind(this)
            });

            inputEscan.onsapenter = (function (oEvent) {
                var oView = oThis.getView();
                var oModelP = oView.getModel("myParam");
                var tabDet = oModelP.getProperty(path + "/ESCANER");
                var escaner = sap.ui.getCore().byId("escaner2").getValue();
                var error = "";
                var binsAsig = sap.ui.getCore().byId("idValorBins2").getText();
                //if (true){
                if (escaner.length > 4) {
                    if (tabDet.length < parseInt(binsAsig)) {
                        var row = {};
                        for (var i = 0; i < tabDet.length; i++) {
                            if (escaner === tabDet[i].Numero) {
                                error = "x";
                            }
                        }
                        if (error !== "x") {

                            ///////////////////////////////////////////////////////////////////
                            var varrId = "CCBIN";
                            var varrCentro = varrcentro.toString();
                            var varrEntrega = varrentrega.toString();
                            var varrModulo = modulo.toString();
                            var varrVariedad = varrvariedad.toString();
                            var varrEscanner = escaner;

                            console.log("ID: " + varrId);
                            console.log("Centro: " + varrCentro);
                            console.log("Entrega: " + varrEntrega);
                            console.log("Modulo: " + varrModulo);
                            console.log("Variedad: " + varrVariedad);
                            console.log("Escanner: " + varrEscanner);

                            var T_BINES = [];
                            var rown = {};
                            rown.COMENT = "";
                            rown.PARAM = "CCBIN--" + varrCentro + "-" + varrEntrega + "-" + varrModulo + "-" + varrVariedad + "-" + varrEscanner +
                                "--";
                            rown.VECTOR = [];
                            rown.PALETA = [];
                            T_BINES.push(rown);
                            T_BINES = JSON.stringify(T_BINES);

                            console.log(T_BINES);

                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                type: 'GET',
                                async: false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                },
                                complete: function (xhr) {
                                    var token = xhr.getResponseHeader("X-CSRF-Token");
                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                        type: 'POST',
                                        data: T_BINES,
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('X-CSRF-Token', token);

                                        },
                                        success: function (response) {
                                            var bins2 = oModelP.getProperty(path + "/ESCANER");
                                            var row = {};
                                            row.Numero = escaner;
                                            row.Escaneado = "";
                                            row.Escaneado2 = "";
                                            row.Ubicacion = "";
                                            row.Ubicacion2 = "";
                                            row.Pesado = "";
                                            row.Pesado2 = "";
                                            bins2.push(row);
                                            //oModelP.setProperty("/binsVector", bins2);
                                            sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                                            var BinsAsig = parseInt(sap.ui.getCore().byId("idValorBinsAsig2").getText());
                                            BinsAsig = BinsAsig + 1;
                                            sap.ui.getCore().byId("idValorBinsAsig2").setText(BinsAsig.toString());
                                            sap.ui.getCore().byId("escaner2").setValue("");
                                            sap.ui.getCore().byId("escaner2").focus();
                                            oThis.valor = "";
                                        }.bind(this),
                                        error: function (response) {
                                            var respuesta4 = "No se realizo la acción 'Estado Sgte'.";
                                            try {
                                                var respuesta = response.responseText.toString();
                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                respuesta = respuesta[1];
                                                respuesta = respuesta.split('</message>');
                                                respuesta = respuesta[0];
                                                respuesta4 = respuesta;
                                            } catch (err) {
                                                console.log(err);
                                            }
                                            var dialog = new sap.m.Dialog({
                                                title: 'Error',
                                                type: 'Message',
                                                state: 'Error',
                                                content: new sap.m.Text({
                                                    text: respuesta4
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }.bind(this)
                                    });
                                },
                            });
                            ///////////////////////////////////////////////////////////////////
                        } else {
                            var dialog = new sap.m.Dialog({
                                title: 'Alerta',
                                type: 'Message',
                                state: 'Warning',
                                content: new sap.m.Text({
                                    text: 'El bin actual ya ha sido escaneado y registrado .'
                                }),
                                beginButton: new sap.m.Button({
                                    text: 'Aceptar',
                                    type: 'Emphasized',
                                    press: function () {
                                        dialog.close();
                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                }
                            });

                            dialog.open();
                        }
                    } else {
                        var dialog = new sap.m.Dialog({
                            title: 'Alerta',
                            type: 'Message',
                            state: 'Warning',
                            content: new sap.m.Text({
                                text: 'El total de bins confirmados se ha completado .'
                            }),
                            beginButton: new sap.m.Button({
                                text: 'Aceptar',
                                type: 'Emphasized',
                                press: function () {
                                    dialog.close();
                                }
                            }),
                            afterClose: function () {
                                dialog.destroy();
                            }
                        });
                        dialog.open();
                    }
                } else {
                    var dialog = new sap.m.Dialog({
                        title: 'Error',
                        type: 'Message',
                        state: 'Error',
                        content: new sap.m.Text({
                            text: 'Se requiere un total de 5 dígitos para el ingreso del bin .'
                        }),
                        beginButton: new sap.m.Button({
                            text: 'Aceptar',
                            type: 'Emphasized',
                            press: function () {
                                dialog.close();
                            }
                        }),
                        afterClose: function () {
                            dialog.destroy();
                        }
                    });
                    dialog.open();
                }
            }.bind(this));

            var oDialog = new sap.m.Dialog("Dialog2", {

                title: "Asignar HU's a Módulo",
                contentWidth: "640px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: "Módulo: ",
                        textAlign: "Right",
                        design: "Bold",
                        width: "16%"
                    }),
                    new sap.m.Label({
                        text: modulo,
                        textAlign: "Left",
                        id: "idValorModulo2",
                        width: "10%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "10%"
                    }),
                    new sap.m.Label({
                        text: "HU's: ",
                        textAlign: "Right",
                        design: "Bold",
                        width: "16%"
                    }),
                    new sap.m.Label({
                        text: total + "",
                        textAlign: "Left",
                        id: "idValorBins2",
                        width: "10%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "10%"
                    }),
                    new sap.m.Label({
                        text: "HU's asignados: ",
                        design: "Bold",
                        width: "18%"
                    }),
                    new sap.m.Label({
                        text: "0",
                        id: "idValorBinsAsig2",

                        width: "8%"
                    }),
                    new sap.m.Label({
                        text: " ",
                        width: "100%"
                    }),
                    new sap.m.ToolbarSpacer({}),
                    new sap.m.Label({
                        text: "Escanear HU",
                        design: "Bold",
                        width: "100%"
                    }),
                    inputEscan,
                    new sap.m.Button({
                        icon: "sap-icon://add",
                        text: "Ingresar",
                        width: "50%",
                        type: "Emphasized",
                        press: function () {
                            var oView = oThis.getView();
                            var oModelP = oView.getModel("myParam");
                            var tabDet = oModelP.getProperty(path + "/ESCANER");

                            var escaner = sap.ui.getCore().byId("escaner2").getValue();
                            var error = "";
                            var binsAsig = sap.ui.getCore().byId("idValorBins2").getText();

                            if (escaner.length > 4) {

                            //if (true){
                                if (tabDet.length < parseInt(binsAsig)) {
                                    var row = {};
                                    for (var i = 0; i < tabDet.length; i++) {
                                        if (escaner === tabDet[i].Numero) {
                                            error = "x";
                                        }
                                    }
                                    if (error !== "x") {

                                        ///////////////////////////////////////////////////////////////////
                                        var varrId = "CCBIN";
                                        var varrCentro = varrcentro.toString();
                                        var varrEntrega = varrentrega.toString();
                                        var varrModulo = modulo.toString();
                                        var varrVariedad = varrvariedad.toString();
                                        var varrEscanner = escaner;

                                        console.log("ID: " + varrId);
                                        console.log("Centro: " + varrCentro);
                                        console.log("Entrega: " + varrEntrega);
                                        console.log("Modulo: " + varrModulo);
                                        console.log("Variedad: " + varrVariedad);
                                        console.log("Escanner: " + varrEscanner);

                                        var T_BINES = [];
                                        var rown = {};
                                        rown.COMENT = "";
                                        rown.PARAM = "CCBIN--" + varrCentro + "-" + varrEntrega + "-" + varrModulo + "-" + varrVariedad + "-" + varrEscanner + "--";
                                        rown.VECTOR = [];
                                        rown.PALETA = [];
                                        T_BINES.push(rown);
                                        T_BINES = JSON.stringify(T_BINES);

                                        console.log(T_BINES);

                                        $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                            type: 'GET',
                                            async: false,
                                            beforeSend: function (xhr) {
                                                xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                            },
                                            complete: function (xhr) {
                                                var token = xhr.getResponseHeader("X-CSRF-Token");
                                                $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                                    type: 'POST',
                                                    data: T_BINES,
                                                    beforeSend: function (xhr) {
                                                        xhr.setRequestHeader('X-CSRF-Token', token);

                                                    },
                                                    success: function (response) {
                                                        console.log(response);
                                                        var bins2 = oModelP.getProperty(path + "/ESCANER");
                                                        var row = {};
                                                        row.Numero = escaner;
                                                        row.Escaneado = "";
                                                        row.Escaneado2 = "";
                                                        row.Ubicacion = "";
                                                        row.Ubicacion2 = "";
                                                        row.Pesado = "";
                                                        row.Pesado2 = "";
                                                        bins2.push(row);
                                                        //oModelP.setProperty("/binsVector", bins2);
                                                        sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                                                        var BinsAsig = parseInt(sap.ui.getCore().byId("idValorBinsAsig2").getText());
                                                        BinsAsig = BinsAsig + 1;
                                                        sap.ui.getCore().byId("idValorBinsAsig2").setText(BinsAsig.toString());
                                                        sap.ui.getCore().byId("escaner2").setValue("");
                                                        sap.ui.getCore().byId("escaner2").focus();
                                                        oThis.valor = "";
                                                    }.bind(this),
                                                    error: function (response) {
                                                        var respuesta3 = "No se realizo la acción 'Estado Sgte'.";
                                                        try {
                                                            var respuesta = response.responseText.toString();
                                                            respuesta = respuesta.split('<message xml:lang="es">');
                                                            respuesta = respuesta[1];
                                                            respuesta = respuesta.split('</message>');
                                                            respuesta = respuesta[0];
                                                            respuesta3 = respuesta;
                                                        } catch (err) {
                                                            console.log(err);
                                                        }
                                                        var dialog = new sap.m.Dialog({
                                                            title: 'Error',
                                                            type: 'Message',
                                                            state: 'Error',
                                                            content: new sap.m.Text({
                                                                text: respuesta3
                                                            }),
                                                            beginButton: new sap.m.Button({
                                                                text: 'Aceptar',
                                                                type: 'Emphasized',
                                                                press: function () {
                                                                    dialog.close();
                                                                }
                                                            }),
                                                            afterClose: function () {
                                                                dialog.destroy();
                                                            }
                                                        });
                                                        dialog.open();
                                                    }.bind(this)
                                                });
                                            },
                                        });
                                        ///////////////////////////////////////////////////////////////////


                                    } else {
                                        var dialog = new sap.m.Dialog({
                                            title: 'Alerta',
                                            type: 'Message',
                                            state: 'Warning',
                                            content: new sap.m.Text({
                                                text: 'El bin actual ya ha sido escaneado y registrado .'
                                            }),
                                            beginButton: new sap.m.Button({
                                                text: 'Aceptar',
                                                type: 'Emphasized',
                                                press: function () {
                                                    dialog.close();
                                                }
                                            }),
                                            afterClose: function () {
                                                dialog.destroy();
                                            }
                                        });

                                        dialog.open();
                                    }
                                } else {
                                    var dialog = new sap.m.Dialog({
                                        title: 'Alerta',
                                        type: 'Message',
                                        state: 'Warning',
                                        content: new sap.m.Text({
                                            text: 'El total de bins confirmados se ha completado .'
                                        }),
                                        beginButton: new sap.m.Button({
                                            text: 'Aceptar',
                                            type: 'Emphasized',
                                            press: function () {
                                                dialog.close();
                                            }
                                        }),
                                        afterClose: function () {
                                            dialog.destroy();
                                        }
                                    });
                                    dialog.open();
                                }
                            } else {
                                var dialog = new sap.m.Dialog({
                                    title: 'Error',
                                    type: 'Message',
                                    state: 'Error',
                                    content: new sap.m.Text({
                                        text: 'Se requiere un total de 5 dígitos para el ingreso del bin .'
                                    }),
                                    beginButton: new sap.m.Button({
                                        text: 'Aceptar',
                                        type: 'Emphasized',
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();
                            }
                            jQuery.sap.delayedCall(0, this, function () {
                                sap.ui.getCore().byId("escaner2").focus();
                            });

                        }.bind(this)
                    }),
                    oTable
                ],
                beginButton: new sap.m.Button({
                    icon: "sap-icon://save",
                    text: "Guardar",
                    press: function () {
                        var oView = oThis.getView();
                        var oModelP = oView.getModel("myParam");
                        var tabDet;
                        //var tabDet = oModelP.getProperty(path + "/ESCANER");
                        var error = "";
                        var binsAsig = sap.ui.getCore().byId("idValorBins2").getText();

                        ///////////////////////////////////////////////////////////////////////////////////////////
                        var tabDetSol = oModelP.getProperty(path + "/ESCANER");
                        var tabDetTemp = [];
                        var llaveDetTemp = {};
                        for (var chu1 = 0; chu1 < tabDetSol.length; chu1++) {
                            for (var chu2 = 0; chu2 < tabDetSol.length - 1; chu2++) {
                                if (chu1 !== chu2) {
                                    if (tabDetSol[chu1].Numero === tabDetSol[chu2].Numero) {
                                        tabDetSol[chu1].Numero = "";
                                    }
                                }
                            }
                        }

                        for (var chu3 = 0; chu3 < tabDetSol.length; chu3++) {
                            if (tabDetSol[chu3].Numero !== "") {
                                llaveDetTemp = {};
                                llaveDetTemp = tabDetSol[chu3];
                                tabDetTemp.push(llaveDetTemp);
                            }
                        }

                        tabDet = tabDetTemp;

                        console.log(tabDet);
                        console.log(tabDetTemp);
                        if (tabDetSol.length === tabDet.length) {
                            ///////////////////////////////////////////////////////////////////////////////////////////

                            if (tabDet.length === parseInt(binsAsig)) {
                                oModelP.setProperty(path + "/accion1", false);
                                oModelP.setProperty(path + "/accion2", true);
                                oDialog.close();
                                var dialog = new sap.m.Dialog({
                                    title: 'Guardado',
                                    type: 'Message',
                                    state: 'Success',
                                    content: new sap.m.Text({
                                        text: 'Se guardó correctamente los HUs ingresados.'
                                    }),
                                    beginButton: new sap.m.Button({
                                        text: 'Aceptar',
                                        type: 'Emphasized',
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();
                            } else {
                                var resta = parseInt(binsAsig) - parseInt(tabDet.length);
                                var dialog = new sap.m.Dialog({
                                    title: 'Alerta',
                                    type: 'Message',
                                    state: 'Warning',
                                    content: new sap.m.Text({
                                        text: 'El total de bins confirmados no se ha completado. Faltantes (' + resta + ')'
                                    }),
                                    beginButton: new sap.m.Button({
                                        text: 'Aceptar',
                                        type: 'Emphasized',
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();
                            }
                            ///////////////////////////////////////////////////////////////////////////////////////
                        } else {
                            var dialog = new sap.m.Dialog({
                                title: 'Alerta',
                                type: 'Message',
                                state: 'Warning',
                                content: new sap.m.Text({
                                    text: 'Existen códigos duplicados, se procederá a eliminarlos. ¿Está de acuerdo?'
                                }),
                                beginButton: new sap.m.Button({
                                    text: 'Aceptar',
                                    type: 'Emphasized',
                                    press: function () {
                                        ///////////////////////////////////////////////////////////////////////////////////////
                                        oModelP.setProperty("/ESCANER", tabDet);
                                        var vectorEliminarVacios = [];
                                        var llaveEliminarVacios = {};
                                        for (var cev = 0; cev < tabDet.length; cev++) {
                                            if (tabDet[cev].Numero !== "") {
                                                llaveEliminarVacios = {};
                                                llaveEliminarVacios = tabDet[cev];
                                                vectorEliminarVacios.push(llaveEliminarVacios);
                                            }
                                        }
                                        tabDet = vectorEliminarVacios;
                                        console.log(vectorEliminarVacios);
                                        oModelP.setProperty(path + "/ESCANER", tabDet);
                                        sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                                        sap.ui.getCore().byId("idValorBinsAsig2").setText(tabDet.length.toString());
                                        ///////////////////////////////////////////////////////////////////////////////////////
                                        dialog.close();
                                    }.bind(this)
                                }),
                                endButton: new sap.m.Button({
                                    icon: "sap-icon://cancel",
                                    text: 'Cancel',
                                    press: function () {
                                        dialog.close();
                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                }
                            });
                            dialog.open();
                        }
                        ///////////////////////////////////////////////////////////////////////////////////////
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: "Cancelar",
                    press: function () {

                        oDialog.close();
                    }.bind(this)
                }),
                afterClose: function () {

                    oDialog.destroy();
                }
            });
            oDialog.open();
        },
        onPressNotificacion: function (event) {
            var oThis = this;
            oThis.valor = "";
            var oDialog = new sap.m.Dialog({
                title: "Notificación de producto terminado",
                contentWidth: "580px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: "Id de reproceso",

                        width: "50%"
                    }),
                    new sap.m.Input({
                        id: "idReproceso",
                        valueStateText: "El campo Id de Reproceso (10) no debe estar vacío.",
                        maxLength: 10,
                        width: "50%"
                    }),
                    new sap.m.Label({
                        text: "Orden de reproceso",
                        width: "50%"
                    }),
                    new sap.m.Input({
                        id: "idOrden",
                        maxLength: 10,
                        width: "35%",
                        editable: false
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        width: "15%",
                        icon: "sap-icon://course-program",
                        press: function () {
                            oThis.BusquedaOrden();
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "Producto",
                        width: "50%"
                    }),
                    new sap.m.Input({
                        id: "idProducto",
                        width: "50%",
                        editable: false
                    }),
                    new sap.m.Label({
                        text: "Viaje",
                        width: "50%"
                    }),
                    new sap.m.Input({
                        id: "idViaje",
                        width: "50%",
                        editable: false
                    }),
                    new sap.m.Label({
                        text: "Cantidad",
                        width: "50%"
                    }),
                    new sap.m.Input({
                        id: "idCantidad",
                        maxLength: 4,
                        width: "50%",
                        liveChange: function (oEvent) {
                            if (sap.ui.getCore().byId("idMax").getValue() !== "") {
                                var value = oEvent.getSource().getValue();
                                var idMax = sap.ui.getCore().byId("idMax").getValue().toString();
                                var bNotnumber = isNaN(value);
                                if (bNotnumber === false) {
                                    if (parseInt(idMax) >= parseInt(value)) {
                                        oThis.valor = value;
                                    } else {
                                        if (value === "") {

                                            oEvent.getSource().setValue("");
                                            oThis.valor = "";
                                        } else {
                                            sap.m.MessageToast.show("La cantidad no puede ser mayor al máximo de paletas.");
                                            oEvent.getSource().setValue(oThis.valor);
                                        }
                                    }
                                    //  sNumber = value;
                                } else {

                                    oEvent.getSource().setValue(oThis.valor);
                                }

                            } else {
                                oEvent.getSource().setValue(oThis.valor);
                                sap.m.MessageToast.show("Se requiere seleccionar el orden de reproceso.");
                            }

                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "Máx. Pallet",
                        width: "50%"
                    }),
                    new sap.m.Input({
                        id: "idMax",
                        width: "50%",
                        editable: false
                    }),
                    new sap.m.Label({
                        id: "idSkynetLabel",
                        text: "Nro. Pallet Skynet",
                        width: "50%"
                    }),
                    new sap.m.Input({
                        id: "idSkynet",
                        maxLength: 10,
                        width: "50%"
                    }),
                    new sap.m.Label({
                        text: "Comentario",
                        width: "50%"
                    }),
                    new sap.m.TextArea({
                        maxLength: 40,
                        id: "comentario",
                        width: '100%',
                        placeholder: 'Añade un comentario (opcional)'
                    })
                ],
                beginButton: new sap.m.Button({
                    icon: "sap-icon://activity-individual",
                    text: "Notificar",
                    press: function () {
                        sap.ui.core.BusyIndicator.show(0);
                        var inputs = [
                            sap.ui.getCore().byId("idReproceso"),
                            sap.ui.getCore().byId("idOrden"),
                            sap.ui.getCore().byId("idProducto"),
                            sap.ui.getCore().byId("idViaje"),
                            sap.ui.getCore().byId("idCantidad"),
                            sap.ui.getCore().byId("idMax")
                        ];
                        if (sap.ui.getCore().byId("idSkynet").getVisible()) {
                            inputs.push(sap.ui.getCore().byId("idSkynet"));
                        }
                        jQuery.each(inputs, function (i, input) {
                            if (!input.getValue()) {
                                input.setValueState("Error");
                            } else {
                                input.setValueState("None");
                            }
                        });
                        var canContinue = true;
                        jQuery.each(inputs, function (i, input) {
                            if ("Error" === input.getValueState()) {
                                canContinue = false;
                                return false;
                            }
                        });
                        if (canContinue) {
                            var view = sap.ui.getCore();
                            var T_BINES = [];
                            var PALETA = [];
                            var row = {};
                            row.ID_REPRO = view.byId("idReproceso").getValue().toString();
                            row.AUFNR = view.byId("idOrden").getValue().toString();
                            var material = view.byId("idProducto").getValue().toString();
                            material = material.split("-");
                            row.MATNR = material[0];
                            var viaje = view.byId("idViaje").getValue().toString();
                            viaje = viaje.split("-");
                            row.VIAJE = viaje[0];
                            row.PEDIDO = viaje[1];
                            row.CANT = view.byId("idCantidad").getValue().toString();
                            row.MAXPAL = view.byId("idMax").getValue().toString();

                            if (sap.ui.getCore().byId("idSkynet").getVisible()) {
                                row.CODSKY = view.byId("idSkynet").getValue().toString();
                            } else {
                                row.CODSKY = "";
                            }

                            PALETA.push(row);
                            row = {};
                            row.COMENT = view.byId("comentario").getValue().toString();
                            row.PARAM = "RPNOT";
                            row.VECTOR = [];
                            row.REPALETA = PALETA;
                            T_BINES.push(row);
                            T_BINES = JSON.stringify(T_BINES);
                            console.log(T_BINES);
                            // oDialog.close();

                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                type: 'GET',
                                async: false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                },
                                complete: function (xhr) {
                                    var token = xhr.getResponseHeader("X-CSRF-Token");

                                    //         $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/CP/" + VBELN + "/" + WERKS, {
                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                        type: 'POST',
                                        data: T_BINES,
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('X-CSRF-Token', token);

                                        },
                                        success: function (response) {


                                            try {
                                                var string = response.getElementsByTagName("entry")[0];
                                                string = string.getElementsByTagName("m:properties")[0];
                                                string = string.getElementsByTagName("d:ID")[0].childNodes[0].nodeValue;
                                                string = string.split("-");
                                                var HU = string[0];
                                                var Pedido = string[1];
                                                sap.ui.core.BusyIndicator.hide();
                                            } catch (err) {
                                                sap.ui.core.BusyIndicator.hide();
                                                var HU = "";
                                                var Pedido = "";
                                            }

                                            var dialog = new sap.m.Dialog({
                                                title: 'Guardado',
                                                type: 'Message',
                                                state: 'Success',
                                                content: [
                                                    new sap.ui.layout.VerticalLayout({
                                                        content: [
                                                            new sap.m.Text({
                                                                text: "Se creó correctamente el pallet de producto terminado.",
                                                                width: "100%"
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
                                                                            })
                                                                        ]
                                                                    }),
                                                                    new sap.ui.layout.VerticalLayout({
                                                                        content: [

                                                                            new sap.m.Label({
                                                                                text: HU
                                                                            }),
                                                                            new sap.m.Label({
                                                                                text: Pedido
                                                                            })
                                                                        ]
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ],
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            oDialog.close();
                                            dialog.open();
                                        }.bind(this),
                                        error: function (response) {
                                            sap.ui.core.BusyIndicator.hide();
                                            oThis.byId("idPaletTable").getBinding("items").refresh(true);
                                            var respuesta2 = "No se guardó la notificación de producto terminado.";
                                            try {
                                                var respuesta = response.responseText.toString();
                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                respuesta = respuesta[1];
                                                respuesta = respuesta.split('</message>');
                                                respuesta = respuesta[0];
                                                respuesta2 = respuesta;
                                            } catch (err) {
                                                console.log(err);
                                            }
                                            var dialog = new sap.m.Dialog({
                                                title: 'Error generado',
                                                type: 'Message',
                                                state: 'Error',
                                                content: new sap.m.Text({
                                                    text: respuesta2
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }.bind(this)
                                    });

                                },
                                success: function (response) { },
                                error: function (response) {
                                    console.log(response);
                                }
                            });
                        } else {
                            sap.ui.core.BusyIndicator.hide();
                            var dialogV = new sap.m.Dialog({
                                title: "Warning",
                                type: "Message",
                                state: "Warning",
                                content: new sap.m.Text({
                                    text: "Se requiere el ingreso de los datos indicados."

                                }),
                                beginButton: new sap.m.Button({
                                    text: "Aceptar",
                                    type: "Emphasized",
                                    press: function () {
                                        dialogV.close();
                                        dialogV.destroy();

                                    }
                                }),
                                afterClose: function () {
                                    dialogV.destroy();
                                }
                            });

                            dialogV.open();
                        }

                    }
                }),
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: "Cancelar",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
            sap.ui.getCore().byId("idSkynetLabel").setVisible(false);
            sap.ui.getCore().byId("idSkynet").setVisible(false);
        },
        onPressReproceso: function (event) {
            var oDialog = new sap.m.Dialog("Dialog", {
                title: "Reproceso Palet",
                contentWidth: "680px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.Button({
                        icon: "sap-icon://duplicate",
                        text: "Transformar Pallet para reproceso",
                        type: "Emphasized",
                        width: "100%",
                        press: function () {
                            this.onPressReproceso2();
                        }.bind(this)
                    }),

                    new sap.m.Button({
                        icon: "sap-icon://show",
                        text: "Visualizar Id de reproceso",
                        type: "Emphasized",
                        width: "100%",
                        press: function () {
                            this.sNumber = "";
                            this.onPressVisualizar();
                        }.bind(this)
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://pushpin-on",
                        text: "Notificación producto terminado",
                        type: "Emphasized",
                        width: "100%",
                        press: function () {
                            this.onPressNotificacion();
                        }.bind(this)
                    })
                ],
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: "Cancelar",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
        },
        onPressVisualizar: function () {
            var oTable = new sap.m.Table({
                id: "idTableProceso",
                width: "100%",
                noDataText: "Ningún reproceso encontrado",
                growing: true,
                growingThreshold: 6
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Id Reproceso"
                        })
                    ]
                })
            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Orden Reproceso"
                        })
                    ]
                })
            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Material"
                        })
                    ]
                })
            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Lote"
                        })
                    ]
                })
            }));
            oTable.addColumn(new sap.m.Column({

                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            id: "idCant",
                            text: "Cantidad (CJ)"
                        })
                    ]
                })
            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Materia prima"
                        })
                    ]
                })
            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Lote"
                        })
                    ]
                })
            }));
            oTable.addColumn(new sap.m.Column({

                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            id: "idCantPrim",
                            text: "Cantidad (KG)"
                        })
                    ]
                })
            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Text({
                            text: "Indicador"
                        })
                    ]
                })
            }));
            var columnListItem = new sap.m.ColumnListItem({
                cells: [
                    new sap.m.Text({
                        text: "{ID_REPRO}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{ORDEN_REPRO}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{MATNR}-{MAKTX}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{LOTE}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{CANTIDAD}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{MATNR_MP}-{MAKTX_MP}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{LOTE_MP}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{CANTIDAD_MP}",
                        textAlign: "Center"
                    }),
                    new sap.m.Text({
                        text: "{IND_REPRO}",
                        textAlign: "Center"
                    })
                ]
            });
            var oDialog = new sap.m.Dialog("Dialog3", {
                title: "Visualizar Id de reproceso",
                contentWidth: "2000px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: "Seleccionar ID : ",
                        design: "Bold",

                        width: "9%"
                    }),
                    new sap.m.Input({
                        id: "idReproceso",
                        valueStateText: "El campo Id de Reproceso (10) no debe estar vacío.",
                        maxLength: 10,
                        width: "25%",
                        liveChange: function (oEvent) {
                            var value = oEvent.getSource().getValue();
                            if (value !== "") {
                                var bNotnumber = isNaN(value);
                                if (bNotnumber) {
                                    oEvent.getSource().setValue(this.sNumber);
                                } else {
                                    this.sNumber = value;
                                }
                            } else {
                                this.sNumber = "";
                            }
                        }
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "34%"
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://show",
                        text: "Visualizar",
                        type: "Emphasized",
                        width: "30%",
                        press: function () {
                            sap.ui.core.BusyIndicator.show(0);
                            var inputs = [
                                sap.ui.getCore().byId("idReproceso")
                            ];
                            jQuery.each(inputs, function (i, input) {
                                if (!input.getValue()) {
                                    input.setValueState("Error");
                                } else {
                                    input.setValueState("None");
                                }
                            });
                            var canContinue = true;
                            jQuery.each(inputs, function (i, input) {
                                if ("Error" === input.getValueState()) {
                                    canContinue = false;
                                    return false;
                                }
                            });
                            if (canContinue) {

                                var lv_id_repro = sap.ui.getCore().byId("idReproceso").getValue();
                                var texto = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('RPID-----------" + lv_id_repro + "')/$value";
                                var oModel = new sap.ui.model.json.JSONModel(texto, false);
                                oModel.attachRequestCompleted(function () {
                                    try {
                                        console.log(oModel.getJSON());
                                        sap.ui.getCore().setModel(oModel, "data_select2");
                                        oTable.setModel(sap.ui.getCore().getModel("data_select2"));
                                        oTable.bindAggregation("items", "/ITAB", columnListItem);
                                        sap.ui.core.BusyIndicator.hide();
                                    } catch (err) {
                                        sap.ui.core.BusyIndicator.hide();
                                        console.log(err);
                                    }
                                });
                            } else {
                                sap.ui.core.BusyIndicator.hide();
                                var dialogV = new sap.m.Dialog({
                                    title: "Warning",
                                    type: "Message",
                                    state: "Warning",
                                    content: new sap.m.Text({
                                        text: "Se requiere el ingreso de los datos indicados."

                                    }),
                                    beginButton: new sap.m.Button({
                                        text: "Aceptar",
                                        type: "Emphasized",
                                        press: function () {
                                            dialogV.close();
                                            dialogV.destroy();

                                        }
                                    }),
                                    afterClose: function () {
                                        dialogV.destroy();
                                    }
                                });

                                dialogV.open();
                            }
                        }.bind(this)
                    }),
                    new sap.m.Panel({
                        id: "idPanelTable",
                        headerText: "Relación de Producto terminados reprocesados por ID",
                        width: "auto",
                        content: [
                            oTable
                        ]
                    })

                ],
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: "Cancelar",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
        },

        handleSearchLin: function (oEvt) {
            var sValue = oEvt.getParameter("value");
            var oFilter = new sap.ui.model.Filter("LIN_E", sap.ui.model.FilterOperator.Contains, sValue);
            var oFilter2 = new sap.ui.model.Filter("DESC", sap.ui.model.FilterOperator.Contains, sValue);
            var oBinding = oEvt.getSource().getBinding("items");
            oBinding.filter(new sap.ui.model.Filter([oFilter, oFilter2], false));
            //oBinding.filter([oFilter], "Application");
        },

        handleCloseLin: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts.length) {
                var valor = aContexts.map(function (oContext) {
                    return oContext.getObject().DESC;
                }).join(", ");
                var productInput = sap.ui.getCore().byId("idLineaProd");
                productInput.setValue(valor);
            }
            oEvent.getSource().getBinding("items").filter([]);

        },

        BusquedaLinea2: function () {

            var oThis = this;

            var oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('VOLLI')/$value");
            /*var oModel = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/VCHPR/" + VBELN + "/" +
              WERKS, false);*/

            console.log(oModel);
            sap.ui.getCore().setModel(oModel, "cliente");

            var pressDialog = new sap.m.SelectDialog({
                noDataText: "No hay datos de línea",
                title: "Lista de Líneas",
                search: [this.handleSearchLin, this],
                confirm: [this.handleCloseLin, this],
                close: [this.handleCloseLin, this],
                items: {
                    path: "/ITAB",
                    sorter: {
                        path: "/ITAB>LIN_E"
                    },
                    template: new sap.m.StandardListItem({
                        title: "{LIN_E} - {DESC}",
                        type: "Active"
                    })
                },
                beginButton: new sap.m.Button({
                    text: "Close",
                    type: "Reject",
                    press: function () {
                        pressDialog.close();
                    },
                    afterClose: function () {
                        pressDialog.destroy();
                    }
                })
            });
            pressDialog.setModel(sap.ui.getCore().getModel("cliente"));
            this.getView().addDependent(pressDialog);
            pressDialog.open();
        },

        oDialogAlmacenar: function (event) {

            var oThis = this;
            this.valor = "";
            var oContext = event.getSource().getBindingContext("TP");
            var VBELN = oContext.getProperty("VBELN").toString();
            var WERKS = oContext.getProperty("WERKS");
            var MODULO = oContext.getProperty("MODULO").toString();
            var VARIEDAD = oContext.getProperty("VARIEDAD").toString();
            //  var BinsLength = oContext.getProperty("BinsVector");
            var contBin = 0;
            var contBinReg = 0;
            /*  for (var i = 0; i < BinsLength.length; i++) {
                if (BinsLength[i].Escaneado2 !== "---") {
                  contBin++;
                } else {
                  contBinReg++;
                }
              }*/

            var path = oContext.getPath().toString();
            var oTable = new sap.m.Table({
                id: "idTableRepo",
                title: "Tabla detalle",
                width: "100%",
                noDataText: "Ningún módulo registrado"
                //items:"{/TablaProyeccionData}"
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Planta"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Ubicación"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Sub"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Fila"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Columna"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Posición"
                        })
                    ]
                })

            }));
            var columnListItem = new sap.m.ColumnListItem({
                vAlign: "Middle",
                cells: [
                    new sap.m.Label({
                        text: "{MODULO}"
                    }),
                    new sap.m.Label({
                        text: "{BINS}"
                    }),
                    new sap.m.Label({
                        text: "{JABAS}"
                    }),
                    new sap.m.Label({
                        text: "{PALLETS}"
                    })
                ]
            });

            var oTable2 = new sap.m.Table({
                id: "idTableModulo2",
                noDataText: "Ningún módulo registrado",
                width: "100%"
                //items:"{/TablaProyeccionData}"
            });
            oTable2.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"
            }));
            oTable2.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"
            }));
            oTable2.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"
            }));
            columnListItem = new sap.m.ColumnListItem({
                vAlign: "Middle",
                cells: [
                    new sap.ui.layout.HorizontalLayout({
                        allowWrapping: false,
                        content: [
                            new sap.m.Label({
                                text: "{Numero}",
                                design: "Bold",
                                visible: "{Visible}"
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://bar-code",
                                visible: "{Visible}"
                            })

                        ]
                    }),
                    new sap.m.Label({
                        text: "{Escaneado}",
                        design: "Bold"
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://sys-cancel-2",
                        width: "100%",
                        visible: "{= ${Escaneado} !== ''}",
                        press: function (oEvent) {
                            var oView = oThis.getView();
                            var oModelM = oView.getModel("myParam");
                            var BinsLength = oModelM.getProperty("/binsEscaner");
                            var oContext = oEvent.getSource().getBindingContext();

                            var Escaneado = oContext.getProperty("Escaneado");

                            var pare = "";
                            var encontro = "";
                            for (var i = 0; i < BinsLength.length; i++) {

                                if (pare === "" && BinsLength[i].Numero === "---") {
                                    pare = i.toString();
                                }
                                if (Escaneado === BinsLength[i].Escaneado) {
                                    encontro = i.toString();
                                }

                            }
                            BinsLength[pare].Numero = Escaneado;
                            BinsLength[encontro].Escaneado = "";
                            BinsLength[encontro].UBIC = "";
                            BinsLength[pare].Visible = true;
                            oModelM.refresh();
                            var cont1 = parseInt(sap.ui.getCore().byId("cont1").getText().toString());
                            cont1 = cont1 - 1;
                            sap.ui.getCore().byId("cont1").setText(cont1.toString());
                            var cont2 = parseInt(sap.ui.getCore().byId("cont2").getText().toString());
                            cont2 = cont2 + 1;
                            sap.ui.getCore().byId("cont2").setText(cont2.toString());
                            sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                        }
                    })
                ]
            });
            var oModelT = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('TPDET---" + VBELN + "-" + MODULO +
                "-" + VARIEDAD + "')/$value",
                false);
            /* var oModelT = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/TPDET/" + VBELN + "/" +
               MODULO,
               false);*/
            sap.ui.getCore().setModel(oModelT, "data_select2");
            var scanInput = new sap.m.Input({
                maxLength: 25,
                id: "escaner",
                valueStateText: "El campo bin no debe estar vacío.",
                width: "100%",
                liveChange: function (oEvent) {
                    var value = oEvent.getSource().getValue();
                    var bNotnumber = isNaN(value);
                    if (bNotnumber === false) {
                        oThis.valor = value;
                        //  sNumber = value;
                    } else {
                        oEvent.getSource().setValue(oThis.valor);
                    }
                }.bind(this)
            });
            scanInput.onsapenter = (function (oEvent) {
                var oView = oThis.getView();
                var oModelM = oView.getModel("myParam");
                var Bins = oModelM.getProperty("/binsEscaner");
                //  var Bins = oContext.getProperty("Bins");
                var view = sap.ui.getCore();
                var inputs = [
                    view.byId("escaner")
                ];
                jQuery.each(inputs, function (i, input) {
                    if (!input.getValue()) {
                        input.setValueState("Error");
                    } else {
                        input.setValueState("None");
                    }
                });
                var canContinue = true;
                jQuery.each(inputs, function (i, input) {
                    if ("Error" === input.getValueState()) {
                        canContinue = false;
                    }
                });
                if (canContinue) {
                    var escaner = sap.ui.getCore().byId("escaner").getValue();
                    var pare = "";
                    var encontro = "";
                    for (var i = 0; i < Bins.length; i++) {
                        if (pare === "" && Bins[i].Escaneado === "") {
                            pare = i.toString();
                        }
                        if (escaner === Bins[i].Numero) {
                            encontro = i.toString();
                        }

                    }
                    if (encontro === "") {

                        var dialog = new sap.m.Dialog({
                            title: 'Alerta',
                            type: 'Message',
                            state: 'Warning',
                            content: new sap.m.Text({
                                text: 'El código escaneado no se encuentra en la lista de códigos registrados .'
                            }),
                            beginButton: new sap.m.Button({
                                text: 'Aceptar',
                                type: 'Emphasized',
                                press: function () {
                                    dialog.close();
                                }
                            }),
                            afterClose: function () {
                                dialog.destroy();
                            }
                        });

                        dialog.open();
                    } else {
                        var realizar = 0;
                        for (i = 0; i < Bins.length; i++) {
                            if (encontro === i.toString()) {
                                realizar = 1;
                            }
                            if (realizar === 1 && i !== Bins.length - 1) {
                                var y = i + 1;
                                if (Bins[y].Numero === "---") {
                                    Bins[i].Numero = "---";
                                    Bins[i].Visible = false;
                                    i = Bins.length + 1;
                                } else {
                                    Bins[i].Numero = Bins[y].Numero;
                                }

                            }
                            if (i === Bins.length - 1) {
                                Bins[i].Numero = "---";
                                Bins[i].Visible = false;
                            }
                        }
                        Bins[pare].Escaneado = escaner;
                        //  Bins[encontro].Numero = "---";
                        //  Bins[encontro].Visible = false;
                        oModelM.refresh();
                        var cont1 = parseInt(sap.ui.getCore().byId("cont1").getText().toString());
                        cont1 = cont1 + 1;
                        sap.ui.getCore().byId("cont1").setText(cont1.toString());
                        var cont2 = parseInt(sap.ui.getCore().byId("cont2").getText().toString());
                        cont2 = cont2 - 1;
                        sap.ui.getCore().byId("cont2").setText(cont2.toString());
                        sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                        sap.ui.getCore().byId("escaner").setValue("");
                        sap.ui.getCore().byId("escaner").focus();
                        oThis.valor = "";

                    }
                } else {
                    var dialog = new sap.m.Dialog({
                        title: "Warning",
                        type: "Message",
                        state: "Warning",
                        content: new sap.m.Text({
                            text: "Se requiere el ingreso de los datos indicados."

                        }),
                        beginButton: new sap.m.Button({
                            text: "OK",
                            press: function () {
                                dialog.close();
                                dialog.destroy();

                            }
                        }),
                        afterClose: function () {
                            dialog.destroy();
                        }
                    });

                    dialog.open();
                }
                var id = sap.ui.getCore().byId("escaner").getId();
                console.log(id);
                $(id).focus();
            }.bind(this));
            var oDialog = new sap.m.Dialog("Dialog", {
                title: "Stage módulo",
                contentWidth: "680px",
                modal: true,
                type: "Message",
                content: [oTable,
                    new sap.m.Label({
                        text: "",
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: "Escanear HU",
                        design: "Bold",
                        width: "100%"
                    }),
                    scanInput,
                    new sap.m.Button({
                        text: "Entrar",
                        type: "Emphasized",
                        width: "100%",
                        press: function () {
                            var oView = oThis.getView();
                            var oModelM = oView.getModel("myParam");
                            var Bins = oModelM.getProperty("/binsEscaner");
                            //  var Bins = oContext.getProperty("Bins");
                            var view = sap.ui.getCore();
                            var inputs = [
                                view.byId("escaner")
                            ];
                            jQuery.each(inputs, function (i, input) {
                                if (!input.getValue()) {
                                    input.setValueState("Error");
                                } else {
                                    input.setValueState("None");
                                }
                            });
                            var canContinue = true;
                            jQuery.each(inputs, function (i, input) {
                                if ("Error" === input.getValueState()) {
                                    canContinue = false;
                                }
                            });
                            if (canContinue) {
                                var escaner = sap.ui.getCore().byId("escaner").getValue();
                                var pare = "";
                                var encontro = "";
                                for (var i = 0; i < Bins.length; i++) {
                                    if (pare === "" && Bins[i].Escaneado === "") {
                                        pare = i.toString();
                                    }
                                    if (escaner === Bins[i].Numero) {
                                        encontro = i.toString();
                                    }

                                }
                                if (encontro === "") {

                                    var dialog = new sap.m.Dialog({
                                        title: 'Alerta',
                                        type: 'Message',
                                        state: 'Warning',
                                        content: new sap.m.Text({
                                            text: 'El código escaneado no se encuentra en la lista de códigos registrados .'
                                        }),
                                        beginButton: new sap.m.Button({
                                            text: 'Aceptar',
                                            type: 'Emphasized',
                                            press: function () {
                                                dialog.close();
                                            }
                                        }),
                                        afterClose: function () {
                                            dialog.destroy();
                                        }
                                    });

                                    dialog.open();
                                } else {
                                    var realizar = 0;
                                    for (i = 0; i < Bins.length; i++) {
                                        if (encontro === i.toString()) {
                                            realizar = 1;
                                        }
                                        if (realizar === 1 && i !== Bins.length - 1) {
                                            var y = i + 1;
                                            if (Bins[y].Numero === "---") {
                                                Bins[i].Numero = "---";
                                                Bins[i].Visible = false;
                                                i = Bins.length + 1;
                                            } else {
                                                Bins[i].Numero = Bins[y].Numero;
                                            }

                                        }
                                        if (i === Bins.length - 1) {
                                            Bins[i].Numero = "---";
                                            Bins[i].Visible = false;
                                        }
                                    }
                                    Bins[pare].Escaneado = escaner;
                                    //  Bins[encontro].Numero = "---";
                                    //  Bins[encontro].Visible = false;
                                    oModelM.refresh();
                                    var cont1 = parseInt(sap.ui.getCore().byId("cont1").getText().toString());
                                    cont1 = cont1 + 1;
                                    sap.ui.getCore().byId("cont1").setText(cont1.toString());
                                    var cont2 = parseInt(sap.ui.getCore().byId("cont2").getText().toString());
                                    cont2 = cont2 - 1;
                                    sap.ui.getCore().byId("cont2").setText(cont2.toString());
                                    sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                                    sap.ui.getCore().byId("escaner").setValue("");
                                    sap.ui.getCore().byId("escaner").focus();
                                    oThis.valor = "";

                                }
                            } else {
                                var dialog = new sap.m.Dialog({
                                    title: "Warning",
                                    type: "Message",
                                    state: "Warning",
                                    content: new sap.m.Text({
                                        text: "Se requiere el ingreso de los datos indicados."

                                    }),
                                    beginButton: new sap.m.Button({
                                        text: "OK",
                                        press: function () {
                                            dialog.close();
                                            dialog.destroy();

                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });

                                dialog.open();
                            }

                            jQuery.sap.delayedCall(0, this, function () {
                                sap.ui.getCore().byId("escaner").focus();
                            });
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "100%"
                    }),
                    new sap.tnt.ToolHeader({
                        content: [
                            new sap.m.ToolbarSpacer({

                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://arrow-top"
                            }),
                            new sap.m.Label({
                                text: contBin,
                                id: "cont2",
                                textAlign: "Center",
                                design: "Bold"
                            }),
                            new sap.m.ToolbarSpacer({
                                width: "27%"
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://arrow-bottom"
                            }),
                            new sap.m.Label({
                                text: contBinReg,
                                id: "cont1",
                                textAlign: "Center",
                                design: "Bold"
                            }),
                            new sap.m.ToolbarSpacer({

                            }),
                            new sap.m.ToolbarSpacer({

                            }),
                            new sap.m.ToolbarSpacer({

                            })
                        ]
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "100%"
                    }),
                    oTable2
                ],
                beginButton: new sap.m.Button({
                    icon: "sap-icon://save",
                    text: "Guardar",
                    press: function () {
                        sap.ui.core.BusyIndicator.show(0);
                        var oView = oThis.getView();
                        var oModelM = oView.getModel("myParam");
                        var Bins = oModelM.getProperty("/binsEscaner");
                        oModelM.setProperty("/T_BINES", []);
                        var T_BINES = oModelM.getProperty("/T_BINES");
                        var llave = {};
                        var vector = [];
                        var realizar = true;
                        for (var i = 0; i < Bins.length; i++) {
                            if (Bins[i].Escaneado !== "") {
                                llave = {};
                                llave.CENT = WERKS;
                                llave.VBELN = Bins[i].VBELN;
                                llave.MODULO = Bins[i].MODULO;
                                llave.EXIDV = Bins[i].Escaneado;
                                vector.push(llave);
                            }
                        }
                        var row = {};
                        row.COMENT = "";
                        row.PARAM = "TP---" + VBELN + "-" + MODULO + "-";
                        row.VECTOR = vector;
                        row.PALETA = [];

                        T_BINES.push(row);
                        if (realizar) {
                            console.log(T_BINES);
                            T_BINES = JSON.stringify(T_BINES);
                            var oMessageTemplate = new sap.m.MessageItem({
                                type: '{type}',
                                title: '{title}',
                                subtitle: '{subtitle}'
                            });
                            var oMessageView = new sap.m.MessageView({
                                showDetailsPageHeader: false,
                                items: {
                                    path: "/ERRORES",
                                    template: oMessageTemplate
                                }
                            });
                            oMessageView.setModel(oModelM);
                            var dialogError = new sap.m.Dialog({
                                resizable: true,
                                content: oMessageView,
                                state: 'Error',
                                beginButton: new sap.m.Button({
                                    press: function () {
                                        dialogError.close();
                                    },
                                    text: "Cerrar"
                                }),
                                customHeader: new sap.m.Bar({
                                    contentMiddle: [
                                        new sap.m.Text({
                                            text: "Error"
                                        })
                                    ]
                                }),
                                afterClose: function () {
                                    dialogError.destroy();
                                },
                                contentHeight: "200px",
                                contentWidth: "850px",
                                verticalScrolling: false
                            });
                            //   $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/TP/" + VBELN + "/" + WERKS, {
                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                type: 'GET',
                                async: false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                },
                                complete: function (xhr) {
                                    var token = xhr.getResponseHeader("X-CSRF-Token");

                                    //     $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/TP/" + VBELN + "/" + WERKS, {
                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                        type: 'POST',
                                        data: T_BINES,
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('X-CSRF-Token', token);

                                        },
                                        success: function (response) {
                                            var contador = 0;
                                            var date = new Date();
                                            var year = date.getFullYear();
                                            var day = date.getDate();
                                            var month = date.getMonth() + 1;
                                            var oView = oThis.getView();
                                            date = year + "" + day + "" + month;
                                            var texto3 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('TP-" + date + "-1401---')/$value";
                                            var oModelT = new sap.ui.model.json.JSONModel(texto3, false);
                                            oThis.getView().setModel(oModelT, "TP");
                                            oModelT.attachRequestCompleted(function () {
                                                var vectorError = {
                                                    "ERRORES2": []
                                                };
                                                var cont = oModelT.getProperty("/ITAB");
                                                if (cont === null || cont === undefined) {
                                                    var llave = {};
                                                    llave.subtitle = "Error de conexión en el enlace:" + texto3;
                                                    llave.title = "Mensaje de error Nro " + 3;
                                                    llave.type = "Error";
                                                    vectorError.push(llave);
                                                    contador++;
                                                    oView.byId("idButtonError").setVisible(true);
                                                    oView.byId("idButtonError").setText("" + contador);
                                                    oView.byId("GenericTile4").setSubheader("Se ha generado un error");
                                                } else {
                                                    cont = oModelT.getProperty("/ITAB/length");

                                                    oView.byId("GenericTile4").setSubheader("Tienes " + cont + " tareas");
                                                }
                                            }.bind(this));

                                            oThis.getView().getModel("TP").refresh();
                                            sap.ui.core.BusyIndicator.hide();
                                            oThis.byId("idGuiaTable").getBinding("items").refresh(true);

                                            var texto4 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('ZV-" + date + "-1401---')/$value";
                                            var oModelZ = new sap.ui.model.json.JSONModel(texto4, false);
                                            oThis.getView().setModel(oModelZ, "ZV");
                                            oModelZ.attachRequestCompleted(function () {

                                                var vectorError = {
                                                    "ERRORES2": []
                                                };
                                                var cont = oModelZ.getProperty("/ITAB");

                                                if (cont === null || cont === undefined) {
                                                    var llave = {};
                                                    llave.subtitle = "Error de conexión en el enlace:" + texto4;
                                                    llave.title = "Mensaje de error Nro " + 4;
                                                    llave.type = "Error";
                                                    vectorError.push(llave);
                                                    contador++;
                                                    oView.byId("idButtonError").setVisible(true);
                                                    oView.byId("idButtonError").setText("" + contador);
                                                    oView.byId("GenericTile5").setSubheader("Se ha generado un error");
                                                } else {
                                                    cont = oModelZ.getProperty("/ITAB/length");
                                                    oView.byId("GenericTile5").setSubheader("Tienes " + cont + " tareas");
                                                }
                                                oThis.getView().getModel("ZV").refresh();
                                                oThis.byId("idBinsTable").getBinding("items").refresh(true);
                                            }.bind(this));
                                            var dialog = new sap.m.Dialog({
                                                title: 'Guardado',
                                                type: 'Message',
                                                state: 'Success',
                                                content: new sap.m.Text({
                                                    text: 'Se guardaron correctamente los códigos escaneado .'
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            oDialog.close();
                                            dialog.open();
                                        }.bind(this),
                                        error: function (response) {
                                            sap.ui.core.BusyIndicator.hide();
                                            oThis.byId("idGuiaTable").getBinding("items").refresh(true);
                                            var respuesta2 = "No se guardaron correctamente los códigos escaneados .";
                                            try {
                                                var respuesta = response.responseText.toString();
                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                respuesta = respuesta[1];
                                                respuesta = respuesta.split('</message>');
                                                respuesta = respuesta[0];
                                                respuesta2 = respuesta;
                                            } catch (err) {
                                                console.log(err);
                                            }
                                            var dialog = new sap.m.Dialog({
                                                title: 'Error generado',
                                                type: 'Message',
                                                state: 'Error',
                                                content: new sap.m.Text({
                                                    text: respuesta2
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }.bind(this)
                                    });

                                },
                                success: function (response) { },
                                error: function (response) {
                                    console.log(response);
                                }
                            });
                        } else {
                            var dialog = new sap.m.Dialog({
                                title: 'Alerta',
                                type: 'Message',
                                state: 'Warning',
                                content: new sap.m.Text({
                                    text: 'No todos los códigos han sido escaneados y aprobados.'
                                }),
                                beginButton: new sap.m.Button({
                                    text: 'Aceptar',
                                    type: 'Emphasized',
                                    press: function () {
                                        dialog.close();
                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                }
                            });
                            dialog.open();
                            sap.ui.core.BusyIndicator.hide();
                        }
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: "Cancelar",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();

            sap.ui.core.BusyIndicator.show(0);
            oModelT.attachRequestCompleted(function () {
                jQuery.sap.delayedCall(0, this, function () {
                    sap.ui.getCore().byId("escaner").focus();
                });
                sap.ui.core.BusyIndicator.hide();
                console.log(oModelT.getJSON());
                var lenghtV = oModelT.getProperty("/ITAB");
                var oView = oThis.getView();
                var oModelM = oView.getModel("myParam");
                var llave = {};
                var vector = [];
                for (var i = 0; i < lenghtV.length; i++) {
                    llave = {};
                    llave.VBELN = lenghtV[i].VBELN;
                    llave.MODULO = lenghtV[i].MODULO;
                    llave.Numero = lenghtV[i].EXIDV;
                    llave.UBIC = lenghtV[i].UBIC;
                    llave.PESO = lenghtV[i].PESO;
                    llave.Visible = true;
                    llave.Escaneado = "";
                    vector.push(llave);
                }
                sap.ui.getCore().byId("cont2").setText(lenghtV.length + "");
                oModelM.setProperty("/binsEscaner", vector);
                oTable2.setModel(oModelM);

                oTable2.bindAggregation("items", "/binsEscaner", columnListItem);

                jQuery.sap.delayedCall(2000, this, function () {
                    sap.ui.getCore().byId("escaner").focus();
                });

            });
        },
        oDialogMateria: function (event) {

            var oThis = this;
            this.valor = "";
            var oContext = event;
            console.log(oContext);
            var BinsLength = oContext.getProperty("ZV");
            var guia = oContext.getProperty("GUIA").toString();
            var variedad = oContext.getProperty("VARIEDAD").toString();
            var IND_MAT = oContext.getProperty("IND_MAT").toString();
            var DESCOR = oContext.getProperty("DESCOR").toString();
            var DESC_VAR = oContext.getProperty("DESC_VAR").toString();
            console.log(IND_MAT);
            var visualizar = false;
            var valorEsp, valorImput, valorImput2, valorButton, valorLabel;
            if (IND_MAT === "X") {
                visualizar = true;
                valorEsp = "2%";
                valorImput = "18%";
                valorImput2 = "10%";
                valorLabel = "19%";
                valorButton = "9%";
            } else {
                visualizar = false;
                valorEsp = "4%";
                valorImput = "48%";
                valorImput2 = "0%";
                valorButton = "0%";
            }
            var empresa = oContext.getProperty("TXT_EMP").toString();

            var modulo = oContext.getProperty("MODULO").toString();
            var bin = oContext.getProperty("BINS").toString();
            var pallet = oContext.getProperty("PALLETS").toString();
            var VBELN = oContext.getProperty("VBELN").toString();
            var WERKS = oContext.getProperty("WERKS").toString();
            var contBin = 0;
            var contBinReg = 0;
            /*  for (var i = 0; i < BinsLength.length; i++) {
                if (BinsLength[i].Ubicacion2 !== "---") {
                  contBin++;
                } else {
                  contBinReg++;
                }
              }*/

            var oTable2 = new sap.m.Table({
                id: "idTableModulo2",
                noDataText: "Ningún módulo registrado",
                width: "100%"
                //items:"{/TablaProyeccionData}"
            });
            oTable2.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"
            }));
            oTable2.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"
            }));
            oTable2.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"
            }));
            var columnListItem = new sap.m.ColumnListItem({
                vAlign: "Middle",
                cells: [
                    new sap.ui.layout.HorizontalLayout({
                        allowWrapping: false,
                        content: [
                            new sap.m.Label({
                                //text: "{Numero}",
                                text: {
                                    path: "Numero",
                                    formatter: function (oVal) {
                                        return parseInt(oVal);
                                    }
                                },
                                design: "Bold",
                                visible: "{Visible}"
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://bar-code",
                                visible: "{Visible}"
                            })

                        ]
                    }),
                    new sap.m.Label({
                        //text: "{Escaneado} - {PESO}",
                        text: {
                            parts: [
                                'Escaneado',
                                'PESO'
                            ],
                            formatter: function (esc, pes) {
                                if (esc == "" || esc === null || esc === undefined) return "";
                                return parseInt(esc) + " - " + pes;
                            }
                        },
                        design: "Bold"
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://sys-cancel-2",
                        width: "100%",
                        visible: "{= ${Escaneado} !== ''}",
                        press: function (oEvent) {
                            var oView = oThis.getView();
                            var oModelM = oView.getModel("myParam");
                            var BinsLength = oModelM.getProperty("/binsEscaner");
                            var oContext = oEvent.getSource().getBindingContext();

                            var Escaneado = oContext.getProperty("Escaneado");

                            var pare = "";
                            var encontro = "";
                            for (var i = 0; i < BinsLength.length; i++) {

                                if (pare === "" && BinsLength[i].Numero === "---") {
                                    pare = i.toString();
                                }
                                if (Escaneado === BinsLength[i].Escaneado) {
                                    encontro = i.toString();
                                }

                            }
                            BinsLength[pare].Numero = Escaneado;
                            BinsLength[encontro].Escaneado = "";
                            BinsLength[encontro].PESO = "";
                            BinsLength[encontro].MATNR = "";
                            BinsLength[encontro].CANTIDAD = "";
                            BinsLength[encontro].MATEM = "";
                            BinsLength[pare].Visible = true;
                            oModelM.refresh();
                            var cont1 = parseInt(sap.ui.getCore().byId("cont1").getText().toString());
                            cont1 = cont1 - 1;
                            sap.ui.getCore().byId("cont1").setText(cont1.toString());
                            var cont2 = parseInt(sap.ui.getCore().byId("cont2").getText().toString());
                            cont2 = cont2 + 1;
                            sap.ui.getCore().byId("cont2").setText(cont2.toString());
                            sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                        }
                    })
                ]
            });
            /*   var oModelT = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/ZVDET/" + empresa + "/" +
                 modulo,
                 false);*/

            var oModelT = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('ZVDET---" + VBELN + "-" + modulo +
                "-" + variedad + "')/$value",
                false);
            sap.ui.getCore().setModel(oModelT, "data_select2");
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /*var scanInput = new sap.m.Input({
              maxLength: 25,
              id: "escaner",
              width: valorImput,
              valueStateText: "El campo escaner(25) no debe estar vacío.",
              liveChange: function(oEvent) {
                var value = oEvent.getSource().getValue();
                var bNotnumber = isNaN(value);
                if (bNotnumber === false) {
                  oThis.valor = value;
                  //  sNumber = value;
                } else {
                  oEvent.getSource().setValue(oThis.valor);
                }
              }.bind(this)
            });
            scanInput.onsapenter = (function(oEvent) {
              var oView = oThis.getView();
              var oModelM = oView.getModel("myParam");
              var Bins = oModelM.getProperty("/binsEscaner");
              //  var Bins = oContext.getProperty("Bins");

              var escaner = sap.ui.getCore().byId("escaner").getValue();
              var escaner2 = sap.ui.getCore().byId("escaner2").getValue();
              var producto = sap.ui.getCore().byId("producto").getValue();
              var cantidad2 = sap.ui.getCore().byId("cantidad2").getValue();
              var embalaje = sap.ui.getCore().byId("embalaje").getValue();
              var view = sap.ui.getCore();
              var inputs = [
                view.byId("escaner"),
                view.byId("escaner2"),
                view.byId("producto"),
                view.byId("cantidad2"),
                view.byId("embalaje")
              ];
              jQuery.each(inputs, function(i, input) {
                if (!input.getValue()) {
                  input.setValueState("Error");
                } else {
                  input.setValueState("None");
                }
              });
              var canContinue = true;
              jQuery.each(inputs, function(i, input) {
                if ("Error" === input.getValueState()) {
                  canContinue = false;
                }
              });
              if (canContinue) {

                var pare = "";
                var encontro = "";
                for (var i = 0; i < Bins.length; i++) {
                  if (pare === "" && Bins[i].Escaneado === "") {
                    pare = i.toString();
                  }
                  if (escaner === Bins[i].Numero) {
                    encontro = i.toString();
                  }

                }
                if (encontro === "") {

                  var dialog = new sap.m.Dialog({
                    title: 'Alerta',
                    type: 'Message',
                    state: 'Warning',
                    content: new sap.m.Text({
                      text: 'El código escaneado no se encuentra en la lista de códigos registrados .'
                    }),
                    beginButton: new sap.m.Button({
                      text: 'Aceptar',
                      type: 'Emphasized',
                      press: function() {
                        dialog.close();
                      }
                    }),
                    afterClose: function() {
                      dialog.destroy();
                    }
                  });

                  dialog.open();
                } else {
                  var realizar = 0;
                  for (i = 0; i < Bins.length; i++) {
                    if (encontro === i.toString()) {
                      realizar = 1;
                    }
                    if (realizar === 1 && i !== Bins.length - 1) {
                      var y = i + 1;
                      if (Bins[y].Numero === "---") {
                        Bins[i].Numero = "---";
                        Bins[i].Visible = false;
                        i = Bins.length + 1;
                      } else {
                        Bins[i].Numero = Bins[y].Numero;
                      }

                    }
                    if (i === Bins.length - 1) {
                      Bins[i].Numero = "---";
                      Bins[i].Visible = false;
                    }
                  }
                  Bins[pare].Escaneado = escaner;
                  Bins[pare].PESO = escaner2;
                  Bins[pare].CANTIDAD = cantidad2;
                  Bins[pare].MATEM = embalaje;
                  Bins[pare].MATNR = producto;
                  //  Bins[encontro].Numero = "---";
                  //    Bins[encontro].Visible = false;
                  oModelM.refresh();
                  var cont1 = parseInt(sap.ui.getCore().byId("cont1").getText().toString());
                  cont1 = cont1 + 1;
                  sap.ui.getCore().byId("cont1").setText(cont1.toString());
                  var cont2 = parseInt(sap.ui.getCore().byId("cont2").getText().toString());
                  cont2 = cont2 - 1;
                  sap.ui.getCore().byId("cont2").setText(cont2.toString());
                  sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                  sap.ui.getCore().byId("escaner").setValue("");
                  sap.ui.getCore().byId("escaner2").setValue("");
                  sap.ui.getCore().byId("escaner").focus();
                  oThis.valor = "";

                }
              } else {
                var dialog = new sap.m.Dialog({
                  title: "Warning",
                  type: "Message",
                  state: "Warning",
                  content: new sap.m.Text({
                    text: "Se requiere el ingreso de los datos indicados."

                  }),
                  beginButton: new sap.m.Button({
                    text: "OK",
                    press: function() {
                      dialog.close();
                      dialog.destroy();

                    }
                  }),
                  afterClose: function() {
                    dialog.destroy();
                  }
                });

                dialog.open();
              }
              sap.ui.getCore().byId("escaner").focus();
            }.bind(this));*/
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var oDialog = new sap.m.Dialog("Dialog", {
                title: "HU's a línea de empaque",
                contentWidth: "1180px",
                modal: true,
                type: "Message",
                content: [
                    /////////////////////////// 20200124 /////////////////////////////
                    new sap.m.Label({
                        text: "Línea",
                        design: "Bold",
                        width: "12%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "2%"
                    }),
                    //////////////////////////////////////////////////////////////////
                    new sap.m.Label({
                        text: "Guía",
                        design: "Bold",
                        width: "15%"
                    }),
                    //////////////////////////////////////////////////////////////////
                    new sap.m.Label({
                        text: "",
                        width: "2%"
                    }),
                    new sap.m.Label({
                        text: "Empresa Agrícola",
                        design: "Bold",
                        width: "22%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "2%"
                    }),
                    new sap.m.Label({
                        text: "Módulo",
                        design: "Bold",
                        width: "15%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "2%"
                    }),
                    new sap.m.Label({
                        text: "Variedad",
                        design: "Bold",
                        width: "17%"
                    }),

                    new sap.m.Label({
                        text: "",
                        width: "2%"
                    }),
                    new sap.m.Label({
                        text: "Bin/Pallet",
                        design: "Bold",
                        width: "8%"
                    }),
                    /////////////////////////// 20200124 /////////////////////////////
                    new sap.m.Input({
                        maxLength: 15,
                        id: "idLineaProd",
                        editable: false,
                        valueStateText: "El campo línea no debe estar vacío.",
                        placeholder: "Ingrese línea (15) ...",
                        required: true,
                        width: "7%",
                        visible: visualizar
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        icon: "sap-icon://product",
                        width: "5%",
                        visible: visualizar,
                        press: function () {
                            oThis.BusquedaLinea2();
                        }.bind(this)
                    }),
                    //////////////////////////////////////////////////////////////////
                    new sap.m.Label({
                        text: "",
                        width: "2%"
                    }),
                    new sap.m.Input({
                        id: "Guia",
                        value: guia,
                        editable: false,
                        width: "15%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "2%"
                    }),
                    new sap.m.Input({
                        id: "Empresa",
                        value: empresa,
                        editable: false,
                        width: "22%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "2%"
                    }),
                    new sap.m.Input({
                        id: "Modulo",
                        value: modulo + "-" + DESCOR,
                        editable: false,
                        width: "15%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "2%"
                    }),
                    new sap.m.Input({
                        id: "Variedad",
                        value: variedad + "-" + DESC_VAR,
                        editable: false,
                        width: "17%"
                    }),

                    new sap.m.Label({
                        text: "",
                        width: "2%"
                    }),
                    new sap.m.Input({
                        id: "binPallet",
                        value: bin + "-" + pallet,
                        editable: false,
                        width: "8%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "100%"
                    }),

                    new sap.m.Label({
                        text: "Código Producto",
                        design: "Bold",
                        width: valorLabel,
                        visible: visualizar
                    }),
                    new sap.m.Label({
                        text: "  ",
                        width: valorEsp,
                        visible: visualizar
                    }),
                    new sap.m.Label({
                        text: "Escanear HU",
                        design: "Bold",
                        width: valorImput
                    }),
                    new sap.m.Label({
                        text: "  ",
                        width: valorEsp
                    }),
                    new sap.m.Label({
                        text: "Ingrese peso",
                        design: "Bold",
                        width: valorImput
                    }),
                    new sap.m.Label({
                        text: "  ",
                        width: valorEsp
                    }),
                    new sap.m.Label({
                        text: "Material Embalaje",
                        design: "Bold",
                        width: valorLabel,
                        visible: visualizar
                    }),
                    new sap.m.Label({
                        text: "  ",
                        width: valorEsp
                    }),
                    new sap.m.Label({
                        text: "Cantidad",
                        design: "Bold",
                        width: valorImput,
                        visible: visualizar
                    }),

                    new sap.m.Input({
                        maxLength: 15,
                        id: "producto",
                        editable: false,
                        valueStateText: "El campo producto no debe estar vacío.",
                        placeholder: "Ingrese producto (15) ...",
                        required: true,
                        width: valorImput2,
                        visible: visualizar
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        icon: "sap-icon://product",
                        width: valorButton,
                        visible: visualizar,
                        press: function () {
                            oThis.BusquedaProducto2(WERKS, VBELN, modulo, variedad);
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "  ",
                        width: valorEsp,
                        visible: visualizar
                    }),
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    new sap.m.Input({
                        maxLength: 25,
                        id: "escaner",
                        width: valorImput,
                        valueStateText: "El campo escaner(25) no debe estar vacío.",
                        liveChange: function (oEvent) {
                            var value = oEvent.getSource().getValue();
                            var bNotnumber = isNaN(value);
                            if (bNotnumber === false) {
                                oThis.valor = value;
                                //  sNumber = value;
                            } else {
                                oEvent.getSource().setValue(oThis.valor);
                            }
                        }.bind(this)
                    }),
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //scanInput,
                    new sap.m.Label({
                        text: "  ",
                        width: valorEsp
                    }),
                    new sap.m.Input({
                        maxLength: 25,
                        id: "escaner2",
                        width: valorImput,
                        valueStateText: "El campo peso(25) no debe estar vacío.",
                        ///////////// Codigo extraido programa
                    }),
                    new sap.m.Label({
                        text: "  ",
                        width: valorEsp
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "embalaje",
                        editable: false,
                        valueStateText: "El campo material embalaje no debe estar vacío.",
                        placeholder: "Seleccione material embalaje (15) ...",
                        required: true,
                        width: valorImput2,
                        visible: visualizar
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        icon: "sap-icon://product",
                        width: valorButton,
                        visible: visualizar,
                        press: function () {
                            oThis.BusquedaMaterial(WERKS, VBELN, modulo);
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "  ",
                        width: valorEsp
                    }),
                    new sap.m.Input({
                        maxLength: 25,
                        id: "cantidad2",
                        width: valorImput,
                        valueStateText: "El campo cantidad(25) no debe estar vacío.",
                        editable: false,
                        value: 1,
                        liveChange: function (oEvent) {
                            var value = oEvent.getSource().getValue();
                            var bNotnumber = isNaN(value);
                            if (bNotnumber === false) {
                                oThis.valor = value;
                                //  sNumber = value;
                            } else {
                                oEvent.getSource().setValue(oThis.valor);
                            }
                        }.bind(this)
                    }),

                    new sap.m.Button({
                        text: "Entrar",
                        type: "Emphasized",
                        width: "100%",
                        press: function () {
                            var oView = oThis.getView();
                            var oModelM = oView.getModel("myParam");
                            var Bins = oModelM.getProperty("/binsEscaner");
                            //  var Bins = oContext.getProperty("Bins");

                            var escaner = sap.ui.getCore().byId("escaner").getValue();
                            var escaner2 = sap.ui.getCore().byId("escaner2").getValue();
                            var producto = sap.ui.getCore().byId("producto").getValue();
                            var cantidad2 = sap.ui.getCore().byId("cantidad2").getValue();
                            var embalaje = sap.ui.getCore().byId("embalaje").getValue();
                            var view = sap.ui.getCore();
                            var inputs = [
                                view.byId("escaner"),
                                view.byId("escaner2"),
                                view.byId("producto"),
                                view.byId("cantidad2"),
                                view.byId("embalaje")
                            ];
                            jQuery.each(inputs, function (i, input) {
                                if (!input.getValue()) {
                                    input.setValueState("Error");
                                } else {
                                    input.setValueState("None");
                                }
                            });
                            var canContinue = true;
                            jQuery.each(inputs, function (i, input) {
                                if ("Error" === input.getValueState()) {
                                    canContinue = false;
                                }
                            });
                            if (canContinue) {

                                var pare = "";
                                var encontro = "";
                                for (var i = 0; i < Bins.length; i++) {
                                    if (pare === "" && Bins[i].Escaneado === "") {
                                        pare = i.toString();
                                    }
                                    //BEGIN - DGOMEZ - 11.05.2021 - 8000019408
                                    //if (escaner === Bins[i].Numero) {
                                    //    encontro = i.toString();
                                    //}
                                    if (escaner.replace(/^0+/, '') === Bins[i].Numero.replace(/^0+/, '')) {
                                        encontro = i.toString();
                                    }
                                    //END   - DGOMEZ - 11.05.2021 - 8000019408

                                }
                                if (encontro === "") {

                                    var dialog = new sap.m.Dialog({
                                        title: 'Alerta',
                                        type: 'Message',
                                        state: 'Warning',
                                        content: new sap.m.Text({
                                            text: 'El código escaneado no se encuentra en la lista de códigos registrados .'
                                        }),
                                        beginButton: new sap.m.Button({
                                            text: 'Aceptar',
                                            type: 'Emphasized',
                                            press: function () {
                                                dialog.close();
                                            }
                                        }),
                                        afterClose: function () {
                                            dialog.destroy();
                                        }
                                    });

                                    dialog.open();
                                } else {
                                    var realizar = 0;
                                    for (i = 0; i < Bins.length; i++) {
                                        if (encontro === i.toString()) {
                                            realizar = 1;
                                            //BEGIN - DGOMEZ - 11.05.2021 - 8000019408
                                            Bins[pare].Escaneado = Bins[i].Numero;
                                            //END   - DGOMEZ - 11.05.2021 - 8000019408
                                        }
                                        if (realizar === 1 && i !== Bins.length - 1) {
                                            var y = i + 1;
                                            if (Bins[y].Numero === "---") {
                                                Bins[i].Numero = "---";
                                                Bins[i].Visible = false;
                                                i = Bins.length + 1;
                                            } else {
                                                console.log(Bins[i]);
                                                Bins[i].Numero = Bins[y].Numero;
                                            }

                                        }
                                        if (i === Bins.length - 1) {
                                            Bins[i].Numero = "---";
                                            Bins[i].Visible = false;
                                        }
                                    }
                                    //BEGIN - DGOMEZ - 11.05.2021 - 8000019408
                                    //Bins[pare].Escaneado = escaner;
                                    //END   - DGOMEZ - 11.05.2021 - 8000019408
                                    Bins[pare].PESO = escaner2;
                                    Bins[pare].CANTIDAD = cantidad2;
                                    Bins[pare].MATEM = embalaje;
                                    Bins[pare].MATNR = producto;
                                    console.log(Bins);
                                    //  Bins[encontro].Numero = "---";
                                    //    Bins[encontro].Visible = false;
                                    oModelM.refresh();
                                    var cont1 = parseInt(sap.ui.getCore().byId("cont1").getText().toString());
                                    cont1 = cont1 + 1;
                                    sap.ui.getCore().byId("cont1").setText(cont1.toString());
                                    var cont2 = parseInt(sap.ui.getCore().byId("cont2").getText().toString());
                                    cont2 = cont2 - 1;
                                    sap.ui.getCore().byId("cont2").setText(cont2.toString());
                                    sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                                    sap.ui.getCore().byId("escaner").setValue("");
                                    sap.ui.getCore().byId("escaner2").setValue("");
                                    sap.ui.getCore().byId("escaner").focus();
                                    oThis.valor = "";

                                }
                            } else {
                                var dialog = new sap.m.Dialog({
                                    title: "Warning",
                                    type: "Message",
                                    state: "Warning",
                                    content: new sap.m.Text({
                                        text: "Se requiere el ingreso de los datos indicados."

                                    }),
                                    beginButton: new sap.m.Button({
                                        text: "OK",
                                        press: function () {
                                            dialog.close();
                                            dialog.destroy();

                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });

                                dialog.open();
                            }

                            jQuery.sap.delayedCall(0, this, function () {
                                sap.ui.getCore().byId("escaner").focus();
                            });
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "100%"
                    }),
                    new sap.tnt.ToolHeader({
                        content: [
                            new sap.m.ToolbarSpacer({

                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://arrow-top"
                            }),
                            new sap.m.Label({
                                text: contBin,
                                id: "cont2",
                                textAlign: "Center",
                                design: "Bold"
                            }),
                            new sap.m.ToolbarSpacer({
                                width: "27%"
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://arrow-bottom"
                            }),
                            new sap.m.Label({
                                text: contBinReg,
                                id: "cont1",
                                textAlign: "Center",
                                design: "Bold"
                            }),
                            new sap.m.ToolbarSpacer({

                            }),
                            new sap.m.ToolbarSpacer({

                            }),
                            new sap.m.ToolbarSpacer({

                            })
                        ]
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "100%"
                    }),
                    oTable2
                ],
                beginButton: new sap.m.Button({
                    icon: "sap-icon://save",
                    text: "Guardar",
                    press: function () {

                        //////////////////////////// 20200207 ////////////////////////////
                        var view = sap.ui.getCore();
                        var inputs = [
                            view.byId("idLineaProd")
                        ];
                        jQuery.each(inputs, function (i, input) {
                            if (!input.getValue()) {
                                input.setValueState("Error");
                            } else {
                                input.setValueState("None");
                            }
                        });
                        var canContinue = true;
                        jQuery.each(inputs, function (i, input) {
                            if ("Error" === input.getValueState()) {
                                canContinue = false;
                            }
                        });
                        if (canContinue) {
                            //////////////////////////////////////////////////////////////////

                            sap.ui.core.BusyIndicator.show(0);
                            var oView = oThis.getView();
                            var oModelM = oView.getModel("myParam");
                            var Bins = oModelM.getProperty("/binsEscaner");
                            var varLineaObt = sap.ui.getCore().byId("idLineaProd").getValue();
                            var varLinea12 = varLineaObt.substring(6, 7);
                            console.log(varLinea12);
                            oModelM.setProperty("/T_BINES", []);
                            var T_BINES = oModelM.getProperty("/T_BINES");
                            var llave = {};
                            var vector = [];
                            var realizar = true;

                            ////////////////////////////////////////////////////////////////////////////////////////////
                            var contHUbin = 0;
                            ////////////////////////////////////////////////////////////////////////////////////////////
                            for (var i = 0; i < Bins.length; i++) {
                                llave = {};
                                if (Bins[i].PESO === "") {
                                    realizar = false;
                                } else {
                                    contHUbin = contHUbin + 1;
                                    llave.PESO = Bins[i].PESO;
                                    llave.CENT = WERKS;
                                    llave.VBELN = Bins[i].VBELN;
                                    llave.MATNR = Bins[i].MATNR;
                                    llave.CANTIDAD = Bins[i].CANTIDAD;
                                    llave.MATEM = Bins[i].MATEM;
                                    llave.MODULO = Bins[i].MODULO;
                                    llave.EXIDV = Bins[i].Escaneado;
                                    vector.push(llave);
                                }
                            }
                            var row = {};
                            row.COMENT = "";
                            //row.PARAM = "ZV---" + VBELN + "-" + modulo + "-" + varLinea12;  ZV---4900751286-162-1
                            row.PARAM = "ZV---" + VBELN + "-" + modulo + "-----" + varLinea12;
                            row.VECTOR = vector;
                            row.PALETA = [];

                            T_BINES.push(row);
                            if (contHUbin > 0) {
                                console.log(T_BINES);
                                T_BINES = JSON.stringify(T_BINES);
                                var oMessageTemplate = new sap.m.MessageItem({
                                    type: '{type}',
                                    title: '{title}',
                                    subtitle: '{subtitle}'
                                });
                                var oMessageView = new sap.m.MessageView({
                                    showDetailsPageHeader: false,
                                    items: {
                                        path: "/ERRORES",
                                        template: oMessageTemplate
                                    }
                                });
                                oMessageView.setModel(oModelM);
                                var dialogError = new sap.m.Dialog({
                                    resizable: true,
                                    content: oMessageView,
                                    state: 'Error',
                                    beginButton: new sap.m.Button({
                                        press: function () {
                                            dialogError.close();
                                        },
                                        text: "Cerrar"
                                    }),
                                    customHeader: new sap.m.Bar({
                                        contentMiddle: [
                                            new sap.m.Text({
                                                text: "Error"
                                            })
                                        ]
                                    }),
                                    afterClose: function () {
                                        dialogError.destroy();
                                    },
                                    contentHeight: "200px",
                                    contentWidth: "850px",
                                    verticalScrolling: false
                                });
                                //   $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/ZV/" + VBELN + "/" + WERKS, {
                                $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                    type: 'GET',
                                    async: false,
                                    beforeSend: function (xhr) {
                                        xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                    },
                                    complete: function (xhr) {
                                        var token = xhr.getResponseHeader("X-CSRF-Token");

                                        //     $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/ZV/" + VBELN + "/" + WERKS, {
                                        $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                            type: 'POST',
                                            data: T_BINES,
                                            beforeSend: function (xhr) {
                                                xhr.setRequestHeader('X-CSRF-Token', token);

                                            },
                                            success: function (response) {
                                                var contador = 0;
                                                var date = new Date();
                                                var year = date.getFullYear();
                                                var day = date.getDate();
                                                var month = date.getMonth() + 1;
                                                var oView = oThis.getView();
                                                date = year + "" + day + "" + month;
                                                //DG - Inicio
                                                const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
                                                //var texto4 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('ZV-" + date + "-1401---')/$value";
                                                var texto4 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('ZV-" + date + "-" + sCentro + "---')/$value";
                                                //DG - Fin
                                                var oModelZ = new sap.ui.model.json.JSONModel(texto4, false);
                                                oThis.getView().setModel(oModelZ, "ZV");
                                                oModelZ.attachRequestCompleted(function () {

                                                    var vectorError = {
                                                        "ERRORES2": []
                                                    };
                                                    var cont = oModelZ.getProperty("/ITAB");

                                                    if (cont === null || cont === undefined) {
                                                        var llave = {};
                                                        llave.subtitle = "Error de conexión en el enlace:" + texto4;
                                                        llave.title = "Mensaje de error Nro " + 4;
                                                        llave.type = "Error";
                                                        vectorError.push(llave);
                                                        contador++;
                                                        oView.byId("idButtonError").setVisible(true);
                                                        oView.byId("idButtonError").setText("" + contador);
                                                        oView.byId("GenericTile5").setSubheader("Se ha generado un error");
                                                    } else {
                                                        cont = oModelZ.getProperty("/ITAB/length");
                                                        oView.byId("GenericTile5").setSubheader("Tienes " + cont + " tareas");
                                                    }
                                                }.bind(this));
                                                oThis.getView().getModel("ZV").refresh();
                                                sap.ui.core.BusyIndicator.hide();
                                                oThis.byId("idBinsTable").getBinding("items").refresh(true);
                                                //DG - Inicio
                                                var texto5 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CP-" + date + "-" + sCentro + "---')/$value";
                                                //var texto5 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CP-" + date + "-1401---')/$value";
                                                //DG - Fin
                                                var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
                                                oThis.getView().setModel(oModelC, "CP");
                                                oModelC.attachRequestCompleted(function () {
                                                    var vectorError = {
                                                        "ERRORES2": []
                                                    };
                                                    var myParam = oThis.getView().getModel("myParam");
                                                    var cont = oModelC.getProperty("/ITAB");

                                                    var llave = {};

                                                    if (cont === null || cont === undefined) {
                                                        llave = {};
                                                        llave.subtitle = "Error de conexión en el enlace:" + texto5;
                                                        llave.title = "Mensaje de error Nro " + 5;
                                                        llave.type = "Error";
                                                        vectorError.push(llave);
                                                        contador++;
                                                        oView.byId("idButtonError").setVisible(true);
                                                        oView.byId("idButtonError").setText("" + contador);
                                                        oView.byId("GenericTile6").setSubheader("Se ha generado un error");
                                                    } else {
                                                        cont = oModelC.getProperty("/ITAB/length");

                                                        oView.byId("GenericTile6").setSubheader("Tienes " + cont + " tareas");
                                                        var lenghtV = oModelC.getProperty("/ITAB/length");
                                                        var vector = [];
                                                        for (var i = 0; i < lenghtV; i++) {
                                                            llave = {};
                                                            llave.ELIMINAR = false;
                                                            llave.BINS = oModelC.getProperty("/ITAB/" + i + "/BINS").toString();
                                                            llave.DESC_VAR = oModelC.getProperty("/ITAB/" + i + "/DESC_VAR").toString();
                                                            llave.DESCOR = oModelC.getProperty("/ITAB/" + i + "/DESCOR").toString();
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
                                                        oThis.getView().setModel(myParam, "CP");
                                                        oThis.getView().getModel("CP").refresh();
                                                        oThis.byId("idPaletTable").getBinding("items").refresh(true);
                                                    }
                                                }.bind(this));
                                                var dialog = new sap.m.Dialog({
                                                    title: 'Guardado',
                                                    type: 'Message',
                                                    state: 'Success',
                                                    content: new sap.m.Text({
                                                        text: 'Se guardaron correctamente los códigos escaneado .'
                                                    }),
                                                    beginButton: new sap.m.Button({
                                                        text: 'Aceptar',
                                                        type: 'Emphasized',
                                                        press: function () {
                                                            dialog.close();
                                                        }
                                                    }),
                                                    afterClose: function () {
                                                        dialog.destroy();
                                                    }
                                                });
                                                oDialog.close();
                                                dialog.open();
                                            }.bind(this),
                                            error: function (response) {
                                                sap.ui.core.BusyIndicator.hide();
                                                oThis.byId("idBinsTable").getBinding("items").refresh(true);
                                                var respuesta2 = "No se guardaron correctamente los códigos escaneados .";
                                                try {
                                                    var respuesta = response.responseText.toString();
                                                    respuesta = respuesta.split('<message xml:lang="es">');
                                                    respuesta = respuesta[1];
                                                    respuesta = respuesta.split('</message>');
                                                    respuesta = respuesta[0];
                                                    respuesta2 = respuesta;
                                                } catch (err) {
                                                    console.log(err);
                                                }
                                                var dialog = new sap.m.Dialog({
                                                    title: 'Error generado',
                                                    type: 'Message',
                                                    state: 'Error',
                                                    content: new sap.m.Text({
                                                        text: respuesta2
                                                    }),
                                                    beginButton: new sap.m.Button({
                                                        text: 'Aceptar',
                                                        type: 'Emphasized',
                                                        press: function () {
                                                            dialog.close();
                                                        }
                                                    }),
                                                    afterClose: function () {
                                                        dialog.destroy();
                                                    }
                                                });
                                                dialog.open();
                                            }.bind(this)
                                        });

                                    },
                                    success: function (response) { },
                                    error: function (response) {
                                        console.log(response);
                                    }
                                });
                            } else {
                                var dialog = new sap.m.Dialog({
                                    title: 'Alerta',
                                    type: 'Message',
                                    state: 'Warning',
                                    content: new sap.m.Text({
                                        text: 'Se debe escanear y aprobar al menos un código.'
                                    }),
                                    beginButton: new sap.m.Button({
                                        text: 'Aceptar',
                                        type: 'Emphasized',
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();
                                sap.ui.core.BusyIndicator.hide();
                            }

                            //////////////////////////// 20200207 ////////////////////////////
                        } else {
                            var dialog = new sap.m.Dialog({
                                title: "Error",
                                type: "Message",
                                state: "Error",
                                content: new sap.m.Text({
                                    text: "Se requiere el ingreso de la línea."

                                }),
                                beginButton: new sap.m.Button({
                                    text: "OK",
                                    press: function () {
                                        dialog.close();
                                        dialog.destroy();

                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                }
                            });

                            dialog.open();
                        }
                        //////////////////////////////////////////////////////////////////

                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: "Cancelar",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
            jQuery.sap.delayedCall(0, this, function () {
                sap.ui.getCore().byId("escaner").focus();
            });
            sap.ui.core.BusyIndicator.show(0);
            oModelT.attachRequestCompleted(function () {
                sap.ui.core.BusyIndicator.hide();
                var lenghtV = oModelT.getProperty("/ITAB");
                var oView = oThis.getView();
                var oModelM = oView.getModel("myParam");
                var llave = {};
                var vector = [];
                for (var i = 0; i < lenghtV.length; i++) {
                    llave = {};
                    llave.VBELN = lenghtV[i].VBELN;
                    llave.MODULO = lenghtV[i].MODULO;
                    llave.Numero = lenghtV[i].EXIDV;
                    llave.UBIC = lenghtV[i].UBIC;
                    llave.PESO = lenghtV[i].PESO;
                    llave.Visible = true;
                    llave.MATNR = "";
                    llave.CANTIDAD = "";
                    llave.MATEM = "";
                    llave.Escaneado = "";
                    vector.push(llave);
                }
                sap.ui.getCore().byId("cont2").setText(lenghtV.length + "");
                oModelM.setProperty("/binsEscaner", vector);
                oTable2.setModel(oModelM);
                oTable2.bindAggregation("items", "/binsEscaner", columnListItem);
            });
        },
        oDialogStage: function (event) {

            var oThis = this;
            this.valor = "";
            var oContext = event.getSource().getBindingContext("A");
            var guiaTXT = oContext.getProperty("VBELN");
            var WERKS = oContext.getProperty("WERKS");
            var VARIEDAD = oContext.getProperty("VARIEDAD");
            var moduloTXT = oContext.getProperty("MODULO");
            //   var BinsLength = oContext.getProperty("BinsVector");
            var contBin = 0;
            var contBinReg = 0;
            /*   for (var i = 0; i < BinsLength.length; i++) {
                 if (BinsLength[i].Numero !== "---") {
                   contBin++;
                 } else {
                   contBinReg++;
                 }
               }*/

            var path = oContext.getPath().toString();
            var oTable = new sap.m.Table({
                id: "idTableRepo",
                title: "Tabla detalle",
                width: "100%",
                noDataText: "Ningún módulo registrado"
                //items:"{/TablaProyeccionData}"
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Planta"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Ubicación"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Sub"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Fila"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Columna"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Posición"
                        })
                    ]
                })

            }));
            var columnListItem = new sap.m.ColumnListItem({
                vAlign: "Middle",
                cells: [
                    new sap.m.Label({
                        text: "{Planta}",
                        design: "Bold"
                    }),
                    new sap.m.Label({
                        text: "{Ubicacion}",
                        design: "Bold"
                    }),
                    new sap.m.Label({
                        text: "{Sub}",
                        design: "Bold"
                    }),
                    new sap.m.Label({
                        text: "{Fila}",
                        design: "Bold"
                    }),
                    new sap.m.Label({
                        text: "{Column}",
                        design: "Bold"
                    }),
                    new sap.m.Label({
                        text: "{Pos}",
                        design: "Bold"
                    })
                ]
            });

            //TABLA 2 CODIGOS ESCANEADO
            var oTable2 = new sap.m.Table({
                id: "idTableModulo2",
                noDataText: "Ningún módulo registrado",
                width: "100%"
                //items:"{/TablaProyeccionData}"
            });
            oTable2.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"
            }));
            oTable2.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"
            }));
            oTable2.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"
            }));
            columnListItem = new sap.m.ColumnListItem({
                vAlign: "Middle",
                cells: [
                    new sap.ui.layout.HorizontalLayout({
                        allowWrapping: false,
                        content: [
                            new sap.m.Label({
                                text: "{Numero}",
                                design: "Bold",
                                visible: "{Visible}"
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://bar-code",
                                visible: "{Visible}"
                            })

                        ]
                    }),
                    new sap.m.Label({
                        text: "{Escaneado}",
                        design: "Bold"
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://sys-cancel-2",
                        width: "100%",
                        visible: "{= ${Escaneado} !== ''}",
                        press: function (oEvent) {
                            var oView = oThis.getView();
                            var oModelM = oView.getModel("myParam");
                            var BinsLength = oModelM.getProperty("/binsEscaner");
                            var oContext = oEvent.getSource().getBindingContext();

                            var Escaneado = oContext.getProperty("Escaneado");

                            var pare = "";
                            var encontro = "";
                            for (var i = 0; i < BinsLength.length; i++) {

                                if (pare === "" && BinsLength[i].Numero === "---") {
                                    pare = i.toString();
                                }
                                if (Escaneado === BinsLength[i].Escaneado) {
                                    encontro = i.toString();
                                }

                            }
                            BinsLength[pare].Numero = Escaneado;
                            BinsLength[encontro].Escaneado = "";
                            BinsLength[encontro].UBIC = "";
                            BinsLength[pare].Visible = true;
                            oModelM.refresh();
                            var cont1 = parseInt(sap.ui.getCore().byId("cont1").getText().toString());
                            cont1 = cont1 - 1;
                            sap.ui.getCore().byId("cont1").setText(cont1.toString());
                            var cont2 = parseInt(sap.ui.getCore().byId("cont2").getText().toString());
                            cont2 = cont2 + 1;
                            sap.ui.getCore().byId("cont2").setText(cont2.toString());
                            sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                        }
                    })
                ]
            });
            /* var oModelT = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/ADET/" + guiaTXT + "/" +
               moduloTXT,
               false);*/
            var oModelT = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('ADET---" + guiaTXT + "-" + moduloTXT +
                "-" + VARIEDAD + "')/$value",
                false);

            ///////////////////////////////////////////////////////////////////////////////////////////////
            sap.ui.getCore().setModel(oModelT, "data_select2");
            var scanInput = new sap.m.Input({
                maxLength: 25,
                id: "escaner",
                width: "48%",
                valueStateText: "El campo bin no debe estar vacío.",
                liveChange: function (oEvent) {
                    var value = oEvent.getSource().getValue();
                    oThis.valor = value;
                    //  sNumber = value;
                    oEvent.getSource().setValue(oThis.valor);
                }.bind(this)
            });
            var scanInput2 = new sap.m.Input({
                value: "",
                maxLength: 25,
                valueStateText: "El campo ubicación no debe estar vacío.",
                id: "escaner2",
                width: "48%"
            });
            ///////////////////////////////////////////////////////////////////////////////////////////////

            console.log(VARIEDAD);
            sap.ui.getCore().setModel(oModelT, "data_select2");
            oModelT.attachRequestCompleted(function () {
                sap.ui.core.BusyIndicator.hide();
                var lenghtV = oModelT.getProperty("/ITAB");
                console.log(lenghtV);
                var oView = oThis.getView();
                var oModelM = oView.getModel("myParam");
                var llave = {};
                var vector = [];
                for (var i = 0; i < lenghtV.length; i++) {
                    llave = {};
                    llave.VBELN = lenghtV[i].VBELN;
                    llave.MODULO = lenghtV[i].MODULO;
                    llave.Numero = lenghtV[i].EXIDV;
                    llave.UBIC = lenghtV[i].UBIC;
                    llave.PESO = lenghtV[i].PESO;
                    llave.Visible = true;
                    llave.Escaneado = "";
                    vector.push(llave);
                }
                console.log(vector);
                sap.ui.getCore().byId("cont2").setText(lenghtV.length + "");
                oModelM.setProperty("/binsEscaner", vector);
                oTable2.setModel(oModelM);
                oTable2.bindAggregation("items", "/binsEscaner", columnListItem);
            });

            ///////////////////////////////////////////////////////////////////////////////////////////////
            scanInput.onsapenter = (function (oEvent) {
                var txtbinpallet = sap.ui.getCore().byId("escaner").getValue();
                var concatenarbp = txtbinpallet + "-";
                sap.ui.getCore().byId("escaner").setValue("");
                sap.ui.getCore().byId("escaner").setValue(concatenarbp);

                var varbinpallettxt = "";
                var vectorbinpallettxt = [];
                var llavebinpallettxt = {};
                for (var k = 0; k < txtbinpallet.length; k++) {
                    if (txtbinpallet.substring(k, k + 1) !== "-") {
                        varbinpallettxt = varbinpallettxt + txtbinpallet.substring(k, k + 1);
                    }
                    if (txtbinpallet.substring(k, k + 1) === "-" || k === txtbinpallet.length - 1) {
                        llavebinpallettxt = {};
                        llavebinpallettxt.Dato = varbinpallettxt;
                        vectorbinpallettxt.push(llavebinpallettxt);
                        varbinpallettxt = "";
                    }
                }
                console.log(vectorbinpallettxt);

                var concatenarRespuesta = "";
                for (var pp = 0; pp < vectorbinpallettxt.length; pp++) {
                    if (pp === 2) {
                        concatenarRespuesta = concatenarRespuesta + vectorbinpallettxt[pp].Dato;
                        sap.ui.getCore().byId("escaner2").focus();
                    } else {
                        concatenarRespuesta = concatenarRespuesta + vectorbinpallettxt[pp].Dato + "-";
                    }
                }

                sap.ui.getCore().byId("escaner").setValue("");
                sap.ui.getCore().byId("escaner").setValue(concatenarRespuesta);

                console.log(concatenarRespuesta);
            }.bind(this));
            scanInput2.onsapenter = (function (oEvent) {
                var oView = oThis.getView();
                var oModelM = oView.getModel("myParam");
                var Bins = oModelM.getProperty("/binsEscaner");
                console.log(Bins);
                //  var Bins = oContext.getProperty("Bins");
                var view = sap.ui.getCore();
                var inputs = [
                    view.byId("escaner"),
                    view.byId("escaner2")
                ];
                jQuery.each(inputs, function (i, input) {
                    if (!input.getValue()) {
                        input.setValueState("Error");
                    } else {
                        input.setValueState("None");
                    }
                });
                var canContinue = true;
                jQuery.each(inputs, function (i, input) {
                    if ("Error" === input.getValueState()) {
                        canContinue = false;
                    }
                });
                if (canContinue) {
                    // 10007-10008-10009
                    // 01234567890123456
                    var escaner = sap.ui.getCore().byId("escaner").getValue();
                    console.log(escaner);
                    console.log(escaner.length);

                    ///////////////////////////////////////////////////////////////////////////////////////////////
                    var varbinpallet = "";
                    var vectorbinpallet = [];
                    var llavebinpallet = {};
                    for (var k = 0; k < escaner.length; k++) {
                        if (escaner.substring(k, k + 1) !== "-") {
                            varbinpallet = varbinpallet + escaner.substring(k, k + 1);
                        }
                        if (escaner.substring(k, k + 1) === "-" || k === escaner.length - 1) {
                            console.log(varbinpallet);
                            llavebinpallet = {};
                            llavebinpallet.Dato = varbinpallet;
                            vectorbinpallet.push(llavebinpallet);
                            varbinpallet = "";
                        }
                    }
                    console.log(vectorbinpallet);
                    console.log(vectorbinpallet.length);

                    var vectorbinpallecopia = [];
                    var llavebinpalletcopia = {};
                    var encontroVal = 0;
                    for (var cc = 0; cc < vectorbinpallet.length; cc++) {
                        for (var i = 0; i < Bins.length; i++) {
                            if (vectorbinpallet[cc].Dato === Bins[i].Numero) {
                                encontroVal = encontroVal + 1;
                                llavebinpalletcopia = {};
                                llavebinpalletcopia.Dato = vectorbinpallet[cc].Dato;
                                vectorbinpallecopia.push(llavebinpalletcopia);
                            }
                        }
                    }
                    console.log(vectorbinpallecopia);

                    var vectorbinpalleterror = [];
                    var llavebinpalleterror = {};
                    for (var rr1 = 0; rr1 < vectorbinpallet.length; rr1++) {
                        var inicioval = 0;
                        for (var rr2 = 0; rr2 < vectorbinpallecopia.length; rr2++) {
                            if (vectorbinpallet[rr1].Dato === vectorbinpallecopia[rr2].Dato) {
                                inicioval = inicioval + 1;
                            }
                        }
                        if (inicioval === 0) {
                            llavebinpalleterror = {};
                            llavebinpalleterror.Dato = vectorbinpallet[rr1].Dato;
                            vectorbinpalleterror.push(llavebinpalleterror);
                        }
                    }

                    var binspalletnotdefinido = " ";
                    for (var rr3 = 0; rr3 < vectorbinpalleterror.length; rr3++) {
                        binspalletnotdefinido = binspalletnotdefinido + " " + vectorbinpalleterror[rr3].Dato + " ";
                    }
                    var mensajeerrorbinpallet = "Los bin(s) no registrados son: " + binspalletnotdefinido;
                    console.log(mensajeerrorbinpallet);

                    var sumaduplicado = 0;
                    for (var d1 = 0; d1 < vectorbinpallet.length; d1++) {
                        for (var d2 = 0; d2 < vectorbinpallet.length; d2++) {
                            if (vectorbinpallet[d1].Dato === vectorbinpallet[d2].Dato) {
                                sumaduplicado = sumaduplicado + 1;
                            }
                        }
                    }
                    console.log(sumaduplicado);

                    console.log(encontroVal);
                    if (sumaduplicado === vectorbinpallet.length) {
                        if (encontroVal === vectorbinpallet.length) {
                            if (vectorbinpallet.length > 0 && vectorbinpallet.length <= 3) {
                                for (var kk = 0; kk < vectorbinpallet.length; kk++) {
                                    ///////////////////////////////////////////////////////////////////////////////////////////////
                                    console.log(vectorbinpallet[kk].Dato);
                                    var escaner2 = sap.ui.getCore().byId("escaner2").getValue();
                                    var pare = "";
                                    var encontro = "";
                                    for (var i = 0; i < Bins.length; i++) {
                                        if (pare === "" && Bins[i].Escaneado === "") {
                                            pare = i.toString();
                                        }
                                        if (vectorbinpallet[kk].Dato === Bins[i].Numero) { ////////////////////////////////////////////////////////
                                            encontro = i.toString();
                                        }

                                    }
                                    if (encontro === "") {

                                        var dialog = new sap.m.Dialog({
                                            title: 'Alerta',
                                            type: 'Message',
                                            state: 'Warning',
                                            content: new sap.m.Text({
                                                text: 'El código escaneado no se encuentra en la lista de códigos registrados .'
                                            }),
                                            beginButton: new sap.m.Button({
                                                text: 'Aceptar',
                                                type: 'Emphasized',
                                                press: function () {
                                                    dialog.close();
                                                }
                                            }),
                                            afterClose: function () {
                                                dialog.destroy();
                                            }
                                        });

                                        dialog.open();
                                    } else {
                                        var realizar = 0;
                                        for (i = 0; i < Bins.length; i++) {
                                            if (encontro === i.toString()) {
                                                realizar = 1;
                                            }
                                            if (realizar === 1 && i !== Bins.length - 1) {
                                                var y = i + 1;
                                                if (Bins[y].Numero === "---") {
                                                    Bins[i].Numero = "---";
                                                    Bins[i].Visible = false;
                                                    i = Bins.length + 1;
                                                } else {
                                                    Bins[i].Numero = Bins[y].Numero;
                                                }

                                            }
                                            if (i === Bins.length - 1) {
                                                Bins[i].Numero = "---";
                                                Bins[i].Visible = false;
                                            }
                                        }
                                        Bins[pare].Escaneado = vectorbinpallet[kk].Dato; ////////////////////////////////////////////////////////
                                        Bins[pare].UBIC = escaner2;
                                        //   Bins[encontro].Numero = "---";
                                        //   Bins[encontro].Visible = false;
                                        oModelM.refresh();
                                        var cont1 = parseInt(sap.ui.getCore().byId("cont1").getText().toString());
                                        cont1 = cont1 + 1;
                                        sap.ui.getCore().byId("cont1").setText(cont1.toString());
                                        var cont2 = parseInt(sap.ui.getCore().byId("cont2").getText().toString());
                                        cont2 = cont2 - 1;
                                        sap.ui.getCore().byId("cont2").setText(cont2.toString());
                                        sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                                        //sap.ui.getCore().byId("escaner").setValue(""); ////////////////////////////////////////////////////////
                                        //sap.ui.getCore().byId("escaner").focus(); ////////////////////////////////////////////////////////
                                        oThis.valor = "";
                                    }
                                    ///////////////////////////////////////////////////////////////////////////////////////////////
                                }
                                sap.ui.getCore().byId("escaner").setValue("");
                                sap.ui.getCore().byId("escaner2").setValue("");
                            } else {
                                var dialog = new sap.m.Dialog({
                                    title: 'Alerta',
                                    type: 'Message',
                                    state: 'Warning',
                                    content: new sap.m.Text({
                                        text: 'El número de bins excedió a 3.'
                                    }),
                                    beginButton: new sap.m.Button({
                                        text: 'Aceptar',
                                        type: 'Emphasized',
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();
                            }
                        } else {
                            var dialog = new sap.m.Dialog({
                                title: 'Alerta',
                                type: 'Message',
                                state: 'Warning',
                                content: new sap.m.Text({
                                    text: mensajeerrorbinpallet
                                }),
                                beginButton: new sap.m.Button({
                                    text: 'Aceptar',
                                    type: 'Emphasized',
                                    press: function () {
                                        dialog.close();
                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                }
                            });
                            dialog.open();
                            sap.ui.getCore().byId("escaner2").setValue("");
                        }
                    } else {
                        var dialog = new sap.m.Dialog({
                            title: 'Alerta',
                            type: 'Message',
                            state: 'Warning',
                            content: new sap.m.Text({
                                text: 'Hay bines duplicados al escanear'
                            }),
                            beginButton: new sap.m.Button({
                                text: 'Aceptar',
                                type: 'Emphasized',
                                press: function () {
                                    dialog.close();
                                }
                            }),
                            afterClose: function () {
                                dialog.destroy();
                            }
                        });
                        dialog.open();
                        sap.ui.getCore().byId("escaner2").setValue("");
                    }
                    ///////////////////////////////////////////////////////////////////////////////////////////////
                } else {
                    var dialog = new sap.m.Dialog({
                        title: "Warning",
                        type: "Message",
                        state: "Warning",
                        content: new sap.m.Text({
                            text: "Se requiere el ingreso de los datos indicados."

                        }),
                        beginButton: new sap.m.Button({
                            text: "OK",
                            press: function () {
                                dialog.close();
                                dialog.destroy();

                            }
                        }),
                        afterClose: function () {
                            dialog.destroy();
                        }
                    });

                    dialog.open();
                }
                sap.ui.getCore().byId("escaner").focus();
                jQuery.sap.delayedCall(0, this, function () {
                    sap.ui.getCore().byId("escaner").focus();
                });
            }.bind(this));
            ///////////////////////////////////////////////////////////////////////////////////////////////

            var oDialog = new sap.m.Dialog("Dialog", {
                title: "Almacenar HU's",
                contentWidth: "680px",
                modal: true,
                type: "Message",
                content: [oTable,
                    new sap.m.Label({
                        text: "",
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: "Escanear HU",
                        design: "Bold",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "  ",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Escanear Ubicación",
                        design: "Bold",
                        width: "48%"
                    }),
                    ///////////////////////////////////////////////////////////////////////////////////////////////
                    scanInput,
                    ///////////////////////////////////////////////////////////////////////////////////////////////
                    new sap.m.Label({
                        text: "  ",
                        width: "4%"
                    }),
                    ///////////////////////////////////////////////////////////////////////////////////////////////
                    scanInput2,
                    ///////////////////////////////////////////////////////////////////////////////////////////////
                    new sap.m.Button({
                        text: "Entrar",
                        type: "Emphasized",
                        width: "100%",
                        press: function () {
                            var oView = oThis.getView();
                            var oModelM = oView.getModel("myParam");
                            var Bins = oModelM.getProperty("/binsEscaner");
                            console.log(Bins);
                            //  var Bins = oContext.getProperty("Bins");
                            var view = sap.ui.getCore();
                            var inputs = [
                                view.byId("escaner"),
                                view.byId("escaner2")
                            ];
                            jQuery.each(inputs, function (i, input) {
                                if (!input.getValue()) {
                                    input.setValueState("Error");
                                } else {
                                    input.setValueState("None");
                                }
                            });
                            var canContinue = true;
                            jQuery.each(inputs, function (i, input) {
                                if ("Error" === input.getValueState()) {
                                    canContinue = false;
                                }
                            });
                            if (canContinue) {
                                var escaner = sap.ui.getCore().byId("escaner").getValue();
                                console.log(escaner);
                                console.log(escaner.length);
                                ///////////////////////////////////////////////////////////////////////////////////////////////
                                var varbinpallet = "";
                                var vectorbinpallet = [];
                                var llavebinpallet = {};
                                for (var k = 0; k < escaner.length; k++) {
                                    if (escaner.substring(k, k + 1) !== "-") {
                                        varbinpallet = varbinpallet + escaner.substring(k, k + 1);
                                    }
                                    if (escaner.substring(k, k + 1) === "-" || k === escaner.length - 1) {
                                        console.log(varbinpallet);
                                        llavebinpallet = {};
                                        llavebinpallet.Dato = varbinpallet;
                                        vectorbinpallet.push(llavebinpallet);
                                        varbinpallet = "";
                                    }
                                }
                                console.log(vectorbinpallet);
                                console.log(vectorbinpallet.length);

                                var vectorbinpallecopia = [];
                                var llavebinpalletcopia = {};
                                var encontroVal = 0;
                                for (var cc = 0; cc < vectorbinpallet.length; cc++) {
                                    for (var i = 0; i < Bins.length; i++) {
                                        if (vectorbinpallet[cc].Dato === Bins[i].Numero) {
                                            encontroVal = encontroVal + 1;
                                            llavebinpalletcopia = {};
                                            llavebinpalletcopia.Dato = vectorbinpallet[cc].Dato;
                                            vectorbinpallecopia.push(llavebinpalletcopia);
                                        }
                                    }
                                }
                                console.log(vectorbinpallecopia);

                                var vectorbinpalleterror = [];
                                var llavebinpalleterror = {};
                                for (var rr1 = 0; rr1 < vectorbinpallet.length; rr1++) {
                                    var inicioval = 0;
                                    for (var rr2 = 0; rr2 < vectorbinpallecopia.length; rr2++) {
                                        if (vectorbinpallet[rr1].Dato === vectorbinpallecopia[rr2].Dato) {
                                            inicioval = inicioval + 1;
                                        }
                                    }
                                    if (inicioval === 0) {
                                        llavebinpalleterror = {};
                                        llavebinpalleterror.Dato = vectorbinpallet[rr1].Dato;
                                        vectorbinpalleterror.push(llavebinpalleterror);
                                    }
                                }

                                var binspalletnotdefinido = " ";
                                for (var rr3 = 0; rr3 < vectorbinpalleterror.length; rr3++) {
                                    binspalletnotdefinido = binspalletnotdefinido + " " + vectorbinpalleterror[rr3].Dato + " ";
                                }
                                var mensajeerrorbinpallet = "Los bin(s) no registrados son: " + binspalletnotdefinido;
                                console.log(mensajeerrorbinpallet);

                                var sumaduplicado = 0;
                                for (var d1 = 0; d1 < vectorbinpallet.length; d1++) {
                                    for (var d2 = 0; d2 < vectorbinpallet.length; d2++) {
                                        if (vectorbinpallet[d1].Dato === vectorbinpallet[d2].Dato) {
                                            sumaduplicado = sumaduplicado + 1;
                                        }
                                    }
                                }
                                console.log(sumaduplicado);

                                console.log(encontroVal);
                                if (sumaduplicado === vectorbinpallet.length) {
                                    if (encontroVal === vectorbinpallet.length) {
                                        if (vectorbinpallet.length > 0 && vectorbinpallet.length <= 3) {
                                            for (var kk = 0; kk < vectorbinpallet.length; kk++) {
                                                console.log(vectorbinpallet[kk].Dato);
                                                ///////////////////////////////////////////////////////////////////////////////////////////////
                                                var escaner2 = sap.ui.getCore().byId("escaner2").getValue();
                                                var pare = "";
                                                var encontro = "";
                                                for (var i = 0; i < Bins.length; i++) {
                                                    if (pare === "" && Bins[i].Escaneado === "") {
                                                        pare = i.toString();
                                                    }
                                                    if (vectorbinpallet[kk].Dato === Bins[i].Numero) { ////////////////////////////////////////////////////////
                                                        encontro = i.toString();
                                                    }

                                                }
                                                if (encontro === "") {

                                                    var dialog = new sap.m.Dialog({
                                                        title: 'Alerta',
                                                        type: 'Message',
                                                        state: 'Warning',
                                                        content: new sap.m.Text({
                                                            text: 'El código escaneado no se encuentra en la lista de códigos registrados .'
                                                        }),
                                                        beginButton: new sap.m.Button({
                                                            text: 'Aceptar',
                                                            type: 'Emphasized',
                                                            press: function () {
                                                                dialog.close();
                                                            }
                                                        }),
                                                        afterClose: function () {
                                                            dialog.destroy();
                                                        }
                                                    });

                                                    dialog.open();
                                                } else {
                                                    var realizar = 0;
                                                    for (i = 0; i < Bins.length; i++) {
                                                        if (encontro === i.toString()) {
                                                            realizar = 1;
                                                        }
                                                        if (realizar === 1 && i !== Bins.length - 1) {
                                                            var y = i + 1;
                                                            if (Bins[y].Numero === "---") {
                                                                Bins[i].Numero = "---";
                                                                Bins[i].Visible = false;
                                                                i = Bins.length + 1;
                                                            } else {
                                                                Bins[i].Numero = Bins[y].Numero;
                                                            }

                                                        }
                                                        if (i === Bins.length - 1) {
                                                            Bins[i].Numero = "---";
                                                            Bins[i].Visible = false;
                                                        }
                                                    }
                                                    Bins[pare].Escaneado = vectorbinpallet[kk].Dato; ////////////////////////////////////////////////////////
                                                    Bins[pare].UBIC = escaner2;
                                                    //   Bins[encontro].Numero = "---";
                                                    //   Bins[encontro].Visible = false;
                                                    oModelM.refresh();
                                                    var cont1 = parseInt(sap.ui.getCore().byId("cont1").getText().toString());
                                                    cont1 = cont1 + 1;
                                                    sap.ui.getCore().byId("cont1").setText(cont1.toString());
                                                    var cont2 = parseInt(sap.ui.getCore().byId("cont2").getText().toString());
                                                    cont2 = cont2 - 1;
                                                    sap.ui.getCore().byId("cont2").setText(cont2.toString());
                                                    sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                                                    //sap.ui.getCore().byId("escaner").setValue(""); ////////////////////////////////////////////////////////
                                                    //sap.ui.getCore().byId("escaner").focus(); ////////////////////////////////////////////////////////
                                                    oThis.valor = "";

                                                }
                                                ///////////////////////////////////////////////////////////////////////////////////////////////
                                            }
                                            sap.ui.getCore().byId("escaner").setValue("");
                                            sap.ui.getCore().byId("escaner2").setValue("");
                                        } else {
                                            var dialog = new sap.m.Dialog({
                                                title: 'Alerta',
                                                type: 'Message',
                                                state: 'Warning',
                                                content: new sap.m.Text({
                                                    text: 'El número de bins excedió a 3.'
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }
                                    } else {
                                        var dialog = new sap.m.Dialog({
                                            title: 'Alerta',
                                            type: 'Message',
                                            state: 'Warning',
                                            content: new sap.m.Text({
                                                text: mensajeerrorbinpallet
                                            }),
                                            beginButton: new sap.m.Button({
                                                text: 'Aceptar',
                                                type: 'Emphasized',
                                                press: function () {
                                                    dialog.close();
                                                }
                                            }),
                                            afterClose: function () {
                                                dialog.destroy();
                                            }
                                        });
                                        dialog.open();
                                        sap.ui.getCore().byId("escaner2").setValue("");
                                    }
                                } else {
                                    var dialog = new sap.m.Dialog({
                                        title: 'Alerta',
                                        type: 'Message',
                                        state: 'Warning',
                                        content: new sap.m.Text({
                                            text: 'Hay bines duplicados al escanear'
                                        }),
                                        beginButton: new sap.m.Button({
                                            text: 'Aceptar',
                                            type: 'Emphasized',
                                            press: function () {
                                                dialog.close();
                                            }
                                        }),
                                        afterClose: function () {
                                            dialog.destroy();
                                        }
                                    });
                                    dialog.open();
                                    sap.ui.getCore().byId("escaner2").setValue("");
                                }
                                ///////////////////////////////////////////////////////////////////////////////////////////////
                            } else {
                                var dialog = new sap.m.Dialog({
                                    title: "Warning",
                                    type: "Message",
                                    state: "Warning",
                                    content: new sap.m.Text({
                                        text: "Se requiere el ingreso de los datos indicados."

                                    }),
                                    beginButton: new sap.m.Button({
                                        text: "OK",
                                        press: function () {
                                            dialog.close();
                                            dialog.destroy();

                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });

                                dialog.open();
                            }
                            jQuery.sap.delayedCall(0, this, function () {
                                sap.ui.getCore().byId("escaner").focus();
                            });
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "100%"
                    }),
                    new sap.tnt.ToolHeader({
                        content: [
                            new sap.m.ToolbarSpacer({

                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://arrow-top"
                            }),
                            new sap.m.Label({
                                text: contBin,
                                id: "cont2",
                                textAlign: "Center",
                                design: "Bold"
                            }),
                            new sap.m.ToolbarSpacer({
                                width: "27%"
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://arrow-bottom"
                            }),
                            new sap.m.Label({
                                text: contBinReg,
                                id: "cont1",
                                textAlign: "Center",
                                design: "Bold"
                            }),
                            new sap.m.ToolbarSpacer({

                            }),
                            new sap.m.ToolbarSpacer({

                            }),
                            new sap.m.ToolbarSpacer({

                            })
                        ]
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "100%"
                    }),
                    oTable2
                ],
                beginButton: new sap.m.Button({
                    icon: "sap-icon://save",
                    text: "Guardar",
                    press: function () {
                        sap.ui.core.BusyIndicator.show(0);
                        var oView = oThis.getView();
                        var oModelM = oView.getModel("myParam");
                        var Bins = oModelM.getProperty("/binsEscaner");
                        oModelM.setProperty("/T_BINES", []);
                        var T_BINES = oModelM.getProperty("/T_BINES");
                        var llave = {};
                        var realizar = true;
                        var vector = [];
                        for (var i = 0; i < Bins.length; i++) {
                            llave = {};
                            llave.UBIC = Bins[i].UBIC;
                            if (Bins[i].UBIC === "") {
                                realizar = false;
                            }
                            llave.CENT = WERKS;
                            llave.VBELN = Bins[i].VBELN;
                            llave.MODULO = Bins[i].MODULO;
                            llave.EXIDV = Bins[i].Escaneado;
                            vector.push(llave);
                        }
                        var row = {};
                        row.COMENT = "";
                        row.PARAM = "A---" + guiaTXT + "-" + moduloTXT + "-";
                        row.VECTOR = vector;
                        row.PALETA = [];
                        T_BINES.push(row);
                        if (realizar) {
                            console.log(T_BINES);
                            console.log(vector);
                            T_BINES = JSON.stringify(T_BINES);
                            var oMessageTemplate = new sap.m.MessageItem({
                                type: '{type}',
                                title: '{title}',
                                subtitle: '{subtitle}'
                            });
                            var oMessageView = new sap.m.MessageView({
                                showDetailsPageHeader: false,
                                items: {
                                    path: "/ERRORES",
                                    template: oMessageTemplate
                                }
                            });
                            oMessageView.setModel(oModelM);
                            var dialogError = new sap.m.Dialog({
                                resizable: true,
                                content: oMessageView,
                                state: 'Error',
                                beginButton: new sap.m.Button({
                                    press: function () {
                                        dialogError.close();
                                    },
                                    text: "Cerrar"
                                }),
                                customHeader: new sap.m.Bar({
                                    contentMiddle: [
                                        new sap.m.Text({
                                            text: "Error"
                                        })
                                    ]
                                }),
                                afterClose: function () {
                                    dialogError.destroy();
                                },
                                contentHeight: "200px",
                                contentWidth: "850px",
                                verticalScrolling: false
                            });
                            //       $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/A/" + guiaTXT + "/" + WERKS, {
                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                type: 'GET',
                                async: false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                },
                                complete: function (xhr) {
                                    var token = xhr.getResponseHeader("X-CSRF-Token");

                                    //         $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/A/" + guiaTXT + "/" + WERKS, {
                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                        type: 'POST',
                                        data: T_BINES,
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('X-CSRF-Token', token);

                                        },
                                        success: function (response) {
                                            var contador = 0;
                                            var date = new Date();
                                            var year = date.getFullYear();
                                            var day = date.getDate();
                                            var month = date.getMonth() + 1;
                                            var oView = oThis.getView();
                                            date = year + "" + day + "" + month;
                                            var texto6 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('A-" + date + "-1401---')/$value";
                                            var oModelA = new sap.ui.model.json.JSONModel(texto6, false);
                                            oThis.getView().setModel(oModelA, "A");
                                            oModelA.attachRequestCompleted(function () {
                                                var vectorError = {
                                                    "ERRORES2": []
                                                };
                                                var cont = oModelA.getProperty("/ITAB");
                                                if (cont === null || cont === undefined) {
                                                    var llave = {};
                                                    llave.subtitle = "Error de conexión en el enlace:" + texto6;
                                                    llave.title = "Mensaje de error Nro " + 6;
                                                    llave.type = "Error";
                                                    vectorError.push(llave);
                                                    contador++;
                                                    oView.byId("idButtonError").setVisible(true);
                                                    oView.byId("idButtonError").setText("" + contador);
                                                    oView.byId("GenericTile3").setSubheader("Se ha generado un error");
                                                } else {
                                                    //  cont = oModelA.getProperty("/ITAB");
                                                    // console.log(cont);
                                                    cont = oModelA.getProperty("/ITAB/length");
                                                    oView.byId("GenericTile3").setSubheader("Tienes " + cont + " tareas");
                                                    oThis.getView().getModel("A").refresh();
                                                    oThis.byId("idStageTable").getBinding("items").refresh(true);
                                                }
                                            }.bind(this));

                                            var texto3 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('TP-" + date + "-1401---')/$value";
                                            var oModelT = new sap.ui.model.json.JSONModel(texto3, false);
                                            oThis.getView().setModel(oModelT, "TP");
                                            oModelT.attachRequestCompleted(function () {
                                                var vectorError = {
                                                    "ERRORES2": []
                                                };
                                                var cont = oModelT.getProperty("/ITAB");
                                                if (cont === null || cont === undefined) {
                                                    var llave = {};
                                                    llave.subtitle = "Error de conexión en el enlace:" + texto3;
                                                    llave.title = "Mensaje de error Nro " + 3;
                                                    llave.type = "Error";
                                                    vectorError.push(llave);
                                                    contador++;
                                                    oView.byId("idButtonError").setVisible(true);
                                                    oView.byId("idButtonError").setText("" + contador);
                                                    oView.byId("GenericTile4").setSubheader("Se ha generado un error");
                                                } else {
                                                    cont = oModelT.getProperty("/ITAB/length");

                                                    oView.byId("GenericTile4").setSubheader("Tienes " + cont + " tareas");
                                                }
                                                oThis.getView().getModel("TP").refresh();
                                                oThis.byId("idGuiaTable").getBinding("items").refresh(true);
                                            }.bind(this));

                                            var dialog = new sap.m.Dialog({
                                                title: 'Guardado',
                                                type: 'Message',
                                                state: 'Success',
                                                content: new sap.m.Text({
                                                    text: 'Se guardaron correctamente los códigos escaneado .'
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            sap.ui.core.BusyIndicator.hide();
                                            oDialog.close();
                                            dialog.open();
                                        }.bind(this),
                                        error: function (response) {
                                            sap.ui.core.BusyIndicator.hide();
                                            oThis.getView().getModel("A").refresh();
                                            oThis.byId("idStageTable").getBinding("items").refresh(true);
                                            var respuesta2 = "No se guardaron correctamente los códigos escaneados .";
                                            try {
                                                var respuesta = response.responseText.toString();
                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                respuesta = respuesta[1];
                                                respuesta = respuesta.split('</message>');
                                                respuesta = respuesta[0];
                                                respuesta2 = respuesta;
                                            } catch (err) {
                                                console.log(err);
                                            }
                                            var dialog = new sap.m.Dialog({
                                                title: 'Error generado',
                                                type: 'Message',
                                                state: 'Error',
                                                content: new sap.m.Text({
                                                    text: respuesta2
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }.bind(this)
                                    });

                                },
                                success: function (response) { },
                                error: function (response) {
                                    console.log(response);
                                }
                            });
                        } else {
                            var dialog = new sap.m.Dialog({
                                title: 'Alerta',
                                type: 'Message',
                                state: 'Warning',
                                content: new sap.m.Text({
                                    text: 'No todos los códigos han sido escaneados y aprobados.'
                                }),
                                beginButton: new sap.m.Button({
                                    text: 'Aceptar',
                                    type: 'Emphasized',
                                    press: function () {
                                        dialog.close();
                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                }
                            });
                            dialog.open();
                            sap.ui.core.BusyIndicator.hide();
                        }
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: "Cancelar",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
            sap.ui.core.BusyIndicator.show(0);
        },
        onSearch: function (oEvt) {

            // add filter for search
            var aFilters = [];
            var sQuery = oEvt.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new sap.ui.model.Filter("VBELN", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }

            // update list binding
            var list = this.getView().byId("idProductsTable");
            var binding = list.getBinding("items");
            binding.filter(aFilters, "Application");
        },
        oDialogRecibir: function (event) {

            var oThis = this;
            this.valor = "";
            var oContext = event.getSource().getBindingContext("R");
            var VBELN = oContext.getProperty("VBELN").toString();
            var WERKS = oContext.getProperty("WERKS").toString();

            //  var BinsLength = oContext.getProperty("Bins");
            var contBin = 0;
            var contBinReg = 0;
            /*  for (var i = 0; i < BinsLength.length; i++) {
                if (BinsLength[i].Numero !== "---") {
                  contBin++;
                } else {
                  contBinReg++;
                }
              }*/

            var path = oContext.getPath().toString();
            var oTable = new sap.m.Table({
                id: "idTableRepo",
                title: "Tabla detalle",
                width: "100%",
                noDataText: "Ningún módulo registrado"
                //items:"{/TablaProyeccionData}"
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Módulo"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Bins"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Jabas"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Pallets"
                        })
                    ]
                })

            }));
            var columnListItem = new sap.m.ColumnListItem({
                vAlign: "Middle",
                cells: [
                    new sap.m.Label({
                        text: "{MODULO}"
                    }),
                    new sap.m.Label({
                        text: "{BINS}"
                    }),
                    new sap.m.Label({
                        text: "{JABAS}"
                    }),
                    new sap.m.Label({
                        text: "{PALLETS}"
                    })
                ]
            });

            /*   var oModelP = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/RDET/" + VBELN + "/" +
                 WERKS,
                 false);*/

            var oModelP = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('RDET--" + WERKS + "-" + VBELN +
                "-')/$value",
                false);
            sap.ui.getCore().setModel(oModelP, "data_select");
            oTable.setModel(sap.ui.getCore().getModel("data_select"));
            oTable.bindAggregation("items", "/ITAB", columnListItem);

            var oTable2 = new sap.m.Table({
                id: "idTableModulo2",
                noDataText: "Ningún módulo registrado",
                width: "100%"
                //items:"{/TablaProyeccionData}"
            });
            oTable2.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"
            }));
            oTable2.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"
            }));
            oTable2.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center"
            }));
            columnListItem = new sap.m.ColumnListItem({
                vAlign: "Middle",
                cells: [
                    new sap.ui.layout.HorizontalLayout({
                        allowWrapping: false,
                        content: [
                            new sap.m.Label({
                                text: "{Numero}",
                                design: "Bold",
                                visible: "{Visible}"
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://bar-code",
                                visible: "{Visible}"
                            })

                        ]
                    }),
                    new sap.m.Label({
                        text: "{Escaneado}",
                        design: "Bold"
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://sys-cancel-2",
                        width: "100%",
                        visible: "{= ${Escaneado} !== ''}",
                        press: function (oEvent) {
                            var oView = oThis.getView();
                            var oModelM = oView.getModel("myParam");
                            var BinsLength = oModelM.getProperty("/binsEscaner");
                            var oContext = oEvent.getSource().getBindingContext();

                            var Escaneado = oContext.getProperty("Escaneado");

                            var pare = "";
                            var encontro = "";
                            for (var i = 0; i < BinsLength.length; i++) {

                                if (pare === "" && BinsLength[i].Numero === "---") {
                                    pare = i.toString();
                                }
                                if (Escaneado === BinsLength[i].Escaneado) {
                                    encontro = i.toString();
                                }

                            }
                            BinsLength[pare].Numero = Escaneado;
                            BinsLength[encontro].Escaneado = "";
                            BinsLength[pare].Visible = true;
                            oModelM.refresh();
                            console.log(BinsLength);
                            var cont1 = parseInt(sap.ui.getCore().byId("cont1").getText().toString());
                            cont1 = cont1 - 1;
                            sap.ui.getCore().byId("cont1").setText(cont1.toString());
                            var cont2 = parseInt(sap.ui.getCore().byId("cont2").getText().toString());
                            cont2 = cont2 + 1;
                            sap.ui.getCore().byId("cont2").setText(cont2.toString());
                            sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                        }
                    })
                ]
            });

            /* var oModelT = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/RDPOS/" + VBELN + "/" +
               WERKS,
               false);*/
            var oModelT = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('RDPOS--" + WERKS + "-" + VBELN +
                "-')/$value",
                false);
            sap.ui.getCore().setModel(oModelT, "data_select2");

            /*  var oTable3 = new sap.m.List({
                id: "idTableModulo3",
                noDataText: "Ningún módulo registrado",
                width: "100%"
                  //items:"{/TablaProyeccionData}"
              });
                  oTable3.addColumn(new sap.m.Column({
                  minScreenWidth: "Tablet",
                  demandPopin: true,
                  hAlign: "Center"

                }));*/
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var scanInput99 = new sap.m.Input({
                maxLength: 25,
                id: "escaner",
                width: "50%",
                liveChange: function (oEvent) {
                    var value = oEvent.getSource().getValue();
                    var bNotnumber = isNaN(value);
                    if (bNotnumber === false) {
                        oThis.valor = value;
                        //  sNumber = value;
                    } else {
                        oEvent.getSource().setValue(oThis.valor);
                    }
                }.bind(this)
            });

            scanInput99.onsapenter = (function (oEvent) {

                var oView = oThis.getView();
                var oModelM = oView.getModel("myParam");
                var Bins = oModelM.getProperty("/binsEscaner");
                //  var Bins = oContext.getProperty("Bins");

                var escaner = sap.ui.getCore().byId("escaner").getValue();
                var pare = "";
                var encontro = "";
                for (var i = 0; i < Bins.length; i++) {
                    if (pare === "" && Bins[i].Escaneado === "") {
                        pare = i.toString();
                    }
                    if (escaner === Bins[i].Numero) {
                        encontro = i.toString();
                    }

                }

                if (encontro === "") {

                    var dialog = new sap.m.Dialog({
                        title: 'Alerta',
                        type: 'Message',
                        state: 'Warning',
                        content: new sap.m.Text({
                            text: 'El código escaneado no se encuentra en la lista de códigos registrados .'
                        }),
                        beginButton: new sap.m.Button({
                            text: 'Aceptar',
                            type: 'Emphasized',
                            press: function () {
                                dialog.close();
                            }
                        }),
                        afterClose: function () {
                            dialog.destroy();
                        }
                    });

                    dialog.open();
                } else {
                    var realizar = 0;
                    for (i = 0; i < Bins.length; i++) {
                        if (encontro === i.toString()) {
                            realizar = 1;
                        }
                        if (realizar === 1 && i !== Bins.length - 1) {
                            var y = i + 1;
                            if (Bins[y].Numero === "---") {
                                Bins[i].Numero = "---";
                                Bins[i].Visible = false;
                                i = Bins.length + 1;
                            } else {
                                Bins[i].Numero = Bins[y].Numero;
                            }

                        }
                        if (i === Bins.length - 1) {
                            Bins[i].Numero = "---";
                            Bins[i].Visible = false;
                        }
                    }
                    Bins[pare].Escaneado = escaner;
                    //  Bins[Bins.length - 1].Numero = "---";
                    //  Bins[Bins.length - 1].Visible = false;
                    oModelM.refresh();
                    var cont1 = parseInt(sap.ui.getCore().byId("cont1").getText().toString());
                    cont1 = cont1 + 1;
                    sap.ui.getCore().byId("cont1").setText(cont1.toString());
                    var cont2 = parseInt(sap.ui.getCore().byId("cont2").getText().toString());
                    cont2 = cont2 - 1;
                    sap.ui.getCore().byId("cont2").setText(cont2.toString());
                    sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                    sap.ui.getCore().byId("escaner").setValue("");
                    sap.ui.getCore().byId("escaner").focus();
                    oThis.valor = "";

                }
                var id = sap.ui.getCore().byId("escaner").getId();
                console.log(id);
                $(id).focus();
            }.bind(this));
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var oDialog = new sap.m.Dialog("Dialog", {

                title: "Resumen de Guía",
                contentWidth: "600px",
                modal: true,
                type: "Message",
                content: [oTable,
                    new sap.m.Label({
                        text: "",
                        width: "100%"
                    }),
                    new sap.m.Label({
                        text: "Escanear HU's",
                        design: "Bold",
                        width: "100%"
                    }),
                    /*new sap.m.Input({
                      maxLength: 25,
                      id: "escaner",
                      width: "50%",
                      liveChange: function(oEvent) {
                        var value = oEvent.getSource().getValue();
                        var bNotnumber = isNaN(value);
                        if (bNotnumber === false) {
                          oThis.valor = value;
                          //  sNumber = value;
                        } else {
                          oEvent.getSource().setValue(oThis.valor);
                        }
                      }.bind(this)
                    }),*/
                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    scanInput99,
                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    new sap.m.Button({
                        icon: "sap-icon://add",
                        text: "Ingresar",
                        width: "50%",
                        type: "Emphasized",
                        press: function () {
                            var oView = oThis.getView();
                            var oModelM = oView.getModel("myParam");
                            var Bins = oModelM.getProperty("/binsEscaner");
                            //  var Bins = oContext.getProperty("Bins");

                            var escaner = sap.ui.getCore().byId("escaner").getValue();
                            var pare = "";
                            var encontro = "";
                            for (var i = 0; i < Bins.length; i++) {
                                if (pare === "" && Bins[i].Escaneado === "") {
                                    pare = i.toString();
                                }
                                if (escaner === Bins[i].Numero) {
                                    encontro = i.toString();
                                }

                            }
                            if (encontro === "") {

                                var dialog = new sap.m.Dialog({
                                    title: 'Alerta',
                                    type: 'Message',
                                    state: 'Warning',
                                    content: new sap.m.Text({
                                        text: 'El código escaneado no se encuentra en la lista de códigos registrados .'
                                    }),
                                    beginButton: new sap.m.Button({
                                        text: 'Aceptar',
                                        type: 'Emphasized',
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });

                                dialog.open();
                            } else {
                                var realizar = 0;
                                for (i = 0; i < Bins.length; i++) {
                                    if (encontro === i.toString()) {
                                        realizar = 1;
                                    }
                                    if (realizar === 1 && i !== Bins.length - 1) {
                                        var y = i + 1;
                                        if (Bins[y].Numero === "---") {
                                            Bins[i].Numero = "---";
                                            Bins[i].Visible = false;
                                            i = Bins.length + 1;
                                        } else {
                                            Bins[i].Numero = Bins[y].Numero;
                                        }

                                    }
                                    if (i === Bins.length - 1) {
                                        Bins[i].Numero = "---";
                                        Bins[i].Visible = false;
                                    }
                                }
                                Bins[pare].Escaneado = escaner;
                                //  Bins[Bins.length - 1].Numero = "---";
                                //  Bins[Bins.length - 1].Visible = false;
                                oModelM.refresh();
                                var cont1 = parseInt(sap.ui.getCore().byId("cont1").getText().toString());
                                cont1 = cont1 + 1;
                                sap.ui.getCore().byId("cont1").setText(cont1.toString());
                                var cont2 = parseInt(sap.ui.getCore().byId("cont2").getText().toString());
                                cont2 = cont2 - 1;
                                sap.ui.getCore().byId("cont2").setText(cont2.toString());
                                sap.ui.getCore().byId("idTableModulo2").getBinding("items").refresh(true);
                                sap.ui.getCore().byId("escaner").setValue("");
                                sap.ui.getCore().byId("escaner").focus();
                                oThis.valor = "";

                            }
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "100%"
                    }),
                    new sap.tnt.ToolHeader({
                        content: [
                            new sap.m.ToolbarSpacer({

                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://arrow-top"
                            }),
                            new sap.m.Label({
                                text: contBin.toString(),
                                id: "cont2",
                                textAlign: "Center",
                                design: "Bold"
                            }),
                            new sap.m.ToolbarSpacer({

                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://arrow-bottom"
                            }),
                            new sap.m.Label({
                                text: contBinReg.toString(),
                                id: "cont1",
                                textAlign: "Center",
                                design: "Bold"
                            }),
                            new sap.m.ToolbarSpacer({

                            }),
                            new sap.m.ToolbarSpacer({

                            }),
                            new sap.m.ToolbarSpacer({

                            })
                        ]
                    }),

                    new sap.m.Label({
                        text: "",
                        width: "100%"
                    }),

                    oTable2
                ],
                beginButton: new sap.m.Button({
                    icon: "sap-icon://save",
                    text: "Guardar",
                    press: function () {
                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        console.log(sap.ui.getCore().byId("cont2").getText().toString());
                        console.log(sap.ui.getCore().byId("cont1").getText().toString());
                        var oView = oThis.getView();
                        var oModelM = oView.getModel("myParam");
                        var Bins = oModelM.getProperty("/binsEscaner");
                        oModelM.setProperty("/T_BINES", []);
                        var T_BINES = oModelM.getProperty("/T_BINES");
                        if ((sap.ui.getCore().byId("cont2").getText().toString()) === "0" && (sap.ui.getCore().byId("cont1").getText().toString()) !== "0") {
                            var llave = {};
                            var vector = [];
                            for (var i = 0; i < Bins.length; i++) {
                                llave = {};
                                llave.VBELN = Bins[i].VBELN;
                                llave.MODULO = Bins[i].MODULO;
                                llave.EXIDV = Bins[i].Escaneado;
                                vector.push(llave);
                            }
                            var row = {};
                            row.COMENT = "";
                            row.PARAM = "R--" + WERKS + "-" + VBELN + "--";
                            row.VECTOR = vector;
                            row.PALETA = [];
                            //console.log(vector);
                            T_BINES.push(row);
                            T_BINES = JSON.stringify(T_BINES);
                            var oMessageTemplate = new sap.m.MessageItem({
                                type: '{type}',
                                title: '{title}',
                                subtitle: '{subtitle}'
                            });
                            var oMessageView = new sap.m.MessageView({
                                showDetailsPageHeader: false,
                                items: {
                                    path: "/ERRORES",
                                    template: oMessageTemplate
                                }
                            });
                            oMessageView.setModel(oModelM);
                            var dialogError = new sap.m.Dialog({
                                resizable: true,
                                content: oMessageView,
                                state: 'Error',
                                beginButton: new sap.m.Button({
                                    press: function () {
                                        dialogError.close();
                                    },
                                    text: "Cerrar"
                                }),
                                customHeader: new sap.m.Bar({
                                    contentMiddle: [
                                        new sap.m.Text({
                                            text: "Error"
                                        })
                                    ]
                                }),
                                afterClose: function () {
                                    dialogError.destroy();
                                },
                                contentHeight: "200px",
                                contentWidth: "850px",
                                verticalScrolling: false
                            });
                            //   $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/R/" + VBELN + "/" + WERKS, {
                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                type: 'GET',
                                async: false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                },
                                complete: function (xhr) {
                                    var token = xhr.getResponseHeader("X-CSRF-Token");

                                    //  $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/R/" + VBELN + "/" + WERKS, {
                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                        type: 'POST',
                                        data: T_BINES,
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('X-CSRF-Token', token);

                                        },
                                        success: function (response) {
                                            var contador = 0;
                                            var date = new Date();
                                            var year = date.getFullYear();
                                            var day = date.getDate();
                                            var month = date.getMonth() + 1;
                                            var oView = oThis.getView();
                                            date = year + "" + day + "" + month;
                                            var texto2 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('R-" + date + "-1401---')/$value";
                                            var oModelR = new sap.ui.model.json.JSONModel(texto2, false);
                                            oThis.getView().setModel(oModelR, "R");
                                            oModelR.attachRequestCompleted(function () {
                                                var vectorError = {
                                                    "ERRORES2": []
                                                };
                                                var cont = oModelR.getProperty("/ITAB");
                                                if (cont === null || cont === undefined) {
                                                    var llave = {};
                                                    llave.subtitle = "Error de conexión en el enlace:" + texto2;
                                                    llave.title = "Mensaje de error Nro " + 2;
                                                    llave.type = "Error";
                                                    vectorError.push(llave);
                                                    contador++;
                                                    oView.byId("idButtonError").setVisible(true);
                                                    oView.byId("idButtonError").setText("" + contador);
                                                    oView.byId("GenericTile2").setSubheader("Se ha generado un error");
                                                } else {
                                                    cont = oModelR.getProperty("/ITAB/length");
                                                    oView.byId("GenericTile2").setSubheader("Tienes " + cont + " tareas");
                                                }
                                                oThis.getView().getModel("R").refresh();
                                                oThis.byId("idCamConfTable").getBinding("items").refresh(true);
                                            }.bind(this));

                                            var texto6 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('A-" + date + "-1401---')/$value";
                                            var oModelA = new sap.ui.model.json.JSONModel(texto6, false);
                                            oThis.getView().setModel(oModelA, "A");
                                            oModelA.attachRequestCompleted(function () {
                                                var vectorError = {
                                                    "ERRORES2": []
                                                };
                                                var cont = oModelA.getProperty("/ITAB");
                                                if (cont === null || cont === undefined) {
                                                    var llave = {};
                                                    llave.subtitle = "Error de conexión en el enlace:" + texto6;
                                                    llave.title = "Mensaje de error Nro " + 6;
                                                    llave.type = "Error";
                                                    vectorError.push(llave);
                                                    contador++;
                                                    oView.byId("idButtonError").setVisible(true);
                                                    oView.byId("idButtonError").setText("" + contador);
                                                    oView.byId("GenericTile3").setSubheader("Se ha generado un error");
                                                } else {
                                                    //  cont = oModelA.getProperty("/ITAB");
                                                    // console.log(cont);
                                                    cont = oModelA.getProperty("/ITAB/length");
                                                    oView.byId("GenericTile3").setSubheader("Tienes " + cont + " tareas");
                                                    oThis.getView().getModel("A").refresh();
                                                    oThis.byId("idStageTable").getBinding("items").refresh(true);
                                                }
                                            }.bind(this));

                                            var dialog = new sap.m.Dialog({
                                                title: 'Guardado',
                                                type: 'Message',
                                                state: 'Success',
                                                content: new sap.m.Text({
                                                    text: 'Se guardaron correctamente los códigos escaneado .'
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            oDialog.close();
                                            dialog.open();
                                        }.bind(this),
                                        error: function (response) {
                                            oThis.getView().getModel("R").refresh();
                                            oThis.byId("idCamConfTable").getBinding("items").refresh(true);
                                            var respuesta2 = "No se guardaron correctamente los códigos escaneados .";
                                            try {
                                                var respuesta = response.responseText.toString();
                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                respuesta = respuesta[1];
                                                respuesta = respuesta.split('</message>');
                                                respuesta = respuesta[0];
                                                respuesta2 = respuesta;
                                            } catch (err) {
                                                console.log(err);
                                            }
                                            var dialog = new sap.m.Dialog({
                                                title: 'Error generado',
                                                type: 'Message',
                                                state: 'Error',
                                                content: new sap.m.Text({
                                                    text: respuesta2
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }.bind(this)
                                    });

                                },
                                success: function (response) { },
                                error: function (response) {
                                    console.log(response);
                                }
                            });
                        } else {
                            var dialog = new sap.m.Dialog({
                                title: 'Alerta',
                                type: 'Message',
                                state: 'Warning',
                                content: new sap.m.Text({
                                    text: 'No todos los códigos han sido escaneados y aprobados.'
                                }),
                                beginButton: new sap.m.Button({
                                    text: 'Aceptar',
                                    type: 'Emphasized',
                                    press: function () {
                                        dialog.close();
                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                }
                            });
                            dialog.open();
                            sap.ui.core.BusyIndicator.hide();
                        }
                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: "Cancelar",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
            sap.ui.core.BusyIndicator.show(0);
            oModelT.attachRequestCompleted(function () {
                sap.ui.core.BusyIndicator.hide();
                var lenghtV = oModelT.getProperty("/ITAB");
                var oView = oThis.getView();
                var oModelM = oView.getModel("myParam");
                var llave = {};
                var vector = [];
                for (var i = 0; i < lenghtV.length; i++) {
                    llave = {};
                    llave.VBELN = lenghtV[i].VBELN.toString();
                    llave.MODULO = lenghtV[i].MODULO.toString();
                    llave.Numero = lenghtV[i].EXIDV.toString();
                    llave.Visible = true;
                    llave.Escaneado = "";
                    vector.push(llave);
                }
                sap.ui.getCore().byId("cont2").setText(lenghtV.length + "");

                oModelM.setProperty("/binsEscaner", vector);
                oTable2.setModel(oModelM);
                oTable2.bindAggregation("items", "/binsEscaner", columnListItem);
            });
            sap.ui.getCore().byId("escaner").focus();
        },
        oDialogDetail: function (event) {
            var oModelP = this.getView().getModel("myParam");
            oModelP.setProperty("/T_BINES", []);
            console.log(oModelP);

            var oContext = event.getSource().getBindingContext();
            var oThis = this;
            var path = oContext.getPath().toString();
            console.log(path);
            var guiaTXT = oContext.getProperty("GUIA");
            var VBELN = oContext.getProperty("VBELN").toString();
            var WERKS = oContext.getProperty("WERKS").toString();
            var empresaTXT = oContext.getProperty("TXT_EMP");
            var nombreTXT = oContext.getProperty("ZNAME");
            var tipoCamTXT = oContext.getProperty("ZTIP_CAM");
            var licenciaTXT = oContext.getProperty("ZLIC_COND");
            var empresatTXT = oContext.getProperty("ZEMP_TRAN");
            var placaTXT = oContext.getProperty("ZPLACA");
            var pesoTXT = oContext.getProperty("ZPESO_CAM");
            var netoTXT = oContext.getProperty("ZPESO_NET");
            var puertaTXT = oContext.getProperty("ZPUER_EMB");
            var modulosTXT = oContext.getProperty("Modulos");
            var oThis = this;
            var oTable = new sap.m.Table({
                id: "idTableRepo",
                title: "Tabla detalle",
                noDataText: "Ningún módulo registrado"
            });
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                width: "10rem",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Módulo"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Bines"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Jabas"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Pallets"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",
                width: "10rem",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Variedad"
                        })
                    ]
                })

            }));
            oTable.addColumn(new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                hAlign: "Center",

                header: new sap.m.HeaderContainer({
                    content: [
                        new sap.m.Label({
                            text: "Acción"
                        })
                    ]
                })

            }));

            var columnListItem = new sap.m.ColumnListItem({
                vAlign: "Middle",
                cells: [
                    new sap.m.Label({
                        text: "{MODULO}-{DESCOR}"
                    }),
                    new sap.m.Label({
                        text: "{BINS}"
                    }),
                    new sap.m.Label({
                        text: "{JABAS}"
                    }),
                    new sap.m.Label({
                        text: "{PALLETS}"
                    }),
                    new sap.m.Label({
                        text: "{VARIEDAD}-{DESC_VAR}"
                    }),
                    new sap.ui.layout.HorizontalLayout({
                        content: [
                            new sap.m.Button({
                                icon: "sap-icon://bar-code",
                                type: "Emphasized",
                                width: "100%",
                                visible: "{accion1}",
                                press: function (oEvent) {
                                    var oContext = oEvent.getSource().getBindingContext();

                                    /*  var path = oContext.getPath().toString();

                                        var oModel =  oThis.getView().getModel("myParam");
                                        var value = oModel.getProperty("/CamionColeccion/0/Modulos/0");
                                        value.accion1 = false;
                                        oThis.getView().byId("idProductsTable").getBinding("items").refresh(true);
                                          oModel.refresh();*/

                                    var oSelectedItem = oEvent.getSource();
                                    var oContext = oSelectedItem.getBindingContext();
                                    var Path = oContext.getPath().toString();
                                    var Bins = oContext.getObject().BINS.toString();
                                    var Jabas = oContext.getObject().JABAS.toString();
                                    var Pallets = oContext.getObject().PALLETS.toString();
                                    var Modulo = oContext.getObject().MODULO.toString();
                                    ///////////////////////////////////////////////////////////////////
                                    var Variedad = oContext.getObject().VARIEDAD.toString();
                                    var varrLongitudCodigo = oContext.getObject().LONGITUD_CODIGO.toString();
                                    var varrLongitudCodigoTemp = oContext.getObject().LONGITUD_CODIGO.toString();
                                    varrLongitudCodigoTemp = parseInt(varrLongitudCodigoTemp, 10);
                                    if (varrLongitudCodigoTemp === 0) {
                                        varrLongitudCodigo = 5;
                                    }
                                    console.log(varrLongitudCodigo);
                                    var varrCentro = WERKS.toString();
                                    var varrEntrega = VBELN.toString();
                                    ///////////////////////////////////////////////////////////////////
                                    oThis.oDialogAsigBins(Modulo, Bins, Jabas, Pallets, Path, path, varrCentro, varrEntrega, Variedad, varrLongitudCodigo);
                                }.bind(this)
                            }),
                            new sap.m.Button({
                                icon: "sap-icon://accept",
                                type: "Emphasized",
                                width: "100%",
                                visible: "{accion2}"
                            })
                        ]
                    })
                ]
            });

            var oModelP = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CDET--" + WERKS + "-" + VBELN +
                "-')/$value",
                false);
            sap.ui.getCore().setModel(oModelP, "data_select");
            oTable.setModel(sap.ui.getCore().getModel("data_select"));
            oTable.bindAggregation("items", "/ITAB", columnListItem)

            var oDialog = new sap.m.Dialog("Dialog", {

                title: "Resumen de Guías",
                contentWidth: "780px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: "Guía",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Empresa Agrícola",
                        width: "48%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "guia",
                        value: guiaTXT,
                        editable: false,
                        valueStateText: "El campo guía no debe estar vacío.",
                        placeholder: "Ingrese guía (15) ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "empresa",
                        value: empresaTXT,
                        editable: false,
                        valueStateText: "El campo empresa no debe estar vacío.",
                        placeholder: "Ingrese empresa (15) ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "Tipo de camion",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Nombre del conductor",
                        width: "48%"
                    }),

                    new sap.m.Input({
                        id: "tipoCamion",
                        value: tipoCamTXT,
                        editable: false,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 50,
                        id: "nombre",
                        value: nombreTXT,
                        editable: false,
                        valueStateText: "El campo nombre no debe estar vacío.",
                        placeholder: "Ingrese nombre (50) ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "Licencia de conducir",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Empresa de transporte",
                        width: "48%"
                    }),
                    new sap.m.Input({
                        maxLength: 50,
                        id: "licencia",
                        value: licenciaTXT,
                        editable: false,
                        valueStateText: "El campo licencia no debe estar vacío.",
                        placeholder: "Ingrese licencia (50) ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 50,
                        id: "transporte",
                        value: empresatTXT,
                        editable: false,
                        valueStateText: "El campo transporte no debe estar vacío.",
                        placeholder: "Ingrese transporte (50) ...",
                        required: true,
                        width: "48%"
                    }),

                    new sap.m.Label({
                        text: "Placa de camión",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Peso de camión entrante",
                        width: "48%"
                    }),

                    new sap.m.Input({
                        maxLength: 50,
                        id: "placa",
                        value: placaTXT,
                        editable: false,
                        valueStateText: "El campo placa no debe estar vacío.",
                        placeholder: "Ingrese placa (50) ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 50,
                        id: "camion",
                        value: pesoTXT,
                        editable: false,
                        valueStateText: "El campo camión no debe estar vacío.",
                        placeholder: "Ingrese camión (50) ...",
                        width: "48%"
                    }),

                    new sap.m.Label({
                        text: "Peso neto",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Puerta de embarque",
                        width: "48%"
                    }),

                    new sap.m.Input({
                        maxLength: 50,
                        id: "neto",
                        value: netoTXT,
                        valueStateText: "El campo peso neto no debe estar vacío.",
                        placeholder: "Ingrese peso neto  (50) ...",
                        editable: false,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 50,
                        id: "puerta",
                        value: puertaTXT,
                        valueStateText: "El campo puerta no debe estar vacío.",
                        placeholder: "Ingrese puerta neto  (50) ...",
                        editable: false,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "Comentarios",
                        width: "100%"
                    }),
                    new sap.m.TextArea({
                        id: "comentario",
                        width: '100%',
                        placeholder: 'Añade un comentario (opcional)'
                    }),
                    new sap.m.Label({
                        text: "Tabla detalle",
                        design: "Bold",
                        width: "100%"
                    }),
                    oTable

                ],
                beginButton: new sap.m.Button("btnVisibleGeneral", {
                    icon: "sap-icon://save",
                    text: "Guardar",
                    visible: true,
                    press: function () {
                        var vector = [];
                        var oView = oThis.getView();
                        var oModelP = oView.getModel("myParam");
                        var tabDet = oModelP.getProperty("/binsVector");
                        //  var T_BINES = oModelP.getProperty("/T_BINES");
                        var T_BINES = [];
                        var row = {};

                        for (var i = 0; i < tabDet.length; i++) {
                            var estado = tabDet[i].accion2;
                            console.log(estado);
                            if (!estado) {
                                var dialog = new sap.m.Dialog({
                                    title: 'Alerta',
                                    type: 'Message',
                                    state: 'Warning',
                                    content: new sap.m.Text({
                                        text: 'No todos los módulos han sido escaneados y aprobados.'
                                    }),
                                    beginButton: new sap.m.Button({
                                        text: 'Aceptar',
                                        type: 'Emphasized',
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();
                                i = tabDet.length;
                                return;
                            } else {

                                var modulo = tabDet[i].MODULO;
                                var vbeln = tabDet[i].VBELN;
                                var matnr = tabDet[i].VARIEDAD;
                                for (var y = 0; y < tabDet[i].ESCANER.length; y++) {
                                    row = {};
                                    row.EXIDV = tabDet[i].ESCANER[y].Numero;
                                    row.VBELN = vbeln;
                                    row.MODULO = modulo;
                                    row.MATNR = matnr;
                                    vector.push(row);
                                }

                            }
                        }
                        //////////////////////////////////////////////////////////////////////////////////
                        var dialogConfirmacionSiNoF = new sap.m.Dialog({
                            title: 'Alerta',
                            type: 'Message',
                            state: 'Warning',
                            content: new sap.m.Text({
                                text: '¿Esta seguro guardar los HUs ingresados?'
                            }),
                            beginButton: new sap.m.Button({
                                text: 'Aceptar',
                                type: 'Emphasized',
                                press: function () {
                                    //////////////////////////////////////////////////////////////////////////////////
                                    //sap.ui.getCore().byId('btnVisibleGeneral').setVisible(false);
                                    sap.ui.getCore().byId("btnVisibleGeneral").setBusy(true);
                                    row = {};
                                    var comentario = sap.ui.getCore().byId("comentario").getValue();
                                    if (comentario !== "" && comentario !== null && comentario !== undefined) {
                                        row.COMENT = comentario;
                                    } else {
                                        row.COMENT = "";
                                    }
                                    row.PARAM = "C--" + WERKS + "-" + VBELN + "--";
                                    row.VECTOR = vector;
                                    row.PALETA = [];
                                    T_BINES.push(row);
                                    T_BINES = JSON.stringify(T_BINES);

                                    var oMessageTemplate = new sap.m.MessageItem({
                                        type: '{type}',
                                        title: '{title}',
                                        subtitle: '{subtitle}'
                                    });
                                    var oMessageView = new sap.m.MessageView({
                                        showDetailsPageHeader: false,
                                        items: {
                                            path: "/ERRORES",
                                            template: oMessageTemplate
                                        }
                                    });
                                    oMessageView.setModel(oModelP);
                                    var dialogError = new sap.m.Dialog({
                                        resizable: true,
                                        content: oMessageView,
                                        state: 'Error',
                                        beginButton: new sap.m.Button({
                                            press: function () {
                                                dialogError.close();
                                            },
                                            text: "Cerrar"
                                        }),
                                        customHeader: new sap.m.Bar({
                                            contentMiddle: [
                                                new sap.m.Text({
                                                    text: "Error"
                                                })
                                            ]
                                        }),
                                        afterClose: function () {
                                            dialogError.destroy();
                                        },
                                        contentHeight: "200px",
                                        contentWidth: "850px",
                                        verticalScrolling: false
                                    });

                                    //  $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/C/" + VBELN + "/" + WERKS, {
                                    console.log(T_BINES);
                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                        type: 'GET',
                                        async: false,
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                        },
                                        complete: function (xhr) {
                                            var token = xhr.getResponseHeader("X-CSRF-Token");

                                            //   $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/C/" + VBELN + "/" + WERKS, {
                                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                                type: 'POST',
                                                data: T_BINES,
                                                beforeSend: function (xhr) {
                                                    xhr.setRequestHeader('X-CSRF-Token', token);

                                                },
                                                success: function (response) {

                                                    var contador = 0;
                                                    var date = new Date();
                                                    var year = date.getFullYear();
                                                    var day = date.getDate();
                                                    var month = date.getMonth() + 1;
                                                    var oView = oThis.getView();
                                                    date = year + "" + day + "" + month;
                                                    //DG - Inicio
                                                    // var texto = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('C-" + date + "-1401---')/$value";
                                                    var texto = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('C-" + date + "-" + WERKS + "---')/$value";
                                                    //DG - Fin+

                                                    var oModel = new sap.ui.model.json.JSONModel(texto, false);
                                                    oThis.getView().setModel(oModel);
                                                    oModel.attachRequestCompleted(function () {
                                                        var vectorError = {
                                                            "ERRORES2": []
                                                        };
                                                        var oModelM = new sap.ui.model.json.JSONModel(vectorError);
                                                        oView.setModel(oModelM, "myError");
                                                        vectorError = oModelM.getProperty("/ERRORES2");
                                                        var cont = oModel.getProperty("/ITAB");
                                                        oThis.JSONprueba = oModel.getJSON();
                                                        if (cont === null || cont === undefined) {
                                                            var llave = {};
                                                            llave.subtitle = "Error de conexión en el enlace: " + texto;
                                                            llave.title = "Mensaje de error Nro " + 1;
                                                            llave.type = "Error";
                                                            vectorError.push(llave);
                                                            contador++;
                                                            oView.byId("idButtonError").setVisible(true);
                                                            oView.byId("idButtonError").setText("" + contador);
                                                            oView.byId("GenericTile1").setSubheader("Se ha generado un error");
                                                        } else {
                                                            cont = oModel.getProperty("/ITAB/length");
                                                            oView.byId("GenericTile1").setSubheader("Tienes " + cont + " tareas");
                                                        }
                                                        oThis.byId("idProductsTable").getBinding("items").refresh(true);
                                                    }.bind(this));

                                                    //DG - Inicio
                                                    // var texto2 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('R-" + date + "-1401---')/$value";
                                                    var texto2 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('R-" + date + "-" + WERKS + "---')/$value";
                                                    //DG - Fin
                                                    var oModelR = new sap.ui.model.json.JSONModel(texto2, false);
                                                    oThis.getView().setModel(oModelR, "R");
                                                    oModelR.attachRequestCompleted(function () {
                                                        var vectorError = {
                                                            "ERRORES2": []
                                                        };
                                                        var cont = oModelR.getProperty("/ITAB");
                                                        if (cont === null || cont === undefined) {
                                                            var llave = {};
                                                            llave.subtitle = "Error de conexión en el enlace:" + texto2;
                                                            llave.title = "Mensaje de error Nro " + 2;
                                                            llave.type = "Error";
                                                            vectorError.push(llave);
                                                            contador++;
                                                            oView.byId("idButtonError").setVisible(true);
                                                            oView.byId("idButtonError").setText("" + contador);
                                                            oView.byId("GenericTile2").setSubheader("Se ha generado un error");
                                                        } else {
                                                            cont = oModelR.getProperty("/ITAB/length");
                                                            oView.byId("GenericTile2").setSubheader("Tienes " + cont + " tareas");
                                                        }
                                                        oThis.getView().getModel("R").refresh();
                                                        oThis.byId("idCamConfTable").getBinding("items").refresh(true);
                                                    }.bind(this));

                                                    var oModel = new sap.ui.model.json.JSONModel(response, false);
                                                    oThis.getView().getModel().refresh();
                                                    oThis.byId("idProductsTable").getBinding("items").refresh(true);
                                                    var dialog = new sap.m.Dialog({
                                                        title: 'Guardado',
                                                        type: 'Message',
                                                        state: 'Success',
                                                        content: new sap.m.Text({
                                                            text: 'Se guardaron correctamente los códigos escaneados .'
                                                        }),
                                                        beginButton: new sap.m.Button({
                                                            text: 'Aceptar',
                                                            type: 'Emphasized',
                                                            press: function () {
                                                                dialog.close();
                                                            }
                                                        }),
                                                        afterClose: function () {
                                                            dialog.destroy();
                                                        }
                                                    });
                                                    oDialog.close();
                                                    dialog.open();

                                                }.bind(this),
                                                error: function (response) {
                                                    var respuesta2 = "No se guardaron correctamente los códigos escaneados .";
                                                    try {
                                                        var respuesta = response.responseText.toString();
                                                        respuesta = respuesta.split('<message xml:lang="es">');
                                                        respuesta = respuesta[1];
                                                        respuesta = respuesta.split('</message>');
                                                        respuesta = respuesta[0];
                                                        respuesta2 = respuesta;
                                                    } catch (err) {
                                                        console.log(err);
                                                    }
                                                    var dialog = new sap.m.Dialog({
                                                        title: 'Error generado',
                                                        type: 'Message',
                                                        state: 'Error',
                                                        content: new sap.m.Text({
                                                            text: respuesta2
                                                        }),
                                                        beginButton: new sap.m.Button({
                                                            text: 'Aceptar',
                                                            type: 'Emphasized',
                                                            press: function () {
                                                                dialog.close();
                                                            }
                                                        }),
                                                        afterClose: function () {
                                                            dialog.destroy();
                                                        }
                                                    });
                                                    dialog.open();
                                                }.bind(this)
                                            });

                                        },
                                        success: function (response) { },
                                        error: function (response) {
                                            console.log(response);
                                        }
                                    });

                                    /*    var oModelSend = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing", false);
                                              oModelSend.create("/Guia", oModelM, {
                                                      method: "POST",
                                                      success: function(data) {
                                                        console.log("LLLEGGGO");
                                                      }});
                                          */
                                    //////////////////////////////////////////////////////////////////////////////////
                                    dialogConfirmacionSiNoF.close();
                                }
                            }),
                            endButton: new sap.m.Button({
                                icon: "sap-icon://cancel",
                                text: "Cancelar",
                                press: function () {
                                    dialogConfirmacionSiNoF.close();
                                }.bind(this)
                            }),
                            afterClose: function () {
                                dialogConfirmacionSiNoF.destroy();
                            }
                        });
                        dialogConfirmacionSiNoF.open();
                        //////////////////////////////////////////////////////////////////////////////////
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: "Cancelar",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
            sap.ui.core.BusyIndicator.show(0);
            oModelP.attachRequestCompleted(function () {
                // console.log(oModelP.getJSON());
                sap.ui.core.BusyIndicator.hide();
                var lenghtV = oModelP.getProperty("/ITAB");
                console.log(lenghtV);
                var oView = oThis.getView();
                var oModelM = oView.getModel("myParam");
                var binsVector = oModelM.getProperty("/binsVector");
                var llave = {};
                var vector = [];
                for (var i = 0; i < lenghtV.length; i++) {
                    llave = {};
                    llave.VBELN = VBELN;
                    llave.VARIEDAD = lenghtV[i].VARIEDAD;
                    llave.DESCOR = lenghtV[i].DESCOR;
                    llave.DESC_VAR = lenghtV[i].DESC_VAR;
                    llave.MODULO = lenghtV[i].MODULO;
                    llave.BINS = lenghtV[i].BINS;
                    llave.JABAS = lenghtV[i].JABAS;
                    llave.PALLETS = lenghtV[i].PALLETS;
                    llave.LONGITUD_CODIGO = lenghtV[i].LONGITUD_CODIGO;
                    llave.ESCANER = [];
                    llave.accion1 = true;
                    llave.accion2 = false;
                    vector.push(llave);
                }
                oModelM.setProperty("/binsVector", vector);
                oTable.setModel(oModelM);
                oTable.bindAggregation("items", "/binsVector", columnListItem);
            }.bind(this));
        },
        oDialogDetail2: function (event) {
            var valorFecha = new Date();
            var oContext = event.getSource().getBindingContext("CP");
            console.log(oContext);
            var VBELN = oContext.getProperty("VBELN").toString();
            var guiaTXT = oContext.getProperty("FEC_REC").toString();
            var PARTNER = oContext.getProperty("PARTNER").toString();
            var DESCOR = oContext.getProperty("DESCOR").toString();
            var GUIA = oContext.getProperty("GUIA").toString();
            var WERKS = oContext.getProperty("WERKS").toString();
            var moduloTXT = oContext.getProperty("MODULO").toString();
            var palletTXT = oContext.getProperty("PALLETS").toString();
            var empresaTXT = oContext.getProperty("TXT_EMP").toString();
            var oThis = this;
            this.valor = "";

            var oDialog = new sap.m.Dialog("Dialog", {

                title: "Crear Paleta",
                contentWidth: "680px",
                modal: true,
                type: "Message",
                content: [
                    /*new sap.m.Label({
                      text: "Linea",
                      width: "48%"
                    }),
                    new sap.m.Label({
                      text: "",
                      width: "4%"
                    }),
                    new sap.m.Label({
                      text: "Fecha Skynet",
                      width: "48%"
                    }),
                    new sap.m.ComboBox({
                      id: "idReProTipo",
                      placeholder: "Seleccionar", // string
                      items: {
                        path: "myParam>/listTipoLinea",
                        template: new sap.ui.core.Item({
                          key: "Linea1",
                          text: "Linea 1"
                        }, {
                          key: "Linea2",
                          text: "Linea 2"
                        })
                      },
                      width: "48%"
                    }),
                    new sap.m.Label({
                      text: "",
                      width: "4%"
                    }),
                    new sap.m.Input({
                      maxLength: 15,
                      id: "idFechaSkynet",
                      value: guiaTXT,
                      editable: true,
                      valueStateText: "El campo fecha no debe estar vacóo.",
                      placeholder: "Fecha Skynet",
                      required: true,
                      width: "48%"
                    }),*/

                    new sap.m.Label({
                        text: "Fecha de recepción",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEsp1",
                        width: "52%"
                    }),
                    new sap.m.Label({
                        text: "Nro de pallet Skynet",
                        id: "idLabelPallet",
                        visible: false,
                        width: "48%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "guia",
                        value: guiaTXT,
                        editable: false,
                        valueStateText: "El campo fecha no debe estar vacío.",
                        placeholder: "Ingrese fecha (15) ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEsp2",
                        width: "52%"
                    }),
                    new sap.m.Input({
                        maxLength: 20,
                        id: "skynet",
                        visible: false,
                        value: "",
                        editable: true,
                        valueStateText: "El campo nro de pallet skynet no debe estar vacío.",
                        placeholder: "Ingrese nro de pallet skynet (20) ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "Empresa Agrícola",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Módulo",
                        width: "48%"
                    }),
                    new sap.m.Input({
                        maxLength: 200,
                        id: "empresa",
                        value: empresaTXT,
                        editable: false,
                        valueStateText: "El campo guía no debe estar vacío.",
                        placeholder: "Ingrese guía (15) ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "modulo",
                        value: moduloTXT + "-" + DESCOR,
                        editable: false,
                        valueStateText: "El campo guía no debe estar vacío.",
                        placeholder: "Ingrese guía (15) ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "Cliente",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Producto",
                        width: "48%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "cliente",
                        editable: false,
                        value: "",
                        valueStateText: "El campo cliente no debe estar vacío.",
                        placeholder: "Ingrese cliente (15) ...",
                        required: true,
                        width: "30%"
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        icon: "sap-icon://employee-lookup",
                        width: "18%",
                        press: function () {
                            oThis.BusquedaCliente(WERKS, VBELN);
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "producto",
                        editable: false,
                        valueStateText: "El campo producto no debe estar vacío.",
                        placeholder: "Ingrese producto (15) ...",
                        required: true,
                        width: "30%"
                    }),
                    /*new sap.m.Button({
                      type: "Emphasized",
                      icon: "sap-icon://product",
                      width: "8%",
                      press: function() {
                        var cliente = sap.ui.getCore().byId("cliente").getValue().toString();
                        cliente = cliente.split("-");
                        var CLIENTE = cliente[0];
                        oThis.BusquedaProducto(WERKS, VBELN, moduloTXT, guiaTXT, PARTNER, CLIENTE);
                      }.bind(this)
                    }),*/
                    ///////////////////////////////////////////////////////////////////////////////////////////
                    new sap.m.Button({
                        type: "Emphasized",
                        icon: "sap-icon://product",
                        width: "18%",
                        press: function () {
                            var cliente = sap.ui.getCore().byId("cliente").getValue().toString();
                            cliente = cliente.split("-");
                            var CLIENTE = cliente[0];
                            oThis.diallogBusquedaProducto(WERKS, VBELN, moduloTXT, guiaTXT, PARTNER, CLIENTE);
                        }.bind(this)
                    }),
                    ///////////////////////////////////////////////////////////////////////////////////////////
                    new sap.m.Label({
                        text: "Viaje",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Descripción del producto",
                        width: "48%"
                    }),
                    new sap.m.Input({
                        maxLength: 40,
                        id: "viaje",
                        editable: false,
                        value: "",
                        valueStateText: "El campo viaje no debe estar vacío.",
                        placeholder: "Ingrese viaje (15) ...",
                        required: true,
                        width: "30%"
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        icon: "sap-icon://travel-itinerary",
                        width: "18%",
                        press: function () {
                            var PRODUCTO = sap.ui.getCore().byId("producto").getValue();
                            var cliente = sap.ui.getCore().byId("cliente").getValue().toString();
                            cliente = cliente.split("-");
                            var CLIENTE = cliente[0];
                            //oThis.BusquedaViaje(WERKS, guiaTXT, moduloTXT, PARTNER, PRODUCTO, CLIENTE);
                            var varLinea12 = sap.ui.getCore().byId("idLinea12").getValue(); ///20200501
                            oThis.BusquedaViaje(WERKS, guiaTXT, moduloTXT, PARTNER, PRODUCTO, CLIENTE, varLinea12); ///20200501

                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 200,
                        id: "descripcionP",
                        editable: false,
                        value: "",
                        valueStateText: "El campo descripción no debe estar vacío.",
                        placeholder: "Ingrese descripción (200) ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "Fecha de cosecha",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Guía",
                        width: "48%"
                    }),
                    new sap.m.Input({
                        id: "cosecha",
                        value: "",
                        editable: false,
                        valueStateText: "Se requiere seleccionar una Guía.",
                        placeholder: "Seleccione una Guía ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        id: "guia2",
                        value: "",
                        editable: false,
                        valueStateText: "El campo guía no debe estar vacío.",
                        placeholder: "Seleccione Guía (20) ...",
                        required: true,
                        width: "30%"
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        icon: "sap-icon://course-book",
                        width: "18%",
                        press: function () {
                            var PRODUCTO = sap.ui.getCore().byId("producto").getValue();
                            oThis.BusquedaGuia(WERKS, guiaTXT, moduloTXT, PARTNER, PRODUCTO);
                        }.bind(this)
                    }),
                    ////////////////////// 20200130 ///////////////////
                    new sap.m.Label({
                        text: "Línea",
                        width: "22%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Máx. Paleta",
                        width: "22%"
                    }),
                    ///////////////////////////////////////////////////
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Cantidad",
                        width: "48%"
                    }),
                    ////////////////////// 20200130 ///////////////////
                    new sap.m.Input({
                        maxLength: 15,
                        id: "idLinea12",
                        editable: false,
                        valueStateText: "Se requiere seleccionar un pedido.",
                        placeholder: "Seleccione un pedido ...",
                        required: true,
                        width: "22%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "paleta",
                        editable: false,
                        valueStateText: "Se requiere seleccionar un pedido.",
                        placeholder: "Seleccione un pedido ...",
                        required: true,
                        width: "22%"
                    }),
                    ///////////////////////////////////////////////////
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "cantidad",
                        valueStateText: "El campo cantidad no debe estar vacío.",
                        placeholder: "Ingrese cantidad (15) ...",
                        required: true,
                        width: "48%",
                        liveChange: function (oEvent) {
                            if (sap.ui.getCore().byId("paleta").getValue() !== "") {
                                var value = oEvent.getSource().getValue();
                                var paleta = sap.ui.getCore().byId("paleta").getValue().toString();
                                var bNotnumber = isNaN(value);
                                if (bNotnumber === false) {
                                    if (parseInt(paleta) >= parseInt(value)) {
                                        oThis.valor = value;
                                    } else {
                                        if (value === "") {

                                            oEvent.getSource().setValue("");
                                            oThis.valor = "";
                                        } else {
                                            sap.m.MessageToast.show("La cantidad no puede ser mayor al máximo de paletas.");
                                            oEvent.getSource().setValue(oThis.valor);
                                        }
                                    }
                                    //  sNumber = value;
                                } else {

                                    oEvent.getSource().setValue(oThis.valor);
                                }

                            } else {
                                oEvent.getSource().setValue(oThis.valor);
                                sap.m.MessageToast.show("Se requiere seleccionar un producto.");
                            }
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "Comentario",
                        width: "100%"
                    }),
                    new sap.m.TextArea({
                        id: "comentario",
                        width: '100%',
                        placeholder: 'Añade un comentario (opcional)'
                    })

                ],
                beginButton: new sap.m.Button({
                    icon: "sap-icon://save",
                    text: "Guardar",
                    press: function () {
                        sap.ui.core.BusyIndicator.show(0);
                        var view = sap.ui.getCore();
                        var inputs = [
                            view.byId("cliente"),
                            view.byId("producto"),
                            view.byId("paleta"),
                            view.byId("cantidad"),
                            view.byId("viaje"),
                            view.byId("cosecha"),
                            view.byId("guia2"),
                            view.byId("idLinea12")
                        ];
                        if (view.byId("skynet").getVisible()) {
                            inputs.push(view.byId("skynet"));
                        }
                        jQuery.each(inputs, function (i, input) {
                            if (!input.getValue()) {
                                input.setValueState("Error");
                            } else {
                                input.setValueState("None");
                            }
                        });

                        // check states of inputs
                        var canContinue = true;
                        jQuery.each(inputs, function (i, input) {
                            if ("Error" === input.getValueState()) {
                                canContinue = false;
                                return false;
                            }
                        });

                        if (canContinue) {

                            var oView = oThis.getView();
                            var oModelP = oView.getModel("myParam");
                            var T_BINES = [];
                            var PALETA = [];
                            var row = {};
                            row.GUIA = view.byId("guia2").getValue().toString();
                            row.FEC_REC = guiaTXT;
                            row.TXT_EMP = empresaTXT;
                            row.PARTNER = PARTNER;
                            row.MODULO = moduloTXT;
                            row.PALLETS = palletTXT;
                            row.FEC_COS = view.byId("cosecha").getValue().toString();
                            row.CODSKY = view.byId("skynet").getValue().toString();
                            row.CANT = view.byId("cantidad").getValue().toString();
                            row.LINEA = sap.ui.getCore().byId("idLinea12").getValue().substring(6, 7).toString();
                            var cliente = view.byId("cliente").getValue().toString();
                            cliente = cliente.split("-");
                            row.KUNNR = cliente[0];
                            row.MATNR = view.byId("producto").getValue().toString();
                            if (view.byId("viaje").getValue().toString() !== "") {
                                var viajeValor = view.byId("viaje").getValue().toString();
                                viajeValor = viajeValor.split("-");
                                row.VIAJE = viajeValor[0];
                                row.PEDIDO = viajeValor[1];
                            } else {
                                row.VIAJE = "";
                                row.PEDIDO = "";
                            }

                            PALETA.push(row);
                            row = {};
                            row.COMENT = view.byId("comentario").getValue().toString();
                            row.PARAM = "CP--" + WERKS + "-" + VBELN + "--";
                            row.VECTOR = [];
                            row.PALETA = PALETA;
                            T_BINES.push(row);
                            T_BINES = JSON.stringify(T_BINES);
                            console.log(T_BINES);
                            var oMessageTemplate = new sap.m.MessageItem({
                                type: '{type}',
                                title: '{title}',
                                subtitle: '{subtitle}'
                            });
                            var oMessageView = new sap.m.MessageView({
                                showDetailsPageHeader: false,
                                items: {
                                    path: "/ERRORES",
                                    template: oMessageTemplate
                                }
                            });
                            oMessageView.setModel(oModelP);
                            var dialogError = new sap.m.Dialog({
                                resizable: true,
                                content: oMessageView,
                                state: 'Error',
                                beginButton: new sap.m.Button({
                                    press: function () {
                                        dialogError.close();
                                    },
                                    text: "Cerrar"
                                }),
                                customHeader: new sap.m.Bar({
                                    contentMiddle: [
                                        new sap.m.Text({
                                            text: "Error"
                                        })
                                    ]
                                }),
                                afterClose: function () {
                                    dialogError.destroy();
                                },
                                contentHeight: "200px",
                                contentWidth: "850px",
                                verticalScrolling: false
                            });

                            //  $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/CP/" + VBELN + "/" + WERKS, {
                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                type: 'GET',
                                async: false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                },
                                complete: function (xhr) {
                                    var token = xhr.getResponseHeader("X-CSRF-Token");

                                    //         $.ajax("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/CP/" + VBELN + "/" + WERKS, {
                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                        type: 'POST',
                                        data: T_BINES,
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('X-CSRF-Token', token);

                                        },
                                        success: function (response) {
                                            var string = "";
                                            try {
                                                sap.ui.core.BusyIndicator.hide();
                                                string = response.getElementsByTagName("entry")[0];
                                                string = string.getElementsByTagName("m:properties")[0];
                                                string = string.getElementsByTagName("d:ID")[0].childNodes[0].nodeValue;
                                                string = string.split("-");
                                                var HU = string[0];
                                                var Pedido = string[1];
                                                var Cliente = string[2];

                                                string = [

                                                    new sap.ui.layout.VerticalLayout({
                                                        content: [
                                                            new sap.m.Text({
                                                                text: 'Se creó correctamente el pallet de producto terminado.',
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
                                                                            })
                                                                        ]
                                                                    }),
                                                                    new sap.ui.layout.VerticalLayout({
                                                                        content: [

                                                                            new sap.m.Label({
                                                                                text: HU
                                                                            }),
                                                                            new sap.m.Label({
                                                                                text: Pedido
                                                                            }),
                                                                            new sap.m.Label({
                                                                                text: Cliente
                                                                            })
                                                                        ]
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ];

                                            } catch (err) {
                                                string = "Se creó correctamente el pallet de producto terminado.";
                                            }

                                            //         console.log(response.properties);
                                            //       console.log(response.properties.ID);
                                            var contador = 0;
                                            var date = new Date();
                                            var year = date.getFullYear();
                                            var day = date.getDate();
                                            var month = date.getMonth() + 1;
                                            var oView = oThis.getView();
                                            date = year + "" + day + "" + month;
                                            var texto5 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CP-" + date + "-1401---')/$value";
                                            var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
                                            console.log(oModelC);
                                            oThis.getView().setModel(oModelC, "CP");
                                            oModelC.attachRequestCompleted(function () {
                                                var vectorError = {
                                                    "ERRORES2": []
                                                };
                                                var myParam = oThis.getView().getModel("myParam");
                                                var cont = oModelC.getProperty("/ITAB");

                                                var llave = {};

                                                if (cont === null || cont === undefined) {
                                                    llave = {};
                                                    llave.subtitle = "Error de conexión en el enlace:" + texto5;
                                                    llave.title = "Mensaje de error Nro " + 5;
                                                    llave.type = "Error";
                                                    vectorError.push(llave);
                                                    contador++;
                                                    oView.byId("idButtonError").setVisible(true);
                                                    oView.byId("idButtonError").setText("" + contador);
                                                    oView.byId("GenericTile6").setSubheader("Se ha generado un error");
                                                } else {
                                                    cont = oModelC.getProperty("/ITAB/length");

                                                    oView.byId("GenericTile6").setSubheader("Tienes " + cont + " tareas");
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
                                                    oThis.getView().setModel(myParam, "CP");
                                                }
                                            }.bind(this));
                                            oThis.getView().getModel("CP").refresh();
                                            oThis.byId("idPaletTable").getBinding("items").refresh(true);
                                            console.log(string);
                                            var dialog = new sap.m.Dialog({
                                                title: 'Guardado',
                                                type: 'Message',
                                                state: 'Success',
                                                content: string,
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            oDialog.close();
                                            dialog.open();
                                        }.bind(this),
                                        error: function (response) {
                                            sap.ui.core.BusyIndicator.hide();
                                            oThis.byId("idPaletTable").getBinding("items").refresh(true);
                                            var respuesta2 = "No se guardaron correctamente los códigos escaneados .";
                                            try {
                                                var respuesta = response.responseText.toString();
                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                respuesta = respuesta[1];
                                                respuesta = respuesta.split('</message>');
                                                respuesta = respuesta[0];
                                                respuesta2 = respuesta;
                                            } catch (err) {
                                                console.log(err);
                                            }
                                            var dialog = new sap.m.Dialog({
                                                title: 'Error generado',
                                                type: 'Message',
                                                state: 'Error',
                                                content: new sap.m.Text({
                                                    text: respuesta2
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }.bind(this)
                                    });

                                },
                                success: function (response) { },
                                error: function (response) {
                                    console.log(response);
                                }
                            });

                        } else {

                            var dialog = new sap.m.Dialog({
                                title: "Alerta",
                                type: "Message",
                                state: "Warning",
                                content: new sap.m.Text({
                                    text: "Se requiere el ingreso de los datos indicados."

                                }),
                                beginButton: new sap.m.Button({
                                    text: "OK",
                                    type: "Accept",
                                    press: function () {
                                        dialog.close();
                                        dialog.destroy();

                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                }
                            });

                            dialog.open();
                            sap.ui.core.BusyIndicator.hide();
                        }
                    }
                }),
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: "Cancelar",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
        },

        //////////////////////////////////////////////////////////////////////////////////////
        diallogBusquedaProducto: function (WERKS, VBELN, MODULO, FECHA, PARTNER, CLIENTE) {

            var oThis = this;
            this.MODULO = MODULO;
            this.FECHA = FECHA;
            this.WERKS = WERKS;
            this.PARTNER = PARTNER;
            this.CLIENTE = CLIENTE;

            console.log(MODULO);
            console.log(PARTNER);
            console.log(FECHA);
            console.log(VBELN);

            /*var oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPHPR--" + WERKS + "-" + VBELN + "-" +
              MODULO + "-')/$value");*/
            var oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPHPR-" + FECHA + "-" + WERKS + "-" + VBELN + "-" +
                MODULO + "----" + PARTNER + "-')/$value");
            console.log(oModel);

            /*  var oModel = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/CPHPR/" + VBELN + "/" +
                WERKS, false);*/

            sap.ui.getCore().setModel(oModel, "cliente");
            oModel.setSizeLimit(10000);

            var comboBox1 = new sap.m.ComboBox({
                id: "idReProTipo",
                placeholder: "Seleccionar", // string
                items: {
                    path: "myParam>/listTipoProducto",
                    template: new sap.ui.core.Item({
                        key: "{myParam>clistTipoProductoKey}",
                        text: "{myParam>clistTipoProductoText}"
                    })
                },
                selectedKeys: {
                    path: "myParam>/listTipoProducto",
                    template: "{myParam>clistTipoProductoText}"
                },
                selectionChange: function (evt) {
                    var selectedKey = evt.getSource().getSelectedItem().getKey();
                    var selectKey1 = selectedKey;
                    console.log(selectedKey);
                },
                width: "25%"
            });

            var comboBox2 = new sap.m.ComboBox({
                id: "idReProCultivo",
                placeholder: "Seleccionar", // string
                items: {
                    path: "myParam>/listTipoCultivo",
                    template: new sap.ui.core.Item({
                        key: "{myParam>clistTipoCultivoKey}",
                        text: "{myParam>clistTipoCultivoText}"
                    })
                },
                selectedKeys: {
                    path: "myParam>/listTipoProducto",
                    template: "{myParam>clistTipoCultivoText}"
                },
                selectionChange: function (evt) {
                    var selectedKey = evt.getSource().getSelectedItem().getKey();
                    sap.ui.getCore().byId("idBuscarProducto").setValue("");
                    console.log(selectedKey);
                },
                width: "25%"
            });

            var oItemtemplate = new sap.m.StandardListItem("LISTITEM", {
                title: "{MATNR} - {MAKTX}",
                type: "Active"
            });

            var oThis = this;
            var oView = oThis.getView();
            var oModelM = oView.getModel("myParam");
            this.valor = "";
            var valorFecha = new Date();
            var myParam = this.getView().getModel("myParam");

            var inputEscan = new sap.m.Input({
                id: "idBuscarProducto",
                valueStateText: "Este Campo No puede Estar Vacio.",
                maxLength: 100,
                width: "44%"
            });

            inputEscan.onsapenter = (function (oEvent) {
                var inputs = [
                    sap.ui.getCore().byId("idReProTipo"),
                    sap.ui.getCore().byId("idReProCultivo")
                ];

                jQuery.each(inputs, function (i, input) {
                    if (!input.getValue()) {
                        input.setValueState("Error");
                        input.setValueStateText("Campo Requerido");
                    } else {
                        input.setValueState("None");
                    }
                });

                var afirmacion = true;
                jQuery.each(inputs, function (i, input) {
                    if ("Error" === input.getValueState()) {
                        afirmacion = false;
                        return false;
                    }
                });

                if (afirmacion) {
                    var tableGuias = oModelM.getProperty("/listGuia");
                    var tableGuiasNew = oModelM.getProperty("/listGuiaNew");

                    this.oBuscarTipCul();

                    var varReBuscarProducto = sap.ui.getCore().byId("idBuscarProducto").getValue();

                    console.log(varReBuscarProducto);
                } else {
                    var dialog = new sap.m.Dialog({
                        title: 'Alerta',
                        type: 'Message',
                        state: 'Warning',
                        content: new sap.m.Text({
                            text: 'Complete todos los Campos.'
                        }),
                        beginButton: new sap.m.Button({
                            text: 'OK',
                            press: function () {
                                dialog.close();
                            }
                        }),
                        afterClose: function () {
                            dialog.destroy();
                        }
                    });
                    dialog.open();
                }
            }.bind(this));

            var oDialog1 = new sap.m.Dialog("Dialog1", {
                title: "Lista de Productos",
                contentWidth: "1200px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: "Tipo Producto:",
                        width: "25%"
                    }),
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEspacio1",
                        width: "3%"
                    }),
                    new sap.m.Label({
                        text: "Cultivo:",
                        width: "25%"
                    }),
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEspacio2",
                        width: "3%"
                    }),
                    new sap.m.Label({
                        text: "Buscar:",
                        width: "44%"
                    }),
                    comboBox1,
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEspacio3",
                        width: "3%"
                    }),
                    comboBox2,
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEspacio4",
                        width: "3%"
                    }),
                    inputEscan,
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEspacio5",
                        width: "100%"
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        text: "Buscar",
                        icon: "sap-icon://search",
                        width: "100%",
                        press: function () {
                            var inputs = [
                                sap.ui.getCore().byId("idReProTipo"),
                                sap.ui.getCore().byId("idReProCultivo")
                            ];

                            jQuery.each(inputs, function (i, input) {
                                if (!input.getValue()) {
                                    input.setValueState("Error");
                                    input.setValueStateText("Campo Requerido");
                                } else {
                                    input.setValueState("None");
                                }
                            });

                            var afirmacion = true;
                            jQuery.each(inputs, function (i, input) {
                                if ("Error" === input.getValueState()) {
                                    afirmacion = false;
                                    return false;
                                }
                            });

                            if (afirmacion) {
                                var tableGuias = oModelM.getProperty("/listGuia");
                                var tableGuiasNew = oModelM.getProperty("/listGuiaNew");

                                this.oBuscarTipCul();

                                var varReBuscarProducto = sap.ui.getCore().byId("idBuscarProducto").getValue();

                                console.log(varReBuscarProducto);
                            } else {
                                var dialog = new sap.m.Dialog({
                                    title: 'Alerta',
                                    type: 'Message',
                                    state: 'Warning',
                                    content: new sap.m.Text({
                                        text: 'Complete todos los Campos.'
                                    }),
                                    beginButton: new sap.m.Button({
                                        text: 'OK',
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();
                            }
                        }.bind(this)
                    }),
                    new sap.m.List({
                        mode: "SingleSelectMaster",
                        id: "listIdProductos",
                        items: {
                            path: "/ITAB",
                            template: oItemtemplate
                        },
                        itemPress: function (oEvent) {
                            //oController.getProperties(oEvent);
                            console.log("/ITAB");
                            console.log(oEvent.getSource()._aSelectedPaths[0]);
                            var varItenSelectPro = oEvent.getSource()._aSelectedPaths[0];
                            console.log(varItenSelectPro);
                            var varElement = oEvent.getSource()._aSelectedPaths.length;
                            console.log(varElement);

                            if (varElement) {
                                var valor = sap.ui.getCore().getModel("cliente").getProperty(varItenSelectPro + "/MATNR");
                                var valorPaleta = sap.ui.getCore().getModel("cliente").getProperty(varItenSelectPro + "/UMREZ").toString();
                                var MAKTX = sap.ui.getCore().getModel("cliente").getProperty(varItenSelectPro + "/MAKTX").toString();

                                console.log(valor);
                                console.log(valorPaleta);
                                console.log(MAKTX);

                                //////////////////////////////////Logica//////////////////////////////////////////////
                                if (valorPaleta !== "0") {
                                    var productInput = sap.ui.getCore().byId("producto");
                                    productInput.setValue(valor);
                                    var paletaInput = sap.ui.getCore().byId("paleta");
                                    paletaInput.setValue(valorPaleta);
                                    var materiaTxt = sap.ui.getCore().byId("descripcionP");
                                    materiaTxt.setValue(MAKTX);
                                    console.log(valor.substr(3, 2));
                                    if (valor.substr(3, 2) === "PA") {

                                        sap.ui.getCore().byId("idLabelPallet").setVisible(true);
                                        sap.ui.getCore().byId("skynet").setVisible(true);
                                        sap.ui.getCore().byId("skynet").setValue("");
                                        sap.ui.getCore().byId("idLabelEsp1").setWidth("4%");
                                        sap.ui.getCore().byId("idLabelEsp2").setWidth("4%");
                                    } else {
                                        sap.ui.getCore().byId("idLabelPallet").setVisible(false);
                                        sap.ui.getCore().byId("skynet").setVisible(false);
                                        sap.ui.getCore().byId("skynet").setValue("");
                                        sap.ui.getCore().byId("idLabelEsp1").setWidth("52%");
                                        sap.ui.getCore().byId("idLabelEsp2").setWidth("52%");
                                    }
                                    var codigo = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPGR-" + FECHA + "-" + WERKS + "--" + MODULO +
                                        "----" + PARTNER + "--" + valor + "')/$value";
                                    /*var codigo2 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPVIA-" + FECHA + "-" + WERKS + "--" + MODULO +
                                      "----" + PARTNER + "-" + CLIENTE + "-" + valor + "')/$value";*/
                                    var codigo4 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPGV-" + FECHA + "-" + WERKS + "--" + MODULO +
                                        "----" + PARTNER + "-" + CLIENTE + "-" + valor + "')/$value";
                                    console.log(codigo4);
                                    var oModel = new sap.ui.model.json.JSONModel(codigo);
                                    //var oModel2 = new sap.ui.model.json.JSONModel(codigo2);
                                    var oModel4 = new sap.ui.model.json.JSONModel(codigo4);
                                    console.log(oModel4);
                                    sap.ui.getCore().byId("viaje").setValue("");

                                    oModel4.attachRequestCompleted(function () {
                                        try {
                                            console.log(oModel4.getJSON());
                                            var GUIAS = oModel4.getProperty("/ITAB/0/GUIAS");
                                            console.log(GUIAS);

                                            //var VIAJES = oModel4.getProperty("/ITAB/0/VIAJES");
                                            var Mensaje = "";
                                            //if (GUIAS.length === 0 && VIAJES.length === 0) { //20200501
                                            if (GUIAS.length === 0) {
                                                sap.ui.getCore().byId("cosecha").setValue("");
                                                sap.ui.getCore().byId("guia2").setValue("");
                                                //sap.ui.getCore().byId("viaje").setValue("");
                                                //Mensaje = "Error, no se encontraron viajes. No se encontraron guias."
                                                Mensaje = "Error, no se encontraron guias.";
                                            } else if (GUIAS.length === 0) {
                                                sap.ui.getCore().byId("cosecha").setValue("");
                                                sap.ui.getCore().byId("guia2").setValue("");
                                                Mensaje = "No se encontraron guias.";
                                            }
                                            /* else if (VIAJES.length === 0) {
                                                                    Mensaje = "Error, no se encontraron viajes. ";
                                                                    sap.ui.getCore().byId("viaje").setValue("");

                                                                  }*/
                                            if (Mensaje !== "") {
                                                var dialog = new sap.m.Dialog({
                                                    title: 'Alerta',
                                                    type: 'Message',
                                                    state: 'Warning',
                                                    content: new sap.m.Text({
                                                        text: Mensaje
                                                    }),
                                                    beginButton: new sap.m.Button({
                                                        text: 'Aceptar',
                                                        type: 'Emphasized',
                                                        press: function () {
                                                            dialog.close();
                                                        }
                                                    }),
                                                    afterClose: function () {
                                                        dialog.destroy();
                                                    }
                                                });
                                                dialog.open();
                                                sap.ui.core.BusyIndicator.hide();
                                            } else {
                                                if (GUIAS.length !== 0 /*&& VIAJES.length !== 0*/) {
                                                    var GUIA = oModel4.getProperty("/ITAB/0/GUIAS/0/GUIA");
                                                    var FECCOS = oModel4.getProperty("/ITAB/0/GUIAS/0/FECCOS");
                                                    //var VIAJE = oModel4.getProperty("/ITAB/0/VIAJES/0/VIAJE");
                                                    var PEDIDO = oModel4.getProperty("/ITAB/0/VIAJES/0/PEDIDO");
                                                    var LINEANEW = oModel4.getProperty("/ITAB/0/GUIAS/0/LINEA");
                                                    //sap.ui.getCore().byId("viaje").setValue(VIAJE + "-" + PEDIDO);
                                                    sap.ui.getCore().byId("cosecha").setValue(FECCOS);
                                                    sap.ui.getCore().byId("idLinea12").setValue("Línea " + LINEANEW);
                                                    sap.ui.getCore().byId("guia2").setValue(GUIA);

                                                    /////////////////////////////////////////// 202005011
                                                    console.log(GUIAS);
                                                    var oModel22 = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPVIA-" + FECCOS +
                                                        "-" + WERKS +
                                                        "--" +
                                                        MODULO + "----" + PARTNER + "-" + CLIENTE + "-" + valor + "-" + LINEANEW + "')/$value");

                                                    console.log(oModel22);

                                                    oModel22.attachRequestCompleted(function () {
                                                        try {
                                                            var matrizz = oModel22.getProperty("/ITAB");
                                                            if (oModel22.getProperty("/ITAB/0/VIAJE") !== undefined) {
                                                                var VIAJE = oModel22.getProperty("/ITAB/0/VIAJE");
                                                                var PEDIDO1 = oModel22.getProperty("/ITAB/0/PEDIDO");
                                                                console.log(matrizz);
                                                                console.log(VIAJE);
                                                                console.log(PEDIDO1);

                                                                sap.ui.getCore().byId("viaje").setValue(VIAJE + "-" + PEDIDO1);
                                                            } else {
                                                                sap.ui.getCore().byId("viaje").setValue("");
                                                            }

                                                        } catch (err) {
                                                            console.log(err);
                                                        }

                                                    });
                                                    ///////////////////////////////////////////

                                                }
                                                /* else if (VIAJES.length === 0) {
                                                                          var GUIA = oModel4.getProperty("/ITAB/0/GUIAS/0/GUIA");
                                                                          var FECCOS = oModel4.getProperty("/ITAB/0/GUIAS/0/FECCOS");
                                                                          var LINEANEW = oModel4.getProperty("/ITAB/0/GUIAS/0/LINEA");
                                                                          sap.ui.getCore().byId("viaje").setValue("");
                                                                          sap.ui.getCore().byId("cosecha").setValue(FECCOS);
                                                                          sap.ui.getCore().byId("idLinea12").setValue("Línea " + LINEANEW);
                                                                          sap.ui.getCore().byId("guia2").setValue(GUIA);
                                                                        }*/
                                                else {
                                                    //var VIAJE = oModel4.getProperty("/ITAB/0/VIAJES/0/VIAJE");
                                                    var PEDIDO = oModel4.getProperty("/ITAB/0/VIAJES/0/PEDIDO");
                                                    //sap.ui.getCore().byId("viaje").setValue(VIAJE + "-" + PEDIDO);
                                                    sap.ui.getCore().byId("cosecha").setValue("");
                                                    sap.ui.getCore().byId("idLinea12").setValue("");
                                                    sap.ui.getCore().byId("guia2").setValue("");
                                                }
                                                sap.ui.core.BusyIndicator.hide();
                                            }
                                        } catch (err) {
                                            console.log(err);
                                            sap.ui.core.BusyIndicator.hide();
                                        }

                                    });

                                } else {
                                    sap.m.MessageToast.show("El producto seleccionado (" + valor + ") tiene un valor de paleta de 0");
                                    sap.ui.core.BusyIndicator.hide();
                                }
                                //////////////////////////////////Logica//////////////////////////////////////////////

                                oDialog1.close();
                            }
                        },
                    })
                ],
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: 'Cancel',
                    press: function () {
                        oDialog1.close();
                    }
                }),
                afterClose: function () {
                    oDialog1.destroy();
                }
            });
            oDialog1.open();

            comboBox1.setModel(myParam, "myParam");
            comboBox2.setModel(myParam, "myParam");
            //oList.setModel(myParam, "myParam");

            oDialog1.setModel(sap.ui.getCore().getModel("cliente"));
            this.getView().addDependent(oDialog1);
            oDialog1.open();
            oModel.attachRequestCompleted(function () {
                sap.ui.core.BusyIndicator.hide();
            });
            sap.ui.core.BusyIndicator.show(0);
        },

        oBuscarTipCul: function (oEvt) {

            var varReProTipo = sap.ui.getCore().byId("idReProTipo").getSelectedKey();
            var varReProCultivo = sap.ui.getCore().byId("idReProCultivo").getSelectedKey();
            var varReBuscarProducto = sap.ui.getCore().byId("idBuscarProducto").getValue();

            var varTipCul = varReProTipo + varReProCultivo;
            console.log(varTipCul);

            var filters1 = [];
            var filters2 = [];
            var filters3 = [];
            var filtersT = [];

            var varProductstxt = "";
            var vectorProductstxt = [];
            var llaveProductstxt = {};
            for (var k = 0; k < varReBuscarProducto.length; k++) {
                if (varReBuscarProducto.substring(k, k + 1) !== " ") {
                    varProductstxt = varProductstxt + varReBuscarProducto.substring(k, k + 1);
                }
                if (varReBuscarProducto.substring(k, k + 1) === " " || k === varReBuscarProducto.length - 1) {
                    llaveProductstxt = {};
                    llaveProductstxt.Dato = varProductstxt;
                    vectorProductstxt.push(llaveProductstxt);
                    varProductstxt = "";
                }
            }

            console.log(vectorProductstxt);

            var filter1 = new sap.ui.model.Filter("MATNR", sap.ui.model.FilterOperator.Contains, varTipCul);
            var filter2 = new sap.ui.model.Filter("MAKTX", sap.ui.model.FilterOperator.Contains, varReBuscarProducto);
            var allFilter1 = new sap.ui.model.Filter([filter1, filter2], true);
            filters1.push(allFilter1);
            filtersT.push(new sap.ui.model.Filter(filters1, false));

            for (var cpb = 0; cpb < vectorProductstxt.length; cpb++) {
                var filter5 = new sap.ui.model.Filter("MATNR", sap.ui.model.FilterOperator.Contains, varTipCul);
                var filter6 = new sap.ui.model.Filter("MAKTX", sap.ui.model.FilterOperator.Contains, vectorProductstxt[cpb].Dato);
                var allFilter3 = new sap.ui.model.Filter([filter5, filter6], true);
                filters3.push(allFilter3);
                filtersT.push(new sap.ui.model.Filter(filters3, true));
            }

            var filter3 = new sap.ui.model.Filter("MATNR", sap.ui.model.FilterOperator.Contains, varTipCul);
            var filter4 = new sap.ui.model.Filter("MATNR", sap.ui.model.FilterOperator.Contains, varReBuscarProducto);
            var allFilter2 = new sap.ui.model.Filter([filter3, filter4], true);
            filters2.push(allFilter2);
            filtersT.push(new sap.ui.model.Filter(filters2, false));

            var list1 = sap.ui.getCore().byId("listIdProductos");
            var binding1 = list1.getBinding("items");
            binding1.filter(new sap.ui.model.Filter(filtersT, false));
        },
        //////////////////////////////////////////////////////////////////////////////////////

        onPressFrio: function (event) {

            var oThis = this;
            this.valor = "";
            var valorFecha = new Date();
            var oDialog = new sap.m.Dialog("Dialog", {

                title: "Crear Paleta Tratamiento Frío",
                contentWidth: "680px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: "Fecha de recepción",

                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEsp1",
                        width: "52%"
                    }),
                    new sap.m.Label({
                        text: "Nro de pallet Skynet",
                        id: "idLabelPallet",
                        visible: false,
                        width: "48%"
                    }),
                    new sap.m.DatePicker({
                        id: "fecha",

                        valueStateText: "El campo fecha no debe estar vacío.",
                        valueFormat: "yyyyMMdd",
                        displayFormat: "dd.MM.yyyy",
                        dateValue: valorFecha,
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEsp2",
                        width: "52%"
                    }),
                    new sap.m.Input({
                        maxLength: 20,
                        id: "skynet",
                        visible: false,
                        value: "",
                        editable: true,
                        valueStateText: "El campo nro de pallet skynet no debe estar vacío.",
                        placeholder: "Ingrese nro de pallet skynet (20) ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "Empresa Agrícola",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "módulo",
                        width: "48%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "empresa",
                        editable: false,
                        valueStateText: "El campo guía no debe estar vacío.",
                        placeholder: "Ingrese guía (15) ...",
                        required: true,
                        width: "30%"
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        icon: "sap-icon://building",
                        width: "18%",
                        press: function () {
                            var fecha = sap.ui.getCore().byId("fecha").getValue();
                            oThis.BusquedaUniversal("EMPRESA", fecha, "", "");
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "modulo",
                        editable: false,
                        valueStateText: "El campo guía no debe estar vacío.",
                        placeholder: "Ingrese guía (15) ...",
                        required: true,
                        width: "30%"
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        icon: "sap-icon://dimension",
                        width: "18%",
                        press: function () {
                            var fecha = sap.ui.getCore().byId("fecha").getValue();
                            var empresa = sap.ui.getCore().byId("empresa").getValue();
                            empresa = empresa.split("-");
                            empresa = empresa[0];
                            oThis.BusquedaUniversal("MODULO", fecha, empresa, "");
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "Cliente",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Producto",
                        width: "48%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "cliente",
                        editable: false,
                        value: "",
                        valueStateText: "El campo cliente no debe estar vacío.",
                        placeholder: "Ingrese cliente (15) ...",
                        required: true,
                        width: "30%"
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        icon: "sap-icon://employee",
                        width: "18%",
                        press: function () {
                            oThis.BusquedaCliente("", "");
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "producto",
                        editable: false,
                        valueStateText: "El campo producto no debe estar vacío.",
                        placeholder: "Ingrese producto (15) ...",
                        required: true,
                        width: "30%"
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        icon: "sap-icon://product",
                        width: "18%",
                        press: function () {
                            var CLIENTE = sap.ui.getCore().byId("cliente").getValue();
                            var fecha = sap.ui.getCore().byId("fecha").getValue();
                            var empresa = sap.ui.getCore().byId("empresa").getValue();
                            empresa = empresa.split("-");
                            empresa = empresa[0];
                            CLIENTE = CLIENTE.split("-");
                            CLIENTE = CLIENTE[0];
                            oThis.BusquedaUniversal("PRODUCTO", fecha, empresa, CLIENTE);
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "Viaje",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Descripción del producto",
                        width: "48%"
                    }),
                    new sap.m.Input({
                        maxLength: 40,
                        id: "viaje",
                        editable: false,
                        value: "",
                        valueStateText: "El campo viaje no debe estar vacío.",
                        placeholder: "Ingrese viaje (15) ...",
                        required: true,
                        width: "30%"
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        icon: "sap-icon://travel-itinerary",
                        width: "18%",
                        press: function () {
                            var CLIENTE = sap.ui.getCore().byId("cliente").getValue();
                            var fecha = sap.ui.getCore().byId("fecha").getValue();
                            var empresa = sap.ui.getCore().byId("empresa").getValue();
                            empresa = empresa.split("-");
                            empresa = empresa[0];
                            CLIENTE = CLIENTE.split("-");
                            CLIENTE = CLIENTE[0];
                            oThis.BusquedaUniversal("VIAJE", fecha, empresa, CLIENTE);

                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 200,
                        id: "descripcionP",
                        editable: false,
                        value: "",
                        valueStateText: "El campo descripción no debe estar vacío.",
                        placeholder: "Ingrese descripción (200) ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "Fecha de cosecha",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Guía",
                        width: "48%"
                    }),
                    new sap.m.Input({
                        id: "cosecha",
                        value: "",
                        editable: false,
                        valueStateText: "Se requiere seleccionar una Guía.",
                        placeholder: "Seleccione una Guía ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        id: "guia2",
                        value: "",
                        editable: false,
                        valueStateText: "El campo guía no debe estar vacío.",
                        placeholder: "Seleccione Guía (20) ...",
                        required: true,
                        width: "30%"
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        icon: "sap-icon://course-book",
                        width: "18%",
                        press: function () {
                            var CLIENTE = sap.ui.getCore().byId("cliente").getValue();
                            var fecha = sap.ui.getCore().byId("fecha").getValue();
                            var empresa = sap.ui.getCore().byId("empresa").getValue();
                            empresa = empresa.split("-");
                            empresa = empresa[0];
                            CLIENTE = CLIENTE.split("-");
                            CLIENTE = CLIENTE[0];
                            oThis.BusquedaUniversal("GUIA", fecha, empresa, CLIENTE);
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "Máx. Paleta",
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Label({
                        text: "Cantidad",
                        width: "48%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "paleta",
                        editable: false,
                        valueStateText: "Se requiere seleccionar un pedido.",
                        placeholder: "Seleccione un pedido ...",
                        required: true,
                        width: "48%"
                    }),
                    new sap.m.Label({
                        text: "",
                        width: "4%"
                    }),
                    new sap.m.Input({
                        maxLength: 15,
                        id: "cantidad",
                        valueStateText: "El campo cantidad no debe estar vacío.",
                        placeholder: "Ingrese cantidad (15) ...",
                        required: true,
                        width: "48%",
                        liveChange: function (oEvent) {
                            if (sap.ui.getCore().byId("paleta").getValue() !== "") {
                                var value = oEvent.getSource().getValue();
                                var paleta = sap.ui.getCore().byId("paleta").getValue().toString();
                                var bNotnumber = isNaN(value);
                                if (bNotnumber === false) {
                                    if (parseInt(paleta) >= parseInt(value)) {
                                        oThis.valor = value;
                                    } else {
                                        if (value === "") {

                                            oEvent.getSource().setValue("");
                                            oThis.valor = "";
                                        } else {
                                            sap.m.MessageToast.show("La cantidad no puede ser mayor al máximo de paletas.");
                                            oEvent.getSource().setValue(oThis.valor);
                                        }
                                    }
                                    //  sNumber = value;
                                } else {

                                    oEvent.getSource().setValue(oThis.valor);
                                }

                            } else {
                                oEvent.getSource().setValue(oThis.valor);
                                sap.m.MessageToast.show("Se requiere seleccionar un producto.");
                            }
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "Comentario",
                        width: "100%"
                    }),
                    new sap.m.TextArea({
                        maxLength: 40,
                        id: "comentario",
                        width: '100%',
                        placeholder: 'Añade un comentario (opcional)'
                    })

                ],
                beginButton: new sap.m.Button({
                    icon: "sap-icon://save",
                    text: "Guardar",
                    press: function () {
                        sap.ui.core.BusyIndicator.show(0);
                        var view = sap.ui.getCore();
                        var inputs = [
                            view.byId("cliente"),
                            view.byId("producto"),
                            view.byId("paleta"),
                            view.byId("cantidad"),
                            view.byId("viaje"),
                            view.byId("cosecha"),
                            view.byId("guia2")
                        ];
                        if (view.byId("skynet").getVisible()) {
                            inputs.push(view.byId("skynet"));
                        }
                        jQuery.each(inputs, function (i, input) {
                            if (!input.getValue()) {
                                input.setValueState("Error");
                            } else {
                                input.setValueState("None");
                            }
                        });

                        // check states of inputs
                        var canContinue = true;
                        jQuery.each(inputs, function (i, input) {
                            if ("Error" === input.getValueState()) {
                                canContinue = false;
                                return false;
                            }
                        });

                        if (canContinue) {

                            var oView = oThis.getView();
                            var oModelP = oView.getModel("myParam");
                            var T_BINES = [];
                            var PALETA = [];
                            var row = {};
                            row.GUIA = sap.ui.getCore().byId("guia2").getValue();
                            row.FEC_COS = view.byId("cosecha").getValue().toString();
                            var fechaRec = view.byId("fecha").getValue();
                            var ano = fechaRec.substr(0, 4);
                            var mes = fechaRec.substr(4, 2);
                            var dia = fechaRec.substr(6, 2);
                            row.FEC_REC = dia + "." + mes + "." + ano;

                            var empresa = sap.ui.getCore().byId("empresa").getValue();
                            empresa = empresa.split("-");
                            empresa = empresa[0];
                            var empresa2 = empresa[1];
                            row.PARTNER = empresa;
                            row.TXT_EMP = "";

                            var modulo = sap.ui.getCore().byId("modulo").getValue();
                            modulo = modulo.split("-");
                            modulo = modulo[0];
                            row.MODULO = modulo;
                            row.PALLETS = view.byId("paleta").getValue().toString();
                            row.CANT = view.byId("cantidad").getValue().toString();
                            var cliente = sap.ui.getCore().byId("cliente").getValue();
                            cliente = cliente.split("-");
                            cliente = cliente[0];
                            row.KUNNR = cliente;
                            var viaje = sap.ui.getCore().byId("viaje").getValue();
                            var viajesplit = viaje.split("-");
                            viaje = viajesplit[0];
                            var viaje2 = viajesplit[1];
                            row.VIAJE = viaje;
                            row.PEDIDO = viaje2;
                            row.MATNR = view.byId("producto").getValue().toString();
                            row.IMP_PT = "";
                            row.CODSKY = "";

                            PALETA.push(row);
                            row = {};
                            row.COMENT = view.byId("comentario").getValue().toString();
                            row.PARAM = "CP-----";
                            row.VECTOR = [];
                            row.PALETA = PALETA;
                            T_BINES.push(row);
                            T_BINES = JSON.stringify(T_BINES);
                            console.log(T_BINES);
                            var oMessageTemplate = new sap.m.MessageItem({
                                type: '{type}',
                                title: '{title}',
                                subtitle: '{subtitle}'
                            });
                            var oMessageView = new sap.m.MessageView({
                                showDetailsPageHeader: false,
                                items: {
                                    path: "/ERRORES",
                                    template: oMessageTemplate
                                }
                            });
                            oMessageView.setModel(oModelP);
                            var dialogError = new sap.m.Dialog({
                                resizable: true,
                                content: oMessageView,
                                state: 'Error',
                                beginButton: new sap.m.Button({
                                    press: function () {
                                        dialogError.close();
                                    },
                                    text: "Cerrar"
                                }),
                                customHeader: new sap.m.Bar({
                                    contentMiddle: [
                                        new sap.m.Text({
                                            text: "Error"
                                        })
                                    ]
                                }),
                                afterClose: function () {
                                    dialogError.destroy();
                                },
                                contentHeight: "200px",
                                contentWidth: "850px",
                                verticalScrolling: false
                            });

                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                type: 'GET',
                                async: false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                },
                                complete: function (xhr) {
                                    var token = xhr.getResponseHeader("X-CSRF-Token");

                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                        type: 'POST',
                                        data: T_BINES,
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader('X-CSRF-Token', token);

                                        },
                                        success: function (response) {
                                            var string = "";
                                            try {
                                                sap.ui.core.BusyIndicator.hide();
                                                string = response.getElementsByTagName("entry")[0];
                                                string = string.getElementsByTagName("m:properties")[0];
                                                string = string.getElementsByTagName("d:ID")[0].childNodes[0].nodeValue;
                                                string = string.split("-");
                                                var HU = string[0];
                                                var Pedido = string[1];
                                                var Cliente = string[2];

                                                string = [

                                                    new sap.ui.layout.VerticalLayout({
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
                                                                            })
                                                                        ]
                                                                    }),
                                                                    new sap.ui.layout.VerticalLayout({
                                                                        content: [

                                                                            new sap.m.Label({
                                                                                text: HU
                                                                            }),
                                                                            new sap.m.Label({
                                                                                text: Pedido
                                                                            }),
                                                                            new sap.m.Label({
                                                                                text: Cliente
                                                                            })
                                                                        ]
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ];

                                            } catch (err) {
                                                string = "Se creó correctamente la paleta de tratamiento frío.";
                                            }

                                            //         console.log(response.properties);
                                            //       console.log(response.properties.ID);
                                            var contador = 0;
                                            var date = new Date();
                                            var year = date.getFullYear();
                                            var day = date.getDate();
                                            var month = date.getMonth() + 1;
                                            var oView = oThis.getView();
                                            date = year + "" + day + "" + month;
                                            var texto5 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CP-" + date + "-1401---')/$value";
                                            var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
                                            oThis.getView().setModel(oModelC, "CP");
                                            oModelC.attachRequestCompleted(function () {
                                                var vectorError = {
                                                    "ERRORES2": []
                                                };
                                                var myParam = oThis.getView().getModel("myParam");
                                                var cont = oModelC.getProperty("/ITAB");

                                                var llave = {};

                                                if (cont === null || cont === undefined) {
                                                    llave = {};
                                                    llave.subtitle = "Error de conexión en el enlace:" + texto5;
                                                    llave.title = "Mensaje de error Nro " + 5;
                                                    llave.type = "Error";
                                                    vectorError.push(llave);
                                                    contador++;
                                                    oView.byId("idButtonError").setVisible(true);
                                                    oView.byId("idButtonError").setText("" + contador);
                                                    oView.byId("GenericTile6").setSubheader("Se ha generado un error");
                                                } else {
                                                    cont = oModelC.getProperty("/ITAB/length");

                                                    oView.byId("GenericTile6").setSubheader("Tienes " + cont + " tareas");
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
                                                    oThis.getView().setModel(myParam, "CP");
                                                }
                                            }.bind(this));
                                            oThis.getView().getModel("CP").refresh();
                                            oThis.byId("idPaletTable").getBinding("items").refresh(true);
                                            console.log(string);
                                            var dialog = new sap.m.Dialog({
                                                title: 'Guardado',
                                                type: 'Message',
                                                state: 'Success',
                                                content: string,
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            oDialog.close();
                                            dialog.open();
                                        }.bind(this),
                                        error: function (response) {
                                            sap.ui.core.BusyIndicator.hide();
                                            oThis.byId("idPaletTable").getBinding("items").refresh(true);
                                            var respuesta2 = "No se creó correctamente la paleta de tratamiento frío.";
                                            try {
                                                var respuesta = response.responseText.toString();
                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                respuesta = respuesta[1];
                                                respuesta = respuesta.split('</message>');
                                                respuesta = respuesta[0];
                                                respuesta2 = respuesta;
                                            } catch (err) {
                                                console.log(err);
                                            }
                                            var dialog = new sap.m.Dialog({
                                                title: 'Error generado',
                                                type: 'Message',
                                                state: 'Error',
                                                content: new sap.m.Text({
                                                    text: respuesta2
                                                }),
                                                beginButton: new sap.m.Button({
                                                    text: 'Aceptar',
                                                    type: 'Emphasized',
                                                    press: function () {
                                                        dialog.close();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        }.bind(this)
                                    });

                                },
                                success: function (response) { },
                                error: function (response) {
                                    console.log(response);
                                }
                            });

                        } else {

                            var dialog = new sap.m.Dialog({
                                title: "Alerta",
                                type: "Message",
                                state: "Warning",
                                content: new sap.m.Text({
                                    text: "Se requiere el ingreso de los datos indicados."

                                }),
                                beginButton: new sap.m.Button({
                                    text: "OK",
                                    type: "Accept",
                                    press: function () {
                                        dialog.close();
                                        dialog.destroy();

                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                }
                            });

                            dialog.open();
                            sap.ui.core.BusyIndicator.hide();
                        }
                    }
                }),
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: "Cancelar",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
        },

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        onPressReHabilitar: function (evt) {

            var oThis = this;
            var oView = oThis.getView();
            var oModelM = oView.getModel("myParam");
            this.valor = "";
            var valorFecha = new Date();
            var myParam = this.getView().getModel("myParam");
            this.getView().getModel("myParam").setProperty("/listGuiaNew", []);
            this.getView().getModel("myParam").setProperty("/listEmpresaCB1", []);
            this.getView().getModel("myParam").setProperty("/listEmpresaCB2", []);

            var year = valorFecha.getFullYear().toString();
            var day = valorFecha.getDate().toString();
            var month = valorFecha.getMonth() + 1;
            console.log(year);
            if (month.toString().length === 1) {
                month = "0" + month;
            }
            console.log(month);
            if (day.toString().length === 1) {
                day = "0" + day;
            }
            console.log(day);

            var varFechaModificada = year + month + day;
            console.log(varFechaModificada);

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var textoEmpresaAgricola = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPRHEM-" + varFechaModificada + "----------')/$value";
            var oModelEA = new sap.ui.model.json.JSONModel(textoEmpresaAgricola, false);
            console.log(oModelEA);
            var vectorRHCombo = [];
            var llaveRHCombo = {};
            oModelEA.attachRequestCompleted(function () {
                sap.ui.core.BusyIndicator.show(0);
                try {
                    var tamList = oModelEA.getProperty("/ITAB/length");
                    oModelM.setProperty("/listEmpresaCB1", []);

                    console.log(tamList);
                    for (var i = 0; i < tamList; i++) {
                        llaveRHCombo = {};
                        llaveRHCombo.codEmpresa = oModelEA.getProperty("/ITAB/" + i + "/KUNNR").toString();
                        llaveRHCombo.desEmpresa = oModelEA.getProperty("/ITAB/" + i + "/NAME1").toString();
                        vectorRHCombo.push(llaveRHCombo);
                    }
                    console.log(vectorRHCombo);
                    oModelM.setProperty("/listEmpresaCB1", vectorRHCombo);
                    console.log(oModelM.getProperty("/listEmpresaCB1"));
                    sap.ui.core.BusyIndicator.hide();
                } catch (err) {
                    var varMessageVacio = oModelEA.getProperty("/ITAB/0/MESSAGE").toString();
                    console.log(varMessageVacio);
                    var dialog = new sap.m.Dialog({
                        title: 'Alerta',
                        type: 'Message',
                        state: 'Warning',
                        content: new sap.m.Text({
                            text: varMessageVacio
                        }),
                        beginButton: new sap.m.Button({
                            text: 'OK',
                            press: function () {
                                oModelM.setProperty("/listEmpresaCB1", []);
                                dialog.close();
                            }
                        }),
                        afterClose: function () {
                            dialog.destroy();
                        }
                    });
                    dialog.open();
                    sap.ui.core.BusyIndicator.hide();
                }
            }.bind(this));
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            var comboBox1 = new sap.m.ComboBox("idReHaEmpresaAgricola", {
                placeholder: "Seleccionar", // string
                items: {
                    path: "myParam>/listEmpresaCB1",
                    template: new sap.ui.core.Item({
                        key: "{myParam>codEmpresa}",
                        text: "{myParam>codEmpresa} - {myParam>desEmpresa}"
                    })
                },
                selectedKeys: {
                    path: "myParam>/listEmpresaCB1",
                    template: "{myParam>codEmpresa}"
                },
                selectionChange: function (evt) {
                    sap.ui.getCore().byId("idReHaModulo").setBusy(true);
                    var selectedKey = evt.getSource().getSelectedItem().getKey();
                    var selectedFecha = sap.ui.getCore().byId("idReHaFechaRecepcion")._lastValue;
                    console.log(selectedKey);

                    //////////////////////////////////////////////////////////////////////////////7
                    var textoModulo = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPRHMO-" + selectedFecha + "-------" + selectedKey +
                        "---')/$value";
                    var oModelRH = new sap.ui.model.json.JSONModel(textoModulo, false);
                    console.log(oModelRH);
                    var vectorRHCombo2 = [];
                    var llaveRHCombo2 = {};

                    oModelRH.attachRequestCompleted(function () {

                        try {
                            var tamList = oModelRH.getProperty("/ITAB/length");
                            sap.ui.getCore().byId("idReHaModulo").setValue("");
                            oModelM.setProperty("/listEmpresaCB2", []);

                            for (var i = 0; i < tamList; i++) {
                                llaveRHCombo2 = {};
                                llaveRHCombo2.codModulo = oModelRH.getProperty("/ITAB/" + i + "/EQV_FM").toString();
                                llaveRHCombo2.desModulo = oModelRH.getProperty("/ITAB/" + i + "/DESCOR").toString();
                                vectorRHCombo2.push(llaveRHCombo2);
                            }
                            console.log(vectorRHCombo2);
                            oModelM.setProperty("/listEmpresaCB2", vectorRHCombo2);
                            console.log(oModelM.getProperty("/listEmpresaCB2"));
                            sap.ui.getCore().byId("idReHaModulo").setBusy(false);
                        } catch (err) {
                            var varMessageVacio = oModelRH.getProperty("/ITAB/0/MESSAGE").toString();
                            console.log(varMessageVacio);
                            var dialog = new sap.m.Dialog({
                                title: 'Alerta',
                                type: 'Message',
                                state: 'Warning',
                                content: new sap.m.Text({
                                    text: varMessageVacio
                                }),
                                beginButton: new sap.m.Button({
                                    text: 'OK',
                                    press: function () {
                                        oModelM.setProperty("/listEmpresaCB2", []);
                                        sap.ui.getCore().byId("idReHaModulo").setBusy(false);
                                        dialog.close();
                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                }
                            });
                            dialog.open();
                        }
                    }.bind(this));
                    //////////////////////////////////////////////////////////////////////////////7
                },
                width: "32%"
            });

            var comboBox2 = new sap.m.ComboBox("idReHaModulo", {
                placeholder: "Seleccionar", // string
                items: {
                    path: "myParam>/listEmpresaCB2",
                    template: new sap.ui.core.Item({
                        key: "{myParam>codModulo}",
                        text: "{myParam>codModulo} - {myParam>desModulo}"
                    })
                },
                selectedKeys: {
                    path: "myParam>/listEmpresaCB2",
                    template: "{myParam>codModulo}"
                },
                selectionChange: function (evt) {
                    var selectedKey = evt.getSource().getSelectedItem().getKey();
                    console.log(selectedKey);
                },
                width: "30%"
            });

            var oDialog1 = new sap.m.Dialog("Dialog", {

                title: "Re-Habilitar Guía",
                contentWidth: "800px",
                modal: true,
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: "Fecha de recepción:",
                        width: "32%"
                    }),
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEspacio1",
                        width: "3%"
                    }),
                    new sap.m.Label({
                        text: "Empresa Agrícola:",
                        width: "32%"
                    }),
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEspacio2",
                        width: "3%"
                    }),
                    new sap.m.Label({
                        text: "Módulo:",
                        width: "30%"
                    }),
                    new sap.m.DatePicker("idReHaFechaRecepcion", {
                        id: "idReHaFechaRecepcion",
                        value: "",
                        valueStateText: "El campo fecha no debe estar vacío.",
                        valueFormat: "yyyyMMdd",
                        change: function (oEvent) {
                            sap.ui.getCore().byId("idReHaEmpresaAgricola").setBusy(true);
                            var sValue = oEvent.getParameter("value");
                            console.log(sValue);
                            var textoEmpresaAgricola = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPRHEM-" + sValue + "----------')/$value";
                            var oModelEA = new sap.ui.model.json.JSONModel(textoEmpresaAgricola, false);
                            console.log(oModelEA);
                            var vectorRHCombo = [];
                            var llaveRHCombo = {};
                            oModelEA.attachRequestCompleted(function () {

                                try {
                                    var tamList = oModelEA.getProperty("/ITAB/length");
                                    sap.ui.getCore().byId("idReHaEmpresaAgricola").setValue("");
                                    sap.ui.getCore().byId("idReHaModulo").setValue("");
                                    oModelM.setProperty("/listEmpresaCB1", []);

                                    console.log(tamList);
                                    for (var i = 0; i < tamList; i++) {
                                        llaveRHCombo = {};
                                        llaveRHCombo.codEmpresa = oModelEA.getProperty("/ITAB/" + i + "/KUNNR").toString();
                                        llaveRHCombo.desEmpresa = oModelEA.getProperty("/ITAB/" + i + "/NAME1").toString();
                                        vectorRHCombo.push(llaveRHCombo);
                                    }
                                    console.log(vectorRHCombo);
                                    oModelM.setProperty("/listEmpresaCB1", vectorRHCombo);
                                    console.log(oModelM.getProperty("/listEmpresaCB1"));
                                    sap.ui.getCore().byId("idReHaEmpresaAgricola").setBusy(false);
                                } catch (err) {
                                    var varMessageVacio = oModelEA.getProperty("/ITAB/0/MESSAGE").toString();
                                    console.log(varMessageVacio);
                                    var dialog = new sap.m.Dialog({
                                        title: 'Alerta',
                                        type: 'Message',
                                        state: 'Warning',
                                        content: new sap.m.Text({
                                            text: varMessageVacio
                                        }),
                                        beginButton: new sap.m.Button({
                                            text: 'OK',
                                            press: function () {
                                                oModelM.setProperty("/listEmpresaCB1", []);
                                                sap.ui.getCore().byId("idReHaEmpresaAgricola").setBusy(false);
                                                dialog.close();
                                            }
                                        }),
                                        afterClose: function () {
                                            dialog.destroy();
                                        }
                                    });
                                    dialog.open();
                                }
                            }.bind(this));
                        }.bind(this),
                        displayFormat: "dd.MM.yyyy",
                        dateValue: valorFecha,
                        required: true,
                        width: "32%"
                    }),
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEspacio3",
                        width: "3%"
                    }),
                    comboBox1,
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEspacio4",
                        width: "3%"
                    }),
                    comboBox2,
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEspacio5",
                        width: "100%"
                    }),
                    new sap.m.Button({
                        type: "Emphasized",
                        text: "Buscar",
                        icon: "sap-icon://search",
                        width: "100%",
                        press: function () {
                            var inputs = [
                                sap.ui.getCore().byId("idReHaFechaRecepcion"),
                                sap.ui.getCore().byId("idReHaEmpresaAgricola"),
                                sap.ui.getCore().byId("idReHaModulo")
                            ];

                            jQuery.each(inputs, function (i, input) {
                                if (!input.getValue()) {
                                    input.setValueState("Error");
                                    input.setValueStateText("Campo Requerido");
                                } else {
                                    input.setValueState("None");
                                }
                            });

                            var afirmacion = true;
                            jQuery.each(inputs, function (i, input) {
                                if ("Error" === input.getValueState()) {
                                    afirmacion = false;
                                    return false;
                                }
                            });

                            if (afirmacion) {
                                sap.ui.getCore().byId("idTableGuasHabilitar").setBusy(true);
                                var varReHaFechaRecepcion = sap.ui.getCore().byId("idReHaFechaRecepcion").getValue();
                                var varReHaEmpresaAgricola = sap.ui.getCore().byId("idReHaEmpresaAgricola").getSelectedKey();
                                var varReHaModulo = sap.ui.getCore().byId("idReHaModulo").getSelectedKey();

                                console.log(varReHaFechaRecepcion);
                                console.log(varReHaEmpresaAgricola);
                                console.log(varReHaModulo);

                                var textoListGuiasOptenidas = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPRHGR-" + varReHaFechaRecepcion +
                                    "---" + varReHaModulo + "----" + varReHaEmpresaAgricola + "---')/$value";
                                var oModelLGO = new sap.ui.model.json.JSONModel(textoListGuiasOptenidas, false);
                                console.log(oModelLGO);

                                var vectorRHLGO = [];
                                var llaveRHLGO = {};

                                oModelLGO.attachRequestCompleted(function () {

                                    try {
                                        var tamList = oModelLGO.getProperty("/ITAB/length");

                                        for (var i = 0; i < tamList; i++) {
                                            llaveRHLGO = {};
                                            llaveRHLGO.Guia = oModelLGO.getProperty("/ITAB/" + i + "/GUIA").toString();
                                            vectorRHLGO.push(llaveRHLGO);
                                        }
                                        console.log(vectorRHLGO);
                                        oModelM.setProperty("/listGuiaNew", vectorRHLGO);
                                        console.log(oModelM.getProperty("/listGuiaNew"));
                                        sap.ui.getCore().byId("idTableGuasHabilitar").setBusy(false);
                                    } catch (err) {
                                        var varMessageVacio = oModelLGO.getProperty("/ITAB/0/MESSAGE").toString();
                                        console.log(varMessageVacio);
                                        var dialog = new sap.m.Dialog({
                                            title: 'Alerta',
                                            type: 'Message',
                                            state: 'Warning',
                                            content: new sap.m.Text({
                                                text: varMessageVacio
                                            }),
                                            beginButton: new sap.m.Button({
                                                text: 'OK',
                                                press: function () {
                                                    oModelM.setProperty("/listGuiaNew", []);
                                                    sap.ui.getCore().byId("idTableGuasHabilitar").setBusy(false);
                                                    dialog.close();
                                                }
                                            }),
                                            afterClose: function () {
                                                dialog.destroy();
                                            }
                                        });
                                        dialog.open();
                                    }
                                }.bind(this));
                            } else {
                                var dialog = new sap.m.Dialog({
                                    title: 'Alerta',
                                    type: 'Message',
                                    state: 'Warning',
                                    content: new sap.m.Text({
                                        text: 'Complete todos los Campos.'
                                    }),
                                    beginButton: new sap.m.Button({
                                        text: 'OK',
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();
                            }
                        }.bind(this)
                    }),
                    new sap.m.Label({
                        text: "",
                        id: "idLabelEspacio6",
                        width: "100%"
                    })
                ],
                beginButton: new sap.m.Button({
                    icon: "sap-icon://response",
                    text: "Activar",
                    press: function () {
                        console.log("LLEGO");
                        var tableGuias = oModelM.getProperty("/listGuiaNew");
                        console.log(tableGuias);
                        var varReHaFechaRecepcion = sap.ui.getCore().byId("idReHaFechaRecepcion").getValue();
                        var varFechaInicioAno = varReHaFechaRecepcion.substring(0, 4);
                        var varFechaInicioMes = varReHaFechaRecepcion.substring(4, 6);
                        var varFechaInicioDia = varReHaFechaRecepcion.substring(6, 8);
                        var resultadoFechaGuia = (varFechaInicioDia + "." + varFechaInicioMes + "." + varFechaInicioAno).toString();
                        var varReHaEmpresaAgricola = sap.ui.getCore().byId("idReHaEmpresaAgricola").getSelectedKey();
                        var varReHaModulo = sap.ui.getCore().byId("idReHaModulo").getSelectedKey();
                        var validarSelectGuia = false;
                        var vector1 = [];
                        var llave1 = {};
                        for (var i = 0; i < tableGuias.length; i++) {
                            if (tableGuias[i].SELECTGUIA) {
                                llave1 = {};
                                llave1.GUIA = tableGuias[i].Guia;
                                llave1.FEC_REC = resultadoFechaGuia;
                                llave1.PARTNER = varReHaEmpresaAgricola;
                                llave1.TXT_EMP = "";
                                llave1.MODULO = varReHaModulo;
                                llave1.PALLETS = "";
                                llave1.CANT = "";
                                llave1.KUNNR = "";
                                llave1.MATNR = "";
                                llave1.CODSKY = "";
                                vector1.push(llave1);
                                validarSelectGuia = true;
                            }
                        }

                        if (validarSelectGuia) {
                            var oDialogDecision = new sap.m.Dialog("Dialog2", {
                                title: "Confirmar",
                                contentWidth: "540px",
                                modal: true,
                                type: "Message",
                                content: [
                                    new sap.m.Label({
                                        text: " ",
                                        width: "100%"
                                    }),
                                    new sap.m.Label({
                                        text: "Estás Seguro Que Deseas Activar las Guía Selecionadas",
                                        textAlign: "Center",
                                        width: "100%"
                                    }),
                                    new sap.m.Label({
                                        text: " ",
                                        width: "100%"
                                    }),
                                    new sap.m.Button({
                                        text: "Sí",
                                        type: "Emphasized",
                                        width: "100%",
                                        press: function () {
                                            console.log(vector1);

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
                                            var T_BINES = [];
                                            var row = {};
                                            row.COMENT = "";
                                            row.PARAM = "RHG-" + date + "-1401---";
                                            row.VECTOR = [];
                                            row.PALETA = vector1;
                                            T_BINES.push(row);
                                            T_BINES = JSON.stringify(T_BINES);

                                            console.log(date);
                                            console.log(T_BINES);


                                            //////////////////
                                            $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                                type: 'GET',
                                                async: false,
                                                beforeSend: function (xhr) {
                                                    xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                                                },
                                                complete: function (xhr) {
                                                    var token = xhr.getResponseHeader("X-CSRF-Token");

                                                    $.ajax("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet", {
                                                        type: 'POST',
                                                        data: T_BINES,
                                                        beforeSend: function (xhr) {
                                                            xhr.setRequestHeader('X-CSRF-Token', token);
                                                        },
                                                        success: function (response) {

                                                            var respuesta2 = "Se realizó la activación de las Guías Correctamente.";
                                                            try {
                                                                var respuesta = response.responseText.toString();
                                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                                respuesta = respuesta[1];
                                                                respuesta = respuesta.split('</message>');
                                                                respuesta = respuesta[0];
                                                                respuesta2 = respuesta;
                                                            } catch (err) {
                                                                console.log(err);
                                                            }

                                                            sap.ui.core.BusyIndicator.hide();

                                                            var contador = 0;
                                                            date = new Date();
                                                            year = date.getFullYear();
                                                            day = date.getDate();
                                                            month = date.getMonth() + 1;
                                                            oView = oThis.getView();
                                                            date = year + "" + day + "" + month;
                                                            var texto5 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CP-" + date + "-1401---')/$value";
                                                            var oModelC = new sap.ui.model.json.JSONModel(texto5, false);
                                                            oModelC.attachRequestCompleted(function () {
                                                                var vectorError = {
                                                                    "ERRORES2": []
                                                                };
                                                                var myParamZ = oThis.getView().getModel("CP");
                                                                var cont = oModelC.getProperty("/ITAB");
                                                                var llaveZ = {};
                                                                if (cont === null || cont === undefined) {
                                                                    llaveZ = {};
                                                                    llaveZ.subtitle = "Error de conexión en el enlace:" + texto5;
                                                                    llaveZ.title = "Mensaje de error Nro " + 4;
                                                                    llaveZ.type = "Error";
                                                                    vectorError.push(llaveZ);
                                                                    contador++;
                                                                    oView.byId("idButtonError").setVisible(true);
                                                                    oView.byId("idButtonError").setText("" + contador);
                                                                    oView.byId("GenericTile5").setSubheader("Se ha generado un error");
                                                                } else {
                                                                    cont = oModelC.getProperty("/ITAB/length");

                                                                    oView.byId("GenericTile5").setSubheader("Tienes " + cont + " tareas");
                                                                    var lenghtVV = oModelC.getProperty("/ITAB/length");
                                                                    var vectorZ = [];
                                                                    for (var i = 0; i < lenghtVV; i++) {
                                                                        llaveZ = {};
                                                                        llaveZ.ELIMINAR = false;
                                                                        llaveZ.BINS = oModelC.getProperty("/ITAB/" + i + "/BINS").toString();
                                                                        llaveZ.DESCOR = oModelC.getProperty("/ITAB/" + i + "/DESCOR").toString();
                                                                        llaveZ.DESC_VAR = oModelC.getProperty("/ITAB/" + i + "/DESC_VAR").toString();
                                                                        llaveZ.GUIA = oModelC.getProperty("/ITAB/" + i + "/GUIA").toString();
                                                                        llaveZ.IND_MAT = oModelC.getProperty("/ITAB/" + i + "/IND_MAT").toString();
                                                                        llaveZ.JABAS = oModelC.getProperty("/ITAB/" + i + "/JABAS").toString();
                                                                        llaveZ.PALLETS = oModelC.getProperty("/ITAB/" + i + "/PALLETS").toString();
                                                                        llaveZ.PARTNER = oModelC.getProperty("/ITAB/" + i + "/PARTNER").toString();
                                                                        llaveZ.VARIEDAD = oModelC.getProperty("/ITAB/" + i + "/VARIEDAD").toString();
                                                                        llaveZ.VBELN = oModelC.getProperty("/ITAB/" + i + "/VBELN").toString();
                                                                        llaveZ.WERKS = oModelC.getProperty("/ITAB/" + i + "/WERKS").toString();
                                                                        llaveZ.FEC_REC = oModelC.getProperty("/ITAB/" + i + "/FEC_REC").toString();
                                                                        llaveZ.TXT_EMP = oModelC.getProperty("/ITAB/" + i + "/TXT_EMP").toString();
                                                                        llaveZ.MODULO = oModelC.getProperty("/ITAB/" + i + "/MODULO").toString();
                                                                        llaveZ.TXT_STA = oModelC.getProperty("/ITAB/" + i + "/TXT_STA").toString();
                                                                        vectorZ.push(llaveZ);
                                                                    }
                                                                    console.log(vectorZ);
                                                                    myParamZ.setProperty("/ITAB", vectorZ);
                                                                    var dialogRHConfirmacion = new sap.m.Dialog({
                                                                        title: 'Activación Generada',
                                                                        type: 'Message',
                                                                        state: 'Success',
                                                                        content: new sap.m.Text({
                                                                            text: respuesta2
                                                                        }),
                                                                        beginButton: new sap.m.Button({
                                                                            text: 'OK',
                                                                            press: function () {
                                                                                oThis.byId("idBinsTable").getBinding("items").refresh(true);
                                                                                oThis.byId("idPaletTable").getBinding("items").refresh(true);
                                                                                oThis.onPressActualizarTablePaletCrear();
                                                                                dialogRHConfirmacion.close();
                                                                                oDialog1.close();
                                                                            }
                                                                        }),
                                                                        afterClose: function () {
                                                                            dialogRHConfirmacion.destroy();
                                                                            oDialog1.destroy();
                                                                        }
                                                                    });
                                                                    dialogRHConfirmacion.open();
                                                                }
                                                            }.bind(this));

                                                        }.bind(this),
                                                        error: function (response) {
                                                            console.log(response);
                                                            sap.ui.core.BusyIndicator.hide();
                                                            oThis.byId("idGuiaTable").getBinding("items").refresh(true);
                                                            oThis.byId("idPaletTable").getBinding("items").refresh(true);
                                                            var respuesta2 = "No se realizo la activación Correctamente";
                                                            try {
                                                                var respuesta = response.responseText.toString();
                                                                respuesta = respuesta.split('<message xml:lang="es">');
                                                                respuesta = respuesta[1];
                                                                respuesta = respuesta.split('</message>');
                                                                respuesta = respuesta[0];
                                                                respuesta2 = respuesta;
                                                            } catch (err) {
                                                                console.log(err);
                                                            }
                                                            var dialog = new sap.m.Dialog({
                                                                title: 'Error generado',
                                                                type: 'Message',
                                                                state: 'Error',
                                                                content: new sap.m.Text({
                                                                    text: respuesta2
                                                                }),
                                                                beginButton: new sap.m.Button({
                                                                    text: 'Aceptar',
                                                                    type: 'Emphasized',
                                                                    press: function () {
                                                                        dialog.close();
                                                                    }
                                                                }),
                                                                afterClose: function () {
                                                                    dialog.destroy();
                                                                }
                                                            });
                                                            dialog.open();
                                                        }.bind(this)
                                                    });
                                                }.bind(this),
                                                success: function (response) { },
                                                error: function (response) {

                                                    console.log(response);
                                                }
                                            });
                                            //////////////////


                                            oDialogDecision.close();
                                            oDialog1.open();
                                        }.bind(this)
                                    }),
                                    new sap.m.Button({
                                        text: "No",
                                        width: "100%",
                                        press: function () {
                                            oDialogDecision.close();
                                        }
                                    })
                                ],
                                afterClose: function () {
                                    oDialogDecision.destroy();
                                }
                            });
                            oDialogDecision.open();
                        } else {
                            var dialog = new sap.m.Dialog({
                                title: 'Alerta',
                                type: 'Message',
                                state: 'Warning',
                                content: new sap.m.Text({
                                    text: 'No se ha Seleccionado Ninguna Guía para Activar'
                                }),
                                beginButton: new sap.m.Button({
                                    text: 'OK',
                                    press: function () {
                                        dialog.close();
                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                }
                            });
                            dialog.open();
                        }
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    icon: "sap-icon://cancel",
                    text: 'Cancel',
                    press: function () {
                        oDialog1.close();
                    }
                }),
                afterClose: function () {
                    oDialog1.destroy();
                }
            });

            var oTable = new sap.m.Table("idTableGuasHabilitar", {
                minScreenWidth: "Tablet",
                columns: [
                    new sap.m.Column({
                        header: new sap.m.Label({
                            text: "Seleccionar",
                            hAlign: "Center",
                            demandPopin: "true"
                        })
                    }),
                    new sap.m.Column({
                        header: new sap.m.Label({
                            text: "Códigos de Guías",
                            hAlign: "Center",
                            demandPopin: "true"
                        })
                    }),
                    new sap.m.Column({
                        header: new sap.m.Label({
                            text: "",
                            hAlign: "Center",
                            demandPopin: "true"
                        })
                    })
                ],
                items: {
                    path: 'myParam>/listGuiaNew',
                    template: new sap.m.ColumnListItem({
                        vAlign: "Middle",
                        cells: [
                            new sap.m.CheckBox({
                                selected: "{myParam>SELECTGUIA}",
                                valueState: "Warning"
                            }),
                            new sap.m.Text({
                                text: "{myParam>Guia}",
                                textAlign: "Center"
                            }),
                            new sap.m.Text({
                                text: "",
                                textAlign: "Center"
                            })
                        ]
                    })
                }
                /*itemPress: function (e) {
                  var varReHaFechaRecepcion = sap.ui.getCore().byId("idReHaFechaRecepcion").getValue();
                  console.log(varReHaFechaRecepcion);
                }*/
            });

            oTable.setModel(myParam, "myParam");
            oDialog1.addContent(oTable);
            comboBox1.setModel(myParam, "myParam");
            comboBox2.setModel(myParam, "myParam");
            oDialog1.open();
        },

        dialogRHConfirmacion: function () {

            var dialogRHConfirmacion = new sap.m.Dialog({
                title: 'Activación Generada',
                type: 'Message',
                state: 'Success',
                content: new sap.m.Text({
                    text: 'Se realizó la activación de las Guías Correctamente'
                }),
                beginButton: new sap.m.Button({
                    text: 'OK',
                    press: function () {
                        dialogRHConfirmacion.close();
                    }
                }),
                afterClose: function () {
                    dialogRHConfirmacion.destroy();
                }
            });
            dialogRHConfirmacion.open();
        },
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        BusquedaCliente: function (WERKS, VBELN) {
            var oThis = this;

            /* var oModel = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/CPHCL/" + WERKS + "/" +
               VBELN, false);*/
            var oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPHCL--" + WERKS + "-" + VBELN +
                "-')/$value");
            sap.ui.getCore().setModel(oModel, "cliente");

            var pressDialog = new sap.m.SelectDialog({
                noDataText: "No hay datos de clientes",
                title: "Lista de clientes",
                search: [this.handleSearch, this],
                confirm: [this.handleClose, this],
                close: [this.handleClose, this],
                items: {
                    path: "/ITAB",
                    sorter: {
                        path: "/ITAB>KUNNR"
                    },
                    template: new sap.m.StandardListItem({
                        title: "{KUNNR} - {NAME1}",
                        type: "Active"
                    })
                },
                beginButton: new sap.m.Button({
                    text: "Close",
                    type: "Reject",
                    press: function () {
                        pressDialog.close();
                    },
                    afterClose: function () {
                        pressDialog.destroy();
                    }
                })
            });
            pressDialog.setModel(sap.ui.getCore().getModel("cliente"));
            this.getView().addDependent(pressDialog);
            pressDialog.open();
            oModel.attachRequestCompleted(function () {
                sap.ui.core.BusyIndicator.hide();
            });
            sap.ui.core.BusyIndicator.show(0);
        },
        handleSearch: function (oEvt) {
            var sValue = oEvt.getParameter("value");
            var oFilter = new sap.ui.model.Filter("NAME1", sap.ui.model.FilterOperator.Contains, sValue);
            var oBinding = oEvt.getSource().getBinding("items");
            oBinding.filter([oFilter], "Application");
        },
        handleClose: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts.length) {
                var valor = aContexts.map(function (oContext) {
                    return oContext.getObject().KUNNR;
                }).join(", ");
                var valor2 = aContexts.map(function (oContext) {
                    return oContext.getObject().NAME1;
                }).join(", ");

                var productInput = sap.ui.getCore().byId("cliente");
                productInput.setValue(valor + "-" + valor2);

                sap.ui.getCore().setModel(valor, "matrizCliente");
            }
            oEvent.getSource().getBinding("items").filter([]);

        },
        BusquedaViaje: function (WERKS, FECHA, MODULO, PARTNER, PRODUCTO, CLIENTE, LINEA) {

            var oThis = this;
            this.MODULO = MODULO;
            this.FECHA = FECHA;
            this.WERKS = WERKS;
            this.PARTNER = PARTNER;
            /*var oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPVIA-" + FECHA + "-" + WERKS + "--" +
              MODULO + "----" + PARTNER + "-" + CLIENTE + "-" + PRODUCTO + "')/$value");
            console.log("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPVIA-" + FECHA + "-" + WERKS + "--" + MODULO + "----" + PARTNER + "-" +
              CLIENTE + "-" + PRODUCTO);*/
            /*  var oModel = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/CPHPR/" + VBELN + "/" +
                WERKS, false);*/
            var oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPVIA-" + FECHA + "-" + WERKS + "--" +
                MODULO + "----" + PARTNER + "-" + CLIENTE + "-" + PRODUCTO + "-" + LINEA.substring(6, 7) + "')/$value");
            console.log("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPVIA-" + FECHA + "-" + WERKS + "--" + MODULO + "----" + PARTNER + "-" +
                CLIENTE + "-" + PRODUCTO + "-" + LINEA.substring(6, 7));

            sap.ui.getCore().setModel(oModel, "cliente");

            var pressDialog = new sap.m.SelectDialog({
                noDataText: "No hay datos de viaje",
                title: "Lista de Viajes",
                search: [this.handleSearchViaje, this],
                confirm: [this.handleCloseViaje, this],
                close: [this.handleCloseViaje, this],
                items: {
                    path: "/ITAB",
                    sorter: {
                        path: "/ITAB>PEDIDO"
                    },
                    template: new sap.m.StandardListItem({
                        title: "{VIAJE} - {PEDIDO}",
                        type: "Active"
                    })
                },
                beginButton: new sap.m.Button({
                    text: "Close",
                    type: "Reject",
                    press: function () {
                        pressDialog.close();
                    },
                    afterClose: function () {
                        pressDialog.destroy();
                    }
                })
            });
            pressDialog.setModel(sap.ui.getCore().getModel("cliente"));
            this.getView().addDependent(pressDialog);
            pressDialog.open();
            sap.ui.core.BusyIndicator.show(0);
            oModel.attachRequestCompleted(function () {
                console.log(oModel.getJSON());
                try {
                    var cont = oModel.getProperty("/ITAB");
                    var MESSAGE = oModel.getProperty("/ITAB/0/MESSAGE");

                    console.log(MESSAGE);

                    if (MESSAGE !== undefined && MESSAGE !== null) {
                        var dialog = new sap.m.Dialog({
                            title: 'Alerta',
                            type: 'Message',
                            state: 'Warning',
                            content: new sap.m.Text({
                                text: MESSAGE
                            }),
                            beginButton: new sap.m.Button({
                                text: 'Aceptar',
                                type: 'Emphasized',
                                press: function () {
                                    dialog.close();
                                }
                            }),
                            afterClose: function () {
                                dialog.destroy();
                            }
                        });
                        dialog.open();

                    }
                    sap.ui.core.BusyIndicator.hide();
                } catch (err) {

                    sap.ui.core.BusyIndicator.hide();
                }
            });

        },
        handleSearchViaje: function (oEvt) {
            var sValue = oEvt.getParameter("value");
            var oFilter = new sap.ui.model.Filter("PEDIDO", sap.ui.model.FilterOperator.Contains, sValue);
            var oBinding = oEvt.getSource().getBinding("items");
            oBinding.filter([oFilter], "Application");
        },
        handleCloseViaje: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts.length) {
                var valor1 = aContexts.map(function (oContext) {
                    return oContext.getObject().PEDIDO;
                }).join(", ");
                var valor2 = aContexts.map(function (oContext) {
                    return oContext.getObject().VIAJE;
                }).join(", ");
                var productInput = sap.ui.getCore().byId("viaje");
                productInput.setValue(valor2 + "-" + valor1);
            }
            oEvent.getSource().getBinding("items").filter([]);

        },
        BusquedaProducto: function (WERKS, VBELN, MODULO, FECHA, PARTNER, CLIENTE) {

            var oThis = this;
            this.MODULO = MODULO;
            this.FECHA = FECHA;
            this.WERKS = WERKS;
            this.PARTNER = PARTNER;
            this.CLIENTE = CLIENTE;
            var oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPHPR--" + WERKS + "-" + VBELN + "-" +
                MODULO + "-')/$value");

            /*  var oModel = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/CPHPR/" + VBELN + "/" +
                WERKS, false);*/

            sap.ui.getCore().setModel(oModel, "cliente");

            var pressDialog = new sap.m.SelectDialog({
                noDataText: "No hay datos de productos",
                title: "Lista de Productos",
                search: [this.handleSearch2, this],
                confirm: [this.handleClose2, this],
                close: [this.handleClose2, this],
                items: {
                    path: "/ITAB",
                    sorter: {
                        path: "/ITAB>MATNR"
                    },
                    template: new sap.m.StandardListItem({
                        title: "{MATNR} - {MAKTX}",
                        type: "Active"
                    })
                },
                beginButton: new sap.m.Button({
                    text: "Close",
                    type: "Reject",
                    press: function () {
                        pressDialog.close();
                    },
                    afterClose: function () {
                        pressDialog.destroy();
                    }
                })
            });
            pressDialog.setModel(sap.ui.getCore().getModel("cliente"));
            this.getView().addDependent(pressDialog);
            pressDialog.open();
            oModel.attachRequestCompleted(function () {
                sap.ui.core.BusyIndicator.hide();
            });
            sap.ui.core.BusyIndicator.show(0);

        },
        BusquedaUniversal: function (TIPO, FECHA, EMPRESA, CLIENTE) {

            var oThis = this;
            /*   this.MODULO = MODULO;
               this.FECHA = FECHA;
               this.WERKS = WERKS;
               this.PARTNER = PARTNER;
               this.CLIENTE = CLIENTE;*/
            var oModel, noDataText, title, path, sorter, title2;

            if (TIPO === "EMPRESA") {
                oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPSEM-" + FECHA + "----------')/$value");
                noDataText = "No hay datos de empresas";
                title = "Lista de Empresas";
                path = "/ITAB";
                sorter = "/ITAB>NAME1";
                title2 = "{KUNNR} - {NAME1}";
            } else if (TIPO === "MODULO") {
                console.log("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPSMO-" + FECHA + "-------" + EMPRESA + "---')/$value");
                oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPSMO-" + FECHA + "-------" + EMPRESA +
                    "---')/$value");
                noDataText = "No hay datos de módulos";
                title = "Lista de Módulos";
                path = "/ITAB";
                sorter = "/ITAB>EQV_FM";
                title2 = "{EQV_FM} - {DESCOR}";
            } else if (TIPO === "PRODUCTO") {
                console.log("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPHPR--1401----------')/$value");
                oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPHPR--1401----------')/$value");
                noDataText = "No hay datos de productos";
                title = "Lista de Productos";
                path = "/ITAB";
                sorter = "/ITAB>MATNR";
                title2 = "{MATNR} - {MAKTX}";
            } else if (TIPO === "VIAJE") {
                var MODULO = sap.ui.getCore().byId("modulo").getValue();
                MODULO = MODULO.split("-");
                MODULO = MODULO[0];
                var PRODUCTO = sap.ui.getCore().byId("producto").getValue();
                oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPSVI-" + FECHA + "---" +
                    MODULO + "----" + EMPRESA + "-" + CLIENTE + "-" + PRODUCTO + "')/$value");

                noDataText = "No hay datos de viajes";
                title = "Lista de Viajes";
                path = "/ITAB";
                sorter = "/ITAB>VIAJE";
                title2 = "{VIAJE} - {PEDIDO}";
            } else if (TIPO === "GUIA") {
                var MODULO = sap.ui.getCore().byId("modulo").getValue();
                MODULO = MODULO.split("-");
                MODULO = MODULO[0];
                var PRODUCTO = sap.ui.getCore().byId("producto").getValue();
                oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPSGR-" + FECHA + "---" +
                    MODULO + "----" + EMPRESA + "-" + CLIENTE + "-" + PRODUCTO + "')/$value");
                console.log("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPSVI-" + FECHA + "---" +
                    MODULO + "----" + EMPRESA + "-" + CLIENTE + "-" + PRODUCTO + "-')/$value");

                noDataText = "No hay datos de guías";
                title = "Lista de Guías";
                path = "/ITAB";
                sorter = "/ITAB>GUIA";
                title2 = "{GUIA} - {FECCOS}";
            }

            /*  var oModel = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/CPHPR/" + VBELN + "/" +
                WERKS, false);*/

            sap.ui.getCore().setModel(oModel, "cliente");
            var funcionClose = function (oEvent) {
                var aContexts = oEvent.getParameter("selectedContexts");
                if (aContexts.length) {
                    var valor = aContexts.map(function (oContext) {
                        if (TIPO === "EMPRESA") {
                            var valor = oContext.getObject().KUNNR;
                            var valor2 = oContext.getObject().NAME1;
                            var productInput = sap.ui.getCore().byId("empresa");
                            productInput.setValue(valor + "-" + valor2);
                            sap.ui.getCore().byId("modulo").setValue("");
                            sap.ui.getCore().byId("producto").setValue("");
                            sap.ui.getCore().byId("viaje").setValue("");
                            sap.ui.getCore().byId("guia2").setValue("");
                            sap.ui.getCore().byId("descripcionP").setValue("");
                            sap.ui.getCore().byId("cosecha").setValue("");

                        } else if (TIPO === "MODULO") {
                            sap.ui.getCore().byId("producto").setValue("");
                            sap.ui.getCore().byId("viaje").setValue("");
                            sap.ui.getCore().byId("guia2").setValue("");
                            sap.ui.getCore().byId("descripcionP").setValue("");
                            sap.ui.getCore().byId("cosecha").setValue("");
                            var valor = oContext.getObject().EQV_FM;
                            var valor2 = oContext.getObject().DESCOR;
                            var productInput = sap.ui.getCore().byId("modulo");
                            productInput.setValue(valor + "-" + valor2);
                        } else if (TIPO === "PRODUCTO") {

                            var valor = oContext.getObject().MATNR;
                            var valor2 = oContext.getObject().MAKTX;
                            var valor3 = oContext.getObject().UMREZ;
                            sap.ui.getCore().byId("producto").setValue(valor);
                            sap.ui.getCore().byId("descripcionP").setValue(valor2);
                            sap.ui.getCore().byId("paleta").setValue(valor3);
                            var modulo = sap.ui.getCore().byId("modulo").getValue();
                            modulo = modulo.split("-");
                            modulo = modulo[0];
                            var codigo4 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPSGV-" + FECHA + "---" + modulo + "----" + EMPRESA + "-" +
                                CLIENTE + "-" + valor + "-')/$value";
                            var oModel4 = new sap.ui.model.json.JSONModel(codigo4);
                            oModel4.attachRequestCompleted(function () {
                                try {
                                    console.log(oModel4.getJSON());
                                    var GUIAS = oModel4.getProperty("/ITAB/0/GUIAS");
                                    console.log(GUIAS);

                                    var VIAJES = oModel4.getProperty("/ITAB/0/VIAJES");
                                    var Mensaje = "";
                                    if (GUIAS.length === 0 && VIAJES.length === 0) {
                                        sap.ui.getCore().byId("cosecha").setValue("");
                                        sap.ui.getCore().byId("guia2").setValue("");
                                        sap.ui.getCore().byId("viaje").setValue("");
                                        Mensaje = "Error, no se encontraron viajes. No se encontraron guias.";
                                    } else if (GUIAS.length === 0) {
                                        sap.ui.getCore().byId("cosecha").setValue("");
                                        sap.ui.getCore().byId("guia2").setValue("");
                                        Mensaje = "No se encontraron guias.";
                                    } else if (VIAJES.length === 0) {
                                        Mensaje = "Error, no se encontraron viajes. ";
                                        sap.ui.getCore().byId("viaje").setValue("");

                                    }
                                    if (Mensaje !== "") {
                                        var dialog = new sap.m.Dialog({
                                            title: 'Alerta',
                                            type: 'Message',
                                            state: 'Warning',
                                            content: new sap.m.Text({
                                                text: Mensaje
                                            }),
                                            beginButton: new sap.m.Button({
                                                text: 'Aceptar',
                                                type: 'Emphasized',
                                                press: function () {
                                                    dialog.close();
                                                }
                                            }),
                                            afterClose: function () {
                                                dialog.destroy();
                                            }
                                        });
                                        dialog.open();
                                        sap.ui.core.BusyIndicator.hide();
                                    }
                                    if (GUIAS.length !== 0 && VIAJES.length !== 0) {
                                        var GUIA = oModel4.getProperty("/ITAB/0/GUIAS/0/GUIA");
                                        var FECCOS = oModel4.getProperty("/ITAB/0/GUIAS/0/FECCOS");
                                        var VIAJE = oModel4.getProperty("/ITAB/0/VIAJES/0/VIAJE");
                                        var PEDIDO = oModel4.getProperty("/ITAB/0/VIAJES/0/PEDIDO");
                                        sap.ui.getCore().byId("viaje").setValue(VIAJE + "-" + PEDIDO);
                                        sap.ui.getCore().byId("cosecha").setValue(FECCOS);
                                        sap.ui.getCore().byId("guia2").setValue(GUIA);
                                    } else if (VIAJES.length === 0) {
                                        var GUIA = oModel4.getProperty("/ITAB/0/GUIAS/0/GUIA");
                                        var FECCOS = oModel4.getProperty("/ITAB/0/GUIAS/0/FECCOS");
                                        sap.ui.getCore().byId("viaje").setValue("");
                                        sap.ui.getCore().byId("cosecha").setValue(FECCOS);
                                        sap.ui.getCore().byId("guia2").setValue(GUIA);
                                    } else {
                                        var VIAJE = oModel4.getProperty("/ITAB/0/VIAJES/0/VIAJE");
                                        var PEDIDO = oModel4.getProperty("/ITAB/0/VIAJES/0/PEDIDO");
                                        sap.ui.getCore().byId("viaje").setValue(VIAJE + "-" + PEDIDO);
                                        sap.ui.getCore().byId("cosecha").setValue("");
                                        sap.ui.getCore().byId("guia2").setValue("");
                                    }
                                    sap.ui.core.BusyIndicator.hide();

                                } catch (err) {
                                    sap.ui.core.BusyIndicator.hide();
                                }

                            });
                        } else if (TIPO === "VIAJE") {

                            var valor1 = oContext.getObject().PEDIDO;
                            var valor2 = oContext.getObject().VIAJE;
                            var productInput = sap.ui.getCore().byId("viaje");
                            productInput.setValue(valor2 + "-" + valor1);
                        } else if (TIPO === "GUIA") {

                            var valor1 = oContext.getObject().GUIA;
                            var valor2 = oContext.getObject().FECCOS;

                            sap.ui.getCore().byId("cosecha").setValue(valor2);
                            sap.ui.getCore().byId("guia2").setValue(valor1);
                        }
                    }).join(", ");

                }
                oEvent.getSource().getBinding("items").filter([]);

            };
            var pressDialog = new sap.m.SelectDialog({
                noDataText: noDataText,
                title: title,
                search: function (oEvt) {
                    if (TIPO === "EMPRESA") {
                        var sValue = oEvt.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("NAME1", sap.ui.model.FilterOperator.Contains, sValue);
                        var oFilter2 = new sap.ui.model.Filter("KUNNR", sap.ui.model.FilterOperator.Contains, sValue);
                        var oBinding = oEvt.getSource().getBinding("items");
                        oBinding.filter(new sap.ui.model.Filter([oFilter, oFilter2], false));
                    } else if (TIPO === "MODULO") {
                        var sValue = oEvt.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("EQV_FM", sap.ui.model.FilterOperator.Contains, sValue);
                        var oFilter2 = new sap.ui.model.Filter("DESCOR", sap.ui.model.FilterOperator.Contains, sValue);
                        var oBinding = oEvt.getSource().getBinding("items");
                        oBinding.filter(new sap.ui.model.Filter([oFilter, oFilter2], false));
                    } else if (TIPO === "PRODUCTO") {
                        var sValue = oEvt.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("MATNR", sap.ui.model.FilterOperator.Contains, sValue);
                        var oFilter2 = new sap.ui.model.Filter("MAKTX", sap.ui.model.FilterOperator.Contains, sValue);
                        var oBinding = oEvt.getSource().getBinding("items");
                        oBinding.filter(new sap.ui.model.Filter([oFilter, oFilter2], false));
                    } else if (TIPO === "VIAJE") {
                        var sValue = oEvt.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("VIAJE", sap.ui.model.FilterOperator.Contains, sValue);
                        var oFilter2 = new sap.ui.model.Filter("PEDIDO", sap.ui.model.FilterOperator.Contains, sValue);
                        var oBinding = oEvt.getSource().getBinding("items");
                        oBinding.filter(new sap.ui.model.Filter([oFilter, oFilter2], false));
                    } else if (TIPO === "GUIA") {
                        var sValue = oEvt.getParameter("value");
                        var oFilter = new sap.ui.model.Filter("GUIA", sap.ui.model.FilterOperator.Contains, sValue);
                        var oBinding = oEvt.getSource().getBinding("items");
                        oBinding.filter(new sap.ui.model.Filter([oFilter], false));
                    }
                },
                confirm: funcionClose,
                close: funcionClose,
                items: {
                    path: path,
                    sorter: {
                        path: sorter
                    },
                    template: new sap.m.StandardListItem({
                        title: title2,
                        type: "Active"
                    })
                },
                beginButton: new sap.m.Button({
                    text: "Close",
                    type: "Reject",
                    press: function () {
                        pressDialog.close();
                    },
                    afterClose: function () {
                        pressDialog.destroy();
                    }
                })
            });
            pressDialog.setModel(sap.ui.getCore().getModel("cliente"));
            this.getView().addDependent(pressDialog);
            pressDialog.open();
            sap.ui.core.BusyIndicator.show(0);
            oModel.attachRequestCompleted(function () {
                console.log(oModel.getJSON());
                try {
                    var MESSAGE = oModel.getProperty("/ITAB/0/MESSAGE");
                    if (MESSAGE !== undefined && MESSAGE !== null) {
                        var dialog = new sap.m.Dialog({
                            title: 'Alerta',
                            type: 'Message',
                            state: 'Warning',
                            content: new sap.m.Text({
                                text: MESSAGE
                            }),
                            beginButton: new sap.m.Button({
                                text: 'Aceptar',
                                type: 'Emphasized',
                                press: function () {
                                    dialog.close();
                                }
                            }),
                            afterClose: function () {
                                dialog.destroy();
                            }
                        });
                        dialog.open();

                    }
                    sap.ui.core.BusyIndicator.hide();
                } catch (err) {

                    sap.ui.core.BusyIndicator.hide();
                }
            });
            //      sap.ui.core.BusyIndicator.show(0);

        },

        BusquedaOrden: function () {

            var oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('RPORD')/$value");

            /*  var oModel = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/CPHPR/" + VBELN + "/" +
                WERKS, false);*/

            sap.ui.getCore().setModel(oModel, "cliente");

            var pressDialog = new sap.m.SelectDialog({
                noDataText: "No hay datos de ordenes",
                title: "Lista de Ordenes",
                search: [this.handleSearchOrden, this],
                confirm: [this.handleCloseOrden, this],
                close: [this.handleCloseOrden, this],
                items: {
                    path: "/ITAB",
                    sorter: {
                        path: "/ITAB>MATNR"
                    },
                    template: new sap.m.StandardListItem({
                        icon: "sap-icon://course-book",
                        description: "Viaje : {VIAJE}-{VBELN}",
                        title: "Orden : {AUFNR}-{PLNBEZ}",
                        type: "Active"
                    })
                },
                beginButton: new sap.m.Button({
                    text: "Close",
                    type: "Reject",
                    press: function () {
                        pressDialog.close();
                    },
                    afterClose: function () {
                        pressDialog.destroy();
                    }
                })
            });
            pressDialog.setModel(sap.ui.getCore().getModel("cliente"));
            this.getView().addDependent(pressDialog);
            pressDialog.open();
            oModel.attachRequestCompleted(function () {
                console.log(oModel.getJSON());
                sap.ui.core.BusyIndicator.hide();
            });
            sap.ui.core.BusyIndicator.show(0);

        },
        handleSearchOrden: function (oEvt) {
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
        handleCloseOrden: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts.length) {
                var PLNBEZ = aContexts.map(function (oContext) {
                    return oContext.getObject().PLNBEZ;
                }).join(", ");
                var MAKTX = aContexts.map(function (oContext) {
                    return oContext.getObject().MAKTX;
                }).join(", ");
                console.log(MAKTX);
                var VBELN = aContexts.map(function (oContext) {
                    return oContext.getObject().VBELN;
                }).join(", ");
                var VIAJE = aContexts.map(function (oContext) {
                    return oContext.getObject().VIAJE;
                }).join(", ");
                var AUFNR = aContexts.map(function (oContext) {
                    return oContext.getObject().AUFNR;
                }).join(", ");
                var UMREZ = aContexts.map(function (oContext) {
                    return oContext.getObject().UMREZ;
                }).join(", ");
                if (PLNBEZ.substr(3, 2) === "PA") {
                    sap.ui.getCore().byId("idSkynetLabel").setVisible(true);
                    sap.ui.getCore().byId("idSkynet").setVisible(true);
                    sap.ui.getCore().byId("idSkynet").setValue("");
                } else {
                    sap.ui.getCore().byId("idSkynetLabel").setVisible(false);
                    sap.ui.getCore().byId("idSkynet").setVisible(false);
                    sap.ui.getCore().byId("idSkynet").setValue("");
                }

                var idProducto = sap.ui.getCore().byId("idProducto");
                idProducto.setValue(PLNBEZ + "-" + MAKTX);
                var idViaje = sap.ui.getCore().byId("idViaje");
                idViaje.setValue(VIAJE + "-" + VBELN);
                var idOrden = sap.ui.getCore().byId("idOrden");
                idOrden.setValue(AUFNR);
                var idMax = sap.ui.getCore().byId("idMax");
                idMax.setValue(UMREZ);
            }
            oEvent.getSource().getBinding("items").filter([]);

        },
        BusquedaMaterial: function (WERKS, VBELN, MODULO) {
            var oThis = this;
            var oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('VCHME--" + WERKS + "-" + VBELN + "-" +
                MODULO + "')/$value");

            /*  var oModel = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/CPHPR/" + VBELN + "/" +
                WERKS, false);*/

            sap.ui.getCore().setModel(oModel, "cliente");
            /*  oModel.attachRequestCompleted(function() {
                var cont = oModel.getProperty("/ITAB");
                console.log(cont);
              });*/
            var pressDialog = new sap.m.SelectDialog({
                noDataText: "No hay datos de materiales de embalaje",
                title: "Lista de materiales de embalaje",
                search: [this.handleSearch3, this],
                confirm: [this.handleClose31, this],
                close: [this.handleClose31, this],
                items: {
                    path: "/ITAB",
                    sorter: {
                        path: "/ITAB>MAKTX"
                    },
                    template: new sap.m.StandardListItem({
                        title: "{MATNR} - {MAKTX}",
                        type: "Active"
                    })
                },
                beginButton: new sap.m.Button({
                    text: "Close",
                    type: "Reject",
                    press: function () {
                        pressDialog.close();
                    },
                    afterClose: function () {
                        pressDialog.destroy();
                    }
                })
            });
            pressDialog.setModel(sap.ui.getCore().getModel("cliente"));
            this.getView().addDependent(pressDialog);
            pressDialog.open();

        },
        handleSearch3: function (oEvt) {
            var sValue = oEvt.getParameter("value");
            var oFilter = new sap.ui.model.Filter("MAKTX", sap.ui.model.FilterOperator.Contains, sValue);
            var oBinding = oEvt.getSource().getBinding("items");
            oBinding.filter([oFilter], "Application");
        },
        handleClose31: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts.length) {
                var valor = aContexts.map(function (oContext) {
                    return oContext.getObject().MATNR;
                }).join(", ");
                var productInput = sap.ui.getCore().byId("embalaje");
                productInput.setValue(valor);
            }
            oEvent.getSource().getBinding("items").filter([]);

        },
        BusquedaGuia: function (WERKS, FECHA, MODULO, PARTNER, PRODUCTO) {
            var oThis = this;

            var oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPGR-" + FECHA + "-" + WERKS + "--" +
                MODULO + "----" + PARTNER + "--" + PRODUCTO + "')/$value");
            /*var oModel = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/VCHPR/" + VBELN + "/" +
              WERKS, false);*/

            var vector = {};
            vector.WERKS = WERKS;
            vector.MODULO = MODULO;
            vector.PARTNER = PARTNER;
            vector.PRODUCTO = PRODUCTO;
            sap.ui.getCore().setModel(vector, "matrizGuia");

            sap.ui.getCore().setModel(oModel, "cliente");

            var pressDialog = new sap.m.SelectDialog({
                noDataText: "No se encontraron guías",
                title: "Lista de Guías",
                search: [this.handleSearchGuia, this],
                confirm: [this.handleCloseGuia, this],
                close: [this.handleCloseGuia, this],
                items: {
                    path: "/ITAB",
                    sorter: {
                        path: "/ITAB>GUIA"
                    },
                    template: new sap.m.StandardListItem({
                        title: "{GUIA} - {FECCOS} - {LINEA}",
                        type: "Active"
                    })
                },
                beginButton: new sap.m.Button({
                    text: "Close",
                    type: "Reject",
                    press: function () {
                        pressDialog.close();
                    },
                    afterClose: function () {
                        pressDialog.destroy();
                    }
                })
            });
            pressDialog.setModel(sap.ui.getCore().getModel("cliente"));
            this.getView().addDependent(pressDialog);
            pressDialog.open();

        },
        handleCloseGuia: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts.length) {
                var GUIA = aContexts.map(function (oContext) {
                    return oContext.getObject().GUIA;
                }).join(", ");
                var FECCOS = aContexts.map(function (oContext) {
                    return oContext.getObject().FECCOS;
                }).join(", ");
                var LINEA = aContexts.map(function (oContext) {
                    return oContext.getObject().LINEA;
                }).join(", ");
                sap.ui.getCore().byId("cosecha").setValue(FECCOS);
                sap.ui.getCore().byId("guia2").setValue(GUIA);
                console.log(LINEA);
                if (LINEA !== "" && LINEA !== null && LINEA !== undefined) {
                    sap.ui.getCore().byId("idLinea12").setValue("Línea " + LINEA);
                }

                var varMatrizGuia = sap.ui.getCore().getModel("matrizGuia");
                console.log(varMatrizGuia);

                var WERKS = varMatrizGuia.WERKS;
                var MODULO = varMatrizGuia.MODULO;
                var PARTNER = varMatrizGuia.PARTNER;
                var PRODUCTO = varMatrizGuia.PRODUCTO;
                var CLIENTE = sap.ui.getCore().getModel("matrizCliente");

                console.log(WERKS);
                console.log(MODULO);
                console.log(PARTNER);
                console.log(PRODUCTO);
                console.log(CLIENTE);
                console.log(LINEA);
                console.log(FECCOS);

                var oModel2 = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPVIA-" + FECCOS + "-" + WERKS + "--" +
                    MODULO + "----" + PARTNER + "-" + CLIENTE + "-" + PRODUCTO + "-" + LINEA + "')/$value");

                console.log(oModel2);

                oModel2.attachRequestCompleted(function () {
                    try {
                        var matrizz = oModel2.getProperty("/ITAB");
                        if (oModel2.getProperty("/ITAB/0/VIAJE") !== undefined) {
                            var VIAJE = oModel2.getProperty("/ITAB/0/VIAJE");
                            var PEDIDO = oModel2.getProperty("/ITAB/0/PEDIDO");
                            console.log(matrizz);
                            console.log(VIAJE);
                            console.log(PEDIDO);

                            sap.ui.getCore().byId("viaje").setValue(VIAJE + "-" + PEDIDO);
                        } else {
                            sap.ui.getCore().byId("viaje").setValue("");
                        }

                    } catch (err) {
                        console.log(err);
                    }

                });

            }
            oEvent.getSource().getBinding("items").filter([]);

        },
        BusquedaProducto2: function (WERKS, VBELN, MODULO, variedad) {
            var oThis = this;

            var oModel = new sap.ui.model.json.JSONModel("/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('VCHPR--" + WERKS + "-" + VBELN + "-" +
                MODULO + "-" + variedad + "')/$value");
            /*var oModel = new sap.ui.model.json.JSONModel("http://saphanadev.arato.com:8000/sap/bc/zppgw_packing/Guia/VCHPR/" + VBELN + "/" +
              WERKS, false);*/

            sap.ui.getCore().setModel(oModel, "cliente");

            var pressDialog = new sap.m.SelectDialog({
                noDataText: "No hay datos de productos",
                title: "Lista de Productos",
                search: [this.handleSearch2, this],
                confirm: [this.handleClose21, this],
                close: [this.handleClose21, this],
                items: {
                    path: "/ITAB",
                    sorter: {
                        path: "/ITAB>MATNR"
                    },
                    template: new sap.m.StandardListItem({
                        title: "{MATNR} - {MAKTX}",
                        type: "Active"
                    })
                },
                beginButton: new sap.m.Button({
                    text: "Close",
                    type: "Reject",
                    press: function () {
                        pressDialog.close();
                    },
                    afterClose: function () {
                        pressDialog.destroy();
                    }
                })
            });
            pressDialog.setModel(sap.ui.getCore().getModel("cliente"));
            this.getView().addDependent(pressDialog);
            pressDialog.open();

        },
        handleSearchGuia: function (oEvt) {
            var sValue = oEvt.getParameter("value");
            var oFilter = new sap.ui.model.Filter("GUIA", sap.ui.model.FilterOperator.Contains, sValue);
            var oBinding = oEvt.getSource().getBinding("items");
            oBinding.filter([oFilter], "Application");
        },
        handleSearch2: function (oEvt) {
            var sValue = oEvt.getParameter("value");
            var oFilter = new sap.ui.model.Filter("MAKTX", sap.ui.model.FilterOperator.Contains, sValue);
            var oFilter2 = new sap.ui.model.Filter("MATNR", sap.ui.model.FilterOperator.Contains, sValue);
            var oBinding = oEvt.getSource().getBinding("items");
            oBinding.filter(new sap.ui.model.Filter([oFilter, oFilter2], false));
            //oBinding.filter([oFilter], "Application");
        },
        handleClose21: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts.length) {
                var valor = aContexts.map(function (oContext) {
                    return oContext.getObject().MATNR;
                }).join(", ");
                var productInput = sap.ui.getCore().byId("producto");
                productInput.setValue(valor);
            }
            oEvent.getSource().getBinding("items").filter([]);

        },
        handleClose2: function (oEvent) {
            sap.ui.core.BusyIndicator.show(0);
            var aContexts = oEvent.getParameter("selectedContexts");
            console.log(aContexts.length);

            if (aContexts.length) {
                var valor = aContexts.map(function (oContext) {
                    return oContext.getObject().MATNR;
                }).join(", ");
                console.log(valor);
                var valorPaleta = aContexts.map(function (oContext) {
                    return oContext.getObject().UMREZ.toString();
                }).join(", ");
                console.log(valorPaleta);
                var MAKTX = aContexts.map(function (oContext) {
                    return oContext.getObject().MAKTX.toString();
                }).join(", ");
                console.log(MAKTX);
                if (valorPaleta !== "0") {
                    var productInput = sap.ui.getCore().byId("producto");
                    productInput.setValue(valor);
                    var paletaInput = sap.ui.getCore().byId("paleta");
                    paletaInput.setValue(valorPaleta);
                    var materiaTxt = sap.ui.getCore().byId("descripcionP");
                    materiaTxt.setValue(MAKTX);
                    console.log(valor.substr(3, 2));
                    if (valor.substr(3, 2) === "PA") {

                        sap.ui.getCore().byId("idLabelPallet").setVisible(true);
                        sap.ui.getCore().byId("skynet").setVisible(true);
                        sap.ui.getCore().byId("skynet").setValue("");
                        sap.ui.getCore().byId("idLabelEsp1").setWidth("4%");
                        sap.ui.getCore().byId("idLabelEsp2").setWidth("4%");
                    } else {
                        sap.ui.getCore().byId("idLabelPallet").setVisible(false);
                        sap.ui.getCore().byId("skynet").setVisible(false);
                        sap.ui.getCore().byId("skynet").setValue("");
                        sap.ui.getCore().byId("idLabelEsp1").setWidth("52%");
                        sap.ui.getCore().byId("idLabelEsp2").setWidth("52%");
                    }
                    var codigo = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPGR-" + this.FECHA + "-" + this.WERKS + "--" + this.MODULO +
                        "----" + this.PARTNER + "--" + valor + "')/$value";
                    var codigo2 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPVIA-" + this.FECHA + "-" + this.WERKS + "--" + this.MODULO +
                        "----" + this.PARTNER + "-" + this.CLIENTE + "-" + valor + "')/$value";
                    var codigo4 = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPGV-" + this.FECHA + "-" + this.WERKS + "--" + this.MODULO +
                        "----" + this.PARTNER + "-" + this.CLIENTE + "-" + valor + "')/$value";
                    //   var codigo = "/sap/opu/odata/sap/ZPPGW_FIORI_GUIA_SRV/GETSet('CPGR-23.08.2018-1401--186----0000100003-TTFAR01001')/$value";
                    //  console.log(codigo);
                    console.log(codigo4);
                    var oModel = new sap.ui.model.json.JSONModel(codigo);
                    var oModel2 = new sap.ui.model.json.JSONModel(codigo2);
                    var oModel4 = new sap.ui.model.json.JSONModel(codigo4);
                    /*     oModel.attachRequestCompleted(function() {
                           try {
                             var cont = oModel.getProperty("/ITAB");
                             var MESSAGE = oModel.getProperty("/ITAB/0/MESSAGE");
                             console.log(cont);
                             console.log(MESSAGE);
                             var GUIA = oModel.getProperty("/ITAB/0/GUIA");
                             var FECCOS = oModel.getProperty("/ITAB/0/FECCOS");

                             if (MESSAGE === undefined || MESSAGE === null) {
                               sap.ui.getCore().byId("cosecha").setValue(FECCOS);
                               sap.ui.getCore().byId("guia2").setValue(GUIA);
                             }else{
                              sap.ui.getCore().byId("cosecha").setValue("");
                               sap.ui.getCore().byId("guia2").setValue("");
                             }
                             oModel2.attachRequestCompleted(function() {
                               try {
                                 var cont = oModel2.getProperty("/ITAB");
                                 var MESSAGE2 = oModel2.getProperty("/ITAB/0/MESSAGE");
                                 console.log(cont);
                                 console.log(MESSAGE);
                                 var VIAJE = oModel2.getProperty("/ITAB/0/VIAJE");
                                 var PEDIDO = oModel2.getProperty("/ITAB/0/PEDIDO");
                                 var mensajeMostrar2 = "";
                                 if (MESSAGE2 === undefined || MESSAGE2 === null) {
                                   sap.ui.getCore().byId("viaje").setValue(VIAJE + "-" + PEDIDO);
                                   sap.ui.core.BusyIndicator.hide();
                                 } else {
                                   mensajeMostrar2 = "x";
                                 }
                                 if (MESSAGE !== undefined && MESSAGE !== null) {
                                   if (mensajeMostrar2 === "x") {
                                     MESSAGE = MESSAGE2 + " " + MESSAGE;
                                     sap.ui.getCore().byId("viaje").setValue("");
                                   }

                                   var dialog = new sap.m.Dialog({
                                     title: 'Alerta',
                                     type: 'Message',
                                     state: 'Warning',
                                     content: new sap.m.Text({
                                       text: MESSAGE
                                     }),
                                     beginButton: new sap.m.Button({
                                       text: 'Aceptar',
                                       type: 'Emphasized',
                                       press: function() {
                                         dialog.close();
                                       }
                                     }),
                                     afterClose: function() {
                                       dialog.destroy();
                                     }
                                   });
                                   dialog.open();
                                   sap.ui.core.BusyIndicator.hide();
                                 } else if (mensajeMostrar2 === "x") {
                                   sap.ui.getCore().byId("viaje").setValue("");
                                   var dialog = new sap.m.Dialog({
                                     title: 'Alerta',
                                     type: 'Message',
                                     state: 'Warning',
                                     content: new sap.m.Text({
                                       text: MESSAGE2
                                     }),
                                     beginButton: new sap.m.Button({
                                       text: 'Aceptar',
                                       type: 'Emphasized',
                                       press: function() {
                                         dialog.close();
                                       }
                                     }),
                                     afterClose: function() {
                                       dialog.destroy();
                                     }
                                   });
                                   dialog.open();
                                   sap.ui.core.BusyIndicator.hide();
                                 }
                               } catch (err) {

                                 sap.ui.core.BusyIndicator.hide();
                               }
                             });
                           } catch (err) {

                             sap.ui.core.BusyIndicator.hide();
                           }
                         });*/
                    oModel4.attachRequestCompleted(function () {
                        try {
                            console.log(oModel4.getJSON());
                            var GUIAS = oModel4.getProperty("/ITAB/0/GUIAS");
                            console.log(GUIAS);

                            var VIAJES = oModel4.getProperty("/ITAB/0/VIAJES");
                            var Mensaje = "";
                            if (GUIAS.length === 0 && VIAJES.length === 0) {
                                sap.ui.getCore().byId("cosecha").setValue("");
                                sap.ui.getCore().byId("guia2").setValue("");
                                sap.ui.getCore().byId("viaje").setValue("");
                                Mensaje = "Error, no se encontraron viajes. No se encontraron guias."
                            } else if (GUIAS.length === 0) {
                                sap.ui.getCore().byId("cosecha").setValue("");
                                sap.ui.getCore().byId("guia2").setValue("");
                                Mensaje = "No se encontraron guias.";
                            } else if (VIAJES.length === 0) {
                                Mensaje = "Error, no se encontraron viajes. ";
                                sap.ui.getCore().byId("viaje").setValue("");

                            }
                            if (Mensaje !== "") {
                                var dialog = new sap.m.Dialog({
                                    title: 'Alerta',
                                    type: 'Message',
                                    state: 'Warning',
                                    content: new sap.m.Text({
                                        text: Mensaje
                                    }),
                                    beginButton: new sap.m.Button({
                                        text: 'Aceptar',
                                        type: 'Emphasized',
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();
                                sap.ui.core.BusyIndicator.hide();
                            } else {
                                if (GUIAS.length !== 0 && VIAJES.length !== 0) {
                                    var GUIA = oModel4.getProperty("/ITAB/0/GUIAS/0/GUIA");
                                    var FECCOS = oModel4.getProperty("/ITAB/0/GUIAS/0/FECCOS");
                                    var VIAJE = oModel4.getProperty("/ITAB/0/VIAJES/0/VIAJE");
                                    var PEDIDO = oModel4.getProperty("/ITAB/0/VIAJES/0/PEDIDO");
                                    sap.ui.getCore().byId("viaje").setValue(VIAJE + "-" + PEDIDO);
                                    sap.ui.getCore().byId("cosecha").setValue(FECCOS);
                                    sap.ui.getCore().byId("guia2").setValue(GUIA);
                                } else if (VIAJES.length === 0) {
                                    var GUIA = oModel4.getProperty("/ITAB/0/GUIAS/0/GUIA");
                                    var FECCOS = oModel4.getProperty("/ITAB/0/GUIAS/0/FECCOS");
                                    sap.ui.getCore().byId("viaje").setValue("");
                                    sap.ui.getCore().byId("cosecha").setValue(FECCOS);
                                    sap.ui.getCore().byId("guia2").setValue(GUIA);
                                } else {
                                    var VIAJE = oModel4.getProperty("/ITAB/0/VIAJES/0/VIAJE");
                                    var PEDIDO = oModel4.getProperty("/ITAB/0/VIAJES/0/PEDIDO");
                                    sap.ui.getCore().byId("viaje").setValue(VIAJE + "-" + PEDIDO);
                                    sap.ui.getCore().byId("cosecha").setValue("");
                                    sap.ui.getCore().byId("guia2").setValue("");
                                }
                                sap.ui.core.BusyIndicator.hide();
                            }
                        } catch (err) {
                            console.log(err);
                            sap.ui.core.BusyIndicator.hide();
                        }

                    });

                } else {
                    sap.m.MessageToast.show("El producto seleccionado (" + valor + ") tiene un valor de paleta de 0");
                    sap.ui.core.BusyIndicator.hide();
                }
            }
            oEvent.getSource().getBinding("items").filter([]);

        },
        handleFilterCamion: function (valor) {
            var texto = valor.getSource().getValue();
            var oFilter;
            var orFilter = [];
            oFilter = new sap.ui.model.Filter("VBELN", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("GUIA", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            var oBinding = this.getView().byId("idProductsTable").getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(orFilter, false), "Application");
        },
        handleFilterRecibir: function (valor) {
            var texto = valor.getSource().getValue();
            var oFilter;
            var orFilter = [];
            oFilter = new sap.ui.model.Filter("VBELN", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("GUIA", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            var oBinding = this.getView().byId("idCamConfTable").getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(orFilter, false), "Application");
        },
        handleFilterStage: function (valor) {
            var texto = valor.getSource().getValue();
            var oFilter;
            var orFilter = [];
            oFilter = new sap.ui.model.Filter("VBELN", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("GUIA", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            var oBinding = this.getView().byId("idGuiaTable").getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(orFilter, false), "Application");
        },
        handleFilterStatusGuia: function (valor) {
            var texto = valor.getSource().getValue();
            var oFilter;
            var orFilter = [];
            oFilter = new sap.ui.model.Filter("GUIA", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("TXT_EMP", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            var oBinding = this.getView().byId("idStatusGuiaTable").getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(orFilter, false), "Application");
        },
        handleFilterAlmacenar: function (valor) {
            var texto = valor.getSource().getValue();
            var oFilter;
            var orFilter = [];

            oFilter = new sap.ui.model.Filter("GUIA", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            var oBinding = this.getView().byId("idStageTable").getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(orFilter, false), "Application");
        },
        handleFilterBins: function (valor) {
            var texto = valor.getSource().getValue();
            var oFilter;
            var orFilter = [];

            oFilter = new sap.ui.model.Filter("GUIA", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            var oBinding = this.getView().byId("idBinsTable").getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(orFilter, false), "Application");
        },
        handleFilterCrear: function (valor) {
            var texto = valor.getSource().getValue();
            var oFilter;
            var orFilter = [];

            oFilter = new sap.ui.model.Filter("TXT_EMP", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("MODULO", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            var oBinding = this.getView().byId("idPaletTable").getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(orFilter, false), "Application");
        },
        handleFilterRemontar: function (valor) {
            var texto = valor.getSource().getValue();
            var oFilter;
            var orFilter = [];

            oFilter = new sap.ui.model.Filter("EXIDV2", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("MATNR", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            oFilter = new sap.ui.model.Filter("SONUM", sap.ui.model.FilterOperator.Contains, texto.toString());
            orFilter.push(oFilter);
            var oBinding = this.getView().byId("idRemotTable").getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(orFilter, false), "Application");
        },

        btnLogOffPress: function () {
            //INI TKT 8000022030
            var sUrl = location.pathname + location.search;
            var sFinURL = "&sap-ui-language=ES&sap-ui-xx-devmode=true";
            var posicion = sUrl.indexOf(sFinURL);
            if (posicion == -1){
                sUrl = sUrl + sFinURL;
            }
            //FIN TKT 8000022030

            $.ajax({
                type: "GET",
                url: "/sap/public/bc/icf/logoff", //Clear SSO cookies: SAP Provided service to do that
            }).done(function (data) { //Now clear the authentication header stored in the browser
                console.log(data);

                if (!document.execCommand("ClearAuthenticationCache")) {
                    //"ClearAuthenticationCache" will work only for IE. Below code for other browsers
                    console.log("LLEGO");
                    //sap.m.URLHelper.redirect("logout.html", false);
                    $.ajax({
                        //TKT 8000022030
                        //url: "/sap/bc/ui5_ui5/sap/zpackingmovil/webapp/index.html?sap-client=100&sap-ui-language=ES&sap-ui-xx-devmode=true", //any URL to a Gateway service

                        type: "GET",
                        url: sUrl,  //TKT 8000022030
                        username: 'dummy', //dummy credentials: when request fails, will clear the authentication header
                        password: 'dummy',
                        statusCode: {
                            401: function () {
                                //This empty handler function will prevent authentication pop-up in chrome/firefox
                                console.log("LLEGO1");
                                var dialog = new sap.m.Dialog({
                                    title: 'Sesión',
                                    type: 'Message',
                                    state: 'Success',
                                    content: new sap.m.Text({
                                        text: 'Se ha cerrado Sesión.'
                                    }),
                                    beginButton: new sap.m.Button({
                                        text: 'Aceptar',
                                        type: 'Emphasized',
                                        press: function () {
                                            //sap.m.URLHelper.redirect("logout.html", false);
                                            location.reload();
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();
                            }
                        },
                        error: function () {
                            //alert('reached error of wrong username password')
                            console.log("LLEGO2");
                        }
                    });
                }
            })
        },
        ...LogicaSeleccionarCentro

    });

});