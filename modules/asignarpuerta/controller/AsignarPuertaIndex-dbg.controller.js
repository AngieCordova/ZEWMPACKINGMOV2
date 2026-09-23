sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function(Controller, formatter, JSONModel, MensajesObject) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.asignarpuerta.controller.AsignarPuertaIndex", {

        formatter: formatter,
        dataBus: {},
        _PuertaAsignada: false,
        _ForzarPuerta: false,

        onAfterRendering: function() {},

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "AsignarPuertaView", this._busSuscribe, this);

            var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0006_SRV");

            this.getView().setModel(oData, "ZEWM_0006");
            /*------GE 2024-11-26-----*/
            var oView = this.getView();
            var oTable = oView.byId("table-lista_transportes_asignar_puerta");
            var oBinding = oTable.getBinding("items");
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oFilter = new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro);

            // Apply the filter to the table's binding
            oBinding.filter([oFilter]);
            /*------GE 2024-11-26-----*/
            
          //MatchCode puertas
           //   oView.getModel("mBusy").setProperty("/iniciar", true);
            this.recuperarPuertas();            
           //   oView.getModel("mBusy").setProperty("/iniciar", false);
           //SC - Fin
            
            
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        cerrarModalAsignarPuerta: function() {
            this._Fragmento.close();
            this._Fragmento.destroy();
            delete this._Fragmento;
            this._ForzarPuerta = false;
        },

        onSelectItem: function(oEvent) {
            var oView = this.getView();
            var nombre_fragmento = "AvocadoProyecto.AvocadoProyecto.modules.asignarpuerta.fragments.AsignarModal";

            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("ZEWM_0006");
            var sObject = oBinding.getObject();

            if (sObject.Puerta) this._PuertaAsignada = sObject.Puerta;

            this._ForzarPuerta = false;

            var oModelCabecera = new JSONModel(sObject);
            oView.setModel(oModelCabecera, "mCABECERA");

            try {
                this._Fragmento = sap.ui.xmlfragment(nombre_fragmento, this);
            } catch (e) {
                debugger
            }

            oView.addDependent(this._Fragmento);

            this._Fragmento.attachAfterClose(this.cerrarModalAsignarPuerta.bind(this));
            this._Fragmento.open();
        },

        onCerrarMatchcodePuerta: function() {
            this._FragmentoMatchCodePuerta.destroy();
        },

        onFiltarMatchcodePuerta: function(oEvent) {
            var oSource = oEvent.getSource();
            var sValue = oEvent.getParameter("value");
            var oCampos = oSource.getId().split("-");
            var oCampo = oCampos.shift();
            var oCampoDos = oCampos.shift();
            var oFiltros = new Array();

            oFiltros.push(
                new sap.ui.model.Filter(oCampo, sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter(oCampoDos, sap.ui.model.FilterOperator.Contains, sValue)
            );

            var oBinding = oSource.getBinding("items");
            oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },

        onConfirmarSeleccionMatchcodePuerta: async function(oEvent) {
        	
            var oItem = oEvent.getParameter("selectedItem");   
            var oSelected = oItem.getTitle();
            var oDescrip = oItem.getDescription();

            if (this._PuertaAsignada) {
                var sMensaje = "EL contenedor ya tiene una puerta asignada, desea reemplazarla?"
                var oResponse = await MensajesObject._MensajeConfirmacion(sMensaje, "warning");
                if (!oResponse) {
                    this.onCerrarMatchcodePuerta();
                    return;
                } else {
                    this._ForzarPuerta = true;
                }
            }

            if (this.InputMatchcodePuerta) {
                this.InputMatchcodePuerta.setValueState("None");
                this.InputMatchcodePuerta.setValue(oSelected);
            }

            this._PuertaAsignada = false;

            this.onCerrarMatchcodePuerta();
        },

        onComprobarReemplazoPuerta: async function(oEvent) {
            var oSource = oEvent.getSource();

            if (this._PuertaAsignada) {
                var sMensaje = "EL contenedor ya tiene una puerta asignada, desea reemplazarla?"
                var oResponse = await MensajesObject._MensajeConfirmacion(sMensaje, "warning");
                if (!oResponse) {
                    oSource.setValue(this._PuertaAsignada);
                    return;
                } else {
                    this._ForzarPuerta = true;
                }
            }

            this._PuertaAsignada = false;
        },

        onAbrirMatchcodePuerta: function(oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();

            this.InputMatchcodePuerta = oSource;

            var nombre_fragmento = "AvocadoProyecto.AvocadoProyecto.modules.asignarpuerta.fragments.matchcodes.AyudaPuerta";

            try {
                this._FragmentoMatchCodePuerta = sap.ui.xmlfragment(nombre_fragmento, this);
            } catch (e) {
                debugger
                return;
            }

            oView.addDependent(this._FragmentoMatchCodePuerta);

            this._FragmentoMatchCodePuerta.open();
        },

        guardarPuerta: function() {
            var oView = this.getView();
            var oModel = oView.getModel("mCABECERA");
            var oModelOdata = this.getView().getModel("ZEWM_0006");
            var oToken = oModelOdata.getHeaders()["x-csrf-token"];
            var oTableListadoTransportes = oView.byId("table-lista_transportes_asignar_puerta");
            const THAT = this;
            
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;  //SCH-Proyecto Guatemala
            var sIdPuerta = oModel.getProperty("/Puerta");
            sIdPuerta = sIdPuerta ? sIdPuerta : "";

            var oJson = {
                "IdPedido": oModel.getProperty("/IdPedido"),
                "IdTransporte": oModel.getProperty("/IdTransporte"),
                "Ubicacion": oModel.getProperty("/Ubicacion"),
                "IdContenedor": oModel.getProperty("/IdContenedor"),
                "IdPuerta": sIdPuerta,
                "Cliente": oModel.getProperty("/IdCliente"),
                "Booking": oModel.getProperty("/Booking"),
                "FlgForzarPuertaDif": "",
                "I_WERKS": sCentro                              //SCH-Proyecto Guatemala
            }

            if (this._ForzarPuerta) {
                oJson.FlgForzarPuertaDif = "X";
            }

            var oUrl = `/sap/opu/odata/sap/ZEWM_0006_SRV/PuertaSet(IdPedido='${oModel.getProperty("/IdPedido")}',IdTransporte='${oModel.getProperty("/IdTransporte")}')`;

            sap.ui.core.BusyIndicator.show();

            $.ajax({
                type: "PUT",
                url: oUrl,
                data: JSON.stringify(oJson),
                dataType: 'json',
                async: true,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "X-Requested-With": "XMLHttpRequest",
                    "DataServiceVersion": "2.0",
                    "X-CSRF-Token": oToken
                },
                success: function(data, header) {
                    sap.ui.core.BusyIndicator.hide();
                    MensajesObject._MensajeExito("Contenedor actualizado.");
                    oTableListadoTransportes.destroyItems();
                    oTableListadoTransportes.getBinding("items").refresh(true);
                    THAT.cerrarModalAsignarPuerta();
                },
                error: function(data, header) {

                    sap.ui.core.BusyIndicator.hide();
                    var oMensajeError = "Ocurrio un error en el servidor.";
                    try {
                        var oDetallesError = data.responseJSON.error.innererror.errordetails;
                        if (oDetallesError.length > 0) {
                            oMensajeError = "";
                            oDetallesError.forEach(error => {
                                if (!error.message.includes("Internal error occurred, contact your system administrator")) {
                                    oMensajeError += error.message + "\n";
                                }
                            });
                        }
                    } catch (e) {
                        //
                    }
                    MensajesObject._MensajeError(oMensajeError);
                }
            });
        },
        
      //Inicio SCH-Proyecto Guatemala
        recuperarPuertas: async function() {
        	const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oView = this.getView();
            // 
            var oData = oView.getModel("ZEWM_0006");
            
            var oFiltros = new Array(
                     new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)
                  );

               var oResponse = await new Promise(resolve => {
                 oData.read("/PuertaMcSet", {
                 	 filters: oFiltros,
                    "success": function(response, header) {
                        var oResponse = [];
                        try {
                        	               oResponse = response.results;
                        } catch (e) {
                            oResponse = [];
                        }
                        resolve(oResponse);
                    },
                   "error": function(error) {
                        resolve([]);
                    }
                });
              });

            oView.setModel(new JSONModel(oResponse), "mAyudaPuertas");
            return true;
        }
        //Fin SCH-Proyecto Guatemala
        
    });
});