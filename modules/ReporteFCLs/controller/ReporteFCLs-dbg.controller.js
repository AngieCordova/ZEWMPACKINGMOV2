sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    'sap/m/MessageToast'
], function(MessageBox, Controller, formatter, MessageToast) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.ReporteFCLs.controller.ReporteFCLs", {

        formatter: formatter,
        dataBus: {},
        scope: {
            'totalRows': 0,
            'filtrado': {Lddat: new Date().getTime()},
            'filterList': {
                'ZzNumorden': [],
                'Vbeln': [],
                'Entrega': [],
                'Signi': [],
                'Booking': [],
                'Lddat': []
            },
            'inputFilterDialog': '',
            'inputFilterSupFecha': new Date().toLocaleDateString(),
            'tmp': {}
        },

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "ReporteFCLsView", this._busSuscribe, this);

            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0027_SRV", { "useBatch": false });

            this.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModelDetail, "contenedores");
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            //this.onLoadContenedores();
            this._cargaLibPDF();
            this._addStyleHead("id-reporte-fcls", ".bsc-title-center h2 { text-align: center; } .bsc-title-RepFCLs span.sapMTextMaxLine.sapMTextLineClamp{ display: block;}");
        },

        _cargaLibPDF: function() {
            function addScript(url) {
                var script = document.createElement('script');
                script.type = 'application/javascript';
                script.src = url;
                document.head.appendChild(script);
            }
            addScript('https://raw.githack.com/eKoopmans/html2pdf/master/dist/html2pdf.bundle.js');
        },

        _addStyleHead: function(id, styles) {
            var css = document.createElement('style');
            css.id = id;
            css.type = 'text/css';
            if (css.styleSheet)
                css.styleSheet.cssText = styles;
            else
                css.appendChild(document.createTextNode(styles));
            document.getElementsByTagName("head")[0].appendChild(css);
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onLoadContenedores: function() {
            sap.ui.core.BusyIndicator.show(0);
            var othat = this;
            /// GE 22-11-2024
            
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            let aFilters= this.handleFilters();        
            aFilters.push(new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro));
          
            ///GE 22-11-2024 ///
            var oModelService = this.getView().getModel('service');
            oModelService.read("/ObtenerDatosFCLSSet", {
              filters: aFilters,
                success: function(result, response) {
                    var oModel = new sap.ui.model.json.JSONModel(result);
                    oModel.setSizeLimit(result.results.length);
                    othat.getView().setModel(oModel, "contenedores");
                    for (let key in othat.scope.filterList) {
                        othat.scope.filterList[key] = [];
                    }
                    for (let i in result.results) {
                        for (let key in othat.scope.filterList) {
                            let found = othat.scope.filterList[key].find(item => item.id === result.results[i][key]);
                            if (found === undefined && result.results[i][key] !== '') {
                                let dataPush = { 'id': result.results[i][key], 'val': result.results[i][key] };
                                othat.scope.filterList[key].push(dataPush);
                            }
                        }
                    }

                    for (let key in othat.scope.filterList) {
                        othat.scope.filterList[key].sort((a, b) => (a.val > b.val) ? 1 : ((b.val > a.val) ? -1 : 0))
                    }

                    othat.scope.totalRows = result.results.length;
                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");
                    //othat.handleFilter();
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(error) {
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "contenedores");
                    console.log(error);
                    othat.scope.totalRows = 0;
                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.getView().setModel(oModelScope, "scope");
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },
        handleFilter: function() {        	
        	this.onLoadContenedores();
        },
        handleFilter2: function() {
            var othat = this;
            this.scope.totalRows = 0;
            var oBinding = othat.getView().byId("idContenedoresTable").getBinding("items");
            var oFilter;
            var aFilters = [];
            for (let i in othat.scope.filtrado) {
                if (othat.scope.filtrado[i] && othat.scope.filtrado[i] != "") {
                    let isRango = String(othat.scope.filtrado[i]).split("}-{");
                    let isChecks = String(othat.scope.filtrado[i]).split("},{");

                    if (isRango[1]) {
                        let sDesde = isRango[0].replace('}', '').replace('{', '');
                        let sHasta = isRango[1].replace('}', '').replace('{', '');
                        aFilters.push(new sap.ui.model.Filter({
                            path: i,
                            test: function(oValue) {
                                if (i == 'Lddat') {
                                    sDesde = parseInt(sDesde);
                                    sHasta = parseInt(sHasta);
                                    /*
                                    console.log("----------------------------");
                                    console.log(i);
                                    console.log("oValue");
                                    console.log(oValue);
                                    console.log(new Date(oValue));
                                    console.log("sDesde");
                                    console.log(sDesde);
                                    console.log(new Date(sDesde));
                                    console.log("sHasta");
                                    console.log(sHasta);
                                    console.log(new Date(sHasta));
                                    console.log((parseFloat(oValue) >= parseFloat(sDesde) && parseFloat(oValue) <= parseFloat(sHasta)));
                                    */
                                    let DateUtcDesde = new Date(sDesde);
                                    let iDateUtcDesde = (new Date(DateUtcDesde - DateUtcDesde.getTimezoneOffset() * 60000)).getTime();
                                    let DateUtcHasta = new Date(sHasta);
                                    let iDateUtcHasta = (new Date(DateUtcHasta - DateUtcHasta.getTimezoneOffset() * 60000)).getTime();

                                    //return (parseFloat(oValue) >= parseFloat(sDesde) && parseFloat(oValue) <= parseFloat(sHasta));
                                    return (parseFloat(oValue) >= parseFloat(iDateUtcDesde) && parseFloat(oValue) <= parseFloat(iDateUtcHasta));
                                } else {
                                    if (sDesde.match(/^\d+$/) && sHasta.match(/^\d+$/)) {
                                        return (parseFloat(oValue) >= parseFloat(sDesde) && parseFloat(oValue) <= parseFloat(sHasta));
                                    }
                                    return (oValue >= sDesde && oValue <= sHasta);
                                }
                            }
                        }));
                    } else if (isChecks[1]) {
                        var aFiltersCheck = [];
                        for (let iCheck in isChecks) {
                            aFiltersCheck.push(new sap.ui.model.Filter(i, sap.ui.model.FilterOperator.EQ, isChecks[iCheck].replace('}', '').replace('{', '')));
                        }
                        aFilters.push(new sap.ui.model.Filter(aFiltersCheck, false));
                    } else {
                        aFilters.push(new sap.ui.model.Filter({
                            path: i,
                            test: function(oValue) {
                                if (i == 'Lddat') {
                                    /*
                                    console.log("----------------------------");
                                    console.log(i);
                                    console.log("oValue");
                                    console.log(oValue);
                                    console.log(new Date(oValue));
                                    console.log("othat.scope.filtrado[i]");
                                    console.log(othat.scope.filtrado[i]);
                                    console.log(new Date(othat.scope.filtrado[i]));
                                    console.log(oValue == othat.scope.filtrado[i]);
                                    */
                                    let DateUtc = new Date(othat.scope.filtrado[i]);
                                    let iDateUtc = (new Date(DateUtc - DateUtc.getTimezoneOffset() * 60000)).getTime();

                                    //return oValue == othat.scope.filtrado[i];
                                    return oValue == iDateUtc;
                                } else {
                                    return (oValue.toString().toUpperCase().indexOf(othat.scope.filtrado[i]) >= 0);
                                }
                            }
                        }));
                    }
                }
            }

            var oFilter = new sap.ui.model.Filter(aFilters, true);
            oBinding.filter(oFilter);
            this.scope.totalRows = oBinding.aIndices.length;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
        },
        handleFilters: function() {
            var othat = this;
            this.scope.totalRows = 0;           
            var oFilter;
            var aFilters = [];
            for (let i in othat.scope.filtrado) {
                if (othat.scope.filtrado[i] && othat.scope.filtrado[i] != "") {
                    let isRango = String(othat.scope.filtrado[i]).split("}-{");
                    let isChecks = String(othat.scope.filtrado[i]).split("},{");

                    if (isRango[1]) {
                        let sDesde = isRango[0].replace('}', '').replace('{', '');
                        let sHasta = isRango[1].replace('}', '').replace('{', '');
                        
                        if (i == 'Lddat') {                          
                        	sDesde = new Date(parseInt(sDesde));
                        	sHasta = new Date(parseInt(sHasta));    
                        }
                        aFilters.push(new sap.ui.model.Filter(i, sap.ui.model.FilterOperator.BT, sDesde,sHasta));
                   
                    } else if (isChecks[1]) {
                        var aFiltersCheck = [];
                        for (let iCheck in isChecks) {
                            aFiltersCheck.push(new sap.ui.model.Filter(i, sap.ui.model.FilterOperator.EQ, isChecks[iCheck].replace('}', '').replace('{', '')));
                        }
                        aFilters.push(new sap.ui.model.Filter(aFiltersCheck, false));
                    } else {
                    	  let oValue=othat.scope.filtrado[i];
                    	  if (i == 'Lddat') {                          
                    		  oValue = new Date(othat.scope.filtrado[i]);           
                          }
                    	  
                    	  aFilters.push(new sap.ui.model.Filter(i, sap.ui.model.FilterOperator.EQ, oValue));
                    
                    }
                }
            }

            return aFilters;
        
        },
        handleCleanFilter: function() {
            var othat = this;
            this.scope.totalRows = 0;
            for (let i in othat.scope.filtrado) {
                if (othat.scope.filtrado[i] && othat.scope.filtrado[i] != "") {
                    othat.scope.filtrado[i] = "";
                }
            }
            this.scope.inputFilterSupFecha = "";
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            //othat.handleFilter();
        },

        handleCleanFilterFecha: function() {
            this.scope.filtrado.Lddat = '';
            this.scope.inputFilterSupFecha = '';
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
        },

        onReporteShow: function(event) {
            this._getDialogReporte('ReporteFCLs').open();
            var oContext = event.getSource().getBindingContext('contenedores');
            var othat = this;
            var oModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModel, "posiciones");
            this.scope.slcData = oContext.getProperty();
            //this.scope.IdPedido = oContext.getProperty('IdPedido');
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.onLoadPosiciones();
        },

        onLoadPosiciones: function() {
            sap.ui.core.BusyIndicator.show(0);
            var oModelService = this.getView().getModel('service');
            var othat = this;
            oModelService.read("/ConsultaDatosFCLSSet", {
                filters: [new sap.ui.model.Filter("Huident", sap.ui.model.FilterOperator.EQ, othat.scope.slcData.Vbeln)],
                success: function(result, response) {
                    let separarIni = 26;
                    let separar = 38;
                    let ciclo = 1;
                    result.results.sort((a, b) => (a.Correlativo > b.Correlativo) ? 1 : ((b.Correlativo > a.Correlativo) ? -1 : 0));
                    /*
                    result.results = JSON.parse(JSON.stringify(result.results.concat(JSON.parse(JSON.stringify(result.results)))));
                    result.results = JSON.parse(JSON.stringify(result.results.concat(JSON.parse(JSON.stringify(result.results)))));
                    result.results = JSON.parse(JSON.stringify(result.results.concat(JSON.parse(JSON.stringify(result.results)))));
                    result.results = JSON.parse(JSON.stringify(result.results.concat(JSON.parse(JSON.stringify(result.results)))));
                    */
                    for (var key in result.results) {
                        result.results[key].Estado = 'Ocupado';
                        result.results[key].salto = 'no';
                        if (separarIni === (parseInt(key) + 1)) {
                            result.results[key].salto = 'break';
                        }
                        if (((parseInt(key) + 1) % ((separar * ciclo) + separarIni)) === 0) {
                            result.results[key].salto = 'break';
                            ciclo++;
                        }
                    }
                    const tam = result.results.length - 1;
                    result.results[tam].salto = 'no';
                    var oModel = new sap.ui.model.json.JSONModel(result);
                    oModel.setSizeLimit(result.results.length);
                    othat.getView().setModel(oModel, "posiciones");
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function(error) {
                    console.log(error);
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.getView().setModel(oModel, "posiciones");
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        onPrintReport: function() {
            this._addStyleHead("id-reporte-fcls-remove", ".sapMGTSubHdrTxt .sapMText.sapUiSelectable.sapMTextBreakWord.sapMTextMaxWidth{display:none;} .CPCEWM-GenericTilePosiciones {height: 3.4em !important;} .CPCEWM-GenericTilePosiciones .sapMGTHdrContent {height: 1rem !important;padding-top: 5px;}");
            sap.ui.core.BusyIndicator.show(0);
            var element = document.getElementById('ReporteFCLsView--modalReporteDataPDF');
            var opt = {
                margin: [0.5, 0, 0.5, 0],
                filename: 'Orden ' + this.scope.slcData.ZzNumorden + ' Viaje ' + this.scope.slcData.ZzViaje + '.pdf',
                image: { type: 'jpeg', quality: 1 },
                //jsPDF: { unit: 'in', format: 'a3', orientation: 'portrait' },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
                pagebreak: { after: '[data-break-for-pdf="break"]' }
            };
            //html2pdf().set(opt).from(element).save();
            setTimeout(function() {
                html2pdf().set(opt).from(element).save();
                setTimeout(function() {
                    document.getElementById("id-reporte-fcls-remove").remove();
                    sap.ui.core.BusyIndicator.hide();
                }, 1500);
            }, 1500);

            return;
            var print_Url = $.sap.getModulePath("com", "/css/");
            var printCssUrl = print_Url + "style.css";
            var css = '<link rel="stylesheet" href=' + printCssUrl + ' type="text/css" />';
            $.each(document.styleSheets, function(index, oStyleSheet) {
                if (oStyleSheet.href) {
                    css += '<link rel="stylesheet" href=' + oStyleSheet.href + ' type="text/css" />';
                }
            });
            var hContent = '<html><head>' + css + '<style>.sapMFlexBoxFit, .sapMFlexBoxScroll {height: auto !important;} .sapMBtnBase {display: none !important;}.sapMGT.OneByOne{height: 63px !important;}.CPCEWM-GenericTilePosiciones .sapMGTHdrContent{padding: 3px !important;}</style></head><body>';
            var bodyContent = $("#ReporteFCLsView--modalReporteData-cont").html();
            var closeContent = '<script type="text/javascript">setTimeout(function(){ window.print(); setTimeout(function(){ window.close(); }, 500);}, 500);</script></body></html>';
            var htmlpage = hContent + bodyContent + closeContent;
            var win = window.open("", "PrintWindow");
            win.document.write(htmlpage);
            //win.print(); win.stop();
        },

        _getDialogReporte: function(showFragment) {
            if (!this.oDialogReporte) {
                this.oDialogReporte = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.ReporteFCLs.fragments.' + showFragment, this);
                this.getView().addDependent(this.oDialogReporte);
            }
            return this.oDialogReporte;
        },

        onCloseDialogReporte: function() {
            this._getDialogReporte().close();
        },

        onAfterCloseDialogReporte: function() {
            if (this.oDialogReporte) {
                this._getDialogReporte().destroy();
                delete this.oDialogReporte;
            }
        },


        onValDateFilter: function() {
            if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(this.scope.inputFilterSupFecha)) {
                MessageToast.show("Formato de fecha incorrecto");
                this.scope.inputFilterSupFecha = "";
                this.scope.filtrado.Lddat = "";
                return false;
            }
            var spl = this.scope.inputFilterSupFecha.split('/');
            this.scope.filtrado.Lddat = new Date(spl[2], parseInt(spl[1]) - 1, spl[0], 0, 0, 0).getTime();
        },

        onFilterModalFecha: function() {
            this.scope.tmp = {};
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this._getDialogReporte('DialogFilterFecha').open();
        },

        handleFechaDialogFilter: function() {
            let fecha = this.getView().byId("inpDialogFilterFechaOne");
            if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fecha.getValue())) {
                MessageToast.show("Formato de fecha incorrecto");
                return false;
            }        
            this.scope.filtrado.Lddat = this.scope.tmp.inpDialogFilterFechaOne.getTime();
            //this.scope.filtrado.Lddat = this.scope.tmp.inpDialogFilterFechaOne;
            //this.scope.inputFilterSupFecha = fecha.getDateValue().getDate() + '/' + (fecha.getDateValue().getMonth() + 1) + '/' + fecha.getDateValue().getFullYear();
            this.scope.inputFilterSupFecha = fecha.getValue();
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.onCloseDialogReporte();
        },

        handleFechaRangoDialogFilter: function() {
            let fechaDesde = this.getView().byId("inpDialogFilterFechaDesde");
            let fechaHasta = this.getView().byId("inpDialogFilterFechaHasta");
            if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fechaDesde.getValue())) {
                MessageToast.show("Formato de fecha incorrecto");
                return false;
            }
            if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fechaHasta.getValue())) {
                MessageToast.show("Formato de fecha incorrecto");
                return false;
            }
            this.scope.filtrado.Lddat = '{' + this.scope.tmp.inpDialogFilterFechaDesde.getTime() + '}-{' + this.scope.tmp.inpDialogFilterFechaHasta.getTime() + '}';
            //this.scope.inputFilterSupFecha = fechaDesde.getDateValue().getDate() + '/' + (fechaDesde.getDateValue().getMonth() + 1) + '/' + fechaDesde.getDateValue().getFullYear() + ' hasta ' + fechaHasta.getDateValue().getDate() + '/' + (fechaHasta.getDateValue().getMonth() + 1) + '/' + fechaHasta.getDateValue().getFullYear();
            this.scope.inputFilterSupFecha = fechaDesde.getValue() + ' hasta ' + fechaHasta.getValue();
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.onCloseDialogReporte();
        },




        onFilterModal: function(onFilterModal) {
            this.scope.inputFilterDialog = onFilterModal;
            this.scope.listFilter = [];
            this.scope.listFilter = JSON.parse(JSON.stringify(this.scope.filterList[onFilterModal]));
            var oModelFilter = new sap.ui.model.json.JSONModel(this.scope.listFilter);
            this.getView().setModel(oModelFilter, "listFilter");
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this._getDialogReporte('DialogFilter').open();
        },

        handleRangoDialogFilter: function() {
            let desde = this.getView().byId("inpDialogFilterDesde").getValue().toString();
            let hasta = this.getView().byId("inpDialogFilterHasta").getValue().toString();
            this.scope.filtrado[this.scope.inputFilterDialog] = '{' + desde + '}-{' + hasta + '}';
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.onCloseDialogReporte();
        },

        handleSlcDialogFilter: function() {
            let itemsSlc = '';
            let elements = 0;
            for (let i in this.scope.listFilter) {
                if (this.scope.listFilter[i].slc) {
                    itemsSlc += (itemsSlc != '') ? ',' : '';
                    itemsSlc += '{' + this.scope.listFilter[i].id + '}';
                    elements++;
                }
            }
            if (elements == 1) itemsSlc = itemsSlc.replace('}', '').replace('{', '');
            this.scope.filtrado[this.scope.inputFilterDialog] = itemsSlc;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.onCloseDialogReporte();
        },

        handleTableDialogFilter: function(event) {
            var sSearch = event.getSource().getValue().toString().toUpperCase();
            var oBinding = this.getView().byId("tableDialogFilterMul").getBinding("items");
            if (sSearch === "") {
                oBinding.filter([]);
                return;
            }
            var oFilter;
            var aFilters = [];
            aFilters.push(new sap.ui.model.Filter({
                path: "val",
                test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(sSearch) >= 0); }
            }));
            var oFilter = new sap.ui.model.Filter(aFilters, false);
            oBinding.filter(oFilter);
        },





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