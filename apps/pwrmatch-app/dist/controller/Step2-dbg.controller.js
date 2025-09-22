sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (Controller, JSONModel) {
  "use strict";
  return Controller.extend("simulador.controller.Step2", {
    onInit: function () {
      // model to hold manual rows and simple
      var oModel = new JSONModel({
        manualRows: [
          { date: "", vazio: "", cheio: "", ponta: "" }
        ],
        simple: { date: "", value: "" }
      });
      this.getView().setModel(oModel);
    },

    onAddRow: function () {
      var o = this.getView().getModel();
      var a = o.getProperty("/manualRows");
      a.push({ date: "", vazio: "", cheio: "", ponta: "" });
      o.setProperty("/manualRows", a);
    },

    onBack: function () {
      this.getOwnerComponent().getRouter().navTo("main");
    },

    onNext: function () {
      // copy manual data to component viewModel.stepData for next steps
      var compModel = this.getOwnerComponent().getModel("viewModel");
      var local = this.getView().getModel().getData();
      compModel.setProperty("/stepData/manualRows", local.manualRows);
      compModel.setProperty("/stepData/simple", local.simple);

      this.getOwnerComponent().getRouter().navTo("supplier");
    }
  });
});
