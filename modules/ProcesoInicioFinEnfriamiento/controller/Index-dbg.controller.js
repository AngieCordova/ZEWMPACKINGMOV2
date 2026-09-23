sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject",
    "sap/m/MessageToast"
], function(Controller, formatter, JSONModel, MensajesObject, MessageToast) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.ProcesoInicioFinEnfriamiento.controller.Index", {

        formatter: formatter,
        dataBus: {},
        _Fragmento: false,
        _FragmentoAyuda: new Object(),

        onAfterRendering: function() {},

        onInit: async function() {
            // Se crea la suscripción al canal
            var oView = this.getView();
            var bus = sap.ui.getCore().getEventBus();
            await bus.subscribe("splitApp", "ProcesoInicioFinEnfriamientoView", this._busSuscribe, this);

            try {
                var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0023_SRV/");
                oView.setModel(oData, "ZEWM_0023");
            } catch (error) {
                MensajesObject._MensajeError("Ocurrio un error al cargar el odata");
            }

            var oTable = oView.byId("table-lista_procesamiento_enfriamiento");
            var oBinding = oTable.getBinding("items");
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oFilter = new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro);

            // Apply the filter to the table's binding
            oBinding.filter([oFilter]);
            oTable.attachUpdateFinished(this.onTablaActualizada.bind(this));
        },

        /**
         * @param {String} sUrl 
         * @param {Array} aFilters 
         */
        _Read: async function(sUrl = "", aFilters = []) {
            var oView = this.getView();
            var oDataService = oView.getModel("ZEWM_0022");
            return new Promise(resolve => {
                oDataService.read(sUrl, {
                    filters: aFilters,
                    "success": function(response, header) {
                        resolve(response);
                    },
                    "error": function(response) {
                        resolve(false);
                    }
                });
            });
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
            return true;
        },

        onPressInicion: function() {
            try {
                this.dataBus.oView.oController.onPressInicion();
                this.getView().destroy();
            } catch (error) {
                debugger
                this.getView().destroy();
            }
        },

        onCerrarModal: function() {
            this._Fragmento.close();
            this._Fragmento.destroy();
            delete this._Fragmento;
            this.onPressInicion();
        },

        onTablaActualizada: function(oEvent) {
            var oTable = oEvent.getSource();
            oTable.setBusy(false);         
            var oItems = oTable.getItems();
            oItems.forEach((row, index) => {
                var oCells = row.getCells();
                var oInput = oCells[6];
                var oBinding = oInput.getBindingContext("ZEWM_0023");
                var object = oBinding.getObject();

                var umbral_uno = Number(object.Umbral1);
                var umbral_dos = Number(object.Umbral2);
                var sHoraInicio = object.HoraInicio;
                var sFecha = object.FechaInicio;

                var campos_vacios = !sHoraInicio && !sFecha;

                var value = oInput.getValue();
                value = Number(value);
                value = isNaN(value) ? 0 : value;

                var color = "";
                if (value == 0 && campos_vacios) {
                    oInput.setVisible(false);
                    return;
                }

                try {
                    var anio = sFecha.substring(0,4);
                    var mes = sFecha.substring(4,6);
                    var dia = sFecha.substring(6,8);
                    var fecha_response = `${anio}/${mes}/${dia}`;
                    var hora = sHoraInicio.substring(0,2);
                    var minutos = sHoraInicio.substring(2,4);
                    var segundos = sHoraInicio.substring(4,6);
                    var fecha = new Date(fecha_response);
                    fecha.setHours(hora);
                    fecha.setMinutes(minutos);
                    fecha.setSeconds(segundos);

                    var fecha_hoy = new Date();
                    var diferencia = fecha_hoy.getTime() - fecha.getTime();

                    if(isNaN(diferencia)) diferencia = 0;

                    if(diferencia < 0) {
                        diferencia = diferencia * -1;
                    }
                    
                    var minutos = Math.floor((diferencia / (1000 * 60)) % 60);
                    // var horas = Math.round(diferencia/(1000 * 60 * 60 * 60));
                    // var horas = Math.floor((diferencia % 86400000) / 3600000);
                    var horas = Math.floor((diferencia / (1000 * 60 * 60)));
                   
                    
                    //var horas = Math.round(diferencia / (1000 * 60 * 60));
                    //var minutos = Math.round(diferencia / (1000 * 60 * 24));
                    
                    if(minutos < 10) minutos = "0" + minutos;
                    if(horas < 10) horas = "0" + horas;

                    value = horas >= 0 ? horas : ( horas * -1);
                } catch (error) {
                    value = 0;
                }

                if (value <= umbral_uno) {
                    color = "FondoVerdeRedondeado";
                } else if (value > umbral_uno && value <= umbral_dos) {
                    color = "FondoAmarilloRedondeado";
                } else if (value > umbral_dos) {
                    color = "FondoRojoRedondeado";
                }
                
                oInput.setValue( `${value}:${minutos}` );

                oInput.addStyleClass(color);
            });
        },

        onActualizarTabla: function(oEvent) {
            try {
                var oSource = oEvent.getSource();
                var oToolbar = oSource.getParent();
                var oTable   = oToolbar.getParent();
                var oBinding = oTable.getBinding("items");
                const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
                var oFilter = new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro);
                // Apply the filter to the table's binding
                oBinding.filter([oFilter]);
                oBinding.refresh();
            } catch (error) {
                debugger
            }
        },

        onCheckInRow: function(oEvent) {
            var oSource = oEvent.getSource();
            var oRowParent = oSource.getParent();

            const is_selected = oSource.getSelected();

            var oContextSelected = oSource.getBindingContext("ZEWM_0023");
            var sPathSelected = oContextSelected.getPath();

            var oTable = oRowParent.getParent();
            var oItems = oTable.getItems();

            oItems.forEach((row, index) => {
                var sPath = row.getBindingContextPath();
                var es_fila_seleccionada = sPath == sPathSelected;

                var oCells = row.getCells();
                var oCheckbox = oCells[0];
                var oInicioBtn = oCells[3];
                var oFinBtn = oCells[4];

                var habilitar = false;
                if (es_fila_seleccionada) {
                    habilitar = is_selected ? true : false;
                } else {
                    oCheckbox.setSelected(false)
                }

                oInicioBtn.setEnabled(habilitar);
                oFinBtn.setEnabled(habilitar);
            });
        },

        onIniciar: function(oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();            
            var oBinding = oSource.getBindingContext("ZEWM_0023");
            var object = oBinding.getObject();
            console.log(object);
            
            //Inicio 8000018884             
             if(object.CantPallets == "00"){
             	MensajesObject._MensajeError("Imposible continuar. El túnel no contiene Pallets");
              return;
             } 
            // Fin 8000018884
            
            var sHora = object.HoraInicio;
            var sFecha = object.FechaInicio;
            var pendiente = !sHora && !sFecha;

            var estado = "A";
            var accion = "V";

            if (pendiente) {
                estado = "P";
                accion = "I";
            }

            object.Accion = accion;
            object.Estado = estado;

            this.onSiguientePaginaGuardado(object);
        },

        onFinalizar: function(oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();            
            var oBinding = oSource.getBindingContext("ZEWM_0023");
            var object = oBinding.getObject();
            
          //Inicio 8000018884            
            if(object.CantPallets == "00"){
              MensajesObject._MensajeError("Imposible continuar. El túnel no contiene Pallets");
           	return;
            } 
          //fin 8000018884

            var sFecha = object.FechaInicio;
            var caso_fecha_activa = sFecha ? true : false;

            var estado = "P";
            var accion = "V";

            if (caso_fecha_activa) {
                estado = "A";
                accion = "F";
            }

            object.Accion = accion;
            object.Estado = estado;

            this.onSiguientePaginaGuardado(object);
        },

        onCellClick: function(oEvent) {
            var oView = this.getView();

            var oRow = oEvent.getSource();
            var oCells = oRow.getCells();
            var oCheckbox = oCells[0];
            
            //Inicio 8000018884
            if(oCells[2].mProperties.text == "00"){
              MensajesObject._MensajeError("Imposible continuar. El túnel no contiene Pallets");
              return;
            }
            //Fin 8000018884
            
            var oBinding = oRow.getBindingContext("ZEWM_0023");
            var object = oBinding.getObject();

            var estado = "P"; // fecha vacia
            var accion = "V";

            var sFecha = object.FechaInicio;
            var caso_fecha_activa = sFecha ? true : false;

            if (caso_fecha_activa) estado = "A";

            object.Accion = accion;
            object.Estado = estado;
            this.onSiguientePaginaGuardado(object);
        },

        onSiguientePaginaGuardado: function(object) {
            var oView = this.getView();
            var oDataService = oView.getModel("ZEWM_0023");

            var oViewId = "GuadarProcesoEnfriamientoView";
            var oPathView = "AvocadoProyecto.AvocadoProyecto.modules.ProcesoInicioFinEnfriamiento.view.GuadarProcesoEnfriamiento";
            this.dataBus.oView.oController.onSplitRouter(oViewId, oPathView, 41);
            this.getView().destroy();

            var oNextView = sap.ui.getCore().byId(oViewId);
            oNextView.setModel(new JSONModel(object), "mCabecera");
            oNextView.setModel(oDataService, "ZEWM_0023");
            oNextView.getModel("mCabecera").refresh(true);
        },

        onVolverAtras: function(evt) {
            var oCore = sap.ui.getCore();
            var navCon = oCore.byId("navCon");
            var oBtnVolverAtras = oCore.byId("btn-volver_atras");
            oBtnVolverAtras.setVisible(false);
            navCon.back();
        }
    });
});