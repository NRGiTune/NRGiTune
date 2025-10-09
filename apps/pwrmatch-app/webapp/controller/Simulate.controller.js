sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
  "simulador/model/modelsUtils",
  "simulador/util/formatter",
  "simulador/model/simulate",
], function (Controller, MessageToast, JSONModel, modelsUtils, formatter, simulate) {
  "use strict";

  return Controller.extend("simulador.controller.Main", {

    formatter: formatter,

    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("simulate").attachPatternMatched(this._onRouteMatched, this);

      var oModel = new JSONModel({
        // Select supplier
        offer: [{}],
        suppliers: [],
        offers: [],
        offerPowers: [],
        powers: [],
        hourlyCycles: [
          { key: "1", text: "Simples" },
          { key: "2", text: "Bi-Horário" },
          { key: "3", text: "Tri-Horário" }
        ],
        selectedSupplier: "ERSE",
        selectedSupplierName: null,
        selectedSupplierLogo: null,
        selectedOffer: null,
        selectedOfferName: null,
        selectedOfferNameId: null,
        selectedPower: "6.9",
        selectedHourlyCycle: "1",

        // Offer
        offerFromDate: null,
        offerToDate: null,
        offerSupplyType: null,
        offerSupplyTypeEleVisibility: null,
        offerSupplyTypeGasVisibility: null,
        offerCountType: null,
        offerSegment: null,
        offerModality: null,
        offerContractDuration: null,

        // Offer Totals by Cycle
        offerSimpleSimulationTtl: 102.49,
        offerBiHSimulationTtl: 101.49,
        offerTriHSimulationTtl: 100.49,
        offerSimpleSavings: null,
        offerBiHSavings: null,
        offerTriHSavings: null,
        offerSimpleState: null,
        offerBiHState: null,
        offerTriHState: null,
        offerlowestHourlyCycle: null,
        offerlowestValue: null,

        offersCount: 2,
        //offers: [
        // {
        //    logo: "imgs/suppliersLogos/ibelectraLogo.png",
        //    name: "Ibelectra",
        //    contractType: "Solução Segura (DD + FE)",
        //    price: "91,86€",
        //    savings: "10,63€ poupança",
        //    ddMandatory: true,
        //    eInvoiceMandatory: true,
        //    noLoyalty: true,
        //    noSpecialConditions: true
        //  },
        //  {
        //    logo: "imgs/suppliersLogos/G9-Logo.svg",
        //    name: "IG9",
        //    contractType: "Net Promo Verão",
        //    price: "93,55€",
        //    savings: "8.94€ poupança",
        //    ddMandatory: false,
        //    eInvoiceMandatory: false,
        //    noLoyalty: false,
        //    noSpecialConditions: false
        //  }
        //]
        
      });
      this.getView().setModel(oModel);
      this._getSuppliers(this);
      //this._getSupplierOffers(this);
      //this._getSupplierOfferPowers(this);
      //this._getHourlyCiclesSavings();

    },

    _onRouteMatched: function (oEvent) {
      this._simulateOfferConsumptionByCycle();

    },

    _getSuppliers: function (that) {
      // Load suppliers list
      var oAppDataModel = that.getOwnerComponent().getModel("appDataModel");
      var oModel = this.getView().getModel();
      oModel.setProperty("/suppliers", oAppDataModel.oData.suppliers);
      this._updateSelectedSupplier(oModel);
    },

    onSupplierChange: function (oEvt) {
      var sKey = oEvt.getParameter("selectedItem").getKey();
      var sName = oEvt.getParameter("selectedItem").getText();
      var oModel = this.getView().getModel();
      oModel.setProperty("/selectedSupplier", sKey);
      this._updateSelectedSupplier(oModel);
    },

    _updateSelectedSupplier: function (oModel) {
      // update selected supplier - oModel receives xmlview model
      var suppliers = oModel.oData.suppliers;
      var selectedSupplier = oModel.oData.selectedSupplier;
      if (suppliers.length > 0 && !selectedSupplier) {
        oModel.setProperty("/selectedSupplier", suppliers[0].supplierId);
        selectedSupplier = suppliers[0].supplierId;
      }
      var supplier = suppliers.filter(item => item.supplierId === selectedSupplier);
      if (supplier[0]) {
        oModel.setProperty("/selectedOffer", null);
        oModel.setProperty("/selectedSupplierName", supplier[0].supplierName);
        var logo = "imgs/suppliersLogos/" + supplier[0].supplierLogo;
        oModel.setProperty("/selectedSupplierLogo", logo);
        this._getSupplierOffers(this);
      }
    },

    _getSupplierOffers: function (that) {
      // Load supplier offers list
      var oAppDataModel = that.getOwnerComponent().getModel("appDataModel");
      var oModel = this.getView().getModel();
      var selectedSupplier = oModel.oData.selectedSupplier;
      var offers = oAppDataModel.oData.suppliersOffers.filter(item => item.supplierId === selectedSupplier);
      oModel.setProperty("/offers", offers);
      this._updateSupplierOffers(oModel);
    },

    onOfferChange: function (oEvt) {
      var sKey = oEvt.getParameter("selectedItem").getKey();
      var oModel = this.getView().getModel();
      oModel.setProperty("/selectedOffer", sKey);
      this._updateSupplierOffers(oModel);
    },

    _updateSupplierOffers: function (oModel) {
      // Load supplier offers list
      var oModel = this.getView().getModel();
      //var selectedSupplier = oModel.oData.selectedSupplier;
      var offers = oModel.oData.offers;
      offers.sort((a, b) => a.offerNameId.localeCompare(b.offerNameId));
      var selectedOffer = oModel.oData.selectedOffer;
      if (offers.length > 0 && !selectedOffer) {
        //var id = oOffers[0].key;
        oModel.setProperty("/selectedOffer", offers[0].offerId);
        selectedOffer = offers[0].offerId;
      }
      var offer = offers.filter(item => item.offerId === selectedOffer);
      if (offer[0]) {
        oModel.setProperty("/selectedOfferName", offer[0].offerName);
        oModel.setProperty("/selectedOfferNameId", offer[0].offerName + "[" + offers[0].offerId + "]");
        oModel.setProperty("/offerFromDate", offer[0].offerFromDate);
        oModel.setProperty("/offerToDate", offer[0].offerToDate);
        oModel.setProperty("/offerSupplyType", offer[0].supplyType);
        if (offer[0].supplyType === "ELE") {
          oModel.setProperty("/offerSupplyTypeEleVisibility", true);
          oModel.setProperty("/offerSupplyTypeGasVisibility", false);
        } else if (offer[0].supplyType === "GN") {
          oModel.setProperty("/offerSupplyTypeEleVisibility", false);
          oModel.setProperty("/offerSupplyTypeGasVisibility", true);
        } else {
          oModel.setProperty("/offerSupplyTypeEleVisibility", true);
          oModel.setProperty("/offerSupplyTypeGasVisibility", true);
        }
        oModel.setProperty("/offerCountType", offer[0].offerCountType);
        oModel.setProperty("/offerSegment", offer[0].offerSegment);
        oModel.setProperty("/offerModality", offer[0].offerModality);
        oModel.setProperty("/offerContractDuration", offer[0].offerContractDuration);
        this._getSupplierOfferPowers(this);
      };
    },

    _getSupplierOfferPowers: function (that) {
      var oModel = this.getView().getModel();
      var selectedSupplier = oModel.oData.selectedSupplier;
      var selectedOffer = oModel.oData.selectedOffer;
      //var selectedHourlyCycle = oModel.oData.selectedHourlyCycle;
      var selectedPower = oModel.oData.selectedPower;
      var oOffers = oModel.oData.offers;
      var oAppDataModel = that.getOwnerComponent().getModel("appDataModel");
      var offersPrices = oAppDataModel.oData.offersPrices;
      const normalizeNum = val => Number(String(val ?? "").trim());
      var offerPowers = offersPrices.filter(item =>
        item.supplierId === selectedSupplier &&
        item.offerId === selectedOffer
        //&& normalizeNum(item.countingCycle) === normalizeNum(selectedHourlyCycle)
      );
      oModel.setProperty("/offerPowers", offerPowers);
      this._updateSupplierOfferPowers(oModel);
    },

    onPowerChange: function (oEvt) {
      var sKey = oEvt.getParameter("selectedItem").getKey();
      var oModel = this.getView().getModel();
      this._updateSupplierOfferPowers(oModel);
    },

    _updateSupplierOfferPowers: function (oModel) {
      var selectedHourlyCycle = oModel.oData.selectedHourlyCycle;
      var selectedPower = oModel.oData.selectedPower;
      var offerPowers = oModel.oData.offerPowers;

      const normalizeNum = val => Number(String(val ?? "").trim());
      var offerPowersCycle = offerPowers.filter(item =>
        normalizeNum(item.countingCycle) === normalizeNum(selectedHourlyCycle)
      );

      oModel.setProperty("/powers", offerPowersCycle);
      if (offerPowersCycle.length > 0 && !selectedPower) {
        oModel.setProperty("/selectedPower", normalizeNum(offerPowersCycle[0].power));
        selectedPower = offerPowersCycle[0].power;
      }
      var offerPower = offerPowersCycle.filter(item =>
        normalizeNum(item.power) === normalizeNum(selectedPower)
      );
      if (offerPower[0]) {
        oModel.setProperty("/selectedPower", normalizeNum(offerPower[0].power));
      }
      this._simulateOfferConsumptionByCycle();
    },

    _simulateOfferConsumptionByCycle: function () {
      const normalizeNum = val => Number(String(val ?? "").trim());
      // get app data model
      var oAppDataModel = this.getOwnerComponent().getModel("appDataModel");
      // gets view model
      var oModel = this.getView().getModel();
      var selectedPower = oModel.oData.selectedPower;
      var offerPowers = oModel.oData.offerPowers.filter(item =>
        normalizeNum(item.power) === normalizeNum(selectedPower)
      );
      //var offersPrices = oModel.oData.powers.filter(item =>
      //  normalizeNum(item.power) === normalizeNum(selectedPower)
      //);
      var consumptions = oAppDataModel.oData.consumptions;

      var offerSimulation = simulate.simulateOfferConsumptionByCycle(offerPowers, consumptions);
      oModel.setProperty("/offerSimpleSimulationTtl", offerSimulation.offerSimpleSimulationTtl);
      oModel.setProperty("/offerBiHSimulationTtl", offerSimulation.offerBiHSimulationTtl);
      oModel.setProperty("/offerTriHSimulationTtl", offerSimulation.offerTriHSimulationTtl);
      oAppDataModel.setProperty("/offerSimulation", offerSimulation);

      this._getHourlyCiclesSavings(oModel);
      this._simulateTopOffers();

    },

    _simulateTopOffers: function () {
      const normalizeNum = val => Number(String(val ?? "").trim());
      // get app data model
      var oAppDataModel = this.getOwnerComponent().getModel("appDataModel");
      // gets view model
      var oModel = this.getView().getModel();
      //var selectedSupplier = oModel.oData.selectedSupplier;
      //var selectedOffer = oModel.oData.selectedOffer;
      var offerSupplyType = oModel.oData.offerSupplyType;
      var selectedPower = oModel.oData.selectedPower;
      var selectedHourlyCycle = oModel.oData.selectedHourlyCycle;
      //var offerlowestHourlyCycle = oModel.oData.offerlowestHourlyCycle;
      //var offerlowestValue = oModel.oData.offerlowestValue;
      //offerSimpleSimulationTtl
      //offerBiHSimulationTtl
      //offerTriHSimulationTtl

      // Get offers by supply type: ELE; DUAL; GN
      var suppliersOffers = oAppDataModel.oData.suppliersOffers.filter(item =>
        item.supplyType === oModel.oData.offerSupplyType
      );
      // Get offers prices by selected power
      var offersPrices = oAppDataModel.oData.offersPrices.filter(item =>
        normalizeNum(item.power) === normalizeNum(selectedPower)
      );


      //var consumptions = oAppDataModel.oData.consumptions;

      var simulateTopOffersModel = {
        suppliers: oAppDataModel.oData.suppliers,
        suppliersOffers: suppliersOffers,
        offersPrices: offersPrices,
        consumptions: oAppDataModel.oData.consumptions,
        offerlowestHourlyCycle: oModel.oData.offerlowestHourlyCycle,
        offerlowestValue: oModel.oData.offerlowestValue
      };

      var topOffersSimulation = simulate.simulateTopOffers(simulateTopOffersModel);
      //oModel.setProperty("/offerSimpleSimulationTtl", offerSimulation.offerSimpleSimulationTtl);
      //oModel.setProperty("/offerBiHSimulationTtl", offerSimulation.offerBiHSimulationTtl);
      //oModel.setProperty("/offerTriHSimulationTtl", offerSimulation.offerTriHSimulationTtl);
      oAppDataModel.setProperty("/topOffersSimulation", topOffersSimulation);

      //this._getHourlyCiclesSavings(oModel);

    },

    onCycleChange: function (oEvt) {
      var sKey = oEvt.getParameter("selectedItem").getKey();
      var oModel = this.getView().getModel();
      this._updateSupplierOfferPowers(oModel);
      //this._getHourlyCiclesSavings(oModel);
    },

    _getHourlyCiclesSavings: function (oModel) {
      // Calculate hourly cicles savings based on selected hourly cycle
      var selectedHourlyCycle = oModel.oData.selectedHourlyCycle;

      var simpleAmountVal = oModel.oData.offerSimpleSimulationTtl;
      var simpleSavings = null;
      var simpleState = null;
      var biHAmountVal = oModel.oData.offerBiHSimulationTtl;
      var biHSavings = null;
      var biHState = null;
      var triHAmountVal = oModel.oData.offerTriHSimulationTtl;
      var triHSavings = null;
      var triHState = null;
      var lowestHourlyCycle = null; // 1 - Simple; 2 - Bi-hourly; 3 - Tri-hourly 

      switch (selectedHourlyCycle) {
        case "2": // bi-hourly
          simpleSavings = simpleAmountVal - biHAmountVal;
          biHSavings = biHAmountVal - biHAmountVal;
          triHSavings = triHAmountVal - biHAmountVal;
          break;
        case "3": // tri-hourly
          simpleSavings = simpleAmountVal - triHAmountVal;
          biHSavings = biHAmountVal - triHAmountVal;
          triHSavings = triHAmountVal - triHAmountVal;
          break;
        default: // simple
          simpleSavings = simpleAmountVal - simpleAmountVal;
          biHSavings = biHAmountVal - simpleAmountVal;
          triHSavings = triHAmountVal - simpleAmountVal;
          break;
      }

      if (simpleSavings < 0) {
        simpleState = "Success";
      } else if (simpleSavings > 0) {
        simpleState = "Warning";
      } else {
        simpleState = "Information";
      }

      if (biHSavings < 0) {
        biHState = "Success";
      } else if (biHSavings > 0) {
        biHState = "Warning";
      } else {
        biHState = "Information";
      }

      if (triHSavings < 0) {
        triHState = "Success";
      } else if (triHSavings > 0) {
        triHState = "Warning";
      } else {
        triHState = "Information";
      }

      //const values = {
      //  "1": simpleSavings,
      //  "2": biHSavings,
      //  "3": triHSavings
      //};

      //lowestHourlyCycle = Object.keys(values).reduce((a, b) =>
      //  values[a] < values[b] ? a : b
      //);

      const options = [
        { type: "1", value: simpleAmountVal },
        { type: "2", value: biHAmountVal },
        { type: "3", value: triHAmountVal }
      ];

      const lowest = options.reduce((min, curr) =>
        curr.value < min.value ? curr : min
      );

      oModel.setProperty("/offerSimpleSavings", simpleSavings);
      oModel.setProperty("/offerSimpleState", simpleState);
      oModel.setProperty("/offerBiHSavings", biHSavings);
      oModel.setProperty("/offerBiHState", biHState);
      oModel.setProperty("/offerTriHSavings", triHSavings);
      oModel.setProperty("/offerTriHState", triHState);
      oModel.setProperty("/offerlowestHourlyCycle", lowest.type);
      oModel.setProperty("/offerlowestValue", lowest.value);

    },

    DELETE_getSupplierOfferPowersPrices: function () {
      const normalizeNum = val => Number(String(val ?? "").trim());
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

      var powersSimples = oPowers.filter(item =>
        normalizeNum(item.cicloH) === 1 &&
        normalizeNum(item.key) === normalizeNum(selectedPower)
      );
      var powersBi = oPowers.filter(item =>
        normalizeNum(item.cicloH) === 2 &&
        normalizeNum(item.key) === normalizeNum(selectedPower)
      );
      var powersTri = oPowers.filter(item =>
        normalizeNum(item.cicloH) === 3 &&
        normalizeNum(item.key) === normalizeNum(selectedPower)
      );
      oModel.setProperty("/current/power", selectedPower);
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

    onOpenDialog: function () {
      var oView = this.getView();

      // cria só uma vez
      if (!this._oDialog) {

        var oView = this.getView(); // view pai
        var oComponent = this.getOwnerComponent();
        var oSubView = new sap.ui.core.mvc.XMLView({
          viewName: "simulador.view.OfferDetails"
        });
        // Herdar modelos e OwnerComponent
        oSubView.setModel(oComponent.getModel("appDataModel"), "appDataModel");
        oSubView.setModel(oComponent.getModel("i18n"), "i18n");
        oView.addDependent(oSubView); // importante para destruição automática

        this._oDialog = new sap.m.Dialog({
          title: "Detalhes",
          contentWidth: "80%",
          contentHeight: "80%",
          resizable: true,
          draggable: true,
          //content: [
          //  new sap.ui.core.mvc.XMLView({
          //    viewName: "simulador.view.OfferDetails"   // nome da XMLView detalhada
          //  })
          //],
          content: [oSubView],
          //content: [
          //  new sap.m.Page({
          //    enableScrolling: true,
          //    content: [
          //      new sap.ui.core.mvc.XMLView({
          //        viewName: "simulador.view.OfferDetails"
          //      })
          //    ]
          //  })
          //],
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

    onOpenDialogII: function () {

      if (!this._oDialog) {
        const oView = this.getView();
        const oComponent = this.getOwnerComponent();

        // Criação assíncrona da subview
        sap.ui.core.mvc.XMLView.create({
          viewName: "simulador.view.OfferDetails",
          models: {
            appDataModel: this.getOwnerComponent().getModel("appDataModel"),
            i18n: this.getOwnerComponent().getModel("i18n")
          }
        }).then(function (oSubView) {

          this.getView().addDependent(oSubView);

          this._oDialog = new sap.m.Dialog({
            title: "Detalhes",
            contentWidth: "80%",
            contentHeight: "80%",
            resizable: true,
            draggable: true,
            content: [
              new sap.m.Page({
                showHeader: false,
                enableScrolling: true,
                content: [oSubView]
              })
            ],
            beginButton: new sap.m.Button({
              text: "Fechar",
              press: function () {
                this._oDialog.close();
              }.bind(this)
            })
          });

          this.getView().addDependent(this._oDialog);
          this._oDialog.open();
        }.bind(this));

      } else {
        this._oDialog.open();
      }

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

    onShowCurrentDetails: function () {
      this.onOpenDialogII();
      MessageToast.show("Detalhes do contrato atual");
    },

    onShowOfferDetails: function (oEvent) {
      this.onOpenDialogII();
      MessageToast.show("Detalhes da oferta selecionada");
    },

    onSwitch: function (oEvent) {
      MessageToast.show("Mudar para este fornecedor");
    },

    onNewSimulation: function () {
      // limpar dados do componente

      // voltar ao início
      this.getOwnerComponent().getRouter().navTo("main");
    },

    onBack: function () {
      this.getOwnerComponent().getRouter().navTo("main");
    }

  });
});
