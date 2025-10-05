sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/json/JSONModel"
], function (Log, JSONModel) {
	"use strict";

	// Update consumptions chart
	function updateConsumptionChart(that, consTotals) {
		if (that._oConsumptionChart) {
			var oBundle = that.getOwnerComponent().getModel("i18n").getResourceBundle();

			var consTotal = consTotals.totalConsEmpty + consTotals.totalConsFull + consTotals.totalConsRush;

			// calcular percentagens
			var emptyPct = (consTotals.totalConsEmpty / consTotal * 100).toFixed(1);
			var fullPct = (consTotals.totalConsFull / consTotal * 100).toFixed(1);
			var rushPct = (consTotals.totalConsRush / consTotal * 100).toFixed(1);

			that._oConsumptionChart.data.labels = [
				oBundle.getText("hdrTtlConsEmpty"),
				oBundle.getText("hdrTtlConsFull"),
				oBundle.getText("hdrTtlConsRush")
			];

			that._oConsumptionChart.data.datasets[0].data = [emptyPct, fullPct, rushPct];

			// configurar opções para mostrar % no eixo e nos tooltips
			that._oConsumptionChart.options = {
				responsive: true,
				plugins: {
					datalabels: {
						color: '#050505',
						font: {
							weight: 'bold',
							size: 14
						},
						formatter: (v) => v + "%",	// mostra o valor da percentagem
						// anchor: "end",   // coloca a label no extremo da fatia (lado de fora do gráfico)
						align: "end",    // alinha para o lado externo
						// offset: 15        // ajusta a distância (px) em relação ao arco
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								return context.parsed + "%";
							}
						}
					}
				}
			};

			that._oConsumptionChart.update();
		}
	}



	// Filtrar modelo por data
	function _filterByDate(oData, sDate) {

		// Converter string -> Date
		const oCheckDate = new Date(sDate); // e.g. "2025-08-16"

		const aFiltered = oData.filter(oItem => {
			const oStart = new Date(oItem.startDate);
			const oEnd = new Date(oItem.endDate);
			return oCheckDate >= oStart && oCheckDate <= oEnd;
		});

		return aFiltered;
	}


	// Create model for eRedes reading file
	function _createLeiturasModel(that, jsonData) {

		// Get i18n model
		var oBundle = that.oView.oParent.oModels.i18n.getResourceBundle();


		// Get readings address, CPE and counter nr
		var header = jsonData.slice(0, 3).map((row, index) => ({
			[`hdr${index + 1}`]: row[1]
		}));

		// Get energy consumption readings
		var readingsData = jsonData
			.slice(8) // ignora cabeçalho
			.filter(row => row[0] && row[5] && row[6] && row[7]) // só mantém linhas válidas
			.map(row => ({
				date: row[0].split("/")[2] + "-" + row[0].split("/")[1] + "-" + row[0].split("/")[0],
				day: row[0].split("/")[0],
				readingEmpty: row[5],
				readingFull: row[7],
				readingRush: row[6]
			}));

		// Sort readings by date descending
		var readingsDataSorded = readingsData.sort((a, b) => new Date(b.date) - new Date(a.date));
		// Get end date
		var sEndDate = readingsDataSorded[0].date;
		var oEndDate = new Date(sEndDate);
		// Get end date row
		var oEndDateRow = readingsDataSorded[0];
		// Add header date to
		header.push({ ["hdrDateTo"]: oEndDateRow.date });

		// Sort readings by date ascending
		readingsDataSorded = readingsData.sort((a, b) => new Date(a.date) - new Date(b.date));

		// Get start date
		var sStartDate = readingsDataSorded[0].date;
		var oStartDate = new Date(sStartDate);
		// Get start date row
		var oStartDateRow = readingsDataSorded[0];
		// Add header date from
		header.push({ ["hdrDateFrom"]: oStartDateRow.date });

		// Without Filter
		var readingsDataFiltered = readingsDataSorded;
		// Filter the first day of each month
		//var readingsDataFiltered = readingsDataSorded.filter(function (item) {
		//	var d = new Date(item.date);
		//	return d.getDate() === 1;
		//});

		// If start date is first day → ignore start date row
		//if (oStartDate.getDate() === 1) {
		//	readingsDataFiltered.shift(); // removes start date row
		//}

		// If end date not the first day → add end date row
		//if (oEndDate.getDate() !== 1) {
		//	readingsDataFiltered.push(oEndDateRow); // adds end date row
		//}

		// Get tariffs model
		var tariffsData = that.oView.oParent.oModels.tariffs.oData.rows;

		// Consumption calculation
		readingsDataFiltered.forEach(function (item, index, arr) {
			if (index === 0) {
				// Primeiro cálculo feito com base na data inicial
				item.consEmpty = item.readingEmpty - oStartDateRow.readingEmpty;
				item.consFull = item.readingFull - oStartDateRow.readingFull;
				item.consRush = item.readingRush - oStartDateRow.readingRush;
			} else {
				// Restantes são baseados no registo anterior
				item.consEmpty = item.readingEmpty - arr[index - 1].readingEmpty;
				item.consFull = item.readingFull - arr[index - 1].readingFull;
				item.consRush = item.readingRush - arr[index - 1].readingRush;
			}
			// Add tariffs list by reading date
			item.tariffs = _filterByDate(tariffsData, item.date);

		});

		// Consumption totals
		var consTotals = readingsDataFiltered.reduce((acc, item) => {
			acc.totalConsEmpty += item.consEmpty || 0;
			acc.totalConsFull += item.consFull || 0;
			acc.totalConsRush += item.consRush || 0;
			return acc;
		}, {
			totalConsEmpty: 0,
			totalConsRush: 0,
			totalConsFull: 0
		});

		// Add header total consumptions kwh: empty, rush and full
		header.push({ ["hdrTtlConsEmpty"]: consTotals.totalConsEmpty });
		header.push({ ["hdrTtlConsFull"]: consTotals.totalConsFull });
		header.push({ ["hdrTtlConsRush"]: consTotals.totalConsRush });
		header.push({
			["hdrTtlCons"]: consTotals.totalConsEmpty
				+ consTotals.totalConsFull
				+ consTotals.totalConsRush
		});


		// Update consumptions chart
		updateConsumptionChart(that, consTotals);


		// Transform readings for having reading tariff by energy supplier
		var readingsDataExpanded = readingsDataFiltered.flatMap(item =>
			item.tariffs.map(tariff => ({
				...item,
				...tariff
			}))
		);

		// Remove tariffs array after transformation
		readingsDataExpanded.forEach(e => delete e.tariffs);

		// Readings cost calculation by tariff
		readingsDataExpanded.forEach(function (item, index, arr) {
			// Simple tariff calculation
			item.tariffSimple = (item.consEmpty + item.consRush + item.consFull) * item.priceSimple;
			item.tariffBiHourly = (item.consRush + item.consFull) * item.priceOutEmpty
				+ item.consEmpty * item.priceEmpty;
			item.tariffTriHourly = item.consEmpty * item.priceEmpty
				+ item.consRush * item.priceRush
				+ item.consFull * item.priceFull;
		});

		// Totals calculation to array
		var readingsDataTotals = Object.values(

			readingsDataExpanded.reduce((acc, item) => {
				const key = item.id;

				if (!acc[key]) {
					acc[key] = {
						tariffId: item.id,
						tariff: item.description,
						supplierName: item.name,
						totalSimple: 0,
						totalBiHourly: 0,
						totalTriHourly: 0
					};
				}

				acc[key].totalSimple += item.tariffSimple;
				acc[key].totalBiHourly += item.tariffBiHourly;
				acc[key].totalTriHourly += item.tariffTriHourly;

				return acc;
			}, {})
		);

		var oData = {
			header,
			readings: readingsDataExpanded,
			totals: readingsDataTotals,
			enableExportToXLSXButton: true,
			showExportToXLSXButton: true,
		};

		// set debug mode
		var oParams = new URLSearchParams(window.location.search);
		var debugMode = oParams.get("debugmode");
		console.log("DebugMode:", debugMode);

		return oData;
	}


	return {
		parseEredesFile: function (that, e) {

			try {
				var data = new Uint8Array(e);
				var workbook = XLSX.read(data, { type: "array" });

				// Lê a primeira sheet
				var firstSheetName = workbook.SheetNames[0];
				var firstSheet = workbook.Sheets[firstSheetName];
				var jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
				var formattedData = [];

				// Determina tipo de ficheiro
				switch (firstSheetName) {
					case "Leituras":
						// Cria modelo para ficheiro eRedes - Leituras
						formattedData = _createLeiturasModel(that, jsonData);
						break;
					default:
					// Código a ser executado se a expressão não corresponder a nenhum dos casos
				};

				var oModel = new JSONModel(formattedData);


				Log.info("Excel carregado com sucesso");
				return oModel;
			} catch (err) {
				Log.error("Erro ao processar Excel: " + err.message);
				return new JSONModel([]);
			}


		},

		// Export JSON model to .xlsx file
		exportToXLSX: function (oModel, nomeFicheiro = "NRGiTune-Detalhes.xlsx") {

			var readings = oModel.readings;
			var totals = oModel.totals;

			if (!readings || !readings.length || !totals || !totals.length) {
				console.warn("Modelos: Leituras e Totais vazio, nada para exportar.");
				return;
			}

			// Criar worksheet leituras a partir do JSON
			const wsLeituras = XLSX.utils.json_to_sheet(readings);
			// Criar worksheet totais a partir do JSON
			const wsTotais = XLSX.utils.json_to_sheet(totals);

			// Criar workbook e adicionar worksheet leituras e totais
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, wsLeituras, "Leituras");
			XLSX.utils.book_append_sheet(wb, wsTotais, "Totais");

			// Exportar para ficheiro .xlsx
			XLSX.writeFile(wb, nomeFicheiro);


		}


	};

});