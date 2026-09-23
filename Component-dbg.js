sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/Device",
  "AvocadoProyecto/AvocadoProyecto/model/models"
], function(UIComponent, Device, models) {
  "use strict";

  return UIComponent.extend("AvocadoProyecto.AvocadoProyecto.Component", {

    metadata: {
      manifest: "json"
    },

    /**
     * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
     * @public
     * @override
     */
    init: function() {
      UIComponent.prototype.init.apply(this, arguments);

      //  this.setModel(models.createDeviceModel(), "device");

      this.setModel(models.createDeviceModel(), "device");
      var oData = {
      "tbl_T_CENTRO_Resultado":[],
       	"T_BINES": [],
        "ERRORES": [],
        "ERRORES2": [],
        "binsVector": [],
        "listTotalItemSTM": [],

        "listGuia": [{
          "clistGuiaFecha": "20190407",
          "clistGuiaEmpresa": "00030007",
          "clistGuiaModulo": "117",
          "clistGuiaCodigo": "007-002748"
        }, {
          "clistGuiaFecha": "20190409",
          "clistGuiaEmpresa": "00030002",
          "clistGuiaModulo": "116",
          "clistGuiaCodigo": "007-002746"
        }, {
          "clistGuiaFecha": "20190401",
          "clistGuiaEmpresa": "00030001",
          "clistGuiaModulo": "111",
          "clistGuiaCodigo": "007-002751"
        }],

        "listTipoProducto": [{
          "clistTipoProductoText": "PROPIO",
          "clistTipoProductoKey": "PTF"
        }, {
          "clistTipoProductoText": "TERCERO",
          "clistTipoProductoKey": "TTF"
        }],

        "listTipoCultivo": [{
          "clistTipoCultivoText": "ARANDANO",
          "clistTipoCultivoKey": "AR"
        }, {
          "clistTipoCultivoText": "PALTA",
          "clistTipoCultivoKey": "PA"
        }, {
          "clistTipoCultivoText": "MANGO",
          "clistTipoCultivoKey": "MG"
        }],

        "listGuiasStatus": [{
          "clistGuiasStatusFecRecepcion": "25.04.2019",
          "clistGuiasStatusEmpAgricola": "INAGRO",
          "clistGuiasStatusModulo": "144-Mod01",
          "clistGuiasStatusGuiaRemision": "09-005-00001501",
          "clistGuiasStatusMaterial": "ARÁNDANO KIRRA",
          "clistGuiasStatusKilosVol": "21354.8",
          "clistGuiasStatusKilosNot": "15478.2",
          "clistGuiasStatusDiferencia": "5876.6"
        }, {
          "clistGuiasStatusFecRecepcion": "25.04.2019",
          "clistGuiasStatusEmpAgricola": "INVERSIONES AGRICOLAS OLMOS S.A.C",
          "clistGuiasStatusModulo": "147-Mod04",
          "clistGuiasStatusGuiaRemision": "09-005-00002341",
          "clistGuiasStatusMaterial": "PALTA HASS",
          "clistGuiasStatusKilosVol": "54685.5",
          "clistGuiasStatusKilosNot": "11564.2",
          "clistGuiasStatusDiferencia": "43121.3"
        }]
      };
      var oModel2 = new sap.ui.model.json.JSONModel(oData);
      this.setModel(oModel2, "myParam");
      // enable routing
      this.getRouter().initialize();

      // set the device model
    }
  });
});