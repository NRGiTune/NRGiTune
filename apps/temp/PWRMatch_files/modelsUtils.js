sap.ui.define([
  "sap/ui/model/json/JSONModel"
], function (JSONModel) {
  "use strict";

  return {

    getPricesBySupplierOffer: function (jsonData, supplierID, offerID) {

      return jsonData
        .filter(item => item.COM === supplierID && item.COD_Proposta === offerID)
        .map(item => ({
          Pot_Cont: item.Pot_Cont,
          Contagem: item.Contagem,
          TF: item.TF,
          "TV|TVFV|TVP": item["TV|TVFV|TVP"],
          "TVV|TVC": item["TVV|TVC"],
          TVVz: item.TVVz
        }));

    },

    mapOffersMetadataSegment: function (segment, condModel) {
      // Map condModel into offer comercial conditions segment
      const results = segment.map(link => {
        const match = condModel.find(c => c.id === link.id);
        return {
          ...link,
          text: match ? match.text : "" // adda text if exists
        };
      });
      return results
    },

    mapOfferConditions: function (segments, condModel) {
      // Map offer comercial conditions segment into offer conditions

      var conditionsLinks = this.mapOffersMetadataSegment(
                segments.conditionsLinks, condModel
              );
      var conditionsRefundsDiscounts = this.mapOffersMetadataSegment(
                segments.conditionsRefundsDiscounts, condModel
              );
      var conditionsDescr = this.mapOffersMetadataSegment(
                segments.conditionsDescr, condModel
              );
      var conditionsLimit = this.mapOffersMetadataSegment(
                segments.conditionsLimit, condModel
              );
      var conditionsCost = this.mapOffersMetadataSegment(
                segments.conditionsCost, condModel
              );
      var conditionsFilter = this.mapOffersMetadataSegment(
                segments.conditionsFilter, condModel
              );

      return {
        conditionsLinks: conditionsLinks,
        conditionsRefundsDiscounts: conditionsRefundsDiscounts,
        conditionsDescr: conditionsDescr,
        conditionsLimit: conditionsLimit,
        conditionsCost: conditionsCost,
        conditionsFilter: conditionsFilter
      }
    },

    filterOffersMetadataSegments: function (condComerciais) {
      // Filter offer comercial conditions into segments

      // Filter metadata to create conditions by type "link" ou "contacto"
      const conditionsLinks = condComerciais.filter(
        item => item.descr
          && (
            item.descr.toLowerCase().includes("link")
            || item.descr.toLowerCase().includes("contacto")
          )
      );
      // Filter metadata to create conditions by type "reembolsos/descontos" ou "desconto/reembolsos" ou "desconto"
      const conditionsRefundsDiscounts = condComerciais.filter(
        item => item.descr
          && (
            item.descr.toLowerCase().includes("reembolsos/descontos")
            || item.descr.toLowerCase().includes("desconto/reembolsos")
            || item.descr.toLowerCase().includes("desconto")
          )
      );
      // Filter metadata to create conditions by type "descritivo" ou "detalhe" ou "comentários" ou "texto"
      const conditionsDescr = condComerciais.filter(
        item => item.descr
          && (
            item.descr.toLowerCase().includes("descritivo")
            || item.descr.toLowerCase().includes("detalhe")
            || item.descr.toLowerCase().includes("comentários")
            || item.descr.toLowerCase().includes("texto")
          )
      );
      // Filter metadata to create conditions by type "limitações"
      const conditionsLimit = condComerciais.filter(
        item => item.descr
          && (
            item.descr.toLowerCase().includes("limitações")
          )
      );
      // Filter metadata to create conditions by type "custo"
      const conditionsCost = condComerciais.filter(
        item => item.descr
          && (
            item.descr.toLowerCase().includes("custo")
          )
      );
      // Filter metadata to create conditions by type "filtro"
      const conditionsFilter = condComerciais.filter(
        item => item.id
          && (
            item.id.toLowerCase().includes("filtro")
          )
      );

      return {
        conditionsLinks: conditionsLinks,
        conditionsRefundsDiscounts: conditionsRefundsDiscounts,
        conditionsDescr: conditionsDescr,
        conditionsLimit: conditionsLimit,
        conditionsCost: conditionsCost,
        conditionsFilter: conditionsFilter
      }

    },

    getSuppliers: function (that) {
      // Get ERSE data models
      var oAppFlowModel = that.getOwnerComponent().getModel("appFlowModel");
      var suppliersERSE = oAppFlowModel.oData.suppliersERSE;
      var comOffersConditionsERSE = oAppFlowModel.oData.comOffersConditionsERSE;
      var comOffersPricesERSE = oAppFlowModel.oData.comOffersPricesERSE;
      var comOffersMetadataERSE = oAppFlowModel.oData.comOffersMetadataERSE;
      var regMrktOffersERSE = oAppFlowModel.oData.regMrktOffersERSE;
      // Supplier model elements
      var suppliers = [];
      var offersPrices = [];
      var offersConditions = [];

      var oThat = this;

      // Filter offer conditions metadata into segments
      var filterOffersMetadataSegments = oThat.filterOffersMetadataSegments(comOffersMetadataERSE[0].condComerciais);

      // Create ERSE regulated market reference
      // Tarnsform prices
      offersPrices = oThat.getPricesBySupplierOffer(regMrktOffersERSE, "ERSE", "MR");


          var conditionMR = {
              conditionsDescr: [{
                id: "TarifasPrecosRegulados", 
                descr: "Tarifas e Preços Regulados", 
                text: "https://www.erse.pt/atividade/regulacao/tarifas-e-precos-eletricidade/#tarifas-e-precos-regulados"                
              }]
          };

              var offersMR = [
                {
                id: "MR",
                name: "TARIFA TRANSITÓRIA DE VENDA A CLIENTES FINAIS EM BTN (≤20,7 kVA e >1,15 kVA)",
                startDate: "01/01/2025",
                endDate: "31/12/2025",
                supplyType: "ELE",
                countType: null,
                segment: null,
                contractDuration: null,
                prices: offersPrices,
                conditions: conditionMR
              }
                             ];
      
      var suppliers = [{

        id: "ERSE",
        name: "ERSE - Entidade Reguladora dos Serviços Energéticos",
        offers: offersMR
        //offers: [
        //  {
        //    id: "MR",
        //    name: "TARIFA TRANSITÓRIA DE VENDA A CLIENTES FINAIS EM BTN (≤20,7 kVA e >1,15 kVA)",
        //    startDate: "01/01/2025",
        //    endDate: "31/12/2025",
        //    supplyType: "ELE",
        //    prices: offersPrices,
        //    conditions: [{
        //        id: "TarifasPrecosRegulados", 
        //        desc: "Tarifas e Preços Regulados", 
        //        text: "https://www.erse.pt/atividade/regulacao/tarifas-e-precos-eletricidade/#tarifas-e-precos-regulados" 
        //      }]                

      }];


      suppliersERSE.forEach(function (supplier) {
        if (supplier.id && supplier.name) {
          var exists = suppliers.some(function (s) {
            return s.id === supplier.id;
          });
          if (!exists) {
            var offers = [];
            // get supplier offers excluding Gas and transform
            var ocomOffersConditionsERSE = comOffersConditionsERSE.filter(element => element.COM === supplier.id && element.Fornecimento !== "GN");
            ocomOffersConditionsERSE.forEach(function (comCondition, index) {

              var ocomOffersConditionsERSETranf = Object.entries(ocomOffersConditionsERSE[index]).map(([key, value]) => ({
                id: key,
                text: value
              }));

              //var ocomOffersConditionsERSETranfMeta = comOffersMetadataERSE[0].condComerciais.map(meta => ({
                 
              //var ocomOffersConditionsERSETranfMeta = oThat.mapOffersMetadataSegment(
              //  filterOffersMetadataSegments.conditionsLinks, ocomOffersConditionsERSETranf
              //);

              var ocomOffersConditionsERSETranfMeta = oThat.mapOfferConditions(
                filterOffersMetadataSegments, ocomOffersConditionsERSETranf
              );

              var startDate = null;
              if (comCondition["Data ini"]) {
                startDate = comCondition["Data ini"];
              }
              var endDate = null;
              if (comCondition["Data fim"]) {
                endDate = comCondition["Data fim"];
              }
              var countType = null;
              if (comCondition["TipoContagem"]) {
                countType = comCondition["TipoContagem"];
              }
              var segment = null;
              if (comCondition["Segmento"]) {
                segment = comCondition["Segmento"];
              }
              var contractDuration = null;
              if (comCondition["DuracaoContrato"]) {
                contractDuration = comCondition["DuracaoContrato"];
              }
              var fornecimento = null;
              if (comCondition["Fornecimento"]) {
                fornecimento = comCondition["Fornecimento"];
              }
              offersPrices = oThat.getPricesBySupplierOffer(comOffersPricesERSE, comCondition.COM, comCondition.COD_Proposta);
              var offer = {
                id: comCondition.COD_Proposta,
                name: comCondition.NomeProposta + " (" + comCondition.COD_Proposta + ")",
                startDate: startDate,
                endDate: endDate,
                supplyType: fornecimento,
                countType: countType,
                segment: segment,
                contractDuration: contractDuration,
                prices: offersPrices,
                conditions: ocomOffersConditionsERSETranfMeta
              };
              offers.push(offer);

            })

            var supplier = {
              id: supplier.id,
              name: supplier.name,
              offers: offers
            };

            suppliers.push(supplier);

          }
        }
      });

      return suppliers;
    },



  };
});
