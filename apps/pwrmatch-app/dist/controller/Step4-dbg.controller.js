sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";
  return Controller.extend("simulador.controller.Step4", {
    onNewSimulation: function () {
      // limpar dados do componente
      var vm = this.getOwnerComponent().getModel("viewModel");
      vm.setProperty("/stepData", {});
      vm.setProperty("/hasFile", true);
      vm.setProperty("/invoiceOption", "leituras");
      // voltar ao início
      this.getOwnerComponent().getRouter().navTo("main");
    },

    onBack: function () {
      this.getOwnerComponent().getRouter().navTo("step3");
    }
  });
});
