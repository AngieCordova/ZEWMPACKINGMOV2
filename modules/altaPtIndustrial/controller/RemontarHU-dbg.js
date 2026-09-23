sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "./MensajesObject",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(JSONModel, MensajesObject, Filter, FilterOperator) {
    "use strict";

    return {

        onAbrirRemontarHU: async function(oEvent) {
            var oView = this.getView();

            var oInputCentro = oView.byId("input-filter_centro"); //esta en la primera pantalla de filtros
            var sIdCentro = oInputCentro.getValue().trim();

            if (!sIdCentro) {
                MensajesObject._MensajeAdvertencia("Debe seleccionar primero un centro");
                return;
            }
            oView.setModel(new JSONModel({}), "oRemonte");           


            var sNombre = "RemontarHU";
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

            oView.getModel("mBusy").setProperty("/iniciar", true);

            //await this.recuperarAlmacen();
            //await this.recuperarAlmacenesDestino();

            oView.getModel("mBusy").setProperty("/iniciar", false);
            let aRemonteDisp=this.getView().getModel("mListaPrincipal").getData()
            
            this.getView().setModel(new JSONModel(aRemonteDisp),"mListaRemonte")
            this.getView().setModel(new JSONModel([]),"HUDisp");
            this._Fragmento[sNombre].open();
        },
        onSelectPalletRemontar: function(oEvent) {
            var oSource = oEvent.getSource();
            var oSelected = oSource.getSelected();
            var oFila = oSource.getParent();
            var oCells = oFila.getCells();
            var oInputCantidad = oCells[7];

            oInputCantidad.setEnabled(oSelected);
        },
        noSuperaMaximo:function(evt){
        	let oSource= evt.getSource();
        	let cabRem=this.getView().getModel("oRemonte").getData();
        	let pesoTotal = parseFloat(cabRem.PesoTotal);
        	let peso= parseFloat(cabRem.Peso);
        	let aRemonteDet = this.getView().getModel("mListaRemonte").getData();
        	let oFila= oSource.getBindingContext("mListaRemonte").getObject();
        	const objetosFiltrados = aRemonteDet.filter(objeto => objeto.Check === true && objeto.IdLote !== oFila.IdLote);
        	const sumaList = objetosFiltrados.reduce((acumulador, objeto) => acumulador + parseFloat(objeto.Peso), 0);
        	let total = peso + sumaList + parseFloat(oSource.getValue())
        	if(total > pesoTotal){
        		
        		 sap.m.MessageToast.show("La cantidad no puede superar el Maximo de peso total.");
                 oSource.setValue("");
                 return
        	}
        },
        getPalletRemonte: async function(evt){
        	
        	 var oView = this.getView();
             var oData = oView.getModel("ZEWM_0011");
             let oValue= evt.getSource().getValue();
             if(!oValue){
            	 return;
             }
             var oInputCentro = oView.byId("input-filter_centro"); //esta en la primera pantalla de filtros
             var sIdCentro = oInputCentro.getValue().trim();
             
             var oFiltros = new Array(
                    new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sIdCentro),
                    new sap.ui.model.Filter("I_ID2", sap.ui.model.FilterOperator.EQ, oValue)
             );
             let sUrl = "/PalletRemontarSet(I_ID2='" + oValue + "',I_WERKS='" + sIdCentro+"')"
             var oResponse = await new Promise(resolve => {
                 oData.read(sUrl, {
                    // filters: oFiltros,
                     "success": async function(response, header) {                    
                         resolve(response);
                     },
                     "error": function(error) {                      
                         resolve({});
                     }
                 });
             });

             oView.getModel("oRemonte").setData(oResponse);
             oView.getModel("oRemonte").refresh();
             
        },   

        	
        onRemontarPallets:function(){
        	
        	let aRemonteDet = this.getView().getModel("mListaRemonte").getData();
        	let objetosFiltrados = aRemonteDet.filter(objeto => objeto.Check === true && objeto.Peso);
        	let aHUDisp=this.getView().getModel("HUDisp").getData()
        	let aHUDetalle=aHUDisp.concat(objetosFiltrados);
        	this.getView().setModel(new JSONModel(aHUDetalle),"HUDisp");
        	
        	//// Eliminar HU Seleccionados
        	let aHuNoSel = aRemonteDet.filter(objeto => !objeto.Peso);
        	this.getView().setModel(new JSONModel(aHuNoSel),"mListaRemonte");
        }, 
       


        onGuardarRemonteHu: async function() {
            var oView = this.getView();
            var oModel = oView.getModel("HUDisp");
            var oLista = oModel.getData();
            let THAT =this;
            let cabRem= this.getView().getModel("oRemonte").getData();
            if (oLista.length == 0) {
                MensajesObject._MensajeAdvertencia("No hay HU asignadas para el remonte");
                return;
            } 
            
            if(!cabRem.I_ID2){
            	MensajesObject._MensajeError("Ingresar ID2");
                return;
            }
            
            var oInputImpresora = sap.ui.getCore().byId("input-impresora_remontar_pallets");
            var sImpresora = oInputImpresora.getValue();
            
            if (!sImpresora) {
                MensajesObject._MensajeError("Seleccione una impresora");
                return;
            }
            
            
            
            var oInputCentro = oView.byId("input-filter_centro"); //esta en la primera pantalla de filtros
            var sIdCentro = oInputCentro.getValue().trim();


            var sUrl = "/CabRemonteSet";
           
            var oJson = {
                 "I_ID2": cabRem.I_ID2,
                 "IdAlmacen": oLista[0].IdAlmacen,
                 "IdCentro": sIdCentro,
                 "Comentario": cabRem.Comentario,
                 "IdImpresora": sImpresora,
                 "N_Cab_TO_DetRemonte" : []
             }
                        
            oLista.forEach(hu => {
                var obj = {
                    "I_ID2": cabRem.I_ID2,
                    "IdLote": hu.IdLote,
                    "Cantidad":hu.Peso
                }
           

                oJson.N_Cab_TO_DetRemonte.push(obj);
            });

            var oData = oView.getModel("ZEWM_0011");
            oView.getModel("mBusy").setProperty("/iniciar", true);

            var oResponse = await new Promise(resolve => {
                oData.create(sUrl, oJson, {
                    "success": async function(response, header) {           
                    	  sap.ui.core.BusyIndicator.hide();
                          var sMessage = "";
                          try {                             
                              var oSuccess = JSON.parse(header.headers["sap-message"]);
                              sMessage = oSuccess.message + "\n";
                              if (oSuccess.details.length > 0) {
                                  oSuccess.details.forEach(d => {
                                      sMessage += d.message + "\n";
                                  });
                              }
                          } catch (e) {
                              sMessage = "Se proceso el remonte correctamente";
                          }
                        await MensajesObject._MensajeExito(sMessage);                       
                        resolve(true);
                    },
                    "error": async function(oError) {
                    	  sap.ui.core.BusyIndicator.hide();
                          try {
                              if (oError.responseText) {
                                  var oErrorJson = JSON.parse(oError.responseText);
                                  var oErrorObject = oErrorJson.error;
                                  if (oErrorObject) {
                                      var oMessage = "";
                                      var oInnerError = oErrorObject.innererror;

                                      if (oInnerError) {
                                          var oDetallesErrores = oInnerError.errordetails;
                                          if (oDetallesErrores.length > 0) {
                                              oDetallesErrores.forEach(detalle => {
                                                  oMessage += '- ' + detalle.message + '\n';
                                              });
                                          }
                                      }

                                      if (!oMessage) {
                                          var oErrorMessage = oErrorObject.message;
                                          if (oErrorMessage) {
                                              oMessage += '- ' + oErrorMessage.value + '\n';
                                          }
                                      }

                                      await MensajesObject._MensajeError(oMessage);
                                  }
                              }
                          } catch (e) {
                        	  await MensajesObject._MensajeError("Ha ocurrido un error");
                          }
                        
                        resolve(false);
                    }
                });
            });

            oView.getModel("mBusy").setProperty("/iniciar", false);

            if (!oResponse) return;

            oModel.setData([]);
            oModel.refresh(true);
            THAT.onCerrarFragmento('RemontarHU');    
            THAT.onBuscar();
        },
        
        onFiltrarTablaPrincipal: function (oEvent) {
        	var oView = this.getView();       
        	var oTable = sap.ui.getCore().byId("table-lista_pallets_remontar");        
        	var binding = oTable.getBinding("items");
        	
            var oSource = oEvent.getSource();
            var oValue = oSource.getValue();

              var oFiltros = new Array(
            	   new sap.ui.model.Filter("Guia", sap.ui.model.FilterOperator.Contains, oValue),	  
                   new sap.ui.model.Filter("EmpresaAgricola", sap.ui.model.FilterOperator.Contains, oValue),
                   new sap.ui.model.Filter("Modulo", sap.ui.model.FilterOperator.Contains, oValue),
                   new sap.ui.model.Filter("Variedad", sap.ui.model.FilterOperator.Contains, oValue),
                   new sap.ui.model.Filter("IdLote", sap.ui.model.FilterOperator.Contains, oValue)
                   );
               
                
               binding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        },
        
        onAbrirAyudaBusquedaImpresora: function (oEvent) {
            var oView = this.getView();
            var sNombreFragmento = "AyudaGrupoImpresora";
             var sPath = "AvocadoProyecto.AvocadoProyecto.modules.altaPtIndustrial.fragments.matchcodes." + sNombreFragmento;                                                         

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
         }

    }
});