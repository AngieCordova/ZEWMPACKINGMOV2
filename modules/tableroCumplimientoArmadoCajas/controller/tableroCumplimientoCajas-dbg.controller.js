sap.ui.define([
        'sap/m/MessageBox',
        "sap/ui/core/mvc/Controller",
        "../model/formatter",
        'sap/ui/core/Fragment',
        'sap/ui/model/json/JSONModel',
        'sap/m/ColumnListItem',
        'sap/m/Label',
        'sap/m/Token',
        'sap/ui/core/Fragment',
        "sap/ui/unified/Calendar",
        'sap/ui/unified/DateRange'
    ],

    /**
     * 
     * @param {typeof sap.m.MessageBox} MessageBox 
     * @param {typeof sap.ui.core.mvc.Controller } Controller  
     * @param {typeof sap.ui.core.Fragment} Fragment 
     * @param {typeof sap.ui.unified.Calendar} Calendar
     * @returns 
     */

    function(MessageBox, Controller, formatter, Fragment, JSONModel, Calendar, DateRange) {
        "use strict";

        return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.tableroCumplimientoArmadoCajas.controller.tableroCumplimientoCajas", {

            oView: new Object(),
            idMasterDialog: "tableroCumplimientoCajasFragment",
            _localFragmento: new Object(),
            _Fragmento: new Object(),
            formatter: formatter,
            _oDestinosModel: new sap.ui.model.json.JSONModel(),
            scope: {},
            selectedRowMC: '',
            initDialog: function(othat) {
                this.oView = othat;
            },

            onCreateMasterDialog: function() {
                var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0033_SRV", { "useBatch": false });
                this.oView.getView().setModel(oModelService, "service");              
                this.oView.getView().setModel(new sap.ui.model.json.JSONModel(), "constantes");
                this.onModelFiltro();
                
            },

            onAfterCloseMasterDialog: function() {
               
                this.oView.getView().setModel(null, "service");
                this.oView.getView().setModel(null, "scopeTPR");
                this.oView.getView().setModel(null, "posTPR");
                this.onModelFiltro();
                this.oView.closeSplitDialogRouter(this.idMasterDialog, function() { console.log('cerrado'); });
            },
            onModelFiltro:function(){
            	this.oView.getView().setModel(new sap.ui.model.json.JSONModel({}), "filtro");
            },
            onCloseMasterDialog: function() {
                this.oView._Fragmento[this.idMasterDialog].close();
            },

            //-------------------------------------------------------------------
            onShowResumenSemana: function() {
                this.scope = {
                    'activeGuardar': false,
                };
                var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
                this.oView.getView().setModel(oModelScope, "scopeZF");
                this.onOpenDialog('resumenCajasSemana', 'AvocadoProyecto.AvocadoProyecto.modules.tableroCumplimientoArmadoCajas.fragments.resumenCajasSemana');
                this.onLoadFilters();
                this.onModelFiltro();
                this.onModelCumplimientoCajas();
                    //this.onLoadDestino();
            },
            onGetService: function(entity,filters=[]){
            	var othat = this;
            	return new Promise(function (resolve, reject) {
            		 var oModelService = othat.oView.getView().getModel('service');
                     oModelService.read("/"+entity, {
                          filters: filters,
                          success: function(result, response) {
                       	   	  resolve(result)
                             
                          },
                          error: function(error) {
                        	  reject(error)
                          }
                     })

    			});
            },
            onLoadYears: function(){
            	var othat = this;
            	sap.ui.core.BusyIndicator.show();
            	this.onGetService("filteryearSet").then(function (result) {
            		var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.oView.getView().setModel(oModel, "Years");
            	}).catch(function (oError) {
            		console.log(oError);
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
            },
            onLoadVkorg: function(){
            	var othat = this;
            	sap.ui.core.BusyIndicator.show();
            	this.onGetService("filtervkorgSet").then(function (result) {
            		var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.oView.getView().setModel(oModel, "Vkorg");
            	}).catch(function (oError) {
            		console.log(oError);
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
            },
            onLoadSemana: function(){
            	var othat = this;
            	sap.ui.core.BusyIndicator.show();
            	this.onGetService("filtersemanaSet").then(function (result) {
            		var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.oView.getView().setModel(oModel, "Semana");
            	}).catch(function (oError) {
            		console.log(oError);
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
            },
            onLoadClase: function(){
            	var othat = this;
            	sap.ui.core.BusyIndicator.show();
            	this.onGetService("filterclaseSet").then(function (result) {
            		var oModel = new sap.ui.model.json.JSONModel(result);
            		oModel.setSizeLimit(9999);
                    othat.oView.getView().setModel(oModel, "Clase");
            	}).catch(function (oError) {
            		console.log(oError);
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
            },
            onLoadCultivo: function(){
            	var othat = this;
            	sap.ui.core.BusyIndicator.show();
            	this.onGetService("filtercultivoSet").then(function (result) {
            		var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.oView.getView().setModel(oModel, "Cultivo");
            	}).catch(function (oError) {
            		console.log(oError);
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
            },
            onLoadVariedad: function(){
            	var othat = this;
            	sap.ui.core.BusyIndicator.show();
            	this.onGetService("filtervariedadSet").then(function (result) {
            		var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.oView.getView().setModel(oModel, "Variedad");
            	}).catch(function (oError) {
            		console.log(oError);
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
            },
            onLoadFormato: function(){
            	var othat = this;
            	let filters=[];
            	const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            	filters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, sCentro))
            	sap.ui.core.BusyIndicator.show();
            	this.onGetService("filterformatoSet",filters).then(function (result) {
            		var oModel = new sap.ui.model.json.JSONModel(result);
                    othat.oView.getView().setModel(oModel, "Formato");
            	}).catch(function (oError) {
            		console.log(oError);
                }).finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
            },
            onLoadStatus: function(){
	        	var othat = this;
	        	sap.ui.core.BusyIndicator.show();
	        	this.onGetService("filterstatusSet").then(function (result) {
	        		var oModel = new sap.ui.model.json.JSONModel(result);
	                othat.oView.getView().setModel(oModel, "Status");
	        	}).catch(function (oError) {
	        		console.log(oError);
	            }).finally(function () {
	                sap.ui.core.BusyIndicator.hide();
	            });
            },
            
            handleCleanFilter:function(){
            	
            	this.onModelFiltro();
            },
            
            onLoadFilters:function(){
            	
            	this.onLoadYears();
            	this.onLoadVkorg();
            	this.onLoadSemana();
            	this.onLoadClase();
            	this.onLoadCultivo();
            	this.onLoadVariedad();
            	this.onLoadStatus();
            	this.onLoadFormato();
            	
            },
            
            onFiltrarTabla: function(oEvent) {
                var oSource = oEvent.getSource();
                var oValue = oSource.getValue();
                var oTable = oSource.getParent().getParent();
                var binding = oTable.getBinding("items");

                var oFiltros = new Array(
                    new sap.ui.model.Filter("Tipo", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Pallfaltan", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Requerido", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Producido", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Poravance", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Avanceorder", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Armado", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Cajfaltan", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Stocksegper", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Stockseg", sap.ui.model.FilterOperator.Contains, oValue) 
      
                );                
      
               
                binding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
            },
            
            onFilterCumplimientoCajas:function(){
            	
            	let filtro = this.oView.getView().getModel("filtro").getData();
            	let filters=[];
            	var othat = this;
            	const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            	filters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, sCentro))
            	if(filtro.Vkorg){
            		filters.push(new sap.ui.model.Filter("Vkorg", sap.ui.model.FilterOperator.EQ, filtro.Vkorg))
            	}
            	if(filtro.ZzYear){
            		filters.push(new sap.ui.model.Filter("ZzYear", sap.ui.model.FilterOperator.EQ, filtro.ZzYear))
            	}
            	if(filtro.Semana){
            		filters.push(new sap.ui.model.Filter("Semana", sap.ui.model.FilterOperator.EQ, filtro.Semana))            		
            	}
            	if(filtro.Clase){
            		filters.push(new sap.ui.model.Filter("Clase", sap.ui.model.FilterOperator.EQ, filtro.Clase))            		
            	}
            	if(filtro.Cultivo){
            		filters.push(new sap.ui.model.Filter("Codigo", sap.ui.model.FilterOperator.EQ, filtro.Cultivo))            		
            	}
            	if(filtro.Formato){
            		filters.push(new sap.ui.model.Filter("Tipo", sap.ui.model.FilterOperator.EQ, filtro.Formato))            		
            	}
           
            	
            	
	        	sap.ui.core.BusyIndicator.show();
	        	this.onGetService("cumpackboxSet",filters).then(function (result) {
	        		
	        		/// Total
	        		var totalReq = result.results.reduce(function (total, item) {
	        	        return total + parseFloat(item.Pallfaltan);
	        	      }, 0);
	        		var totalProdu = result.results.reduce(function (total, item) {
	        	        return total + parseFloat(item.Cajfaltan);
	        	      }, 0);
	        		var totalStock = result.results.reduce(function (total, item) {
	        	        return total + parseFloat(item.Avanceorder);
	        	      }, 0);
	        		var totalAlmArm = result.results.reduce(function (total, item) {
	        	        return total + parseFloat(item.Requerido);
	        	      }, 0);
	        		var totalAlmGen = result.results.reduce(function (total, item) {
	        	        return total + parseFloat(item.Producido);
	        	      }, 0);
	        		var totalCumpl = result.results.reduce(function (total, item) {
	        	        return total + parseFloat(item.Poravance);
	        	      }, 0);
	        		var totalArm = result.results.reduce(function (total, item) {
	        	        return total + parseFloat(item.Armado);
	        	      }, 0);
	        		var totalStockSeg = result.results.reduce(function (total, item) {
	        	        return total + parseFloat(item.Stockseg);
	        	      }, 0);
	        		var totalStockSegPer = result.results.reduce(function (total, item) {
	        	        return total + parseFloat(item.Stocksegper);
	        	      }, 0);
	        		result.totalReq = totalReq.toFixed(3);
	        		result.totalProdu= totalProdu.toFixed(3);
	        		result.totalStock= totalStock.toFixed(3);
	        		result.totalAlmArm = totalAlmArm .toFixed(3);
	        		result.totalAlmGen = totalAlmGen.toFixed(3);
	        		result.totalCumpl= totalCumpl.toFixed(3);
	        		result.totalArm= totalArm.toFixed(3);
	        		result.totalStockSeg= totalStockSeg.toFixed(3);
	        		result.totalStockPer= totalStockSegPer.toFixed(3);
	        		
	        		var oModel = new sap.ui.model.json.JSONModel(result);
	                othat.oView.getView().setModel(oModel, "CumplimientoCajas");
	        	}).catch(function (oError) {
	        		console.log(oError);
	            }).finally(function () {
	                sap.ui.core.BusyIndicator.hide();
	            });
            		
            },
    
            onModelCumplimientoCajas:function(){
            	var othat = this;
            	var oModel = new sap.ui.model.json.JSONModel({results:[]});
                othat.oView.getView().setModel(oModel, "CumplimientoCajas");
            },
            onShowCuadroDiario: function() {
                this.oView.getView().setModel(oModelScope, "scopeZF");
                this.onOpenDialog('cuadroDiarioStockSeguridad', 'AvocadoProyecto.AvocadoProyecto.modules.tableroCumplimientoArmadoCajas.fragments.cuadroDiarioStockSeguridad');
                this.scope = {
                    'activeGuardar': false,
                    'fechaEntregaMinDate': new Date(),
                };
                var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
                this.oView.getView().setModel(oModelScope, "scopeZF");
                this.onLoadFilters();
                this.onModelFiltro();
                this.onModelCumplimientoCajas();
            },            
      
            //--------------------------------------------------------------------
              
            onOpenDialog: function(id, path, callback = function() {}) {
                if (id == "") return;
                if (path == "") return;
                var othat = this;
                if (!othat._localFragmento[id]) {
                    othat._localFragmento[id] = {};
                    othat._localFragmento[id].fragment = sap.ui.xmlfragment(othat.oView.getView().getId(), path, othat);
                    othat.oView.getView().addDependent(othat._localFragmento[id].fragment);
                    othat._localFragmento[id].callback = callback;
                }
                othat._localFragmento[id].fragment.open();
            },

            onAfterCloseDialog: function(id) {
                if (this._localFragmento[id] && this._localFragmento[id].fragment) {
                    this._localFragmento[id].fragment.destroy();
                    this._localFragmento[id].callback();
                    delete this._localFragmento[id];
                }
            },

            onCloseDialog: function(id) {
                if (this._localFragmento[id] && this._localFragmento[id].fragment) this._localFragmento[id].fragment.close();
            },

  

        });
    });