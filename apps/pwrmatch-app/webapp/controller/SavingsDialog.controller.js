sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
  "use strict";

  return Controller.extend("simulador.controller.SavingsDialog", {
    onInit: function () {
      var oModel = new JSONModel({
        savings: [
          { term: "Eletricidade", offer: "76.15 €", diff: "- 8.94€", state: "Success" },
          { term: "Taxas", offer: "3.33 €", diff: "0.00€", state: "None" },
          { term: "IVA", offer: "12.38 €", diff: "- 1.69€", state: "Success" }
        ],
        total: {
          offer: "91.86 €",
          diff: "- 10.63€"
        }
      });
      this.getView().setModel(oModel);
    }
  });
});
