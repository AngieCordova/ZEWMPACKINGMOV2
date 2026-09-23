sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "./MensajesObject",
    'sap/m/MessageToast'
], function(Controller, formatter, JSONModel, MensajesObject, MessageToast) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.asignarcontenedor.controller.SeleccionTransporteContenedores", {

        formatter: formatter,
        dataBus: {},

        scope: {
            'filtrado': {},
            'listFilter': [],
            'inputFilterDialog': '',
            'inputFilterSupFecha': '',
            'tmp': {}
        },

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "SeleccionTransporteContenedoresView", this._busSuscribe, this);

            this.getView().setModel(new JSONModel([]), "CONTENEDORES_ASIGNADOS");
            this.getView().setModel(new JSONModel([]), "CONTENEDORES_SIN_ASIGNAR");
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            var oViewId = "AsignarContenedorIndexView";
            var oPathView = "AvocadoProyecto.AvocadoProyecto.modules.asignarcontenedor.view.Index";
            this.dataBus.oView.oController.onSplitRouter(oViewId, oPathView, 17);
            this.getView().destroy();
        },

        requestPutOrDelete: function(oType, oUrl, oJson, oToken) {
            return new Promise(resolve => {
                $.ajax({
                    type: oType,
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
                        resolve(true);
                        // MensajesObject._MensajeExito("Contenedor actualizado.");
                    },
                    error: function(data, header) {
                        resolve(false);
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
            });
        },

        onQuitarContenedor: function(oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var oParent = oSource.getParent();
            var oSelectedIndex = oParent.getIndex();
            var oBinding = oSource.getBindingContext("CONTENEDORES_ASIGNADOS");
            var oModel = oBinding.getModel();
            var contenedor = oBinding.getObject();

            oModel.getData().splice(oSelectedIndex, 1);
            oModel.refresh(true);

            var oModeloContenedoresSinAsignar = oView.getModel("CONTENEDORES_SIN_ASIGNAR");
            oModeloContenedoresSinAsignar.getData().push(contenedor);
            oModeloContenedoresSinAsignar.refresh(true);

            this.habilitacionBotonesAgregarContenedor(true);
        },


        onAgregarContenedor: function(oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var oParent = oSource.getParent();
            var oSelectedIndex = oParent.getIndex();
            var oBinding = oSource.getBindingContext("CONTENEDORES_SIN_ASIGNAR");
            var oModel = oBinding.getModel();
            var contenedor = oBinding.getObject();

            oModel.getData().splice(oSelectedIndex, 1);
            oModel.refresh(true);

            var oModeloContenedoresAsignados = oView.getModel("CONTENEDORES_ASIGNADOS");
            oModeloContenedoresAsignados.getData().push(contenedor);
            oModeloContenedoresAsignados.refresh(true);

            this.habilitacionBotonesAgregarContenedor(false);
        },

        habilitacionBotonesAgregarContenedor: function(sHabilitar = true) {
            var oView = this.getView();
            var oModelCabecera = oView.getModel("CABECERA");
            var oTable = oView.byId("table-contendedores_sin_asignar");
            var oRows = oTable.getRows();

            // var sEstado = oModelCabecera.getProperty("/Estado");

            // if (sEstado == "Pendiente") {
            //     sHabilitar = false;
            //     var oBtnGuardar = oView.byId("btn-aceptar_asignacion_contenedor");
            //     oBtnGuardar.setEnabled(false);

            //     var oTableAsignados = oView.byId("table-contendedores_asignados");

            //     oTableAsignados.getRows().forEach(row => {
            //         var oCells = row.getCells();
            //         var oBtnAgregar = oCells[3];
            //         oBtnAgregar.setEnabled(false);
            //     });
            // }

            oRows.forEach(row => {
                var oCells = row.getCells();
                //var oBtnAgregar = oCells[3];
                var oBtnAgregar = oCells[4];
                oBtnAgregar.setEnabled(sHabilitar);
            });
        },


        /**
         * GUARDAMOS LOS CONTENEDORES
         * Si hay sin asignar, los mandamos a eliminar, y si hay asignados, los mandamos a guardar
         */
        onGuardarContenedores: async function() {
            var oView = this.getView();
            var oModelCabecera = oView.getModel("CABECERA");
            var oModeloContenedoresAsignados = oView.getModel("CONTENEDORES_ASIGNADOS");
            var oModeloContenedoresSinAsignar = oView.getModel("CONTENEDORES_SIN_ASIGNAR");

            var oIdPedido = oModelCabecera.getProperty("/IdPedido");
            var oCliente = oModelCabecera.getProperty("/Cliente");
            var oDestino = oModelCabecera.getProperty("/Destino");
            var oZona = oModelCabecera.getProperty("/Zona");
            var oCantPallets = oModelCabecera.getProperty("/CntPallets");

            var oContenedoresAsignados = oModeloContenedoresAsignados.getData();
            var oContenedoresSinAsignar = oModeloContenedoresSinAsignar.getData();

            var oModelOdata = this.getView().getModel("ZEWM_0005");
            var oToken = oModelOdata.getHeaders()["x-csrf-token"];

            sap.ui.core.BusyIndicator.show();

            const THAT = this;

            var oMensaje = "";

            sap.ui.core.BusyIndicator.show();

            // var sContadorContenedoresSinAccion = 0;
            var bExisteContenedorEliminar = false;
            var bContenedorEliminado = false;

            var oContenedorEliminar = oContenedoresSinAsignar.find(contenedor => contenedor.Estado);

            if (oContenedorEliminar) {
                bExisteContenedorEliminar = true;

                var oUrl = `/sap/opu/odata/sap/ZEWM_0005_SRV/TransporteSet(IdPedido='${oIdPedido}',IdTransporte='${oContenedorEliminar.IdTransporte}')`;

                var oJson = {
                    "IdPedido": oIdPedido,
                    "IdTransporte": oContenedorEliminar.IdTransporte,
                    "Cliente": oCliente,
                    "Destino": oDestino,
                    "Ubicacion": oZona,
                    "Booking": oContenedorEliminar.Booking,
                    "IdContenedor": oContenedorEliminar.IdContenedor
                }

                bContenedorEliminado = await THAT.requestPutOrDelete("DELETE", oUrl, oJson, oToken);
                if (bContenedorEliminado) oContenedorEliminar.Estado = "";
            } else {
                oMensaje = "No se realizaron modificaciones";
            }

            //Corroboramos si debemos eliminar un contenedor
            // await Promise.all(
            //     oContenedoresSinAsignar.map(async contenedor => {
            //         if (!contenedor.Estado) {
            //             sContadorContenedoresSinAccion++;
            //             return;
            //         }

            //         bExisteContenedorEliminar = true;

            //         return await new Promise(async(resolve) => {
            //             sContadorContenedoresSinAccion = 0;

            //             var oUrl = `/sap/opu/odata/sap/ZEWM_0005_SRV/TransporteSet(IdPedido='${oIdPedido}',IdTransporte='${contenedor.IdTransporte}')`;

            //             var oJson = {
            //                 "IdPedido": oIdPedido,
            //                 "IdTransporte": contenedor.IdTransporte,
            //                 "Cliente": oCliente,
            //                 "Destino": oDestino,
            //                 "Ubicacion": oZona,
            //                 "Booking": contenedor.Booking,
            //                 "IdContenedor": contenedor.IdContenedor
            //             }

            //             bContenedorEliminado = await THAT.requestPutOrDelete("DELETE", oUrl, oJson, oToken);
            //             if (bContenedorEliminado) contenedor.Estado = "";
            //             resolve();
            //         })
            //     })
            // );


            if (bExisteContenedorEliminar && !bContenedorEliminado) {
                // MensajesObject._MensajeAdvertencia("No se pudo eliminar el contenedor y no se guardara el nuevo");
                sap.ui.core.BusyIndicator.hide();
                return;
            }

            // var sPosicionAsignada = false;

            var oContenedorAsignar = oContenedoresAsignados[0];
            var bExisteContenedorAsignar = false;
            var bContenedorAsignado = false;

            if (oContenedorAsignar) {
                if (oContenedorAsignar.Estado) {
                    oMensaje = "No se realizaron modificaciones";
                } else {
                    bExisteContenedorAsignar = true;

                    var oUrl = `/sap/opu/odata/sap/ZEWM_0005_SRV/TransporteSet(IdPedido='${oIdPedido}',IdTransporte='${oContenedorAsignar.IdTransporte}')`;

                    var oJson = {
                        "IdPedido": oIdPedido,
                        "IdTransporte": oContenedorAsignar.IdTransporte,
                        "Cliente": oCliente,
                        "Destino": oDestino,
                        "Ubicacion": oZona,
                        "Booking": oContenedorAsignar.Booking,
                        "IdContenedor": oContenedorAsignar.IdContenedor,
                        "CntPallets": String(oCantPallets)
                    }

                    bContenedorAsignado = await THAT.requestPutOrDelete("PUT", oUrl, oJson, oToken);
                    if (bContenedorAsignado) oContenedorAsignar.Estado = "X";
                }
            }

            sap.ui.core.BusyIndicator.hide();

            var sMensajeExito = "";

            if (bExisteContenedorEliminar && bContenedorEliminado) sMensajeExito += "-Contenedor eliminado.";

            if (bExisteContenedorAsignar && bContenedorAsignado) sMensajeExito += "-Contenedor asignado.";

            if (sMensajeExito) {
                MensajesObject._MensajeExito(sMensajeExito);
                return;
            }
            // await oContenedoresAsignados.forEach(async contenedor => {
            //     if (contenedor.Estado) {
            //         oMensaje += "No se realizaron modificaciones"
            //         return;
            //     }

            //     sPosicionAsignada = true;

            //     var oUrl = `/sap/opu/odata/sap/ZEWM_0005_SRV/TransporteSet(IdPedido='${oIdPedido}',IdTransporte='${contenedor.IdTransporte}')`;

            //     var oJson = {
            //         "IdPedido": oIdPedido,
            //         "IdTransporte": contenedor.IdTransporte,
            //         "Cliente": oCliente,
            //         "Destino": oDestino,
            //         "Ubicacion": oZona,
            //         "Booking": contenedor.Booking,
            //         "IdContenedor": contenedor.IdContenedor,
            //         "CntPallets": String(oCantPallets)
            //     }

            //     await THAT.requestPutOrDelete("PUT", oUrl, oJson, oToken);
            // });


            // if (sContadorContenedoresSinAccion > 0 && !sPosicionAsignada && !oMensaje) {
            //     MensajesObject._MensajeAdvertencia("No se realizaron modificaciones");
            //     return;
            // }

            if (oMensaje) {
                sap.ui.core.BusyIndicator.hide();
                await MensajesObject._MensajeAdvertencia(oMensaje);
            }
        },

        /*---------------------------------------------------------*/

        handleFilterContSinAsig: async function() {
            var othat = this;
            var oFilter;
            var aFilters = [];

            //console.log(othat.scope.filtrado);
            if (othat.scope.filtrado.Fecha == undefined || othat.scope.filtrado.Fecha == NaN || othat.scope.filtrado.Fecha == '') {
                MessageToast.show("La fecha es obligatoria");
                return;
            }
            sap.ui.core.BusyIndicator.show(0);
            for (let i in othat.scope.filtrado) {
                if (othat.scope.filtrado[i] && othat.scope.filtrado[i] != "") {
                    let isRango = String(othat.scope.filtrado[i]).split("}-{");
                    let isChecks = String(othat.scope.filtrado[i]).split("},{");

                    if (isRango[1]) {
                        let sDesde = isRango[0].replace('}', '').replace('{', '');
                        let sHasta = isRango[1].replace('}', '').replace('{', '');
                        var aFiltersCheck = [];

                        aFiltersCheck.push(new sap.ui.model.Filter(i, sap.ui.model.FilterOperator.GE, sDesde));
                        aFiltersCheck.push(new sap.ui.model.Filter(i, sap.ui.model.FilterOperator.LE, sHasta));

                        aFilters.push(new sap.ui.model.Filter(aFiltersCheck, true));

                    } else if (isChecks[1]) {
                        var aFiltersCheck = [];
                        for (let iCheck in isChecks) {
                            aFiltersCheck.push(new sap.ui.model.Filter(i, sap.ui.model.FilterOperator.EQ, isChecks[iCheck].replace('}', '').replace('{', '')));
                        }
                        aFilters.push(new sap.ui.model.Filter(aFiltersCheck, false));
                    } else {
                        aFilters.push(new sap.ui.model.Filter(i, sap.ui.model.FilterOperator.EQ, othat.scope.filtrado[i]));
                    }
                }
            }
            aFilters.push(new sap.ui.model.Filter("IdPedido", sap.ui.model.FilterOperator.EQ, this.getView().getModel("CABECERA").getData().IdPedido));

            //var oFilter = [new sap.ui.model.Filter(aFilters, true)];
            var oModelOdata = this.getView().getModel("ZEWM_0005");

            var oResponse = await new Promise(resolve => {
                oModelOdata.read("/TransportesSet", {
                    filters: aFilters,
                    "success": function(response, header) {
                        try {
                            resolve(response.results);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    "error": async function(error) {
                        resolve([]);
                    }
                });
            });

            //console.log(oResponse);

            var contenedor = JSON.parse(JSON.stringify(this.getView().getModel("CABECERA").getData()));

            if (contenedor.IdContenedor && contenedor.IdContenedor != '') {
                contenedor.Estado = "X";
                /*
                var oFound = this.getView().getModel("CONTENEDORES_ASIGNADOS").getData().find(item => item.IdContenedor == contenedor.IdContenedor && item.IdTransporte == contenedor.IdTransporte);
                if (!oFound) {
                    */
                oResponse.push(contenedor)
                    //}
            }

            var oContenedoresSinAsignar = new Array();
            oResponse.forEach(conte => {
                var oFound = othat.getView().getModel("CONTENEDORES_ASIGNADOS").getData().find(item => item.IdContenedor == conte.IdContenedor && item.IdTransporte == conte.IdTransporte && item.Booking == conte.Booking);
                if (!oFound) {
                    oContenedoresSinAsignar.push(conte);
                }
            });

            oContenedoresSinAsignar.sort((a, b) => (a.IdTransporte > b.IdTransporte) ? 1 : ((b.IdTransporte > a.IdTransporte) ? -1 : 0));

            this.getView().getModel("CONTENEDORES_SIN_ASIGNAR").setData(oContenedoresSinAsignar);
            this.getView().getModel("CONTENEDORES_SIN_ASIGNAR").refresh(true);

            var oContenedorAsignado = this.getView().getModel("CONTENEDORES_ASIGNADOS").getData();
            if (oContenedorAsignado.length > 0) {
                this.habilitacionBotonesAgregarContenedor(false);
            } else if (oContenedoresSinAsignar.length > 0) {
                this.habilitacionBotonesAgregarContenedor(true);
            }

            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            sap.ui.core.BusyIndicator.hide();
        },

        handleCleanFilterContSinAsig: function() {
            var othat = this;
            for (let i in othat.scope.filtrado) {
                if (othat.scope.filtrado[i] && othat.scope.filtrado[i] != "") {
                    othat.scope.filtrado[i] = "";
                }
            }
            this.scope.inputFilterSupFecha = "";
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            //othat.handleFilterContSinAsig();
        },

        /* -------------------------------------------------------------------*/

        onValDateFilterContSinAsig: function() {
            if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(this.scope.inputFilterSupFecha)) {
                MessageToast.show("Formato de fecha incorrecto");
                this.scope.inputFilterSupFecha = "";
                this.scope.filtrado.Fecha = "";
                return false;
            }
            var spl = this.scope.inputFilterSupFecha.split('/');
            this.scope.filtrado.Fecha = spl[2] + spl[1] + spl[0];
        },

        onFilterModalFechaContSinAsig: function() {
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
            this.scope.inputFilterSupFecha = fecha.getValue();
            var spl = this.scope.inputFilterSupFecha.split('/');
            this.scope.filtrado.Fecha = spl[2] + spl[1] + spl[0];

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
            var spl1 = fechaDesde.getValue().split('/');
            var spl2 = fechaHasta.getValue().split('/');

            this.scope.filtrado.Fecha = '{' + spl1[2] + spl1[1] + spl1[0] + '}-{' + spl2[2] + spl2[1] + spl2[0] + '}';
            this.scope.inputFilterSupFecha = fechaDesde.getValue() + ' hasta ' + fechaHasta.getValue();
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.onCloseDialogReporte();
        },

        onChangeRangeDate: function() {
            let fechaDesde = this.getView().byId("inpDialogFilterFechaDesde");
            let fechaHasta = this.getView().byId("inpDialogFilterFechaHasta");
            fechaHasta.setDateValue(null);
            fechaHasta.setMinDate(fechaDesde.getDateValue());
        },


        /* -------------------------------------------------------------------*/

        onFilterModalContSinAsig: function(onFilterModal) {
            this.scope.inputFilterDialog = onFilterModal;
            this.scope.listFilter = [];
            var oModelFilter = new sap.ui.model.json.JSONModel(this.scope.listFilter);
            this.getView().setModel(oModelFilter, "listFilter");
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this._getDialogReporte('DialogFilter').open();
        },

        handleRangoDialogFilter: function() {
            let desde = this.getView().byId("inpDialogFilterDesde").getValue().toString();
            let hasta = this.getView().byId("inpDialogFilterHasta").getValue().toString();
            if (desde == '' || hasta == '') return;
            this.scope.filtrado[this.scope.inputFilterDialog] = '{' + desde + '}-{' + hasta + '}';
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.onCloseDialogReporte();
        },

        handleSlcDialogFilter: function() {
            let itemsSlc = '';
            let elements = 0;
            for (let i in this.scope.listFilter) {
                if (this.scope.listFilter[i].slc && this.scope.listFilter[i].id != '') {
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

        handleSlcDialogFilterAdd: function() {
            this.scope.listFilter.push({ 'id': '', 'slc': true });
            var oModelScope = new sap.ui.model.json.JSONModel(this.scope);
            this.getView().setModel(oModelScope, "scope");
            this.getView().getModel("listFilter").refresh();
        },

        /* -------------------------------------------------------------------*/



        _getDialogReporte: function(showFragment) {
            if (!this.oDialogReporte) {
                this.oDialogReporte = sap.ui.xmlfragment(this.getView().getId(), 'AvocadoProyecto.AvocadoProyecto.modules.asignarcontenedor.fragments.' + showFragment, this);
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

    });
});