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
      //var oAppFlowModel = this.getOwnerComponent().getModel("appFlowModel");
      //oAppFlowModel.setProperty("/suppliers", modelsUtils.getSuppliers(this));
      //this.setModel(models.createSupplierModel(this), "suppliers");
      // sample powers
      var o = new JSONModel({
        suppliers: [],
        powers: [],
        tariffs: [],
        selectedSupplier: null,
        selectedTariff: null,
        selectedPower: "6.9",
        //pricePower: "pricePower",
        pricePwrSimple: null,
        priceSimple: null,
        pricePwrBi: null,
        priceBiEmpty: null,
        priceBiOutEmpty: null,
        pricePwrTri: null,
        priceTriEmpty: null,
        priceTriFull: null,
        priceTriRush: null,
      });
      this.getView().setModel(o);
      this._getSuppliers(this);
      this._getSupplierTariffs();
      this._getSupplierTariffPowers();
      //var suppliers = new JSONModel({
      //  suppliers: oAppFlowModel.oData.suppliers
      //});
      //this.getView().setModel(suppliers, "suppliers");
    },

    _getSuppliers: function (that) {
      // Load suppliers list
      var oSuppliers = modelsUtils.getSuppliers(that);
      var oAppFlowModel = that.getOwnerComponent().getModel("appFlowModel");
      oAppFlowModel.setProperty("/suppliers", oSuppliers);
      var oModel = this.getView().getModel();
      oModel.setProperty("/suppliers", oSuppliers);
      if (oSuppliers.length > 0) {
        // var id = oSuppliers[0].id;
        oModel.setProperty("/selectedSupplier", oSuppliers[0].id);
      }
    },

    _getSupplierTariffs: function () {
      // Load supplier tariffs list
      var oModel = this.getView().getModel();
      var selectedSupplier = oModel.oData.selectedSupplier;
      var oSuppliers = oModel.oData.suppliers;
      var found = oSuppliers.find(s => s.id === selectedSupplier);
      var oTariffs = found ? found.tariffs.map(t => ({ key: t.id, text: t.descr, prices: t.prices })) : [];
      oModel.setProperty("/tariffs", oTariffs);
      // select first tariff is exists
      if (oTariffs.length > 0) {
        var id = oTariffs[0].key;
        oModel.setProperty("/selectedTariff", oTariffs[0].key);
      }
    },

    _getSupplierTariffPowers: function () {
      var oModel = this.getView().getModel();
      var selectedTariff = oModel.oData.selectedTariff;
      var selectedPower = oModel.oData.selectedPower;
      var oTariffs = oModel.oData.tariffs;
      var found = oTariffs.find(s => s.key === selectedTariff);
      var oPowers = found ? found.prices.map(t => ({ key: t.Pot_Cont, text: t.Pot_Cont + " kW", cicloH: t.Contagem })) : [];
      var powers = oPowers.filter(item => item.cicloH === 1);
      oModel.setProperty("/powers", powers);
      var checkSelectedPower = oPowers.filter(item => item.key === selectedPower);
      if (checkSelectedPower.length === null && oPowers.length > 0) {
        oModel.setProperty("/selectedPower", oPowers[0].key);
      }
      this._getSupplierTariffPowersPrices();
    },

    _getSupplierTariffPowersPrices: function () {
      var oModel = this.getView().getModel();
      var selectedTariff = oModel.oData.selectedTariff;
      var selectedPower = oModel.oData.selectedPower;
      var oTariffs = oModel.oData.tariffs;
      var found = oTariffs.find(s => s.key === selectedTariff);
      var oPowers = found ? found.prices.map(t => ({
        key: t.Pot_Cont,
        cicloH: t.Contagem,
        tf: t.TF,
        prc1: t["TV|TVFV|TVP"],
        prc2: t["TVV|TVC"],
        prc3: t.TVVz
      })) : [];

      var powersSimples = oPowers.filter(item => item.cicloH === 1 && String(item.key) === selectedPower);
      var powersBi = oPowers.filter(item => item.cicloH === 2 && String(item.key) === selectedPower);
      var powersTri = oPowers.filter(item => item.cicloH === 3 && String(item.key) === selectedPower);
      if (powersSimples !== null) {
        oModel.setProperty("/pricePwrSimple", powersSimples[0].tf);
        oModel.setProperty("/priceSimple", powersSimples[0].prc1);
      };
      if (powersBi !== null) {
        oModel.setProperty("/pricePwrBi", powersBi[0].tf);
        oModel.setProperty("/priceBiEmpty", powersBi[0].prc1);
        oModel.setProperty("/priceBiOutEmpty", powersBi[0].prc2);
      };
      if (powersTri !== null && powersTri.length > 0 ) {
        oModel.setProperty("/pricePwrTri", powersTri[0].tf);
        oModel.setProperty("/priceTriEmpty", powersTri[0].prc1);
        oModel.setProperty("/priceTriFull", powersTri[0].prc2);
        oModel.setProperty("/priceTriRush", powersTri[0].prc3);
      };
    },

    onSupplierChange: function (oEvt) {
      var sKey = oEvt.getParameter("selectedItem").getKey();
      var oModel = this.getView().getModel();
      oModel.setProperty("/selectedSupplier", sKey);
      oModel.setProperty("/selectedTariff", null);
      this._getSupplierTariffs();
      this._getSupplierTariffPowers();
    },

    onTariffChange: function (oEvt) {
      var sKey = oEvt.getParameter("selectedItem").getKey();
      var oModel = this.getView().getModel();
      oModel.setProperty("/selectedTariff", sKey);
      this._getSupplierTariffPowers();
    },

    onPowerChange: function (oEvt) {
      this._getSupplierTariffPowersPrices();
    },

    onShowTariffDetails: function () {
      var oModel = this.getView().getModel();
      var sSupplierKey = oModel.getProperty("/selectedSupplier");
      var sTariffKey = oModel.getProperty("/selectedTariff");
      if (!sSupplierKey || !sTariffKey) {
        sap.m.MessageToast.show("Escolha fornecedor e tarifário");
        return;
      }
      // buscar detalhes
      var sId = sSupplierKey;
      var suppliers = oModel.oData.suppliers;
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
      this.getOwnerComponent().getRouter().navTo("simulate");
    }
  });
});
