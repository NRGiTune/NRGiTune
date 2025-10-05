sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "simulador/util/formatter"
], function (Controller, formatter) {
  "use strict";

  return Controller.extend("simulador.controller.OfferDetails", {

    formatter: formatter,

    onInit: function () {
      // get app data model
      var oAppDataModel = null;
      if (this.getOwnerComponent()) {
        oAppDataModel = this.getOwnerComponent().getModel("appDataModel");
      } else {
        oAppDataModel = this.getView().getModel("appDataModel");
      };
      // gets view model

      var simple = oAppDataModel.oData.offerSimulation.simple;
      var totalsSimple = oAppDataModel.oData.offerSimulation.totalsSimple;
      var biH = oAppDataModel.oData.offerSimulation.biH;
      var totalsBiH = oAppDataModel.oData.offerSimulation.totalsBiH;
      var triH = oAppDataModel.oData.offerSimulation.triH;
      var totalsTriH = oAppDataModel.oData.offerSimulation.totalsTriH;


      var oModel = this.getView().getModel();
      // Modelo de exemplo
      var oModel = new sap.ui.model.json.JSONModel({

        //simple: oAppDataModel.oData.offerSimulation.simple,
        //totalsSimple: oAppDataModel.oData.offerSimulation.totalsSimple,
        //biH: oAppDataModel.oData.offerSimulation.biH,
        //totalsBiH: oAppDataModel.oData.offerSimulation.totalsBiH,
        //triH: oAppDataModel.oData.offerSimulation.triH,
        //totalsTriH: oAppDataModel.oData.offerSimulation.totalsTriH,

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
            { period: "Ponta", consumption: "94.00 kWh", price: "0.164 €" },
            { period: "Vazio", consumption: "143.00 kWh", price: "0.164 €" }
          ]
        },
        simple: {
          powers: [
            {
              startDate: "2025-08-01",
              endDate: "2025-08-31",
              days: "31 Dias",
              power: "6.9 kVA",
              pricePerDay: "0.568€",
              price: "17.62€"
            },
            {
              startDate: "2025-09-01",
              endDate: "2025-09-21",
              days: "21 Dias",
              power: "6.9 kVA",
              pricePerDay: "0.568€",
              price: "11.93€"
            }
          ],
          powersTtl: "29,55€",
          consuptions: [
            {
              startDate: "2025-08-01",
              endDate: "2025-08-31",
              simple: "Simples",
              kWh: "411 kWh",
              pricePerKWh: "0.15€",
              price: "61,65€"
            },
            {
              startDate: "2025-09-01",
              endDate: "2025-09-21",
              simple: "Simples",
              kWh: "411 kWh",
              pricePerKWh: "0.14€",
              price: "57,54€"
            }
          ],
          consuptionsTtl: "119,19€"
        },
        biHourly: {
          powers: [
            {
              startDate: "2025-08-01",
              endDate: "2025-08-31",
              days: "31 Dias",
              power: "6.9 kVA",
              pricePerDay: "0.568€",
              price: "17.62€"
            },
            {
              startDate: "2025-09-01",
              endDate: "2025-09-21",
              days: "21 Dias",
              power: "6.9 kVA",
              pricePerDay: "0.568€",
              price: "11.93€"
            }
          ],
          powersTtl: "29,55€",
          consuptions: [
            {
              startDate: "2025-08-01",
              endDate: "2025-08-31",
              empty: "Vazio",
              kWhEmpty: "411 kWh",
              pricePerKWhEmpty: "0.15€",
              priceEmpty: "61,65€",
              outEmpty: "Fora de vazio",
              kWhOutEmpty: "411 kWh",
              pricePerKWhOutEmpty: "0.15€",
              priceOutEmpty: "61,65€"
            },
            {
              startDate: "2025-09-01",
              endDate: "2025-09-21",
              empty: "Vazio",
              kWhEmpty: "411 kWh",
              pricePerKWhEmpty: "0.15€",
              priceEmpty: "61,65€",
              outEmpty: "Fora de vazio",
              kWhOutEmpty: "411 kWh",
              pricePerKWhOutEmpty: "0.15€",
              priceOutEmpty: "61,65€"
            }
          ],
          consuptionsTtl: "119,19€"
        },
        triHourly: {
          powers: [
            {
              startDate: "2025-08-01",
              endDate: "2025-08-31",
              days: "31 Dias",
              power: "6.9 kVA",
              pricePerDay: "0.568€",
              price: "17.62€"
            },
            {
              startDate: "2025-09-01",
              endDate: "2025-09-21",
              days: "21 Dias",
              power: "6.9 kVA",
              pricePerDay: "0.568€",
              price: "11.93€"
            }
          ],
          powersTtl: "29,55€",
          consuptions: [
            {
              startDate: "2025-08-01",
              endDate: "2025-08-31",
              empty: "Vazio",
              kWhEmpty: "411 kWh",
              pricePerKWhEmpty: "0.15€",
              priceEmpty: "61,65€",
              full: "Cheio",
              kWhFull: "411 kWh",
              pricePerKWhFull: "0.15€",
              priceFull: "61,65€",
              rush: "Cheio",
              kWhRush: "411 kWh",
              pricePerKWhRush: "0.15€",
              priceRush: "61,65€"
            },
            {
              startDate: "2025-09-01",
              endDate: "2025-09-21",
              empty: "Vazio",
              kWhEmpty: "411 kWh",
              pricePerKWhEmpty: "0.15€",
              priceEmpty: "61,65€",
              full: "Cheio",
              kWhFull: "411 kWh",
              pricePerKWhFull: "0.15€",
              priceFull: "61,65€",
              rush: "Cheio",
              kWhRush: "411 kWh",
              pricePerKWhRush: "0.15€",
              priceRush: "61,65€"
            }
          ],
          consuptionsTtl: "119,19€"
        }

      });
      this.getView().setModel(oModel);
    }
  });
});
