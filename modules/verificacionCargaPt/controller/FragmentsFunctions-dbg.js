sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "./MensajesObject"
], function(JSONModel, MensajesObject) {
    "use strict";

    return {

        _Fragmento: new Object(),

        onCerrarFragmento: function(sNombre) {
            // this._Fragmento[sNombre].close();
            this._Fragmento[sNombre].destroy();
            delete this._Fragmento[sNombre];
            delete this._InputHelperRequest;
        },

        onAbrirMatchcode: function(oEvent, sNombre) {
            var oView = this.getView();
            var oSource = oEvent.getSource();

            // oSource.setValue("");

            this._InputHelperRequest = oSource;

            var sPath = "AvocadoProyecto.AvocadoProyecto.modules.verificacionCargaPt.fragments.matchcodes.";
            var sPathCompleto = sPath + sNombre;

            try {
                if (!this._Fragmento[sNombre]) {
                    this._Fragmento[sNombre] = sap.ui.xmlfragment(sPathCompleto, this);
                    oView.addDependent(this._Fragmento[sNombre]);
                }
            } catch (e) {
                debugger
            }

            this._Fragmento[sNombre].open();
        },

        onButtonPressOpenMatchcode: function(oEvent, sNombre) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var oFormElements = oSource.getParent();
            var oFields = oFormElements.getFields();
            var oInput = oFields[0];

            this._InputHelperRequest = oInput;

            var sPath = "AvocadoProyecto.AvocadoProyecto.modules.verificacionCargaPt.fragments.matchcodes.";
            var sPathCompleto = sPath + sNombre;

            try {
                if (!this._Fragmento[sNombre]) {
                    this._Fragmento[sNombre] = sap.ui.xmlfragment(sPathCompleto, this);
                    oView.addDependent(this._Fragmento[sNombre]);
                }
            } catch (e) {
                debugger
            }

            this._Fragmento[sNombre].open();
        },

        onAgregarValorMatchcode: function(oEvent, sNombreFragment, oCamposModeloAgregar, sNombreModelo) {
            var oView = this.getView();
            var oItem = oEvent.getParameter("selectedItem");

            var sModelo = sNombreModelo ? sNombreModelo : "ZEWM_0011";

            var oBinding = oItem.getBindingContext(sModelo);
            var oElement = oBinding.getObject();
            var oSelected = oItem.getTitle();

            if (this._InputHelperRequest) {
                if (sNombreFragment == "AyudaEmpresaAgricola") {
                    this._InputHelperRequest.setValueState("None");
                    this._InputHelperRequest.setValue(oItem.getDescription());
                } else {
                    this._InputHelperRequest.setValueState("None");
                    this._InputHelperRequest.setValue(oSelected);
                }
            }

            if (oCamposModeloAgregar) {
                var oModel = oView.getModel("mAlmacenarHU");
                oCamposModeloAgregar.forEach(campo => {
                    Object.keys(campo).forEach(key => {
                        var sKeyElement = campo[key];
                        var sValue = oElement[sKeyElement];
                        var sProperty = key;
                        oModel.setProperty(sProperty, sValue);
                    });
                });
            }

            this.onCerrarFragmento(sNombreFragment);
        },

        onFiltrarMatchcode: function(oEvent, oFields) {
            var oSource = oEvent.getSource();
            var sValue = oEvent.getParameter("value");

            var oFiltros = new Array();

            if (!oFields) return;

            try {
                oFields.forEach(field => {
                    oFiltros.push(
                        new sap.ui.model.Filter(field, sap.ui.model.FilterOperator.Contains, sValue)
                    );
                });

                var oBinding = oSource.getBinding("items");
                oBinding.filter(new sap.ui.model.Filter(oFiltros, false), "Application");
            } catch (e) {

            }
        },
        
        onAgregarValorMatchcodeAlmacenDestino: function(oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("mTrasladoHU");
            var oItem = oEvent.getParameter("selectedItem");

            var oBinding = oItem.getBindingContext("mAyudaAlmacenesDestino");
            var oElement = oBinding.getObject();
            var oSelected = oItem.getTitle();


            if (this._InputHelperRequest) {
                this._InputHelperRequest.setValueState("None");
                this._InputHelperRequest.setValue(oSelected);
            }

            var sNombreFragmento = "AyudaAlmacenesDestino";
            this.onCerrarFragmento(sNombreFragmento);

            oModel.setProperty("/IdAlmacen", oElement.IdAlmacen);
            oModel.setProperty("/FlgEwm", oElement.FlgEwm);
        }

    }
});