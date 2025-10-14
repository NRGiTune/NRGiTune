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

    simulateTopOffers: function (oBundle, simulateTopOffersModel, offerTtl, topOffersNr = 5) {

      var suppliers = simulateTopOffersModel.suppliers;
      var suppliersOffers = simulateTopOffersModel.suppliersOffers;
      var consumptions = simulateTopOffersModel.consumptions;
      var topOffers = [];


      suppliersOffers.forEach(element => {

        var supplier = suppliers.filter(supplier =>
          supplier.supplierId === element.supplierId
        );

        if (!supplier[0]) {
          console.log("Supplier:", element.supplierId);
          return;
        };

        var offerPowers = simulateTopOffersModel.offersPrices.filter(item =>
          item.supplierId === element.supplierId
          && item.offerId === element.offerId
        );

        var offerSimulation = this.simulateOfferConsumptionByCycle(offerPowers, consumptions);

        var supplyType = element.supplyType;
        var topOfferSupplyTypeEleVisibility = true;
        var topOfferSupplyTypeGasVisibility = true;
        if (supplyType === "ELE") {
          topOfferSupplyTypeGasVisibility = false;
        } else if (supplyType === "GAS") {
          topOfferSupplyTypeEleVisibility = false;
        };

        const options = [
          { type: "1", value: offerSimulation.offerSimpleSimulationTtl },
          { type: "2", value: offerSimulation.offerBiHSimulationTtl },
          { type: "3", value: offerSimulation.offerTriHSimulationTtl }
        ];

        const lowest = options.reduce((min, curr) =>
          curr.value < min.value ? curr : min
        );

        var topOfferSavings = lowest.value - simulateTopOffersModel.offerlowestValue;

        var offerCommConditionsFilter = null;
        if (element.details) {
          var offerCommConditionsFilter = formatter.getOfferCommConditionsFilter(oBundle, element.details);
          //oModel.setProperty("/offerCommConditionsFilter", offerCommConditionsFilter);
        }

        var offerSavingsSimple = offerSimulation.offerSimpleSimulationTtl - offerTtl
        var stateSimple = "None";
        if (offerSavingsSimple < 0) {
          stateSimple = "Success";
        } else if (offerSavingsSimple > 0) {
          stateSimple = "Warning";
        }
        var offerSavingsBiH = offerSimulation.offerBiHSimulationTtl - offerTtl
        var stateBiH = "None";
        if (offerSavingsBiH < 0) {
          stateBiH = "Success";
        } else if (offerSavingsBiH > 0) {
          stateBiH = "Warning";
        }
        var offerSavingsTriH = offerSimulation.offerTriHSimulationTtl - offerTtl
        var stateTriH = "None";
        if (offerSavingsTriH < 0) {
          stateTriH = "Success";
        } else if (offerSavingsTriH > 0) {
          stateTriH = "Warning";
        }

        var topOffer = {
          topOfferSupplier: supplier[0].supplierId,
          topOfferSupplierName: supplier[0].supplierName,
          topOfferSupplierLogo: "imgs/suppliersLogos/" + supplier[0].supplierLogo,
          topOfferSupplyTypeEleVisibility: topOfferSupplyTypeEleVisibility,
          topOfferSupplyTypeGasVisibility: topOfferSupplyTypeGasVisibility,
          topOfferId: element.offerId,
          topOfferNameId: element.offerNameId,
          topOfferPower: offerSimulation.powerkWh,
          topOfferFromDate: element.offerFromDate,
          topOfferToDate: element.offerToDate,
          topOfferHourlyCycle: lowest.type,
          topOfferValueSimple: offerSimulation.offerSimpleSimulationTtl,
          topOfferValueBiH: offerSimulation.offerBiHSimulationTtl,
          topOfferValueTriH: offerSimulation.offerTriHSimulationTtl,
          topOfferSavingsSimple: offerSavingsSimple,
          topOfferSavingsBiH: offerSavingsBiH,
          topOfferSavingsTriH: offerSavingsTriH,
          topOfferSavingsStateSimple: stateSimple,
          topOfferSavingsStateBiH: stateBiH,
          topOfferSavingsStateTriH: stateTriH,

          offerCommConditionsFilter: offerCommConditionsFilter,
        };

        if (topOfferSavings < 0) {
          topOffers.push(topOffer);
        }


      });

      topOffersNr = topOffers.length;
      const lowestTopOffers = [...topOffers] // cria cópia para não alterar o original
        .sort((a, b) => a.topOfferSavings - b.topOfferSavings) // ordena ascendente
        .slice(0, topOffersNr); // pega os X primeiros (menores)

      var oData = {
        topOfferNr: lowestTopOffers.length,
        topOffers: lowestTopOffers
      };

      return oData;

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