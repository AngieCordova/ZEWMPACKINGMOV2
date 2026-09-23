sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function(JSONModel, MensajesObject) {
    "use strict";

    return {

        onAbrirCrearHU: async function(oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("mListaPrincipal");
            var oElement = oBinding.getObject();

            oView.getModel("mListaHUCreados").setData([]);

            var oCopyElement = new Object();

            Object.assign(oCopyElement, oElement);

            var oModel = new JSONModel(oCopyElement);
            oView.setModel(oModel, "mAlmacenarHU");

            var sNombre = "CrearHU";
            var sPath = "AvocadoProyecto.AvocadoProyecto.modules.altaPtIndustrial.fragments.";
            var sPathCompleto = sPath + sNombre;

            try {
                if (!this._Fragmento[sNombre]) {
                    this._Fragmento[sNombre] = sap.ui.xmlfragment(sPathCompleto, this);
                    oView.addDependent(this._Fragmento[sNombre]);
                }
            } catch (e) {
                debugger
            }

            await this.getDatosMatchcodeMaterialesEmbalaje();
            await this.getDatosMatchcodeTipo();

            this._Fragmento[sNombre].open();
        },

        getDatosMatchcodeMaterialesEmbalaje: async function() {
        	//SCH-Inicio-Proyecto Guatemala
        	const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
        	//SCH-Fin-Proyecto Guatemala
            var oView = this.getView();
            var oData = oView.getModel("ZEWM_0011");
            
            //SCH-Inicio-Proyecto Guatemala
            var oFiltros = new Array(
                    new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)
                );
            //SCH-Fin-Proyecto Guatemala
            oView.getModel("mBusy").setProperty("/iniciar", true);

            var oResponse = await new Promise(resolve => {
                var sUrl = "/MaterialesEmbalajeSet";
                oData.read(sUrl, {
                	//SCH-Inicio-Proyecto Guatemala
                	filters: oFiltros,
                	//SCH-Fin-Proyecto Guatemala
                    "success": function(response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": function(response, header) {
                        debugger;
                        resolve([]);
                    }
                });
            });

            oView.getModel("mBusy").setProperty("/iniciar", false);

            oView.setModel(new JSONModel(oResponse), "mAyudaMaterialesEmbalaje");
        },

        getDatosMatchcodeTipo: async function() {
            var oView = this.getView();
            var oData = oView.getModel("ZEWM_0011");

            oView.getModel("mBusy").setProperty("/iniciar", true);

            var oResponse = await new Promise(resolve => {
                var sUrl = "/TiposSet";
                oData.read(sUrl, {
                    "success": function(response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": function(response, header) {
                        debugger;
                        resolve([]);
                    }
                });
            });

            oView.getModel("mBusy").setProperty("/iniciar", false);

            oView.setModel(new JSONModel(oResponse), "mAyudaTipo");
        },

        comprobarPesoNoExcedido: function(oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mAlmacenarHU");
            var oCore = sap.ui.getCore();
            var oSource = oEvent.getSource();
            oSource.setValueState("None");
            var sValue = oSource.getValue();

            var nCharLength = sValue.length;
            var sLastChar = sValue.substring(nCharLength - 1, nCharLength);
            var bUniquePoint = sValue.split(".").length - 1 > 1 ? false : true;
            if (sLastChar == "." && bUniquePoint) return;


            var nValueIngresado = parseFloat(sValue);
            nValueIngresado = isNaN(nValueIngresado) ? 0 : nValueIngresado;

            var nCantidadMaxima = oModel.getProperty("/Cantidad");
            nCantidadMaxima = parseFloat(nCantidadMaxima);
            nCantidadMaxima = isNaN(nCantidadMaxima) ? 0 : nCantidadMaxima;

            if (nValueIngresado > nCantidadMaxima) {
                nValueIngresado = nCantidadMaxima;
            }

            oSource.setValue(nValueIngresado);
        },

        onCrearHU: async function() {
            var oCore = sap.ui.getCore();
            var oView = this.getView();
            var oModel = oView.getModel("mAlmacenarHU");
            var oHU = oModel.getData();

            var sMessage = "";
            if (!oHU.IdTipo) {
                oCore.byId("input-tipo_almacenar_hu").setValueState("Error");
                sMessage += "-Debe seleccionar un tipo \n";
            }

            if (!oHU.IdMaterialEmbalaje) {
                oCore.byId("input-material_embalaje_almacenar_hu").setValueState("Error");
                sMessage += "-Debe seleccionar un material de embalaje \n";
            }

            if (!oHU.Peso) {
                oCore.byId("input-peso_almacenar_hu").setValueState("Error");
                sMessage += "-Debe ingresar el peso \n";
            }

            if (!oHU.IdImpresora) {
                sMessage += "-Debe seleccionar una impresora \n";
            }

            if (oHU.FlgHuInputOpc) {
                if (!oHU.IdHu) {
                    sMessage += "-Debe ingresar un código de HU";
                }
            }

            if (sMessage) {
                MensajesObject._MensajeError(sMessage);
                return;
            }

            var object = {
                "IdCentro": oHU.IdCentro,
                "IdAlmacen": oHU.IdAlmacen,
                "IdMaterial": oHU.IdMaterial,
                "IdLote": oHU.IdLote,
                "Cantidad": oHU.Peso,
                "IdMaterialEmbalaje": oHU.IdMaterialEmbalaje,
                "IdTipo": oHU.IdTipo,
                "Comentario": oHU.Comentario,
                "IdHu": oHU.IdHu,
                "IdImpresora": oHU.IdImpresora
            }

            var sUrl = "/UnidadDeManipulacionSet";
            var oData = oView.getModel("ZEWM_0011");

            oView.setBusy(true);
            oCore.byId("dialog-crear_hu_alta").setBusy(true);

            var oResponse = await new Promise((resolve, reject) => {
                oData.create(sUrl, object, {
                    "success": function(response, header) {
                        resolve(response);
                    },
                    "error": function(error) {
                        MensajesObject._TratarError(error);
                        resolve(false)
                    }
                })
            });

            oView.setBusy(false);
            oCore.byId("dialog-crear_hu_alta").setBusy(false);

            if (!oResponse) return;

            var oModelCreados = oView.getModel("mListaHUCreados");
            var oLista = oModelCreados.getData();
            oLista.push(oResponse);
            oModelCreados.setData(oLista);
            oModelCreados.refresh(true);

            sap.ui.getCore().byId("input-peso_almacenar_hu").setValue("");
            sap.ui.getCore().byId("input-peso_almacenar_hu").focus();

            oModel.setProperty("/IdHu", "");
            oModel.setProperty("/Comentario", "");

            this.onBuscar();

            try {
                var nCantidadDisponible = parseFloat(oModel.getProperty("/Cantidad"));
                var nTotal = nCantidadDisponible - parseFloat(oResponse.Cantidad);
                oModel.setProperty("/Cantidad", nTotal);
            } catch (e) {
                debugger;
            }
        }

    }
});