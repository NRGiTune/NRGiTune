sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function(Controller) {
  "use strict";

  return Controller.extend("simulador.controller.OfferDetails", {
    onInit: function() {
      // Modelo de exemplo
      var oModel = new sap.ui.model.json.JSONModel({
        current: {
          logo: "imgs/suppliersLogos/edpLogo.png",
          name: "EDP",
          type: "Eletricidade",
          period: "22 Jul - 21 Aug",
          totalConsumption: "411 kWh",
          variablePrice: "0.164 €/kWh",
          fixedPrice: "0.568 €/dia",
          totalVariable: "67.47€",
          totalFixed: "17.62€",
          taxes: "3.33€",
          amount: "102.49€",
          details: [
            { period: "Cheias", consumption: "174.00 kWh", price: "0.164 €" },
            { period: "Ponta",  consumption: "94.00 kWh",  price: "0.164 €" },
            { period: "Vazio",  consumption: "143.00 kWh", price: "0.164 €" }
          ]
        }
      });
      this.getView().setModel(oModel);
    }
  });
});
