sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "simulador/util/formatter"
], function (JSONModel, formatter) {
  "use strict";


  return {

    //formatter: formatter,

    getOfferPricesByPower: function (suppliers, supplierId, offerId, offerPower, offerCountType) {
      // encontrar supplier
      const supplier = suppliers.find(s => s.id === supplierId);
      if (!supplier) return [];

      // encontrar oferta
      const offer = (supplier.offers || []).find(o => o.id === offerId);
      if (!offer) return [];

      // filtrar preços
      //const offerPrices = (offer.prices || []).filter(p =>
      //  p.Pot_Cont === offerPower && p.Contagem === offerCountType
      //);

      const normalize = val => {
        if (val == null) return "";
        return String(val).trim().replace(",", "."); // converte tudo para string, remove espaços e troca vírgula por ponto
      };

      if (offerCountType) {
        const offerPrices = (offer.prices || []).filter(p =>
          normalize(p.Pot_Cont) === normalize(offerPower) &&
          normalize(p.Contagem) === normalize(offerCountType)
        );
      } else {
        const offerPrices = (offer.prices || []).filter(p =>
          normalize(p.Pot_Cont) === normalize(offerPower)
        );
      }

      // construir registos
      let results = offerPrices.map(price => ({
        supplierId: supplier.id,
        offerId: offer.id,
        fromDate: offer.startDate,
        toDate: offer.endDate,
        offerPower: price.Pot_Cont,
        offerCountType: price.Contagem,
        offerPowerPrice: price.TF,
        offerkWhSimplePrice: price["TV|TVFV|TVP"],
        offerkWhBiHEPrice: price["TV|TVFV|TVP"], // se for igual ao Simple
        offerkWhBiHOEPrice: price["TVV|TVC"],
        offerkWhTiHEPrice: price["TV|TVFV|TVP"], // se for igual ao Simple
        offerkWhTiHFPrice: price["TVV|TVC"],
        offerkWhTiHPPrice: price.TVVz
      }));

      // consolidar registos com os mesmos valores, mas datas diferentes
      let consolidated = [];
      results.forEach(r => {
        let existing = consolidated.find(c =>
          c.supplierId === r.supplierId &&
          c.offerId === r.offerId &&
          c.offerPower === r.offerPower &&
          c.offerCountType === r.offerCountType &&
          c.offerPowerPrice === r.offerPowerPrice &&
          c.offerkWhSimplePrice === r.offerkWhSimplePrice &&
          c.offerkWhBiHEPrice === r.offerkWhBiHEPrice &&
          c.offerkWhBiHOEPrice === r.offerkWhBiHOEPrice &&
          c.offerkWhTiHEPrice === r.offerkWhTiHEPrice &&
          c.offerkWhTiHFPrice === r.offerkWhTiHFPrice &&
          c.offerkWhTiHPPrice === r.offerkWhTiHPPrice
        );

        if (existing) {
          // ajustar datas
          if (new Date(r.fromDate) < new Date(existing.fromDate)) {
            existing.fromDate = r.fromDate;
          }
          if (new Date(r.toDate) > new Date(existing.toDate)) {
            existing.toDate = r.toDate;
          }
        } else {
          consolidated.push({ ...r });
        }
      });

      return consolidated;
    },

    updateOfferPricesByPowerConsumptions: function (countTypeOfferPrices, consReadRows) {
      // util para converter datas string (dd/mm/yyyy → Date)
      function DELETE_parseDate(str) {
        if (!str) return null;
        const [dd, mm, yyyy] = str.split("/").map(Number);
        return new Date(yyyy, mm - 1, dd);
      }

      // util para formatar Date → dd/mm/yyyy
      function DELETE_formatDate(date) {
        if (!date) return "";
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }

      const oCountTypeOfferPricesConsumptions = countTypeOfferPrices.map(price => {
        let fromDate = price.fromDate;
        let toDate = price.toDate;

        // limites do modelo de leituras
        const globalFrom = consReadRows
          .map(r => r.fromDate)
          .filter(Boolean)
          .sort((a, b) => a - b)[0];

        const globalTo = consReadRows
          .map(r => r.toDate)
          .filter(Boolean)
          .sort((a, b) => b - a)[0];

        // ajusta datas conforme regras
        if (!toDate || (globalTo && toDate < globalTo)) {
          toDate = globalTo;
        }

        // filtra consumos válidos no intervalo
        const filteredRows = consReadRows.filter(r => {
          const f = r.fromDate;
          const t = r.toDate;
          if (!f || !t) return false;
          return f >= fromDate && t <= toDate;
        });

        // somatórios
        const consSimpleTtl = filteredRows.reduce((sum, r) => sum + (Number(r.consSimple) || 0), 0);
        const consEmptyTtl = filteredRows.reduce((sum, r) => sum + (Number(r.consEmpty) || 0), 0);
        const consFullTtl = filteredRows.reduce((sum, r) => sum + (Number(r.consFull) || 0), 0);
        const consRushTtl = filteredRows.reduce((sum, r) => sum + (Number(r.consRush) || 0), 0);

        return {
          ...price,
          consSimpleTtl,
          consEmptyTtl,
          consFullTtl,
          consRushTtl,
          fromDateCons: globalFrom,
          toDateCons: toDate
        };
      });

      return oCountTypeOfferPricesConsumptions;
    },

    bindCycleSimulate: function (consReadRowsPrices) {

      var current = {
        fromDate: consReadRowsPrices.fromDate,
        toDate: consReadRowsPrices.toDate,
        power: consReadRowsPrices.offerPower,
        fixedPrice: consReadRowsPrices.offerPowerPrice,
        totalConsumption: consReadRowsPrices.consSimpleTtl,
        variablePrice: consReadRowsPrices.offerkWhSimplePrice,
        simpleAmountVal: consReadRowsPrices.consSimpleTtl * consReadRowsPrices.offerkWhSimplePrice,
        simpleAmount: simpleAmountVal,
        simpleSavings: "",
        simpleState: "Information",
        biHAmountVal: consReadRowsPrices.consEmptyTtl * consReadRowsPrices.offerkWhBiHEPrice
          + (consReadRowsPrices.consFullTtl + consReadRowsPrices.consRushTtl) * consReadRowsPrices.offerkWhBiHOEPrice,
        biHAmount: biHAmountVal + "€",
        biHSavings: "1,00€",
        biHState: "Warning",
        triHAmountVal: consReadRowsPrices.consEmptyTtl * consReadRowsPrices.offerkWhTiHEPrice
          + consReadRowsPrices.consFullTtl * consReadRowsPrices.offerkWhTiHFPrice
          + consReadRowsPrices.consRushTtl * consReadRowsPrices.offerkWhTiHPPrice,
        triHAmount: triHAmountVal + "€",
        triHSavings: "2,00€",
        triHState: "Success",
        lowestHourlyCyclePrice: "3" // 1 - Simple; 2 - Bi-hourly; 3 - Tri-hourly 
      };

    },

    simulateTopOffers: function (simulateTopOffersModel, topOffers = 2) {

      // obter offersPrices para a lista de suppliers
      // oAppDataModel.oData.offersPrices
      //     supplierId
      //     offerId
      //
      // Lopp offersPrices 
      //    offerSimulation para obter totais por ciclo 
      //    comparar com offer totais e determiar poupança

      var data = {
        topOfferNr: topOffers,
        topOffers: [
          {
            topOfferSupplier: "COOP",
            topOfferSupplierName: "Coopérnico",
            topOfferSupplierLogo: "imgs/suppliersLogos/" + "coopernicoLogo.png",
            topOfferSupplyTypeEleVisibility: true,
            topOfferSupplyTypeGasVisibility: true,
            topOfferId: "COOP_04",
            topOfferName: "Coopérnico BASE 2.0",
            topOfferPower: 6.9,
            topOfferFromDate: new Date(),
            topOfferToDate: new Date(),
            topOfferHourlyCycle: "1",
            topOfferValue: 13.50,
            topOfferSavings: -1.2,
            offerRelevantConditions: [
              {
                condition: "Fatura eletrónica obrigatória",
                state: "Warning",
                icon: "sap-icon://alert",
                visible: true
              },
              {
                condition: "Sem fidelização",
                state: "Success",
                icon: "sap-icon://sys-enter-2",
                visible: true
              }
            ]
          },
          {
            topOfferSupplier: "EDPSU",
            topOfferSupplierName: "SU ELETRICIDADE",
            topOfferSupplierLogo: "imgs/suppliersLogos/" + "edpSuLogo.png",
            topOfferSupplyTypeEleVisibility: true,
            topOfferSupplyTypeGasVisibility: true,
            topOfferId: "TUR",
            topOfferName: "Coopérnico Condições de preço regulado",
            topOfferPower: 6.9,
            topOfferFromDate: new Date(),
            topOfferToDate: new Date(),
            topOfferHourlyCycle: "2",
            topOfferValue: 13.55,
            topOfferSavings: -0.7,
            offerRelevantConditions: [
              {
                condition: "Fatura eletrónica obrigatória",
                state: "Warning",
                icon: "sap-icon://alert",
                visible: true
              },
              {
                condition: "Sem fidelização",
                state: "Success",
                icon: "sap-icon://sys-enter-2",
                visible: true
              }
            ]
          }
        ]
      };

      return data;

    },

    simulateOfferConsumptionByCycle: function (offerPowers, consumptions) {

      const normalizeNum = val => Number(String(val ?? "").trim());
      var powerkWh = null;

      // {fromDate, toDate, consumptionSimple, consumptionEmpty, consumptionFull, consumptionRush, readingsEmpty, readingsFull, readingsRush, checkState, checkMsg}
      // {supplierId, offerID, offerFromDate, offerToDate, power, ... }
      var offersPricesSimple = offerPowers.filter(item =>
        normalizeNum(item.countingCycle) === normalizeNum(1)
      );
      var offersPricesBiH = offerPowers.filter(item =>
        normalizeNum(item.countingCycle) === normalizeNum(2)
      );
      var offersPricesTriH = offerPowers.filter(item =>
        normalizeNum(item.countingCycle) === normalizeNum(3)
      );
      var pricesSimple = this.mapConsumptionPrices(offersPricesSimple, consumptions);
      var pricesBiH = this.mapConsumptionPrices(offersPricesBiH, consumptions);
      var pricesTriH = this.mapConsumptionPrices(offersPricesTriH, consumptions);

      var simple = [];
      pricesSimple.forEach(cons => {
        powerkWh = cons.power;
        var powerDays = formatter.getDaysBetween(cons.fromDate, cons.toDate, false);
        var powerValue = powerDays * cons.termFixed;
        var consumptionKwh = cons.consumptionSimple;
        var consumptionValue = consumptionKwh * cons.termEnergySOR;
        var consumptionValueTotal = consumptionValue;
        simple.push({
          fromDate: cons.fromDate,
          toDate: cons.toDate,
          fromPriceDate: cons.fromPriceDate,
          toPriceDate: cons.toPriceDate,
          simulationType: cons.simulationType,
          simulationScenario: cons.simulationScenario,
          powerkWh: cons.power,
          powerDays: powerDays,
          powerDayValue: cons.termFixed,
          powerValue: powerValue,
          consumption: [
            {
              consumptionTermEnergy: "Simples",            // simple; empty; outEmpty; full; rush 
              consumptionKWh: cons.consumptionSimple,
              consumptionKWhValue: cons.termEnergySOR,
              consumptionValue: consumptionValue
            }
          ],
          consumptionKwh: consumptionKwh,
          consumptionValueTotal: consumptionValueTotal
        });
      });
      const totalsSimple = _getTotals(simple, ["powerDays", "powerValue", "consumptionKwh", "consumptionValueTotal"]);

      var biH = [];
      pricesBiH.forEach(cons => {
        var powerDays = formatter.getDaysBetween(cons.fromDate, cons.toDate, false);
        var powerValue = powerDays * cons.termFixed;
        var consumptionKwh = cons.consumptionSimple;
        var consumptionKwhEmpty = cons.consumptionEmpty;
        var consumptionKwhOutEmpty = cons.consumptionFull + cons.consumptionRush;
        var consumptionEmptyValue = consumptionKwhEmpty * cons.termEnergyEF;
        var consumptionOutEmptyValue = consumptionKwhOutEmpty * cons.termEnergySOR;
        var consumptionValueTotal = consumptionEmptyValue + consumptionOutEmptyValue;
        biH.push({
          fromDate: cons.fromDate,
          toDate: cons.toDate,
          fromPriceDate: cons.fromPriceDate,
          toPriceDate: cons.toPriceDate,
          simulationType: cons.simulationType,
          simulationScenario: cons.simulationScenario,
          powerkWh: cons.power,
          powerDays: powerDays,
          powerDayValue: cons.termFixed,
          powerValue: powerValue,
          consumption: [
            {
              consumptionTermEnergy: "Vazio",            // simple; empty; outEmpty; full; rush 
              consumptionKWh: consumptionKwhEmpty,
              consumptionKWhValue: cons.termEnergyEF,
              consumptionValue: consumptionEmptyValue
            },
            {
              consumptionTermEnergy: "Fora de Vazio",            // simple; empty; outEmpty; full; rush 
              consumptionKWh: consumptionKwhOutEmpty,
              consumptionKWhValue: cons.termEnergySOR,
              consumptionValue: consumptionOutEmptyValue
            }
          ],
          consumptionKwh: consumptionKwh,
          consumptionValueTotal: consumptionValueTotal
        });
      });
      const totalsBiH = _getTotals(biH, ["powerDays", "powerValue", "consumptionKwh", "consumptionValueTotal"]);

      var triH = [];
      pricesTriH.forEach(cons => {
        var powerDays = formatter.getDaysBetween(cons.fromDate, cons.toDate, false);
        var powerValue = powerDays * cons.termFixed;
        var consumptionKwh = cons.consumptionSimple;
        var consumptionEmptyValue = cons.consumptionEmpty * cons.termEnergyE;
        var consumptionFullValue = cons.consumptionFull * cons.termEnergyEF;
        var consumptionRushValue = cons.consumptionRush * cons.termEnergySOR;
        var consumptionValueTotal = consumptionEmptyValue + consumptionFullValue + consumptionRushValue;
        triH.push({
          fromDate: cons.fromDate,
          toDate: cons.toDate,
          fromPriceDate: cons.fromPriceDate,
          toPriceDate: cons.toPriceDate,
          simulationType: cons.simulationType,
          simulationScenario: cons.simulationScenario,
          powerkWh: cons.power,
          powerDays: powerDays,
          powerDayValue: cons.termFixed,
          powerValue: powerValue,
          consumption: [
            {
              consumptionTermEnergy: "Vazio",            // simple; empty; outEmpty; full; rush 
              consumptionKWh: cons.consumptionEmpty,
              consumptionKWhValue: cons.termEnergyE,
              consumptionValue: consumptionEmptyValue
            },
            {
              consumptionTermEnergy: "Cheio",            // simple; empty; outEmpty; full; rush 
              consumptionKWh: cons.consumptionFull,
              consumptionKWhValue: cons.termEnergyEF,
              consumptionValue: consumptionFullValue
            },
            {
              consumptionTermEnergy: "Ponta",            // simple; empty; outEmpty; full; rush 
              consumptionKWh: cons.consumptionRush,
              consumptionKWhValue: cons.termEnergySOR,
              consumptionValue: consumptionRushValue
            }
          ],
          consumptionKwh: consumptionKwh,
          consumptionValueTotal: consumptionValueTotal
        });
      });
      const totalsTriH = _getTotals(triH, ["powerDays", "powerValue", "consumptionKwh", "consumptionValueTotal"]);

      var offerSimpleSimulationTtl = totalsSimple.powerValue + totalsSimple.consumptionValueTotal;
      var offerBiHSimulationTtl = totalsBiH.powerValue + totalsBiH.consumptionValueTotal;
      var offerTriHSimulationTtl = totalsTriH.powerValue + totalsTriH.consumptionValueTotal;

      var data = {
        powerkWh: powerkWh,
        offerSimpleSimulationTtl: offerSimpleSimulationTtl,
        offerBiHSimulationTtl: offerBiHSimulationTtl,
        offerTriHSimulationTtl: offerTriHSimulationTtl,
        simple: simple,
        totalsSimple: totalsSimple,
        biH: biH,
        totalsBiH: totalsBiH,
        triH: triH,
        totalsTriH: totalsTriH
      };

      return data;

    },

    mapConsumptionPrices: function (offersPrices, consumptions) {

      let result = [];

      consumptions.forEach(cons => {
        const consFrom = cons.fromDate;
        const consTo = cons.toDate;

        // encontra oferta aplicável
        let offer = offersPrices.find(p => p.offerFromDate <= consFrom);
        if (!offer) {
          // se não existir oferta anterior → próxima
          offer = offersPrices.find(p => p.offerFromDate > consFrom);
        }

        if (!offer) return; // não há oferta aplicável

        const offerFrom = offer.offerFromDate;
        const offerTo = offer.offerToDate || null;

        let simulationType = "real";
        let simulationScenario = 1;

        if (offerFrom <= consFrom) {
          if (!offerTo || consTo <= offerTo) {
            simulationType = "real";
            simulationScenario = 1;
          } else {
            simulationType = "estimated";
            simulationScenario = 2;
          }
        } else if (offerFrom > consFrom && offerFrom <= consTo) {
          if (!offerTo || consTo <= offerTo) {
            simulationType = "estimated";
            simulationScenario = 3;
          } else {
            simulationType = "estimated";
            simulationScenario = 4;
          }
        } else if (offerFrom > consTo) {
          simulationType = "estimated";
          simulationScenario = 5;
        }

        result.push({
          fromDate: cons.fromDate,
          toDate: cons.toDate,
          fromPriceDate: offer.offerFromDate,
          toPriceDate: offer.offerToDate,
          power: offer.power,
          consumptionSimple: cons.consumptionSimple,
          consumptionEmpty: cons.consumptionEmpty,
          consumptionFull: cons.consumptionFull,
          consumptionRush: cons.consumptionRush,
          termFixed: offer.termFixed,
          termEnergySOR: offer.termEnergySOR,
          termEnergyEF: offer.termEnergyEF,
          termEnergyE: offer.termEnergyE,
          simulationType,
          simulationScenario
        });
      });

      // 🔹 consolidar linhas iguais
      let consolidated = [];
      result.forEach(row => {
        const prev = consolidated[consolidated.length - 1];
        if (
          prev &&
          prev.termFixed === row.termFixed &&
          prev.termEnergySOR === row.termEnergySOR &&
          prev.termEnergyEF === row.termEnergyEF &&
          prev.termEnergyE === row.termEnergyE
        ) {
          prev.consumptionSimple += row.consumptionSimple;
          prev.consumptionEmpty += row.consumptionEmpty;
          prev.consumptionFull += row.consumptionFull;
          prev.consumptionRush += row.consumptionRush;

          prev.fromDate = prev.fromDate < row.fromDate ? prev.fromDate : row.fromDate;
          prev.toDate = prev.toDate > row.toDate ? prev.toDate : row.toDate;

          prev.fromPriceDate =
            prev.fromPriceDate < row.fromPriceDate ? prev.fromPriceDate : row.fromPriceDate;
          prev.toPriceDate =
            prev.toPriceDate > row.toPriceDate ? prev.toPriceDate : row.toPriceDate;

          if (row.simulationType === "estimated") {
            prev.simulationType = "estimated";
            prev.simulationScenario = 0;
          }
        } else {
          consolidated.push({ ...row });
        }
      });

      return consolidated;


    }
  };

  function _getTotals(data, fields) {
    return data.reduce((acc, item) => {
      fields.forEach(f => acc[f] = (acc[f] || 0) + (item[f] || 0));
      return acc;
    }, {});
  }

});