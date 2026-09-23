sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject",
    "sap/m/MessageToast"
], function(Controller, formatter, JSONModel, MensajesObject, MessageToast) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.ProcesoInicioFinEnfriamiento.controller.GuadarProcesoEnfriamiento", {

        formatter: formatter,
        dataBus: {},
        _QueCasoEs: false,
       
        onAfterRendering: async function() {
            var oView = this.getView();
            var campos = {
                "EnabledTunel": false,
                "EnabledProceso": false,
                "EnabledBachada": false,
                "EnabledTempAmbiente": false,
                "EnabledTempSetPoint": false,
                "EnabledFecha": false,
                "EnabledCheckboxSensor": false,
                "VisibleBotonGuardar": false
            }

            //MODIFICACIONES FIORI 23-02-2023 - BEGIN
            campos.EnabledNroAirixa = false;
            campos.EnabledObservaciones = false;
            campos.EnabledTurnos = false;
            //MODIFICACIONES FIORI 23-02-2023 - END


            var model = new JSONModel(campos);
            oView.setModel(model, "mCampos");
            oView.getModel("mCampos").refresh(true);
        },

        onInit: async function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            await bus.subscribe("splitApp", "GuadarProcesoEnfriamientoView", this._busSuscribe, this);

            try {
                var oView = this.getView();

                var oTable = oView.byId("table-lista_detalle_proceso_enfriamiento");
                var oDataService = oView.getModel("ZEWM_0023");
                var oModel = oView.getModel("mCabecera");
                oModel.refresh(true);


                var sTunel = oModel.getProperty("/Tunel");
                var sAccion = oModel.getProperty("/Accion");
                var sEstado = oModel.getProperty("/Estado");
                //DG - Incidente 6 - Inicio
                const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
                //DG - Incidente 6 - Fin  
                
                var sUrl = "/DetalleTunelSet";
                var obj = {
                    "Tunel": sTunel,
                    "Estado": sEstado,
                    "Accion": sAccion,
                    //DG - Incidente 6 - Inicio                    
                    "Werks": sCentro,
                    //DG - Incidente 6 - Fin                       
                    "TunelToDetalle": []
                }

                var oResponse = await new Promise(resolve => {
                    oDataService.create(sUrl, obj, {
                        "success": function(response, header) {
                            try {
                            	//SCH-Inicio-Proyecto Guatemala
                               // response.TunelToDetalle.results.forEach(e => e.Sensor = e.Sensor == "X");
                                 response.TunelToDetalle.results.forEach(e => {    
                                	var zero = "0";
                                	var length = e.PaletId.toString().length;
                                	e.Sensor  = e.Sensor == "X";
                                	e.PaletId = (zero.repeat(20-length)) + e.PaletId; });
                            	//SCH-Fin-Proyecto Guatemala                                
                            } catch (error_response) {
                                debugger
                            }                            
                            resolve(response);
                        },
                        "error": function(response) {
                            resolve(false);
                        }
                    });
                });

                oTable.setBusy(false);

                if (oResponse) {
                    const convert_num = (function(num){
                        try {
                            var val = num.replace(",",".");
                        } catch (error) {
                            var val;
                        }
                        val = Number(num);
                        val = isNaN(val) ? 0 : val;
                        return val;
                    });

                    //MODIFICACIONES FIORI 23-02-2023 - BEGIN
                    oResponse.NroAirixa = oResponse.NroProcesoAirixa;
                    oResponse.Observaciones = oResponse.Observacion;
                    oResponse.Turno = convert_num(oResponse.Turno);
                    //MODIFICACIONES FIORI 23-02-2023 - END

                    oResponse.TempAmb = convert_num(oResponse.TempAmb);
                    oResponse.TempSetPoint = convert_num(oResponse.TempSetPoint);
                    oResponse.TunelToDetalle = oResponse.TunelToDetalle.results;
                    Object.keys(oResponse).forEach(key => {
                        oModel.setProperty("/" + key, oResponse[key]);
                    });
                    oModel.refresh(true);
                    var sFechaProduccion = oResponse.FechaProduccion;
                    oModel.setProperty("/FechaProduccionOriginal", sFechaProduccion);
                }
            } catch (error) {
                debugger
            }

            this.onComprobarCasos();
        },

        onComprobarTemp: function(oEvent)
        {
            var oSource = oEvent.getSource();
            var sValue = oSource.getValue();

            var value = Number(sValue);
            var is_nan = isNaN(value);
            
            //REQ012  Ajustes Semaforización permitir números negativos
            //var invalido = is_nan || value < 0 || value > 99; 
            var invalido = is_nan ||  value > 99 ||  value < -99;
            if(invalido) {
                oSource.setValue("");
                return;
            }

            if(sValue.length > 5){
                oSource.setValue( sValue.substring(0,5) );
            }
            
            if(sValue !== "" && sValue !== "0" && sValue !== "0.0" && sValue !== "-0" && sValue !== "-0.0" && sValue !== "-0,0"){ //REQ012  Ajustes Semaforización
              sValue = parseFloat( sValue ).toFixed(2);            
              oSource.setValue( Number(sValue) );
            }
        },

        onComprobarCasos: function() {
            var oView = this.getView();
            var oModel = oView.getModel("mCampos");

            var mCabeceraModel = oView.getModel("mCabecera");

            var sTunel = mCabeceraModel.getProperty("/Tunel");
            var sAccion = mCabeceraModel.getProperty("/Accion");
            var sEstado = mCabeceraModel.getProperty("/Estado");

//MODIFICACIONES FIORI 23-02-2023 - BEGIN
            let enabled_ProcAirixa = false;
            let enabled_Observaciones = false;
            let enabled_Turnos = false;
            //MODIFICACIONES FIORI 23-02-2023 - END

            var enabled_Tunel = false;
            var enabled_Proceso = false;
            var enabled_Bachada = false;
            var enabled_TempAmbiente = false;
            var enabled_TempSetPoint = false;
            var enabled_Fecha = false;
            var enabled_CheckboxSensor = false;
            var visible_BotonGuardar = false;

            var caso_uno = sTunel && sEstado == "P" && sAccion == "I";
            var caso_dos = sTunel && sEstado == "A" && sAccion == "F";

            //Solo importa el caso uno y dos

            if (caso_uno) {
                this._QueCasoEs = 1;
                //MODIFICACIONES FIORI 23-02-2023 - BEGIN
               enabled_ProcAirixa = true;
                enabled_Observaciones = true;
                enabled_Turnos = true;
                //MODIFICACIONES FIORI 23-02-2023 - END
                enabled_TempAmbiente = true;
                enabled_TempSetPoint = true;
                enabled_Fecha = true;
                enabled_CheckboxSensor = true;
                visible_BotonGuardar = true;
            } else if (caso_dos) {
                this._QueCasoEs = 2;
                visible_BotonGuardar = true;
            }

            //MODIFICACIONES FIORI 23-02-2023 - BEGIN
            oModel.setProperty("/EnabledNroAirixa", enabled_ProcAirixa);
            oModel.setProperty("/EnabledObservaciones", enabled_Observaciones);
            oModel.setProperty("/EnabledTurnos", enabled_Turnos);
            //MODIFICACIONES FIORI 23-02-2023 - END

            oModel.setProperty("/EnabledTunel", enabled_Tunel);
            oModel.setProperty("/EnabledProceso", enabled_Proceso);
            oModel.setProperty("/EnabledBachada", enabled_Bachada);
            oModel.setProperty("/EnabledTempAmbiente", enabled_TempAmbiente);
            oModel.setProperty("/EnabledTempSetPoint", enabled_TempSetPoint);
            oModel.setProperty("/EnabledFecha", enabled_Fecha);
            oModel.setProperty("/EnabledCheckboxSensor", enabled_CheckboxSensor);
            oModel.setProperty("/VisibleBotonGuardar", visible_BotonGuardar);
            
          //SCH
            if (enabled_Fecha){
              mCabeceraModel.setProperty("/TempAmb", "");
              mCabeceraModel.setProperty("/TempSetPoint", "");
            }
            
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
            return true;
        },

        onVolverListado: function() {
            var oViewId = "ProcesoInicioFinEnfriamientoView";
            var oPathView = "AvocadoProyecto.AvocadoProyecto.modules.ProcesoInicioFinEnfriamiento.view.Index";
            this.dataBus.oView.oController.onSplitRouter(oViewId, oPathView, 40);
            this.getView().destroy();
        },

        onCalcularDuracion: async function(oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mCabecera");
            try {
                var oSource = oEvent.getSource();
                var value = oSource.getValue();
                var fecha = new Date(value);
                fecha.setHours(23);
                fecha.setMinutes(59);
                fecha.setSeconds(59);
                var agregar = fecha.getDate() + 1;
                fecha.setDate(agregar);

                var hoy = new Date();
                
                //SCH        
                var FechaSelec = new Date(this.byId("date-fecha_produccion").mProperties.dateValue); //Fecha sin minutos
                var today = new Date();
                var ayer = new Date(new Date().setDate(new Date().getDate() + -1));
                
                if(fecha < ayer || FechaSelec  > today ) {             
                  var fechaProd = oModel.getProperty("/FechaProduccionOriginal");
                  var anio = fechaProd.substring(0, 4);
                    var mes = fechaProd.substring(4, 6);
                    var dia = fechaProd.substring(6, 8);

                  MensajesObject._MensajeError("Fecha de producción seleccionada no válida");

                  oModel.setProperty("/FechaProduccion", (dia + "." + mes + "." + anio));
                  return;
                } 
                //fin SCH
                  
                var diasDif = fecha.getTime() - hoy.getTime();
                var horas = Math.round(diasDif/(1000 * 60 * 60));
                oModel.setProperty("/DuracionCalculada", horas);
            } catch (error) {
                //
            }
            try {
                var oDataService = oView.getModel("ZEWM_0023");
                var oModel = oView.getModel("mCabecera");
                oModel.setProperty("/Bachada", "");
                oModel.setProperty("/Proceso", "");
                oModel.refresh(true);

                var sTunel = oModel.getProperty("/Tunel");
                var date_to_string = value.split("-").join("");
                var fecha_invalida = fecha == "Invalid Date";
                
                //SCH - Inicio
                const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
                //SCH - Fin

               // var sUrl = `/ProcesoBachadaSet(ITunel='${sTunel}',IFechaProduccion='${date_to_string}')`;
                var sUrl = `/ProcesoBachadaSet(ITunel='${sTunel}',IFechaProduccion='${date_to_string}',I_WERK='${sCentro}')`;

                oView.byId("date-fecha_produccion").setBusy(true);
                oView.byId("btn-guardar").setBusy(true);

                var oResponse = await new Promise(resolve => {
                    oDataService.read(sUrl, {
                        "success": function(response, header) {
                            try {
                                resolve( response );
                            } catch (error_response) {
                                resolve(false);
                            }
                            resolve(response);
                        },
                        "error": function(response) {
                            debugger
                            resolve(false);
                        }
                    });
                });
                
                oView.byId("date-fecha_produccion").setBusy(false);
                oView.byId("btn-guardar").setBusy(false);

                if (oResponse) {
                    oModel.setProperty("/Bachada", oResponse.EBachada);
                    oModel.setProperty("/Proceso", oResponse.EProceso);
                    oModel.refresh(true);
                }
            } catch (error) {
                debugger
            }
        },

        onGuardar: async function() {
            var oView = this.getView();
            var oModel = oView.getModel("mCabecera");
            var oLista = oModel.getProperty("/TunelToDetalle");

            if(this._QueCasoEs == 1) {
              if(!oLista){
                  MensajesObject._MensajeError("No hay sensores marcados");
                  return;
              }

              var no_hay_sensores_marcados = oLista.some( e => e.Sensor ) ? false : true;
              if(no_hay_sensores_marcados){
                  MensajesObject._MensajeError("No hay sensores marcados");
                  return;
              }
              
              // SCH if(!oModel.getProperty("/TempAmb")){
              if(oModel.getProperty("/TempAmb") == ''){
                  MensajesObject._MensajeError("Debe ingresar un valor de temperatura ambiente");
                  return;
              }

              //MODIFICACIONES FIORI 23-02-2023 - BEGIN
                if(oModel.getProperty("/NroAirixa") == ''){
                  MensajesObject._MensajeError("Debe ingresar un valor de Nro Airixa");
                  return;
              }

                if(oModel.getProperty("/Turno") == ''){
                  MensajesObject._MensajeError("Debe escoger un turno");
                  return;
              }
              //MODIFICACIONES FIORI 23-02-2023 - END

              //SCH if(!oModel.getProperty("/TempSetPoint")){
              if(oModel.getProperty("/TempSetPoint") == ''){
                  MensajesObject._MensajeError("Debe ingresar un valor de temperatura de salida de aire");
                  return;
              }

              if(!oModel.getProperty("/FechaProduccion")){
                  MensajesObject._MensajeError("La fecha es obligatoria");
                  return;
              }
            }
              
         var sFechaProduccion = oModel.getProperty("/FechaProduccion");
         var sFechaOriginal   = oModel.getProperty("/FechaProduccionOriginal");

         if(sFechaOriginal) {
           if(sFechaProduccion.split("-").join("") != sFechaOriginal){
             var sMensaje = "Se cambiara la fecha de producción propuesta. \n Está seguro?"
                 var sTipoMensaje = "warning";
                 var response = await MensajesObject._MensajeConfirmacion(sMensaje, sTipoMensaje);
                 if(!response) return;
             }
         }

            
            
            var sMensaje = "Se finalizará el proceso de enfriamiento. \n Está seguro?";
            if(this._QueCasoEs == 1) sMensaje = "Se iniciara el proceso de enfriamiento. \n Está seguro?"
            var sTipoMensaje = "warning";
            var response = await MensajesObject._MensajeConfirmacion(sMensaje, sTipoMensaje);

            if(!response) return;

            var oDateNow = new Date();
           
            var h = oDateNow.getHours();
            var m = oDateNow.getMinutes();
            var s = oDateNow.getSeconds();

            if(h < 10) h = "0" + String(h);
            if(m < 10) m = "0" + String(m);
            if(s < 10) s = "0" + String(s);
            
            var sTimeNow =  String(h) + String(m) + String(s);
            //var sDateNow = oDateNow.toISOString().split("T").shift().split("-").join(".");            
            
            var day   =  String(oDateNow.getDate()).length == 1 ? "0" + oDateNow.getDate():oDateNow.getDate() ; 
            var month =  oDateNow.getMonth() + 1; // los meses comienzan con 0
                month = String(month).length == 1 ? "0" + month: month;                
            var year  =  oDateNow.getFullYear();
            
            var sDateNow = `${year}.${month}.${day}`;
           
            if(sFechaProduccion.includes("-")){
                sFechaProduccion = sFechaProduccion.split("-").join(".");
            } else {
                var anio = sFechaProduccion.substring(0,4);
                var mes = sFechaProduccion.substring(4,6);
                var dia = sFechaProduccion.substring(6,8);
                sFechaProduccion = `${anio}.${mes}.${dia}`;
            }

            oView.setBusy(true);
            
            //SCH - Inicio
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            //SCH - Fin

            var oDataService = oView.getModel("ZEWM_0023");
            var sUrl = "/CabeceraEnfriamientoSet";

            var sTunel = oModel.getProperty("/Tunel");
            var sEstado = oModel.getProperty("/Estado");
            var sAccion = oModel.getProperty("/Accion");
            var sProceso = oModel.getProperty("/Proceso");
            var sBachada = oModel.getProperty("/Bachada");
            var sDuracion = oModel.getProperty("/Duracion");

            var obj = {
                "Tunel"   : sTunel,
                "Estado"  : sEstado,
                "Accion"  : sAccion,
                "Proceso" : sProceso,
                "Bachada" : sBachada,
                "FechaProduccion": sFechaProduccion,
                "FechaInicio"    : sDateNow,
                "HoraInicio"     : sTimeNow,
                "Duracion"       : sDuracion,
                "TempAmb"        : oModel.getProperty("/TempAmb"),
                "TempSetPoint"   : oModel.getProperty("/TempSetPoint"),
                "I_WERKS"        : sCentro,                              //SCH
                "CabToPos" : []
            }

            //MODIFICACIONES FIORI 23-02-2023 - BEGIN
            obj.NroProcesoAirixa = oModel.getProperty("/NroAirixa");
            obj.Observacion = oModel.getProperty("/Observaciones");
            obj.Turno = Number(oModel.getProperty("/Turno"));
            //MODIFICACIONES FIORI 23-02-2023 - END

            var sMENSAJE_EXITO = "Proceso de enfriamiento iniciado correctamente";  
            if(this._QueCasoEs == 1) {
                oLista.forEach( e => {
                    var agregar = {}
                    agregar["Tunel"] = sTunel;
                    agregar["HuSap"] = e.HuSap;
                    agregar["PaletId"] = e.PaletId;
                    agregar["Envase"] = e.Envase;
                    agregar["CantidadCajas"] = e.CantidadCajas;
                    agregar["UbicacionEwm"] = e.UbicacionEwm;
                    agregar["Sensor"] = e.Sensor ? "X" : "";
                    obj.CabToPos.push(agregar);
                });
            } else {
                sMENSAJE_EXITO = "Proceso de enfriamiento finalizado correctamente";
                var sHoraInicio = oModel.getProperty("/HoraInicio");
                var sFechaInicio = oModel.getProperty("/FechaInicio");
                
                var anio = sFechaInicio.substring(0,4);
                var mes = sFechaInicio.substring(4,6);
                var dia = sFechaInicio.substring(6,8);
                sFechaInicio = `${anio}.${mes}.${dia}`;

                var fecha_completa_iniciada = new Date(sFechaInicio.split(".").join("/") );
                var hora_i = sHoraInicio.substring(0,2);
                var minutos_i = sHoraInicio.substring(2,4);
                var segundos_i = sHoraInicio.substring(4,6);
                fecha_completa_iniciada.setHours(hora_i);
                fecha_completa_iniciada.setMinutes(minutos_i);
                fecha_completa_iniciada.setSeconds(segundos_i);
                
                try {
                    var hora = sTimeNow.substring(0,2);
                    var minutos = sTimeNow.substring(2,4);
                    var segundos = sTimeNow.substring(4,6);

                    oDateNow.setHours(hora);
                    oDateNow.setMinutes(minutos);
                    oDateNow.setSeconds(segundos);

                    var diferencia = oDateNow.getTime() - fecha_completa_iniciada.getTime();
                    
                    var horas = Math.round(diferencia/(1000 * 60 * 60));

                    var sDuracionCalculada = horas >= 0 ? horas : ( horas * -1);
                } catch (error) {
                    var sDuracionCalculada = 0;
                }
                obj.Duracion = sDuracionCalculada;
                obj.TempAmb = "0";
                obj.TempSetPoint = "0";
                obj.FechaInicio = "";
                obj.HoraInicio  = "";
                obj.FechaFin = sDateNow;
                obj.HoraFin  = sTimeNow;
            }

            var lista_vacia = obj.CabToPos.length == 0;
            if(lista_vacia) {
                obj.CabToPos.push({"Tunel": sTunel});
            }

            var oResponse = await new Promise(resolve => {
                oDataService.create(sUrl, obj, {
                    "success": async function(response, header){
                        await MensajesObject._MensajeExito( sMENSAJE_EXITO );
                        resolve(true);
                    },
                    "error": function(response){
                        var sMensaje = "Ocurrió un error"
                        try {
                            sMensaje = JSON.parse(response.responseText).error.message.value;
                            try {
                                var detalles = JSON.parse(response.responseText).error.innererror.errordetails;
                                if(detalles.length > 0){
                                    detalles.forEach( d => {
                                        sMensaje += d + "\n";
                                    });
                                }
                            } catch (error) {
                                //
                            }
                        } catch (error) {
                            var sMensaje = "Ocurrió un error"
                        }
                        MensajesObject._MensajeError( sMensaje );
                        resolve(false);
                    }
                });
            });

            oView.setBusy(false);

            if(oResponse) {
                this.onVolverListado();
            }
        }
    });
});