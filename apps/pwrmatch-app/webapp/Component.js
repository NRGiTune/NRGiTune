sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "simulador/model/models",
  "simulador/util/fileParserERSE"
], function (UIComponent, JSONModel, models, fileParserERSE) {
  "use strict";
  return UIComponent.extend("simulador.Component", {
    metadata: {
      manifest: "json"
    },
    init: function () {
      // call the init function of the parent
      UIComponent.prototype.init.apply(this, arguments);

      // create App flow model
      var oAppDataModel = models.createDataModel();
      //oDataModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
      this.setModel(oAppDataModel, "appDataModel");

      // create App flow model
      var oAppFlowModel = models.createFlowModel();
      oAppFlowModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
      this.setModel(oAppFlowModel, "appFlowModel");

      // load supliers, offers, prices on app data model
      fileParserERSE.parseERSEFiles(this);

      // inicializa o router definido no manifest.json
      this.getRouter().initialize();
    }
  });
});
