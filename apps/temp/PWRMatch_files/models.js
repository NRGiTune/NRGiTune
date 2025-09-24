sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "simulador/util/fileParserERSE",
  "simulador/model/modelsUtils"
], function (JSONModel, fileParserERSE, modelsUtils) {
  "use strict";

  return {



    createSupplierModel_DELETE: function (that) {
      var data = {
        suppliers: [
          {
            id: "sup1",
            name: "Fornecedor A",
            offers: [
              {
                id: "t1",
                name: "Tarifa A1",
                prices: { power: 5.5, vazio: 0.05, cheio: 0.12, ponta: 0.2 },
                conditions: [{ title: "Cond1", desc: "Descrição 1" }]
              },
              { id: "t2", name: "Tarifa A2", prices: { power: 6, vazio: 0.04, cheio: 0.11, ponta: 0.19 }, conditions: [] }
            ]
          },
          {
            id: "sup2",
            name: "Fornecedor B",
            offers: [
              { id: "t3", name: "Tarifa B1", prices: { power: 5.9, vazio: 0.045, cheio: 0.115, ponta: 0.18 }, conditions: [{ title: "Termo", desc: "..." }] }
            ]
          }
        ]
      };
      return new JSONModel(data);
    },




    createFlowModel: function () {
      var data = {
        // ## Main Step
        // eRedes Readings select options
        optionValEFRVisible: true,
        optionValEFRTypeVisible: true,
        // Message visibility
        optionValEFRMsgVisible: false,
        optionValEFRMsgType: "Ok",
        optionValEFRMsgIcon: "",
        optionValEFRMsg: "",
        // Table columns visibility
        consColsVisible: true,
        readColsVisible: false,
        toDateColVisible: true,
        // readingsEredes
        readingsEredes: [],
        // Comsuption/Readings registration
        consReadRows: [
          { fromDate: "", toDate: "", simple: "", consEmpty: "", consFull: "", consRush: "", readEmpty: "", readFull: "", readRush: "" }
        ],

        // ## Supplier info Step
        // Supplier ERSE list
        suppliersERSE: [],
        // commercial conditions ERSE list
        comOffersConditionsERSE: [],
        // commercial conditions prices ERSE list
        comOffersPricesERSE: [],
        // commercial conditions & prices metadataERSE list
        comOffersMetadataERSE: [],
        // Regulated market tarifes
        regMrktOffersERSE: [],



        // consuption calculated from readings or step 2 manual input
        //consuptions: [],

        powers: [{ key: "3.45", text: "3.45 kW" }, { key: "6.9", text: "6.9 kW" }],
        offers: [],
        selectedPower: "3.45",
        selectedSupplier: null,
        selectedOffer: null


      };
      return new JSONModel(data);
    },

    createEnergySupplierModel: function (oModel) {
      // supliers, tarifs, prices
      var data = {
        suppliers: [
          {
            id: "sup1",
            name: "Fornecedor A",
            offers: [
              { id: "t1", name: "Tarifa A1", prices: { power: 5.5, vazio: 0.05, cheio: 0.12, ponta: 0.2 }, conditions: [{ title: "Cond1", desc: "Descrição 1" }] },
              { id: "t2", name: "Tarifa A2", prices: { power: 6, vazio: 0.04, cheio: 0.11, ponta: 0.19 }, conditions: [] }
            ]
          }
        ]
      };
      return new JSONModel(data);
    },

    createERSEFilesModel: function (that) {
      // supliers, tarifs, prices
      fileParserERSE.parseERSEFiles(that);
    }


  };
});
