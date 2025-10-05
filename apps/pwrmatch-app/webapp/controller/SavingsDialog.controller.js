sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
  "use strict";

  return Controller.extend("simulador.controller.SavingsDialog", {
    onInit: function () {
      var oModel = new JSONModel({
        savings: [
          { term: "Consumo", 
            current01: "Simples: 75.15 €", 
            current02: "15", 
            current03: "fff", 
            offer01: "Simples: 77.15 €", 
            offer02: "33", 
            offer03: "444", 
            diff: "- 8.94€", 
            state: "Success" 
          },
          { term: "Potência", 
            current01: " 7.15 €", 
            current02: "", 
            current03: "", 
            offer01: " 8.15 €", 
            offer02: "", 
            offer03: "", 
            diff: "0.00€", 
            state: "None" 
          }
        ],
        total: {
          offer: "91.86 €",
          current: "91.86 €",
          diff: "- 10.63€",
          state: "Success" 
        },
        erse: {
          lastUpdate: "19/09/2025",
          link: "https://simuladorprecos.erse.pt/"
        }
      });
      this.getView().setModel(oModel);
    }
  });
});
