sap.ui.define([
    'sap/m/MessageBox',
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
], function(MessageBox, Controller, formatter) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.palletsInventarioEWM.controller.palletsInventarioEWM", {

        formatter: formatter,
        dataBus: {},
        scope: {
            "totalRows": 0,
            "filtrado": {}
        },
        oView: new Object(),
        idMasterDialog: "palletsInventarioEWMView",
        sorterTable: [],

        initDialog: function(othat) {
            this.oView = othat;
        },

        onCreateMasterDialog: function() {
            this.onInit();
        },

        onAfterCloseMasterDialog: function() {
            //se limpia los datos y se destruye el dialog
            this.oView.getView().setModel(null, "service");
            this.oView.getView().setModel(null, "detail");
            this.oView.getView().setModel(null, "scope");
            this.oView.closeSplitDialogRouter(this.idMasterDialog, function() { console.log('cerrado'); });
        },

        onCloseMasterDialog: function() {
            this.oView._Fragmento[this.idMasterDialog].close();
        },

        onInit: function() {
            /*
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "palletsInventarioEWMView", this._busSuscribe, this);
            */
            var oModelService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0015_SRV", { "useBatch": false });
            this.oView.getView().setModel(oModelService, "service");

            var oModelDetail = new sap.ui.model.json.JSONModel();
            this.oView.getView().setModel(oModelDetail, "detail");

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.oView.getView().setModel(oModelScope, "scope");

            this.onLoadDetail();
        },
        /*
                _busSuscribe: function(channelId, eventId, data) {
                    this.dataBus = data.splitAppThis;
                },

                onPressInicion: function() {
                    this.dataBus.oView.oController.onPressInicion();
                    this.oView.getView().destroy();
                },
        */
        onLoadDetail: function() {
            sap.ui.core.BusyIndicator.show(0);
            var othat = this;
            this.scope.totalRows = 0;
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks; // Centro GE 2-12-2024
      	    var filters= [new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro)] // Centro GE 2-12-2024
            var oModelService = this.oView.getView().getModel('service');
            oModelService.read("/ObtenerPalletsEnInventarioSet", {
            	filters:filters,
                success: function(result, response) {
                    var msgError = othat._processErrorOdata(result);
                    if (msgError != "") {
                        MessageBox.error(
                            msgError, { styleClass: "sapUiSizeCompact" }
                        );
                    }
                    result.results.forEach(element => element.CANT_CAJAS = parseInt(element.CANT_CAJAS));
                    var oModel = new sap.ui.model.json.JSONModel(result);
                    oModel.setSizeLimit(result.results.length);
                    othat.oView.getView().setModel(oModel, "detail");
                    othat.scope.totalRows = result.results.length;
                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.oView.getView().setModel(oModelScope, "scope");
                    sap.ui.core.BusyIndicator.hide();
                    othat.handleFilter();
                },
                error: function(error) {
                    var msgError = othat._processErrorOdata(error);
                    if (msgError != "") {
                        MessageBox.error(
                            msgError, { styleClass: "sapUiSizeCompact" }
                        );
                    }
                    var oModel = new sap.ui.model.json.JSONModel();
                    othat.oView.getView().setModel(oModel, "detail");
                    console.log(error);
                    othat.scope.totalRows = 0;
                    var oModelScope = new sap.ui.model.json.JSONModel(othat.scope);
                    othat.oView.getView().setModel(oModelScope, "scope");
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        onTableSort: function(sName) {
            var othat = this;
            var oBinding = othat.oView.getView().byId("idReportTable").getBinding("items");
            if (this.sorterTable[sName]) {
                this.sorterTable[sName] = false;
            } else {
                this.sorterTable[sName] = true;
            }
            oBinding.sort(new sap.ui.model.Sorter(sName, this.sorterTable[sName]));
        },

        handleFilter: function() {
            /*
            for (let i in this.scope.filtrado) {
                console.log(i);console.log(this.scope.filtrado[i]);
            }
            */
            var othat = this;
            var oBinding = othat.oView.getView().byId("idReportTable").getBinding("items");
            var oFilter;
            var aFilters = [];
            for (let i in othat.scope.filtrado) {
                if (othat.scope.filtrado[i] && othat.scope.filtrado[i] != "") {
                    aFilters.push(new sap.ui.model.Filter({
                        path: i,
                        test: function(oValue) { return (oValue.toString().toUpperCase().indexOf(othat.scope.filtrado[i]) >= 0); }
                    }));
                }
            }
            var oFilter = new sap.ui.model.Filter(aFilters, true);
            oBinding.filter(oFilter);
            this.scope.totalRows = oBinding.aIndices.length;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.oView.getView().setModel(oModelScope, "scope");
        },

        handleCleanFilter: function() {
            var othat = this;
            for (let i in othat.scope.filtrado) {
                if (othat.scope.filtrado[i] && othat.scope.filtrado[i] != "") {
                    othat.scope.filtrado[i] = "";
                }
            }
            var oBinding = this.oView.getView().byId("idReportTable").getBinding("items");
            oBinding.filter([]);
            this.scope.totalRows = oBinding.aIndices.length;
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.oView.getView().setModel(oModelScope, "scope");
        },

        onPrintReport: function() {
            var print_Url = $.sap.getModulePath("com", "/css/");
            var printCssUrl = print_Url + "style.css";
            var css = '<link rel="stylesheet" href=' + printCssUrl + ' type="text/css" />';
            $.each(document.styleSheets, function(index, oStyleSheet) {
                if (oStyleSheet.href) {
                    css += '<link rel="stylesheet" href=' + oStyleSheet.href + ' type="text/css" />';
                }
            });
            var hContent = '<html><head>' + css + '<style>.sapMFlexBoxFit, .sapMFlexBoxScroll {height: auto !important;} .sapMBtnBase {display: none !important;}.sapMGT.OneByOne{height: 63px !important;}.CPCEWM-GenericTilePosiciones .sapMGTHdrContent{padding: 3px !important;}</style></head><body>';
            var bodyContent = $("#palletsInventarioEWMView--idReportTable").html();
            var closeContent = '<script type="text/javascript">setTimeout(function(){ window.print(); setTimeout(function(){ window.close(); }, 500);}, 500);</script></body></html>';
            var htmlpage = hContent + bodyContent + closeContent;
            var win = window.open("", "PrintWindow");
            win.document.write(htmlpage);
            //win.print(); win.stop();
        },

        onGetCSV: function() {
            var oBinding = this.oView.getView().byId("idReportTable");
            var data = [];
            var tmpData = [];
            for (let index = 0; oBinding.getColumns()[index]; index++) {
                if (oBinding.getColumns()[index].getHeader().getItems()[1].getProperty('text') != "") {
                    tmpData.push(oBinding.getColumns()[index].getHeader().getItems()[1].getProperty('text'));
                } else {
                    tmpData.push(oBinding.getColumns()[index].getHeader().getItems()[0].getProperty('text'));
                }
            }
            data.push(tmpData);
            for (let index = 0; oBinding.getItems()[index]; index++) {
                var tmpData = [];
                for (let jIndex = 0; oBinding.getItems()[index].getCells()[jIndex]; jIndex++) {
                    tmpData.push(oBinding.getItems()[index].getCells()[jIndex].getProperty('text'));
                }
                data.push(tmpData);
            }
            let csvContent = "";
            data.forEach(function(rowArray) {
                let row = rowArray.join(",");
                //let row = rowArray.join("\t");
                csvContent += row + "\r\n";
            });
            var encodedUri = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.style.visibility = 'hidden';
            link.setAttribute("download", "reporte.csv");
            //link.setAttribute("download", "reporte.txt");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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