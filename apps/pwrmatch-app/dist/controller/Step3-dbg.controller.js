sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Title",
  "sap/m/Text",
  "sap/m/OverflowToolbar",
  "sap/m/ToolbarSpacer",
  "sap/ui/model/json/JSONModel"
], function (Controller, Dialog, Button, Title, Text, OverflowToolbar, ToolbarSpacer, JSONModel) {
  "use strict";
  return Controller.extend("simulador.controller.Step3", {
    onInit: function () {
      // sample powers
      var o = new JSONModel({
        powers: [{ key: "3.45", text: "3.45 kW" }, { key: "6.9", text: "6.9 kW" }],
        tariffs: [],
        selectedPower: "3.45",
        selectedSupplier: null,
        selectedTariff: null
      });
      this.getView().setModel(o);
    },

    onSupplierChange: function (oEvt) {
      var sKey = oEvt.getParameter("selectedItem").getKey();
      // carregar tarifários do fornecedor (exemplo: busca no model suppliers)
      var oSuppliers = this.getOwnerComponent().getModel("suppliers").getData().suppliers;
      var found = oSuppliers.find(s => s.id === sKey);
      var aTariffs = found ? found.tariffs.map(t => ({ key: t.id, text: t.name, details: t })) : [];
      this.getView().getModel().setProperty("/tariffs", aTariffs);
    },

    onShowDetails: function () {
      var oModel = this.getView().getModel();
      var sSupplierKey = oModel.getProperty("/selectedSupplier");
      var sTariffKey = oModel.getProperty("/selectedTariff");
      if (!sSupplierKey || !sTariffKey) {
        sap.m.MessageToast.show("Escolha fornecedor e tarifário");
        return;
      }
      // buscar detalhes
      var sId = sSupplierKey;
      var suppliers = this.getOwnerComponent().getModel("suppliers").getData().suppliers;
      var sup = suppliers.find(s => s.id === sId);
      var t = (sup.tariffs || []).find(x => x.id === sTariffKey);
      this._openDetailsDialog(sup, t);
    },

    _openDetailsDialog: function (supplier, tariff) {
      var that = this;
      if (!this._oDlg) {
        this._oDlg = new Dialog({
          title: "{/title}",
          content: [
            new sap.m.Text({ text: "{/subtitle}" }),
            new sap.m.IconTabBar({
              items: [
                new sap.m.IconTabFilter({
                  icon: "sap-icon://money",
                  text: "Preços",
                  content: new sap.m.Table({
                    columns: [
                      new sap.m.Column({ header: new Title({text: "Descrição"}) }),
                      new sap.m.Column({ header: new Title({text: "Valor"})})
                    ],
                    items: {
                      path: "/priceRows",
                      template: new sap.m.ColumnListItem({
                        cells: [ new sap.m.Text({text: "{description}"}), new sap.m.Text({text: "{value}"}) ]
                      })
                    }
                  })
                }),
                new sap.m.IconTabFilter({
                  icon: "sap-icon://hint",
                  text: "Condições",
                  content: new sap.m.List({
                    items: { path: "/conditions", template: new sap.m.StandardListItem({ title: "{title}", description: "{desc}" }) }
                  })
                })
              ]
            })
          ],
          endButton: new Button({ text: "Fechar", press: function () { that._oDlg.close(); }})
        });
      }

      // popular dados do dialog
      var oDlgModel = new JSONModel({
        title: supplier.name + " / " + tariff.name + " / " + this.getView().getModel().getProperty("/selectedPower"),
        subtitle: "Detalhes do tarifário",
        priceRows: [
          { description: "Potência", value: tariff.prices.power },
          { description: "Vazio", value: tariff.prices.vazio },
          { description: "Cheio", value: tariff.prices.cheio },
          { description: "Ponta", value: tariff.prices.ponta }
        ],
        conditions: tariff.conditions || []
      });
      this._oDlg.setModel(oDlgModel);
      this._oDlg.open();
    },

    onBack: function () {
      this.getOwnerComponent().getRouter().navTo("step2");
    },

    onSimulate: function () {
      // guardar seleção para o componente
      var oCompModel = this.getOwnerComponent().getModel("viewModel");
      var local = this.getView().getModel().getData();
      oCompModel.setProperty("/stepData/selection", local);
      this.getOwnerComponent().getRouter().navTo("step4");
    }
  });
});
