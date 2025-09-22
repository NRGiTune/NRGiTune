sap.ui.define([
  "sap/ui/model/json/JSONModel"
], function (JSONModel) {
  "use strict";

  return {

    getPricesBySupplierTariff: function (jsonData, supplierID, tariffID) {

      return jsonData
        .filter(item => item.COM === supplierID && item.COD_Proposta === tariffID)
        .map(item => ({
          Pot_Cont: item.Pot_Cont,
          Contagem: item.Contagem,
          TF: item.TF,
          "TV|TVFV|TVP": item["TV|TVFV|TVP"],
          "TVV|TVC": item["TVV|TVC"],
          TVVz: item.TVVz
        }));

    },

    getSuppliers: function (that) {
      // Get ERSE data models
      var oAppFlowModel = that.getOwnerComponent().getModel("appFlowModel");
      var suppliersERSE = oAppFlowModel.oData.suppliersERSE;
      var comConditionsERSE = oAppFlowModel.oData.comConditionsERSE;
      var comConditionsPricesERSE = oAppFlowModel.oData.comConditionsPricesERSE;
      var comConditionsPricesMetadataERSE = oAppFlowModel.oData.comConditionsPricesMetadataERSE;
      var regMrktTariffsERSE = oAppFlowModel.oData.regMrktTariffsERSE;
      // Supplier model elements
      var suppliers = [];
      var tariffs = [];
      var tariffsPrices = [];
      var tariffsConditions = [];
      // Create ERSE regulated market reference
      // Tarnsform prices 
      tariffsPrices = this.getPricesBySupplierTariff(regMrktTariffsERSE, "ERSE", "MR");

      var suppliers = [{

        id: "ERSE",
        name: "ERSE - Entidade Reguladora dos Serviços Energéticos",
        tariffs: [
          {
            id: "MR",
            descr: "Mercado regulado",
            prices: tariffsPrices,
            conditions: [{ title: "Tarifas e Preços Regulados", desc: ". . .", link: "https://www.erse.pt/atividade/regulacao/tarifas-e-precos-eletricidade/#tarifas-e-precos-regulados" }]
          }
        ]

      }];


      suppliersERSE.forEach(function (item) {
        //if (item[0] && item[1]) {
        if (item.id && item.name) {
          var exists = suppliers.some(function (s) {
            return s.id === item.id;
          });
          if (!exists) {

            var oComConditionsERSE = comConditionsERSE.filter(element => element.COM === item.id );

            var supplier = {
              id: item.id,
              name: item.name,
              tariffs: [
                {
                  id: item.id,
                  descr: item.name,
                  prices: tariffsPrices,
                  conditions: [{ title: "Tarifas e Preços Regulados_1", desc: ". . .", link: "https://www.erse.pt/atividade/regulacao/tarifas-e-precos-eletricidade/#tarifas-e-precos-regulados" }]
                }
              ]
            };

            suppliers.push(supplier);

          }
        }
      });

      return suppliers;
    },



  };
});
