sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "simulador/util/fileParserERSE"
], function (JSONModel, fileParserERSE) {
  "use strict";

  return {

    createDataModel: function () {
      var data = {
        suppliers: [],        // suppliers { supplierId, supplierName, supplierLogo 
        suppliersOffers: [],  // {supplierId, offerID, offerName, offerFromDate, offerToDate, ... }
        offersPrices: [],     // {supplierId, offerID, offerFromDate, offerToDate, power, ... }
        regMarketPrices: [],  // {supplierId, offerID, offerFromDate, offerToDate, power, ... }
        metadata: [],         // {	prices {id, description}, offers {id, description} }
        readings: [],         // {readingDate, readingType, origin, status, empty, rush, full}
        consumptions: [],     // {fromDate, toDate, consumptionSimple, consumptionEmpty, consumptionFull, consumptionRush, readingsEmpty, readingsFull, readingsRush, checkState, checkMsg}
        offerSimulation: [],
        topOffersSimulation: []   
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
          //{ fromDate: "", toDate: "", consSimple: "", consEmpty: "", consFull: "", consRush: "", readEmpty: "", readFull: "", readRush: "" }
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
    }
    

  };
});
