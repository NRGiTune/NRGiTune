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
        offers: [],
        selectedSupplier: null,
        selectedOffer: null,
        selectedOfferName: null,
        selectedPower: "6.9",
        //offer Prices
        offerStartDate: null,
        offerEndDate: null,
        offerSupplyType: null,
        offerCountType: null,
        offerSegment: null,
        offerContractDuration: null,
        //offer Prices
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
      this._getSupplierOffers();
      this._getSupplierOfferPowers();
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

    _getSupplierOffers: function () {
      // Load supplier offers list
      var oModel = this.getView().getModel();
      var selectedSupplier = oModel.oData.selectedSupplier;
      var oSuppliers = oModel.oData.suppliers;
      var found = oSuppliers.find(s => s.id === selectedSupplier);
      var oOffers = found ? found.offers.map(t => ({
        key: t.id,
        text: t.name,
        startDate: t.startDate,
        endDate: t.endDate,
        supplyType: t.supplyType,
        countType: t.countType,
        segment: t.segment,
        contractDuration: t.contractDuration,
        prices: t.prices
      })) : [];
      oModel.setProperty("/offers", oOffers);
      // select first offer is exists
      if (oOffers.length > 0) {
        var id = oOffers[0].key;
        oModel.setProperty("/selectedOffer", oOffers[0].key);
        oModel.setProperty("/selectedOfferName", oOffers[0].text);
      }
    },

    _getSupplierOfferPowers: function () {
      var oModel = this.getView().getModel();
      var selectedOffer = oModel.oData.selectedOffer;
      var selectedPower = oModel.oData.selectedPower;
      var oOffers = oModel.oData.offers;
      var found = oOffers.find(s => s.key === selectedOffer);
      oModel.setProperty("/offerStartDate", null);
      oModel.setProperty("/offerEndDate", null);
      oModel.setProperty("/offerSupplyType", null);
      oModel.setProperty("/offerCountType", null);
      oModel.setProperty("/offerSegment", null);
      oModel.setProperty("/offerContractDuration", null);
      if (found) {
        oModel.setProperty("/offerStartDate", found.startDate);
        oModel.setProperty("/offerEndDate", found.endDate);
        oModel.setProperty("/offerSupplyType", found.supplyType);
        oModel.setProperty("/offerCountType", found.countType);
        oModel.setProperty("/offerSegment", found.segment);
        oModel.setProperty("/offerContractDuration", found.contractDuration);
      }
      var oPowers = found ? found.prices.map(t => ({ key: t.Pot_Cont, text: t.Pot_Cont + " kW", cicloH: t.Contagem })) : [];
      var powers = oPowers.filter(item => item.cicloH === 1);
      oModel.setProperty("/powers", powers);
      var checkSelectedPower = oPowers.filter(item => item.key === selectedPower);
      if (checkSelectedPower.length === null && oPowers.length > 0) {
        oModel.setProperty("/selectedPower", oPowers[0].key);
      }
      this._getSupplierOfferPowersPrices();
    },

    _getSupplierOfferPowersPrices: function () {
      var oModel = this.getView().getModel();
      var selectedOffer = oModel.oData.selectedOffer;
      var selectedPower = oModel.oData.selectedPower;
      var oOffers = oModel.oData.offers;
      var found = oOffers.find(s => s.key === selectedOffer);
      var oPowers = found ? found.prices.map(t => ({
        key: t.Pot_Cont,
        cicloH: t.Contagem,
        tf: t.TF,
        prc1: t["TV|TVFV|TVP"],
        prc2: t["TVV|TVC"],
        prc3: t.TVVz
      })) : [];

      oModel.setProperty("/pricePwrSimple", 0);
      oModel.setProperty("/priceSimple", 0);
      oModel.setProperty("/pricePwrBi", 0);
      oModel.setProperty("/priceBiEmpty", 0);
      oModel.setProperty("/priceBiOutEmpty", 0);
      oModel.setProperty("/pricePwrTri", 0);
      oModel.setProperty("/priceTriEmpty", 0);
      oModel.setProperty("/priceTriFull", 0);
      oModel.setProperty("/priceTriRush", 0);

      var powersSimples = oPowers.filter(item => item.cicloH === 1 && String(item.key) === selectedPower);
      var powersBi = oPowers.filter(item => item.cicloH === 2 && String(item.key) === selectedPower);
      var powersTri = oPowers.filter(item => item.cicloH === 3 && String(item.key) === selectedPower);
      if (powersSimples !== null) {
        oModel.setProperty("/pricePwrSimple", powersSimples[0].tf);
        oModel.setProperty("/priceSimple", powersSimples[0].prc1);
      };
      if (powersBi !== null && powersBi.length > 0) {
        oModel.setProperty("/pricePwrBi", powersBi[0].tf);
        oModel.setProperty("/priceBiEmpty", powersBi[0].prc1);
        oModel.setProperty("/priceBiOutEmpty", powersBi[0].prc2);
      };
      if (powersTri !== null && powersTri.length > 0) {
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
      oModel.setProperty("/selectedOffer", null);
      this._getSupplierOffers();
      this._getSupplierOfferPowers();
    },

    onOfferChange: function (oEvt) {
      var sKey = oEvt.getParameter("selectedItem").getKey();
      var sName = oEvt.getParameter("selectedItem").getText();
      var oModel = this.getView().getModel();
      oModel.setProperty("/selectedOffer", sKey);
      oModel.setProperty("/selectedOfferName", sName);
      this._getSupplierOfferPowers();
    },

    onPowerChange: function (oEvt) {
      this._getSupplierOfferPowersPrices();
    },

    onShowOfferDetails: function () {
      var oModel = this.getView().getModel();
      var sSupplierKey = oModel.getProperty("/selectedSupplier");
      var sOfferKey = oModel.getProperty("/selectedOffer");
      if (!sSupplierKey || !sOfferKey) {
        sap.m.MessageToast.show("Escolha fornecedor e tarifário");
        return;
      }
      // buscar detalhes
      var sId = sSupplierKey;
      var suppliers = oModel.oData.suppliers;
      var sup = suppliers.find(s => s.id === sId);
      var t = (sup.offers || []).find(x => x.id === sOfferKey);
      this._openDetailsDialog(sup, t);
    },

    _openDetailsDialog: function (supplier, offer) {
      var that = this;
      if (!this._oDlg) {
        this._oDlg = new Dialog({
          title: "{/title}",
          content: [
            new sap.m.Text({ text: "{/subtitle}" }),
            new sap.m.IconTabBar({
              items: [
                new sap.m.IconTabFilter({
                  icon: "sap-icon://hint",
                  text: "Descrição",
                  content: new sap.m.Table({
                    columns: [
                      new sap.m.Column({ header: new Title({ text: "Descrição" }) }),
                      new sap.m.Column({ header: new Title({ text: "Valor" }) })
                    ],
                    items: {
                      path: "/conditions/conditionsDescr",
                      template: new sap.m.ColumnListItem({
                        cells: [new sap.m.Text({ text: "{descr}" }), new sap.m.Text({ text: "{text}" })]
                      })
                    }
                  })
                }),
                new sap.m.IconTabFilter({
                  icon: "sap-icon://chain-link",
                  text: "Links",
                  //content: new sap.m.List({
                  //  items: {
                  //    path: "/conditions/conditionsLinks",
                  //    template: new sap.m.StandardListItem({ title: "{descr}", description: "{text}" })
                  //  }
                  //})
                  content: new sap.m.Table({
                    columns: [
                      new sap.m.Column({ header: new Title({ text: "Descrição" }) }),
                      new sap.m.Column({ header: new Title({ text: "Ligação" }) })
                    ],
                    items: {
                      path: "/conditions/conditionsLinks",
                      template: new sap.m.ColumnListItem({
                        cells: [new sap.m.Text({ text: "{descr}" }), new sap.m.Link({
                          text: "Link",   // texto do link
                          href: "{text}",       // URL para abrir
                          target: "_blank"      // abre em nova aba (opcional)
                        })
                        ]
                      })
                    }
                  })



                }),
                new sap.m.IconTabFilter({
                  icon: "sap-icon://paid-leave",
                  text: "Reembolsos/Descontos",
                  content: new sap.m.Table({
                    columns: [
                      new sap.m.Column({ header: new Title({ text: "Descrição" }) }),
                      new sap.m.Column({ header: new Title({ text: "Valor" }) })
                    ],
                    items: {
                      path: "/conditions/conditionsRefundsDiscounts",
                      template: new sap.m.ColumnListItem({
                        cells: [new sap.m.Text({ text: "{descr}" }), new sap.m.Text({ text: "{text}" })]
                      })
                    }
                  })
                }),
                new sap.m.IconTabFilter({
                  icon: "sap-icon://message-warning",
                  text: "Limitações da oferta",
                  content: new sap.m.Table({
                    columns: [
                      new sap.m.Column({ header: new Title({ text: "Descrição" }) }),
                      new sap.m.Column({ header: new Title({ text: "Valor" }) })
                    ],
                    items: {
                      path: "/conditions/conditionsLimit",
                      template: new sap.m.ColumnListItem({
                        cells: [new sap.m.Text({ text: "{descr}" }), new sap.m.Text({ text: "{text}" })]
                      })
                    }
                  })
                }),
                new sap.m.IconTabFilter({
                  icon: "sap-icon://lead",
                  text: "Custo dos serviços adicionais",
                  content: new sap.m.Table({
                    columns: [
                      new sap.m.Column({ header: new Title({ text: "Descrição" }) }),
                      new sap.m.Column({ header: new Title({ text: "Valor" }) })
                    ],
                    items: {
                      path: "/conditions/conditionsCost",
                      template: new sap.m.ColumnListItem({
                        cells: [new sap.m.Text({ text: "{descr}" }), new sap.m.Text({ text: "{text}" })]
                      })
                    }
                  })
                }),
                new sap.m.IconTabFilter({
                  icon: "sap-icon://filter-facets",
                  text: "Filtro",
                  content: new sap.m.Table({
                    columns: [
                      new sap.m.Column({ header: new Title({ text: "Descrição" }) }),
                      new sap.m.Column({ header: new Title({ text: "Valor" }) })
                    ],
                    items: {
                      path: "/conditions/conditionsFilter",
                      template: new sap.m.ColumnListItem({
                        cells: [new sap.m.Text({ text: "{descr}" }), new sap.m.Text({ text: "{text}" })]
                      })
                    }
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
        title: supplier.name + " / " + offer.name + " / " + this.getView().getModel().getProperty("/selectedPower"),
        subtitle: "Detalhes do tarifário",
        priceRows: [
          { description: "Potência", value: offer.prices.power },
          { description: "Vazio", value: offer.prices.vazio },
          { description: "Cheio", value: offer.prices.cheio },
          { description: "Ponta", value: offer.prices.ponta }
        ],
        conditions: offer.conditions || []
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
