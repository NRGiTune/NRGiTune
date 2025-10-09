sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/json/JSONModel",
	"simulador/util/formatter"
], function (Log, JSONModel, formatter) {
	"use strict";


	// Create readings from eRedes file model
	function _createReadingsFromEredesFileModel(that, jsonData) {

		// Get readings address, CPE and counter nr
		var fileHeader = jsonData.slice(0, 3).map((row, index) => ({
			[`hdr${index + 1}`]: row[1]
		}));

		// Get energy consumption readings
		var readings = jsonData
			.slice(8) // ignora cabeçalho
			.filter(row => row[0] && row[5] && row[6] && row[7]) // só mantém linhas válidas
			.map(row => ({
				readingDate: formatter.parseXlsxFilesDate(row[0]),
				readingType: row[1],
				origin: row[2],
				state: row[3],
				type: row[4],
				empty: row[5],
				full: row[7],
				rush: row[6]
			}));

		// Sort readings by date descending
		var readingsSorded = readings.sort((a, b) => new Date(b.readingDate) - new Date(a.readingDate));
		// Get end date row
		var oEndDate = readingsSorded[0];
		// Add fileHeader date to
		//fileHeader.push({ ["hdrDateTo"]: oEndDate.readingDate });
		// Sort readings by date ascending
		readingsSorded = readings.sort((a, b) => new Date(a.readingDate) - new Date(b.readingDate));
		// Get start date row
		var oStartDate = readingsSorded[0];
		// Add fileHeader date from
		//fileHeader.push({ ["hdrDateFrom"]: oStartDate.readingDate });
		var header = {
			address: fileHeader[0].hdr1,
			cpe: fileHeader[1].hdr2,
			counterNr: fileHeader[2].hdr3,
			dateFrom: oStartDate.readingDate,
			dateTo: oEndDate.readingDate,

		};


		// Consumption calculation
		readings.forEach(function (item, index, arr) {
			if (index === 0) {
				item.fromDate = arr[index].readingDate;
				item.toDate = arr[index].readingDate;
				item.readingsEmpty = arr[index].empty;
				item.readingsFull = arr[index].full;
				item.readingsRush = arr[index].rush;
				item.consumptionEmpty = item.readingsEmpty - oStartDate.empty;
				item.consumptionFull = item.readingsFull - oStartDate.full;
				item.consumptionRush = item.readingsRush - oStartDate.rush;
				item.consumptionSimple = item.consumptionEmpty + item.consumptionFull + item.consumptionRush;
			} else {
				item.fromDate = arr[index - 1].readingDate;
				item.toDate = arr[index].readingDate;
				item.readingsEmpty = arr[index].empty;
				item.readingsFull = arr[index].full;
				item.readingsRush = arr[index].rush;
				item.consumptionEmpty = item.readingsEmpty - arr[index - 1].empty;
				item.consumptionFull = item.readingsFull - arr[index - 1].full;
				item.consumptionRush = item.readingsRush - arr[index - 1].rush;
				item.consumptionSimple = item.consumptionEmpty + item.consumptionFull + item.consumptionRush;
			}
		});


		// Creats App Consuption/Readings model with eRedes data
		var oData = {
			header,
			consumptions: readings,
		};
		return oData;
	}

	// Create readings from eRedes file model
	function _createReadingsFromEredesFileModel_old(that, jsonData) {

		// Get readings address, CPE and counter nr
		var header = jsonData.slice(0, 3).map((row, index) => ({
			[`hdr${index + 1}`]: row[1]
		}));

		// Get energy consumption readings
		var readingsData = jsonData
			.slice(8) // ignora cabeçalho
			.filter(row => row[0] && row[5] && row[6] && row[7]) // só mantém linhas válidas
			.map(row => ({
				//date: row[0].split("/")[2] + "-" + row[0].split("/")[1] + "-" + row[0].split("/")[0],
				//date: new Date(row[0]),
				date: formatter.parseXlsxFilesDate(row[0]),
				//day: row[0].split("/")[0],
				readEmpty: row[5],
				readFull: row[7],
				readRush: row[6]
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
				item.fromDate = arr[index].date;
				item.toDate = arr[index].date;
				item.readEmpty = arr[index].readEmpty;
				item.readFull = arr[index].readFull;
				item.readRush = arr[index].readRush;
				item.consEmpty = item.readEmpty - oStartDateRow.readEmpty;
				item.consFull = item.readFull - oStartDateRow.readFull;
				item.consRush = item.readRush - oStartDateRow.readRush;
				item.consSimple = item.consEmpty + item.consFull + item.consRush;
			} else {
				item.fromDate = arr[index - 1].date;
				item.toDate = arr[index].date;
				item.readEmpty = arr[index].readEmpty;
				item.readFull = arr[index].readFull;
				item.readRush = arr[index].readRush;
				item.consEmpty = item.readEmpty - arr[index - 1].readEmpty;
				item.consFull = item.readFull - arr[index - 1].readFull;
				item.consRush = item.readRush - arr[index - 1].readRush;
				item.consSimple = item.consEmpty + item.consFull + item.consRush;
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

				var consReadRows = [];
				var consumptions = [];
				switch (firstSheetName) {
					case "Leituras":
						// Transforms eRedes readings data to App consuption/readings model 
						consumptions = _createReadingsFromEredesFileModel(that, jsonData);
						consReadRows = _createReadingsFromEredesFileModel_old(that, jsonData);
						break;
					default:
					// For future use...
				};

				var oData = {
					consumptions: consumptions,
					oData: consReadRows,
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