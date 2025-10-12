sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "simulador/util/formatter",
  "sap/ui/model/json/JSONModel"
], function (Controller, formatter, JSONModel) {
  "use strict";

  return Controller.extend("simulador.controller.SavingsDialog", {

    formatter: formatter,

    onInit: function () {
      //var savingsModel = this.getModel("savingsModel");
      var oModel = new JSONModel({
        savings: [
          {
            term: "Consumo",
            current01: "Simples: 75.15 €",
            current02: "15",
            current03: "fff",
            offer01: "Simples: 77.15 €",
            offer02: "33",
            offer03: "444",
            diff: "- 8.94€",
            state: "Success"
          },
          {
            term: "Potência",
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
          lastUpdate: "06/10/2025",
          link: "https://simuladorprecos.erse.pt/"
        }
      });
      this.getView().setModel(oModel);
    },

    onAfterRendering: function () {
      var savingsModel = this.oView.getModel("savingsModel");
      // Power
      var powerCurrentVal = savingsModel.oData.offerSimulation.simple[0].powerValue;
      var powerOfferVal = savingsModel.oData.offerSimulation.simple[0].powerValue;
      if (savingsModel.oData.selectedHourlyCycle === "2") {
        var powerCurrentVal = savingsModel.oData.offerSimulation.biH[0].powerValue;

      } else if (savingsModel.oData.selectedHourlyCycle === "3") {
        var powerCurrentVal = savingsModel.oData.offerSimulation.triH[0].powerValue;
      };
      var offerHourlyCycle = savingsModel.oData.eventId;
      if (offerHourlyCycle && offerHourlyCycle.includes("offerSavingsBiH")) {
        var powerOfferVal = savingsModel.oData.offerSimulation.biH[0].powerValue;

      } else if (offerHourlyCycle && offerHourlyCycle.includes("offerSavingsTriH")) {
        var powerOfferVal = savingsModel.oData.offerSimulation.triH[0].powerValue;
      };
      var powerDifVal = powerOfferVal - powerCurrentVal;
      var powerSate = "None";
      if (powerDifVal < 0) {
        powerSate = "Success";
      } else if (powerDifVal > 0) {
        powerSate = "Warning";
      };

      var power = {
        term: "Potência",
        current01: powerCurrentVal,
        current02: 0,
        current03: 0,
        offer01: powerOfferVal,
        offer02: 0,
        offer03: 0,
        diff: powerDifVal,
        state: "None"
      };

      // Consumption
      var consumptionCurrentVal01 = savingsModel.oData.offerSimulation.simple[0].consumption[0].consumptionValue;
      var consumptionCurrentVal02 = 0;
      var consumptionCurrentVal03 = 0;
      var consumptionOfferVal01 = savingsModel.oData.offerSimulation.simple[0].consumption[0].consumptionValue;
      var consumptionOfferVal02 = 0;
      var consumptionOfferVal03 = 0;
      if (savingsModel.oData.selectedHourlyCycle === "2") {
        consumptionCurrentVal01 = savingsModel.oData.offerSimulation.biH[0].consumption[0].consumptionValue;
        consumptionCurrentVal02 = savingsModel.oData.offerSimulation.biH[0].consumption[1].consumptionValue;

      } else if (savingsModel.oData.selectedHourlyCycle === "3") {
        consumptionCurrentVal01 = savingsModel.oData.offerSimulation.triH[0].consumption[0].consumptionValue;
        consumptionCurrentVal02 = savingsModel.oData.offerSimulation.triH[0].consumption[1].consumptionValue;
        consumptionCurrentVal03 = savingsModel.oData.offerSimulation.triH[0].consumption[2].consumptionValue;
      };
      var offerHourlyCycle = savingsModel.oData.eventId;
      if (offerHourlyCycle && offerHourlyCycle.includes("offerSavingsBiH")) {
        consumptionOfferVal01 = savingsModel.oData.offerSimulation.biH[0].consumption[0].consumptionValue;
        consumptionOfferVal02 = savingsModel.oData.offerSimulation.biH[0].consumption[1].consumptionValue;

      } else if (offerHourlyCycle && offerHourlyCycle.includes("offerSavingsTriH")) {
        consumptionOfferVal01 = savingsModel.oData.offerSimulation.triH[0].consumption[0].consumptionValue;
        consumptionOfferVal02 = savingsModel.oData.offerSimulation.triH[0].consumption[1].consumptionValue;
        consumptionOfferVal03 = savingsModel.oData.offerSimulation.triH[0].consumption[2].consumptionValue;
      };
      var consumptionDifVal = (consumptionOfferVal01 + consumptionOfferVal02 + consumptionOfferVal03)
        - (consumptionCurrentVal01 + consumptionCurrentVal02 + consumptionCurrentVal03);
      var consumptionSate = "None";
      if (consumptionDifVal < 0) {
        consumptionSate = "Success";
      } else if (consumptionDifVal > 0) {
        consumptionSate = "Warning";
      };

      var consumption = {
        term: "Consumo",
        current01: consumptionCurrentVal01,
        current02: consumptionCurrentVal02,
        current03: consumptionCurrentVal03,
        offer01: consumptionOfferVal01,
        offer02: consumptionOfferVal02,
        offer03: consumptionOfferVal03,
        diff: consumptionDifVal,
        state: "None"
      };

      var savings = [
        power, consumption
      ];

      var currentTtl = savingsModel.oData.offerSimulation.offerSimpleSimulationTtl;
      var offerTtl = savingsModel.oData.offerSimulation.offerSimpleSimulationTtl;

      if (savingsModel.oData.selectedHourlyCycle === "2") {
        currentTtl = savingsModel.oData.offerSimulation.offerBiHSimulationTtl;
      } else if (savingsModel.oData.selectedHourlyCycle === "3") {
        currentTtl = savingsModel.oData.offerSimulation.offerTriHSimulationTtl;
      };
      var offerHourlyCycle = savingsModel.oData.eventId;
      if (offerHourlyCycle && offerHourlyCycle.includes("offerSavingsBiH")) {
        offerTtl = savingsModel.oData.offerSimulation.offerBiHSimulationTtl;

      } else if (offerHourlyCycle && offerHourlyCycle.includes("offerSavingsTriH")) {
        offerTtl = savingsModel.oData.offerSimulation.offerTriHSimulationTtl;
      };


      var diffTtl = offerTtl - currentTtl;
      var stateTtl = "None";
      if (diffTtl < 0) {
        stateTtl = "Success";
      } else if (diffTtl > 0) {
        stateTtl = "Warning";
      };
      var total = {
        offer: offerTtl,
        current: currentTtl,
        diff: diffTtl,
        state: stateTtl
      };

      var oViewModel = this.oView.getModel();
      oViewModel.setProperty("/savings", savings);
      oViewModel.setProperty("/total", total);

    }

  });
});
