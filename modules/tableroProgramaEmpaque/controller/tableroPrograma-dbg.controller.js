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

        return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.tableroProgramaEmpaque.controller.tableroPrograma", {

            oView: new Object(),
            idMasterDialog: "tableroProgramaFragment",
            _localFragmento: new Object(),
            _Fragmento: new Object(),
            formatter: formatter,
            sorterTable:[],
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
              this.oView.getView().setModel(new sap.ui.model.json.JSONModel({Cultivo:'PA'}), "filtro");
            },
            onCloseMasterDialog: function() {
                this.oView._Fragmento[this.idMasterDialog].close();
            },

            //-------------------------------------------------------------------
            onShowControlIngreso: function() {
                this.scope = {
                    'activeGuardar': false,
                };
                var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
                this.oView.getView().setModel(oModelScope, "scopeZF");
                this.onOpenDialog('controlProduccion', 'AvocadoProyecto.AvocadoProyecto.modules.tableroProgramaEmpaque.fragments.controlProduccion');
                this.onLoadFilters();
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
            onLoadVariedad: function(variedad = 'PA'){
              var othat = this;
              sap.ui.core.BusyIndicator.show();
              let filters=[];

              filters.push(new sap.ui.model.Filter("Codcult", sap.ui.model.FilterOperator.EQ,variedad))  
              this.onGetService("filtervariedadSet",filters).then(function (result) {
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
              sap.ui.core.BusyIndicator.show();
              this.onGetService("filterformatoSet").then(function (result) {
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
            
            onFilterModal: function(onFilterModal) {
              this.onOpenDialog('dialogFilter', 'AvocadoProyecto.AvocadoProyecto.modules.tableroProgramaEmpaque.fragments.dialogFilter');
                
            },       
            handleRangoDialogFilter: function() {               
                let oModelFiltro= this.oView.getView().getModel("filtro")
                let desde = parseInt(oModelFiltro.getProperty("/SemanaDesde"));
                let hasta = parseInt(oModelFiltro.getProperty("/SemanaHasta"));
                if(desde > hasta){
                  MessageBox.error("Rango Inválido")
                  return
                }
                let range = desde +" - " + hasta
                let filtro = this.oView.getView().getModel("filtro").setProperty("/Semana",range);
                
            },
            
            onTableSort: function(sName) {
                var othat = this;
                var oBinding = othat.oView.getView().byId("tblControlProduccion").getBinding("items");
                if (this.sorterTable[sName]) {
                    this.sorterTable[sName] = false;
                } else {
                    this.sorterTable[sName] = true;
                }
                oBinding.sort(new sap.ui.model.Sorter(sName, this.sorterTable[sName]));
            },
            onFiltrarTabla: function(oEvent) {
                var oSource = oEvent.getSource();
                var oValue = oSource.getValue();
                var oTable = oSource.getParent().getParent();
                var binding = oTable.getBinding("items");

                var oFiltros = new Array(
                    new sap.ui.model.Filter("Calibre", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("OrdenViaje", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Consignatario", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("ZzStatusConten", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Codigo", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Descripcion", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Pallfaltan", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("ClienteEtiqueta", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Producido", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Cajfaltan", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Fecprodespa", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Prioridad", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Indicacion", sap.ui.model.FilterOperator.Contains, oValue)
                );
               
                binding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");                
              /// Total
                let aIndices = binding.aIndices;
                let aDatosFiltrados = aIndices.map(i => binding.oList[i]);
            var totalCajasFal = aDatosFiltrados.reduce(function (total, item) {
                  return total + parseFloat(item.Cajfaltan);
                }, 0);
            var totalPallFal = aDatosFiltrados.reduce(function (total, item) {
                  return total + parseFloat(item.Pallfaltan);
                }, 0);
            var totalPallProd = aDatosFiltrados.reduce(function (total, item) {
                  return total + parseFloat(item.Producido);
                }, 0);
            binding.getModel().setProperty("/totalCajasFal",totalCajasFal.toFixed(3))
            binding.getModel().setProperty("/totalPallFal",totalPallFal.toFixed(3))
            binding.getModel().setProperty("/totalPallProd",totalPallProd.toFixed(3))
            },
            onChangeCultivo:function(evt){
              let variedad= evt.getSource().getSelectedKey();
              this.onLoadVariedad(variedad);

            },
            onFilterProduccion:function(){

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
              if(filtro.SemanaDesde && filtro.SemanaHasta){
                filters.push(new sap.ui.model.Filter("Semana", sap.ui.model.FilterOperator.BT, filtro.SemanaDesde,filtro.SemanaHasta))

              }
              if(filtro.Clase){
                filters.push(new sap.ui.model.Filter("Clase", sap.ui.model.FilterOperator.EQ, filtro.Clase))
              }
              if(filtro.Cultivo){
                filters.push(new sap.ui.model.Filter("Codigo", sap.ui.model.FilterOperator.EQ, filtro.Cultivo))
              }
              if(filtro.Variedad){
                filters.push(new sap.ui.model.Filter("Variedad", sap.ui.model.FilterOperator.EQ, filtro.Variedad))
              }

              if(filtro.Formato){
                filters.push(new sap.ui.model.Filter("Tipo", sap.ui.model.FilterOperator.EQ, filtro.Formato))
              }
              if(filtro.Status){
                filters.push(new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, filtro.Status))
              }




            sap.ui.core.BusyIndicator.show();
            this.onGetService("StatusEmpaqSet",filters).then(function (result) {

              var oModel = new sap.ui.model.json.JSONModel(result);

              /// Total
              var totalCajasFal = result.results.reduce(function (total, item) {
                    return total + parseFloat(item.Cajfaltan);
                  }, 0);
              var totalPallFal = result.results.reduce(function (total, item) {
                    return total + parseFloat(item.Pallfaltan);
                  }, 0);
              var totalPallProd = result.results.reduce(function (total, item) {
                    return total + parseFloat(item.Producido);
                  }, 0);
              result.totalCajasFal = totalCajasFal.toFixed(3);
              result.totalPallFal= totalPallFal.toFixed(3);
              result.totalPallProd= totalPallProd.toFixed(3);
                  othat.oView.getView().setModel(oModel, "ControlProduccion");
            }).catch(function (oError) {
              console.log(oError);
              }).finally(function () {
                  sap.ui.core.BusyIndicator.hide();
              });

            },
    
            ////// CONTROL AVANCE //////////////////
            onShowControlAvance: function() {
                this.oView.getView().setModel(oModelScope, "scopeZF");
                this.onOpenDialog('controlAvance', 'AvocadoProyecto.AvocadoProyecto.modules.tableroProgramaEmpaque.fragments.controlAvance');
                this.scope = {
                    'activeGuardar': false,
                    'activeControlAvance':false,
                    'fechaEntregaMinDate': new Date(),
                };
                var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
                this.oView.getView().setModel(oModelScope, "scopeZF");
                this.onLoadFilters();
            },
            onTableSortAvance: function(sName) {
                var othat = this;
                var oBinding = othat.oView.getView().byId("tblAvance").getBinding("items");
                if (this.sorterTable[sName]) {
                    this.sorterTable[sName] = false;
                } else {
                    this.sorterTable[sName] = true;
                }
                oBinding.sort(new sap.ui.model.Sorter(sName, this.sorterTable[sName]));
            },
            onFiltrarTablaAvance: function(oEvent) {
                var oSource = oEvent.getSource();
                var oValue = oSource.getValue();
                var oTable = oSource.getParent().getParent();
                var binding = oTable.getBinding("items");

                var oFiltros = new Array(
                    new sap.ui.model.Filter("Tipo", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Calibre", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Requerido", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Producido", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Poravance", sap.ui.model.FilterOperator.Contains, oValue)  
                );                
      
               
                binding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
            },
            onFiltrarTablaAvance2: function(oEvent) {
                var oSource = oEvent.getSource();
                var oValue = oSource.getValue();
                var oTable = oSource.getParent().getParent();
                var binding = oTable.getBinding("rows");

                var oFiltros = new Array(
                    new sap.ui.model.Filter("Field1", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Field2", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Field3", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Field4", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Field5", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Field6", sap.ui.model.FilterOperator.Contains, oValue)  
                );                
      
               
                binding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
            },           
            onFilterControlAvance:function(){

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
              if(filtro.SemanaDesde && filtro.SemanaHasta){
                filters.push(new sap.ui.model.Filter("Semana", sap.ui.model.FilterOperator.BT, filtro.SemanaDesde,filtro.SemanaHasta))

              }
              if(filtro.Clase){
                filters.push(new sap.ui.model.Filter("Clase", sap.ui.model.FilterOperator.EQ, filtro.Clase))
              }
              if(filtro.Cultivo){
                filters.push(new sap.ui.model.Filter("Codigo", sap.ui.model.FilterOperator.EQ, filtro.Cultivo))
              }
            


              this.oView.getView().getModel("scopeZF").setProperty("/activeControlAvance",true);

              this.onGetService("StatusGrafoSet",filters).then(function (result) {

              result.results[0].Poravance = (parseFloat(result.results[0].Requerido) / parseFloat(result.results[0].Producido)) * 100
                  //result.results[0].Poravance = parseFloat(result.results[0].Poravance.toFixed(2))
              var oModel = new sap.ui.model.json.JSONModel(result);
              othat.oView.getView().setModel(oModel, "GraficoAvance");
            }).catch(function (oError) {
              console.log(oError);
              }).finally(function () {
                  sap.ui.core.BusyIndicator.hide();
              });

            sap.ui.core.BusyIndicator.show();
            this.onGetService("StatusEmpT1Set",filters).then(function (result) {



              /// Total
              var totalReq = result.results.reduce(function (total, item) {
                    return total + parseFloat(item.Requerido);
                  }, 0);
              var totalProdu = result.results.reduce(function (total, item) {
                    return total + parseFloat(item.Producido);
                  }, 0);
              result.totalReq = totalReq.toFixed(3);
              result.totalProdu= totalProdu.toFixed(3);

              // Promedio
              var totalPorce = result.results.reduce(function (total, item) {
                    return total + parseFloat(item.Poravance);
                  }, 0);
              var promePorce = totalPorce / result.results.length
              result.totalPorc= promePorce.toFixed(3);
              var oModel = new sap.ui.model.json.JSONModel(result);
                  othat.oView.getView().setModel(oModel, "ControlAvance");
            }).catch(function (oError) {
              console.log(oError);
              }).finally(function () {
                  sap.ui.core.BusyIndicator.hide();
              });

            sap.ui.core.BusyIndicator.show();
            this.onGetService("StatusEmpT2Set",filters).then(function (result) {
              let cabecera = result.results;
              /// Detalle del Arbol datos
              othat.onGetService("filterordviajeSet",filters).then(function (result){
                let detalle = result.results;
                let aTree = cabecera.map(c => {
                    // Buscar los detalles que coinciden con el id de la cabecera
                    let detallesRelacionados = detalle.filter(d => d.OrdenViaje === c.OrdenViaje);
                    //Filtrar propiedades Cabecera
                    let cabeceraFiltrada = {
                            Field1: c.OrdenViaje,
                            Field2: c.Consignatario,
                            Field3: c.ZzContinente,
                            Field4: c.Fecprodespa,
                            Field5: c.Prioridad,
                            Field6: c.Poravance
                    }; 
                    // Filtrar las propiedades necesarias en los detalles 
                        let detallesFiltrados = detallesRelacionados.map(d => {
                          return { 
                            Field1: d.Solicitante,
                            Field2: d.Descripcion,
                            Field3: d.Pallfaltan,
                            Field4: d.Cajfaltan,
                            Field5: d.Prioridad,
                            Field6: d.Poravance
                          };
                        });
                    // Devolver un nuevo objeto que contiene la cabecera y los detalles
                    return { ...cabeceraFiltrada, Details: detallesFiltrados };


                });


                // Promedio
                var totalPorce = aTree.reduce(function (total, item) {
                      return total + parseFloat(item.Field6);
                    }, 0);
                var promePorce = totalPorce / aTree.length;


                // Usar un Set para obtener los continentes únicos
                var continentsSet = new Set();

                // Recorrer el array y agregar los continentes al Set
                aTree.forEach(function(value) {
                  continentsSet.add(value.Field3);
                });

                let totalResult= {
                  totalPorc: promePorce.toFixed(3),
                  countDestino: continentsSet.size

                }
                var oModel = new sap.ui.model.json.JSONModel(totalResult);
                othat.oView.getView().setModel(oModel, "TotalControlAvance2");
                var oModel = new sap.ui.model.json.JSONModel(aTree);
                    othat.oView.getView().setModel(oModel, "ControlAvance2");
              })


            }).catch(function (oError) {
              console.log(oError);
              }).finally(function () {
                  sap.ui.core.BusyIndicator.hide();
              });

            },  
            
           ////// AVANCE DIARIO
            
            onShowAvanceDiario: function() {
                this.oView.getView().setModel(oModelScope, "scopeZF");
                this.onOpenDialog('avanceDiario', 'AvocadoProyecto.AvocadoProyecto.modules.tableroProgramaEmpaque.fragments.avanceDiario');
                
                this.scope = {
                    'activeGuardar': false,
                    'fechaEntregaMinDate': new Date(),
                };
                var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
                this.oView.getView().setModel(oModelScope, "scopeZF");
                this.onLoadFilters();
                this.onModelFiltro();
                
            },
            onFiltrarTablaDiario: function(oEvent) {
                var oSource = oEvent.getSource();
                var oValue = oSource.getValue();
                var oTable = oSource.getParent().getParent();
                var binding = oTable.getBinding("rows");

                var oFiltros = new Array(
                    new sap.ui.model.Filter("Field1", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Field2", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Field3", sap.ui.model.FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Field4", sap.ui.model.FilterOperator.Contains, oValue)
             
                );             
      
                binding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
            },   
            onFilterAvanceDiario:function(){

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
              if(filtro.SemanaDesde && filtro.SemanaHasta){
                filters.push(new sap.ui.model.Filter("Semana", sap.ui.model.FilterOperator.BT, filtro.SemanaDesde,filtro.SemanaHasta))

              }
              if(filtro.Clase){
                filters.push(new sap.ui.model.Filter("Clase", sap.ui.model.FilterOperator.EQ, filtro.Clase))
              }
              if(filtro.Cultivo){
                filters.push(new sap.ui.model.Filter("Codigo", sap.ui.model.FilterOperator.EQ, filtro.Cultivo))
              }



              sap.ui.core.BusyIndicator.show();
              this.onGetService("cumpdestpalletsSet",filters).then(function (result) {

              let cabecera = result.results;
              othat.onGetService("cumpdestpallets_dSet",filters).then(function (result) {
                var oModel = new sap.ui.model.json.JSONModel(result);
                sap.ui.core.BusyIndicator.hide();
                let detalle = result.results;
                let aTree = cabecera.map(c => {
                    // Buscar los detalles que coinciden con el id de la cabecera
                    let detallesRelacionados = detalle.filter(d => d.ZzContinente === c.ZzContinente);
                    //Filtrar propiedades Cabecera
                    let cabeceraFiltrada = {
                            Field1: c.ZzContinente,
                            Field2: c.Requerido,                          
                            Field3: c.Producido,
                            Field4: c.Poravance
                    }; 
                    // Filtrar las propiedades necesarias en los detalles 
                        let detallesFiltrados = detallesRelacionados.map(d => {
                          return { 
                            Field1: d.Consignatario,
                              Field2: d.Requerido,                          
                            Field3: d.Producido,
                            Field4: d.Poravance
                          };
                        });
                    // Devolver un nuevo objeto que contiene la cabecera y los detalles
                    return { ...cabeceraFiltrada, Details: detallesFiltrados }; 
                })
                ////Total
                aTree.TotalReq = aTree.reduce(function (total, item) {
                      return total + parseFloat(item.Field2);
                   }, 0);

                aTree.TotalProd = aTree.reduce(function (total, item) {
                      return total + parseFloat(item.Field3);
                   }, 0);

                // Promedio
                var totalPorce = aTree.reduce(function (total, item) {
                      return total + parseFloat(item.Field4);
                    }, 0);
                aTree.PromPorce = (totalPorce / aTree.length).toFixed(3);
                var oModel = new sap.ui.model.json.JSONModel(aTree);     
                    othat.oView.getView().setModel(oModel, "DestinoPallets");
              })
            }).catch(function (oError) {
              console.log(oError);
              }).finally(function () {
                  sap.ui.core.BusyIndicator.hide();
              });



            sap.ui.core.BusyIndicator.show();
            this.onGetService("cumpdestordenSet",filters).then(function (result) {

              let cabecera = result.results;
              othat.onGetService("cumpdestorden_dSet",filters).then(function (result) {
                sap.ui.core.BusyIndicator.hide();
                let detalle = result.results;
                let aTree = cabecera.map(c => {
                    // Buscar los detalles que coinciden con el id de la cabecera
                    let detallesRelacionados = detalle.filter(d => d.ZzContinente === c.ZzContinente);
                    //Filtrar propiedades Cabecera
                    let cabeceraFiltrada = {
                            Field1: c.ZzContinente,
                            Field2: c.Requerido,                          
                            Field3: c.Producido,
                            Field4: c.Poravance
                    }; 
                    // Filtrar las propiedades necesarias en los detalles 
                        let detallesFiltrados = detallesRelacionados.map(d => {
                          return { 
                            Field1: d.Consignatario,
                              Field2: d.Requerido,                          
                            Field3: d.Producido,
                            Field4: d.Poravance
                          };
                        });
                    // Devolver un nuevo objeto que contiene la cabecera y los detalles
                    return { ...cabeceraFiltrada, Details: detallesFiltrados }; 
                })
                ////Total
                aTree.TotalReq = aTree.reduce(function (total, item) {
                      return total + parseFloat(item.Field2);
                   }, 0);

                aTree.TotalProd = aTree.reduce(function (total, item) {
                      return total + parseFloat(item.Field3);
                   }, 0);

                // Promedio
                var totalPorce = aTree.reduce(function (total, item) {
                      return total + parseFloat(item.Field4);
                    }, 0);
                aTree.PromPorce = totalPorce / aTree.length;
                var oModel = new sap.ui.model.json.JSONModel(aTree);     
                    othat.oView.getView().setModel(oModel, "DestinoOrders");
              })



            }).catch(function (oError) {
              console.log(oError);
              }).finally(function () {
                  sap.ui.core.BusyIndicator.hide();
              });

            sap.ui.core.BusyIndicator.show();
            this.onGetService("porcentpartdestSet",filters).then(function (result) {
              let cabecera = result.results;
              othat.onGetService("percentpartdest_dSet",filters).then(function (result) {
                sap.ui.core.BusyIndicator.hide();
                let detalle = result.results;
                let aTree = cabecera.map(c => {
                    // Buscar los detalles que coinciden con el id de la cabecera
                    let detallesRelacionados = detalle.filter(d => d.ZzContinente === c.ZzContinente);
                    //Filtrar propiedades Cabecera
                    let cabeceraFiltrada = {
                            Field1: c.ZzContinente,
                            Field2: c.Poravance
                    }; 
                    // Filtrar las propiedades necesarias en los detalles 
                        let detallesFiltrados = detallesRelacionados.map(d => {
                          return { 
                            Field1: d.Consignatario,
                            Field2: d.Poravance
                          };
                        });
                    // Devolver un nuevo objeto que contiene la cabecera y los detalles
                    return { ...cabeceraFiltrada, Details: detallesFiltrados }; 
                })

                // Promedio
                var totalPorce = aTree.reduce(function (total, item) {
                      return total + parseFloat(item.Field2);
                    }, 0);
                aTree.PromPorce = (totalPorce / aTree.length).toFixed(3);
                var oModel = new sap.ui.model.json.JSONModel(aTree);     
                    othat.oView.getView().setModel(oModel, "DestinoParticipacion");
              })
                  
            }).catch(function (oError) {
              console.log(oError);
              }).finally(function () {
                  sap.ui.core.BusyIndicator.hide();
              });

            },  
            
         

         

            onSaveSalidaZFDespachoConfirm: function() {
                if (this.byId("dpSalidaZFDespacho")) {
                    var oCalendar = this.byId("dpSalidaZFDespacho");
                    if (!oCalendar.getSelectedDates()[0]) {
                        sap.m.MessageToast.show("Debe seleccionar una fecha");
                        return;
                    }
                    var dateSlc = oCalendar.getSelectedDates()[0].getStartDate();
                    var dateSlcFormat = dateSlc.getFullYear() + (((dateSlc.getMonth() + 1) < 10) ? '0' : '') + (dateSlc.getMonth() + 1) + ((dateSlc.getDate() < 10) ? '0' : '') + dateSlc.getDate();

                    var oView = this.oView.getView();
                    var oModel = oView.getModel("RepIngresoSalidaZF");
                    var list = oModel.getData();
                    var oFound = list.results.find(function(item) {
                        return item.check == true;
                    });
                    if (!oFound) return;
                    var othat = this;
                    var data = {};
                    data = JSON.parse(JSON.stringify(oFound));
                    data.I_ACCION = "2";
                    data.FECHA_ENTREGA = dateSlcFormat;
                    delete data.UBICACION_BKP;
                    delete data.__metadata;
                    delete data.check;

                    sap.ui.core.BusyIndicator.show(0);
                    var oModelService = othat.oView.getView().getModel('service');
                    oModelService.create("/GuardarIngresoSalidaZFSet", data, {
                        success: async function(oResponse, oHeader) {
                            sap.ui.core.BusyIndicator.hide();
                            var msgError = othat._processErrorOdata(oResponse);
                            if (msgError != "") {
                                MessageBox.error(
                                    msgError, {
                                        styleClass: "sapUiSizeCompact",
                                        onClose: function(oAction) {}
                                    }
                                );
                            } else {
                                MessageBox.success(
                                    "Se ha asignado la Fecha de Entrega al contenedor correctamente", {
                                        styleClass: "sapUiSizeCompact",
                                        onClose: function(oAction) {
                                            othat.onCloseDialog('slcCalendarZF')
                                            othat.onLoadContenedores("2");
                                        }
                                    }
                                );
                            }
                        },
                        error: function(oError, oHeader) {
                            sap.ui.core.BusyIndicator.hide();
                            var msgError = othat._processErrorOdata(oError);
                            MessageBox.error(
                                msgError, {
                                    styleClass: "sapUiSizeCompact",
                                    onClose: function(oAction) {}
                                }
                            );
                        }
                    });

                } else {
                    console.log("Error al obtener la fecha");
                }
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

            //--------------------------------------------------------------------
                
            _processErrorOdata: function(error) {
                if (error) {
                    if (error.responseText) {
                        var obj = JSON.parse(error.responseText);
                        if (obj.error !== undefined) {

                            if (obj.error.innererror) {
                                if (obj.error.innererror.errordetails) {
                                    if (obj.error.innererror.errordetails.length > 0) {
                                        var msgReturn = "";
                                        for (var index = 0; index < obj.error.innererror.errordetails.length; index++) {
                                            if (obj.error.innererror.errordetails[index].message &&
                                                obj.error.innererror.errordetails[index].code != "/IWBEP/CX_MGW_TECH_EXCEPTION") {
                                                if (msgReturn != "") {
                                                    msgReturn = msgReturn + "\r\n";
                                                }
                                                msgReturn = msgReturn + obj.error.innererror.errordetails[index].message;
                                            }
                                        }
                                        if (msgReturn != "") { return msgReturn; }
                                    }
                                }
                            }
                            if (obj.error.message) {
                                return obj.error.message.value
                            }
                        }
                    }
                    if (error.message) {
                        return error.message.value
                    }
                }
                return "";
            }

        });
    });