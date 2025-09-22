sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Title",
  "sap/m/Text",
  "sap/m/OverflowToolbar",
  "sap/m/ToolbarSpacer",
  "sap/ui/model/json/JSONModel",
  "simulador/model/modelsUtils"

], function (Controller, Dialog, Button, Title, Text, OverflowToolbar, ToolbarSpacer, JSONModel, modelsUtils) {
  "use strict";
  return Controller.extend("simulador.controller.supplier", {
    onInit: function () {
      var oAppFlowModel = this.getOwnerComponent().getModel("appFlowModel");
      oAppFlowModel.setProperty("/suppliers", modelsUtils.getSuppliers(this));
      //this.setModel(models.createSupplierModel(this), "suppliers");
      // sample powers
      var o = new JSONModel({
        //powers: [{ key: "3.45", text: "3.45 kW" }, { key: "6.9", text: "6.9 kW" }],
        powers: [],
        tariffs: [],
        selectedSupplier: "ERSE",
        selectedTariff: null,
        selectedPower: null
      });
      this.getView().setModel(o);
      this._getSupplierTariffs("ERSE");
      this._getSupplierTariffPrices("6.9");
      var suppliers = new JSONModel({
        suppliers: oAppFlowModel.oData.suppliers
      });
      this.getView().setModel(suppliers, "suppliers");
    },

    onSupplierChange: function (oEvt) {
      var sKey = oEvt.getParameter("selectedItem").getKey();
      this._getSupplierTariffs(sKey);
      // carregar tarifários do fornecedor (exemplo: busca no model suppliers)
      //var oSuppliers = this.getOwnerComponent().getModel("suppliers").getData().suppliers;
      //var found = oSuppliers.find(s => s.id === sKey);
      //var aTariffs = found ? found.tariffs.map(t => ({ key: t.id, text: t.name, details: t })) : [];
      //this.getView().getModel().setProperty("/tariffs", aTariffs);
    },

    onTariffChange: function (oEvt) {
      var sKey = oEvt.getParameter("selectedItem").getKey();
      this._getSupplierTariffs(sKey);

    },

    _getSupplierTariffs: function (sKey) {
      // carregar tarifários do fornecedor (exemplo: busca no model suppliers)
      var oSuppliers = this.getOwnerComponent().oModels.appFlowModel.oData.suppliers;
      var found = oSuppliers.find(s => s.id === sKey);
      var oTariffs = found ? found.tariffs.map(t => ({ key: t.id, text: t.descr, prices: t.prices })) : [];
      this.getView().getModel().setProperty("/tariffs", oTariffs);
      // select first tariff is exists
      if (oTariffs.length > 0) {
        var id = oTariffs[0].key;
        this.getView().getModel().setProperty("/selectedTariff", oTariffs[0].key);
      }
    },

    _getSupplierTariffPrices: function (sKey) {
      var oModel = this.getView().getModel();
      var selectedTariff = oModel.oData.selectedTariff;
      var oTariffs = oModel.oData.tariffs;
      var found = oTariffs.find(s => s.key === selectedTariff);
      var oPowers = found ? found.prices.map(t => ({ key: t.Pot_Cont, text: t.Pot_Cont + " kW", cicloH: t.Contagem })) : [];
      var powers = oPowers.filter(item => item.cicloH === 1);
      this.getView().getModel().setProperty("/powers", powers);
      if (sKey !== null) {
        this.getView().getModel().setProperty("/selectedPower", sKey);
      }
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
      var suppliers = this.getView().getModel("suppliers").getData().suppliers;
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
                      new sap.m.Column({ header: new Title({ text: "Descrição" }) }),
                      new sap.m.Column({ header: new Title({ text: "Valor" }) })
                    ],
                    items: {
                      path: "/priceRows",
                      template: new sap.m.ColumnListItem({
                        cells: [new sap.m.Text({ text: "{description}" }), new sap.m.Text({ text: "{value}" })]
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
          endButton: new Button({ text: "Fechar", press: function () { that._oDlg.close(); } })
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
      this.getOwnerComponent().getRouter().navTo("main");
    },

    onSimulate: function () {
      // guardar seleção para o componente
      var oCompModel = this.getOwnerComponent().getModel("viewModel");
      var local = this.getView().getModel().getData();
      //oCompModel.setProperty("/stepData/selection", local);
      this.getOwnerComponent().getRouter().navTo("step4");
    }
  });
});
