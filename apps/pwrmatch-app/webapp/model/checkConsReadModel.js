sap.ui.define([
  "sap/ui/model/json/JSONModel"
], function (JSONModel) {
  "use strict";

  return {

    checkConsumptions: function (oModel) {
      // util para converter dd/mm/yyyy em Date
      function DELETE_parseDate(str) {
        if (!str) return null;
        const parts = str.split("/");
        if (parts.length !== 3) return null;
        const [dd, mm, yyyy] = parts.map(Number);
        return new Date(yyyy, mm - 1, dd);
      }

      function DELETE_formatDate(date) {
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }

      let aRows = oModel.getProperty("/consumptions");

      // inicializar
      aRows.forEach((row, i) => {
        oModel.setProperty(`/consumptions/${i}/checkState`, "Success");
        oModel.setProperty(`/consumptions/${i}/checkMsg`, "Lin:" + i);
        //oModel.setProperty(`/consReadRows/${i}/_fromDate`, parseDate(row.fromDate));
        //oModel.setProperty(`/consReadRows/${i}/_toDate`, parseDate(row.toDate));
      });

      // ordenar
      aRows.sort((a, b) => {
        if (!a.fromDate) return 1;
        if (!b.fromDate) return -1;
        return a.fromDate - b.fromDate;
      });
      oModel.setProperty("/consumptions", aRows);

      // validar
      for (let i = 0; i < aRows.length; i++) {
        const row = aRows[i];
        const prev = aRows[i - 1];
        const next = aRows[i + 1];
        const path = `/consumptions/${i}`;

        // validar fromDate
        if (!row.fromDate) {
          oModel.setProperty(`${path}/checkState`, "Error");
          oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " fromDate inválida ou vazia");
          return "Error";
        }

        if (row.fromDate && row.toDate && row.toDate < row.fromDate) {
          oModel.setProperty(`${path}/checkState`, "Error");
          oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " toDate menor que fromDate");
          return "Error";
        }

        // validar toDate
        if (row.fromDate && next && next.fromDate) {
          if (row.toDate && row.toDate > next.fromDate) {
            oModel.setProperty(`${path}/checkState`, "Error");
            oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " toDate maior ao fromDate da linha seguinte");
            return "Error";
          }
        }

        if (!row.toDate) {
          let newDate = null;
          if (next && next.fromDate) {
            newDate = new Date(next.fromDate);
            newDate.setDate(newDate.getDate() - 1);
            oModel.setProperty(`${path}/toDate`, formatDate(newDate));
            oModel.setProperty(`${path}/checkState`, "Information");
            oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " toDate preenchido com fromDate da linha seguinte -1 dia");
          } else if (!next) {
            newDate = new Date();
            oModel.setProperty(`${path}/toDate`, formatDate(newDate));
            oModel.setProperty(`${path}/checkState`, "Information");
            oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " toDate preenchido com data atual");
          } else if (prev && prev.fromDate) {
            newDate = new Date(prev.fromDate);
            newDate.setDate(newDate.getDate() - 1);
            oModel.setProperty(`${path}/toDate`, formatDate(newDate));
            oModel.setProperty(`${path}/checkState`, "Information");
            oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " toDate preenchido com fromDate da linha anterior -1 dia");
          }
          if (newDate) {
            oModel.setProperty(`${path}/toDate`, newDate);
          }
        }

        // validar consumos manuais
        if (!row.consumptionSimple &&
          !row.consumptionEmpty && !row.consumptionFull && !row.consumptionRush &&
          !row.empty && !row.full && !row.rush) {
          oModel.setProperty(`${path}/checkState`, "Error");
          oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " Registo de consumos vazio");
          return "Error";
        }

        // cálculo
        let consReadEmpty = 0, consReadFull = 0, consReadRush = 0;
        if (row.empty) {
          consReadEmpty = prev && prev.empty ? row.empty - prev.empty : 0;
        }
        if (row.full) {
          consReadFull = prev && prev.full ? row.full - prev.full : 0;
        }
        if (row.rush) {
          consReadRush = prev && prev.rush ? row.rush - prev.rush : 0;
        }
        const comReadSimple = consReadEmpty + consReadFull + consReadRush;

        // validar diferenças
        if (row.consumptionEmpty != null && row.consumptionEmpty != consReadEmpty) {
          oModel.setProperty(`${path}/checkState`, "Error");
          oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " Cálculo do consumo em vazio com base em leituras é difrente do valor de consumo em vazio!");
          return "Error";
        } else {
          oModel.setProperty(`${path}/consumptionEmpty`, consReadEmpty);
          oModel.setProperty(`${path}/checkState`, "Warning");
          oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " Consumo em vazio ajustado na verificação para: " + consReadEmpty);
        }
        if (row.consumptionFull != null && row.consumptionFull != consReadFull) {
          oModel.setProperty(`${path}/checkState`, "Error");
          oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " Cálculo do consumo em cheio com base em leituras é difrente do valor de consumo em cheio!");
          return "Error";
        } else {
          oModel.setProperty(`${path}/consumptionFull`, consReadFull);
          oModel.setProperty(`${path}/checkState`, "Warning");
          oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " Consumo em cheio ajustado na verificação para: " + consReadFull);
        }
        if (row.consumptionRush != null && row.consumptionRush != consReadRush) {
          oModel.setProperty(`${path}/checkState`, "Error");
          oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " Cálculo do consumo em ponta com base em leituras é difrente do valor de consumo em ponta!");
          return "Error";
        } else {
          oModel.setProperty(`${path}/consumptionRush`, consReadRush);
          oModel.setProperty(`${path}/checkState`, "Warning");
          oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " Consumo em ponta ajustado na verificação para: " + consReadRush);
        }
        if (row.consumptionSimple != null && row.consumptionSimple != comReadSimple) {
          oModel.setProperty(`${path}/checkState`, "Error");
          oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " Cálculo do consumo em simples com base no somatório dos consumos em: vazio; cheio e ponta é diferente de consumo simples!");
          return "Error";
        } else {
          oModel.setProperty(`${path}/consumptionSimple`, comReadSimple);
          oModel.setProperty(`${path}/checkState`, "Warning");
          oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " Consumo simples ajustado na verificação para: " + comReadSimple);
        }

        // validar soma simples
        if (row.consumptionSimple !== (row.consumptionEmpty + row.consumptionFull + row.consumptionRush)) {
          oModel.setProperty(`${path}/checkState`, "Error");
          oModel.setProperty(`${path}/checkMsg`, "Lin:" + i + " consumptionSimple diferente da soma (consumptionEmpty + consumptionFull + consumptionRush)");
          return "Error";
        }
      }

      // estado global
      const rowsFinal = oModel.getProperty("/consumptions");
      if (rowsFinal.some(r => r.checkState === "Error")) return "Error";
      if (rowsFinal.some(r => r.checkState === "Warning")) return "Warning";
      if (rowsFinal.some(r => r.checkState === "Information")) return "Information";
      return "Success";
    }

  }
});