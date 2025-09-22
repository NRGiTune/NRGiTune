sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/json/JSONModel"
], function (Log, JSONModel) {
	"use strict";


	// Create readings from eRedes file model
	function _createReadingsFromEredesFileModel(that, jsonData) {

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
		// Get end date row
		var oEndDateRow = readingsDataSorded[0];
		// Add header date to
		header.push({ ["hdrDateTo"]: oEndDateRow.date });
		// Sort readings by date ascending
		readingsDataSorded = readingsData.sort((a, b) => new Date(a.date) - new Date(b.date));
		// Get start date row
		var oStartDateRow = readingsDataSorded[0];
		// Add header date from
		header.push({ ["hdrDateFrom"]: oStartDateRow.date });

		// Consumption calculation
		readingsData.forEach(function (item, index, arr) {
			if (index === 0) {
				item.toDate = arr[index].date;
				item.readEmpty = arr[index].readingEmpty;
				item.readFull = arr[index].readingFull;
				item.readRush = arr[index].readingRush;
				item.consEmpty = item.readingEmpty - oStartDateRow.readingEmpty;
				item.consFull = item.readingFull - oStartDateRow.readingFull;
				item.consRush = item.readingRush - oStartDateRow.readingRush;
			} else {
				item.fromDate = arr[index - 1].date;
				item.toDate = arr[index].date;
				item.readEmpty = arr[index].readingEmpty;
				item.readFull = arr[index].readingFull;
				item.readRush = arr[index].readingRush;
				item.consEmpty = item.readingEmpty - arr[index - 1].readingEmpty;
				item.consFull = item.readingFull - arr[index - 1].readingFull;
				item.consRush = item.readingRush - arr[index - 1].readingRush;
				item.simple = item.consEmpty + item.consFull + item.consRush;
			}
		});

		// Creats App Consuption/Readings model with eRedes data
		var oData = {
			header,
			consReadRows: readingsData,
		};
		return oData;
	}


	return {
		parseEredesFile: function (that, e) {

			try {
				var data = new Uint8Array(e.target.result);
				var workbook = XLSX.read(data, { type: "array" });

				// Reads first sheet to model
				var firstSheetName = workbook.SheetNames[0];
				var firstSheet = workbook.Sheets[firstSheetName];
				var jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

				var oData = [];
				switch (firstSheetName) {
					case "Leituras":
						// Trasnforms eRedes readings data to App consuption/readings model 
						oData = _createReadingsFromEredesFileModel(that, jsonData);
						break;
					default:
						// For future use...
				};

				// 
				Log.info("Excel carregado com sucesso");
				return oData;
			} catch (err) {
				Log.error("Erro ao processar Excel: " + err.message);
				return new JSONModel([]);
			}
		}
	};
});