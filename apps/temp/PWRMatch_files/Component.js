sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "simulador/model/models"
], function (UIComponent, JSONModel, models) {
  "use strict";
  return UIComponent.extend("simulador.Component", {
    metadata: {
      manifest: "json"
    },
    init: function () {
      // call the init function of the parent
      UIComponent.prototype.init.apply(this, arguments);

      // create App flow model
      var oAppFlowModel = models.createFlowModel();
      oAppFlowModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
      this.setModel(oAppFlowModel, "appFlowModel");
      
      // sample data models (suppliers/offers)
      //this.setModel(models.createSupplierModel(this), "suppliers");

      // sample data models (suppliers/offers)
      models.createERSEFilesModel(this);
      //this.setModel(models.createEnergySupplierModel(oAppFlowModel), "suppliersERSE");

      // inicializa o router definido no manifest.json
      this.getRouter().initialize();
    }
  });
});
