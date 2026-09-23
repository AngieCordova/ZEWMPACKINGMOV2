sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel"
], function(Controller, formatter, JSONModel) {
    "use strict";

    return Controller.extend("AvocadoProyecto.AvocadoProyecto.modules.strageoutpallet.controller.Index", {

        formatter: formatter,
        dataBus: {},

        onAfterRendering: function() {
            var oTable = this.getView().byId("table-lista_pedidos");

            oTable.attachUpdateFinished(
                (oEvent) => {
                    var oSource = oEvent.getSource();
                    var oTableItems = oSource.getItems();

                    oTableItems.forEach(item => {
                        var oId = item.getId();
                        var oBinding = item.getBindingContext("ZEWM_0003");
                        var object = oBinding.getObject();
                        var oClase = "FondoVerde";

                        switch (object.Color) {
                            case "R":
                                oClase = "FondoRojo";
                                break;

                            case "A":
                                oClase = "FondoAmarillo";
                                break;

                            default:
                                break;
                        }

                        var oFila = $(`#${oId}`);
                        oFila.addClass(oClase);
                    });
                }
            );
        },

        onInit: function() {
            // Se crea la suscripción al canal
            var bus = sap.ui.getCore().getEventBus();
            bus.subscribe("splitApp", "StageOutPalletIndexView", this._busSuscribe, this);

            var oData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZEWM_0003_SRV");

            this.getView().setModel(oData, "ZEWM_0003");
            var oTable = this.getView().byId("table-lista_pedidos");
            ///***** GE 27-11-2024 ****** //
            var oBinding = oTable.getBinding("items");
            const sCentro = sap.ui.getCore().getModel("mModeloCentro").getData().Werks;
            var oFilter = new sap.ui.model.Filter("I_WERKS", sap.ui.model.FilterOperator.EQ, sCentro);

            // Apply the filter to the table's binding
            oBinding.filter([oFilter]);
          ///***** GE 27-11-2024 ****** //
        },

        _busSuscribe: function(channelId, eventId, data) {
            this.dataBus = data.splitAppThis;
        },

        onPressInicion: function() {
            this.dataBus.oView.oController.onPressInicion();
            this.getView().destroy();
        },

        onSelectItem: async function(oEvent) {
            var oModelOdata = this.getView().getModel("ZEWM_0003");

            var oSource = oEvent.getSource();
            var oBinding = oSource.getBindingContext("ZEWM_0003");
            var object = oBinding.getObject();

            var oViewId = "StageOutPalletDetailsView";
            var oPathView = "AvocadoProyecto.AvocadoProyecto.modules.strageoutpallet.view.Details";
            this.dataBus.oView.oController.onSplitRouter(oViewId, oPathView, 16);
            this.getView().destroy();

            var oNextView = sap.ui.getCore().byId(oViewId);
            oNextView.setModel(oModelOdata, "ZEWM_0003");

            var oHeaderOrdenViaje = oNextView.byId("input-orden_viaje_strageout");
            oHeaderOrdenViaje.setValue(`${object.NroOrden} / ${object.NroViaje}`);

            var oTablaPedidos = oNextView.byId("table-detalles_pedido");

            var oTableHeader = oTablaPedidos.getHeaderToolbar();
            var oTitleControl = oTableHeader.getTitleControl();
            oTitleControl.setText(`Pedido Nº ${object.idPedido}`);

            var oBindingTablaPedidos = oTablaPedidos.getBinding("items");

            var oFiltros = new Array(
                new sap.ui.model.Filter("IdPedido", sap.ui.model.FilterOperator.EQ, object.idPedido)
            );

            oBindingTablaPedidos.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
        }
    });
});