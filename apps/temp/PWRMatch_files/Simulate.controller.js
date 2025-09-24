sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("simulador.controller.Simulate", {
    onInit: function () {
      // Modelo de exemplo
      var oModel = new sap.ui.model.json.JSONModel({
        current: {
          logo: "imgs/suppliersLogos/edpLogo.png",
          name: "EDP",
          type: "Eletricidade",
          period: "22 Jul - 21 Aug",
          power: "6.9 kVA",
          fixedPrice: "0.568 €/dia",
          totalConsumption: "411 kWh",
          variablePrice: "0.164 €/kWh",
          amount: "102,49€"
        },
        offersCount: 2,
        offers: [
          {
            logo: "imgs/suppliersLogos/ibelectraLogo.png",
            name: "Ibelectra",
            contractType: "Solução Segura (DD + FE)",
            price: "91,86€",
            savings: "10,63€ poupança",
            ddMandatory: true,
            eInvoiceMandatory: true,
            noLoyalty: true,
            noSpecialConditions: true
          },
          {
            logo: "imgs/suppliersLogos/G9-Logo.svg",
            name: "G9",
            contractType: "Net Promo Verão",
            price: "93,55",
            savings: "8.94€ poupança",
            ddMandatory: false,
            eInvoiceMandatory: false,
            noLoyalty: false,
            noSpecialConditions: false
          }
        ]
      });
      this.getView().setModel(oModel);
    },

    onShowCurrentDetails: function () {
      this.onShowOfferDetails();
      MessageToast.show("Detalhes do contrato atual");
    },

    onShowOfferDetails: function (oEvent) {
      MessageToast.show("Detalhes da oferta selecionada");
      var oView = this.getView();

      // cria só uma vez
      if (!this._oDialog) {
        this._oDialog = new sap.m.Dialog({
          title: "Detalhes da Oferta",
          contentWidth: "80%",
          contentHeight: "80%",
          resizable: true,
          draggable: true,
          content: [
            new sap.ui.core.mvc.XMLView({
              viewName: "simulador.view.OfferDetails"   // nome da XMLView detalhada
            })
          ],
          beginButton: new sap.m.Button({
            text: "Fechar",
            press: function () {
              this._oDialog.close();
            }.bind(this)
          })
        });

        oView.addDependent(this._oDialog);
      }

      this._oDialog.open();
    },

    onOpenSavingsDialog: function () {
      var oView = this.getView();

      if (!this._oSavingsDialog) {
        this._oSavingsDialog = new sap.m.Dialog({
          title: "Poupança Estimada",
          contentWidth: "80%",
          contentHeight: "80%",
          resizable: true,
          draggable: true,
          content: [
            new sap.ui.core.mvc.XMLView({
              viewName: "simulador.view.SavingsDialog" // nova view
            })
          ],
          beginButton: new sap.m.Button({
            text: "Fechar",
            press: function () {
              this._oSavingsDialog.close();
            }.bind(this)
          })
        });

        oView.addDependent(this._oSavingsDialog);
      }

      this._oSavingsDialog.open();
    },

    onSwitch: function (oEvent) {
      MessageToast.show("Mudar para este fornecedor");
    },
    onNewSimulation: function () {
      // limpar dados da simulação

      // voltar ao início
      this.getOwnerComponent().getRouter().navTo("main");
    },

    onBack: function () {
      this.getOwnerComponent().getRouter().navTo("supplier");
    }


  });
});
