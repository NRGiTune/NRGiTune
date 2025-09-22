sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/json/JSONModel"
], function (Log, JSONModel) {
	"use strict";

	// Load supplier list and create relate model
	function _loadSupplierFile(sPath, that) {
		//fetch(sap.ui.require.toUrl(sPath)) // adapta "meuapp" ao namespace do projeto
		fetch(sPath) // adapta "meuapp" ao namespace do projeto
			.then(response => {
				if (!response.ok) {
					throw new Error("Erro ao carregar ficheiro: " + sPath);
				}
				return response.arrayBuffer();
			})
			.then(arrayBuffer => {
				// Agora é equivalente ao reader.onload → tens o conteúdo em binário
				var oModel = that.getOwnModels().appFlowModel;
				var suppliers = oModel.oData.suppliersERSE;
				const e = { target: { result: arrayBuffer } };
				var data = new Uint8Array(e.target.result);
				var workbook = XLSX.read(data, { type: "array" });
				// Reads first sheet to model
				var firstSheetName = workbook.SheetNames[0];
				var firstSheet = workbook.Sheets[firstSheetName];
				//var jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });  
				var jsonData = XLSX.utils.sheet_to_json(firstSheet);
				jsonData.forEach(function (item) {
					//if (item[0] && item[1]) {
					if (item.COM && item.Comercializador) {
						var exists = suppliers.some(function (s) {
							return s.id === item.id;
						});
						if (!exists) {
							//suppliers.push({ id: item[0], name: item[1] });
							suppliers.push({ id: item.COM, name: item.Comercializador });
						}
					}
				});
				//return oModel;
			})
			.catch(err => {
				console.error(err);
				sap.m.MessageToast.show("Erro ao ler ficheiro local");
				//return [];
			});
	}

	// Load commercial conditions list and create related model
	function _loadComConditionsFile(sPath, that) {
		//fetch(sap.ui.require.toUrl(sPath)) // adapta "meuapp" ao namespace do projeto
		fetch(sPath) // adapta "meuapp" ao namespace do projeto
			.then(response => {
				if (!response.ok) {
					throw new Error("Erro ao carregar ficheiro: " + sPath);
				}
				return response.arrayBuffer();
			})
			.then(arrayBuffer => {
				var oModel = that.getOwnModels().appFlowModel;
				var comConditions = oModel.oData.comOffersConditionsERSE;
				const e = { target: { result: arrayBuffer } };
				var data = new Uint8Array(e.target.result);
				var workbook = XLSX.read(data, { type: "array" });
				// Reads first sheet to model
				var firstSheetName = workbook.SheetNames[0];
				var firstSheet = workbook.Sheets[firstSheetName];
				var jsonData = XLSX.utils.sheet_to_json(firstSheet);
				jsonData.forEach(function (item) {
					if (item.COM && item.COD_Proposta) {
						var exists = comConditions.some(function (s) {
							return s.COM === item.COM && s.COD_Proposta === item.COD_Proposta;
						});
						if (!exists) {
							comConditions.push(item);
						}
					}
				});
			})
			.catch(err => {
				console.error(err);
				sap.m.MessageToast.show("Erro ao ler ficheiro local");
				//return [];
			});
	}


	// Load commercial conditions prices list and create related model
	function _loadComConditionsPricesFile(sPath, that) {
		//fetch(sap.ui.require.toUrl(sPath)) // adapta "meuapp" ao namespace do projeto
		fetch(sPath) // adapta "meuapp" ao namespace do projeto
			.then(response => {
				if (!response.ok) {
					throw new Error("Erro ao carregar ficheiro: " + sPath);
				}
				return response.arrayBuffer();
			})
			.then(arrayBuffer => {
				var oModel = that.getOwnModels().appFlowModel;
				var comConditionsPrices = oModel.oData.comOffersPricesERSE;
				const e = { target: { result: arrayBuffer } };
				var data = new Uint8Array(e.target.result);
				var workbook = XLSX.read(data, { type: "array" });
				// Reads first sheet to model
				var firstSheetName = workbook.SheetNames[0];
				var firstSheet = workbook.Sheets[firstSheetName];
				var jsonData = XLSX.utils.sheet_to_json(firstSheet);
				jsonData.forEach(function (item) {
					if (item.COM && item.COD_Proposta) {
						comConditionsPrices.push(item);
						//var exists = comConditionsPrices.some(function (s) {
						//	return s.COM === item.COM && s.COD_Proposta === item.COD_Proposta;
						//});
						//if (!exists) {
						//	comConditionsPrices.push(item);
						//}
					}
				});
			})
			.catch(err => {
				console.error(err);
				sap.m.MessageToast.show("Erro ao ler ficheiro local");
				//return [];
			});
	}


	// Load commercial conditions & prices matadata and create related model
	function _loadComOffersMetadataFile(sPath, that) {
		//fetch(sap.ui.require.toUrl(sPath)) // adapta "meuapp" ao namespace do projeto
		fetch(sPath) // adapta "meuapp" ao namespace do projeto
			.then(response => {
				if (!response.ok) {
					throw new Error("Erro ao carregar ficheiro: " + sPath);
				}
				return response.arrayBuffer();
			})
			.then(arrayBuffer => {
				var oModel = that.getOwnModels().appFlowModel;
				var comOffersMetadata = oModel.oData.comOffersMetadataERSE;
				const e = { target: { result: arrayBuffer } };
				var data = new Uint8Array(e.target.result);
				var workbook = XLSX.read(data, { type: "array" });
				// Reads first sheet to model
				var firstSheetName = workbook.SheetNames[0];
				var firstSheet = workbook.Sheets[firstSheetName];
				var jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

				// Get prices list metadata
				var precosELEGN = jsonData
					.slice(3, 15) // ignora cabeçalho
					//.filter(row => row[0] && row[5] && row[6] && row[7]) // só mantém linhas válidas
					.map(item => ({
						id: item[1],
						descr: item[2]
					}));

				// Get commercial conditions list metadata
				var condComerciais = jsonData
					.slice(18, 84) // ignora cabeçalho
					.map(item => ({
						id: item[1],
						descr: item[2]
					}));

				comOffersMetadata.push({
					precosELEGN: precosELEGN,
					condComerciais: condComerciais
				});

			})
			.catch(err => {
				console.error(err);
				sap.m.MessageToast.show("Erro ao ler ficheiro local");
				//return [];
			});
	}



	// Load regulated market Offers and create related model
	function _loadRegMrktOffersFile(sPath, that) {
		fetch(sPath) // adapta "meuapp" ao namespace do projeto
			.then(response => {
				if (!response.ok) {
					throw new Error("Erro ao carregar ficheiro: " + sPath);
				}
				return response.arrayBuffer();
			})
			.then(arrayBuffer => {
				var oModel = that.getOwnModels().appFlowModel;
				var regMrktOffers = oModel.oData.regMrktOffersERSE;
				const e = { target: { result: arrayBuffer } };
				var data = new Uint8Array(e.target.result);
				var workbook = XLSX.read(data, { type: "array" });
				// Reads first sheet to model
				var firstSheetName = workbook.SheetNames[0];
				var firstSheet = workbook.Sheets[firstSheetName];
				var jsonData = XLSX.utils.sheet_to_json(firstSheet);
				jsonData.forEach(function (item) {
					if (item.COM && item.COD_Proposta) {
						regMrktOffers.push(item);
						//var exists = regMrktOffers.some(function (s) {
						//	return s.COM === item.COM && s.COD_Proposta === item.COD_Proposta;
						//});
						//if (!exists) {
						//	regMrktOffers.push(item);
						//}
					}
				});
			})
			.catch(err => {
				console.error(err);
				sap.m.MessageToast.show("Erro ao ler ficheiro local");
				//return [];
			});
	}


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
		parseERSEFiles: function (that) {
			//var that = this;
			try {
				// Suppliers list
				_loadSupplierFile("data/erse/lstComercializadores.xlsx", that);
				// Commercial conditions list
				_loadComConditionsFile("data/erse/lstCondComerciais.xlsx", that);
				// Commercial conditions prices list
				_loadComConditionsPricesFile("data/erse/lstPrecos_ELEGN.xlsx", that);
				// Commercial conditions & prices metadata
				_loadComOffersMetadataFile("data/erse/metadata.xlsx", that);
				// regulated market offers
				_loadRegMrktOffersFile("data/erse/lstTarifas_RegM.xlsx", that);

				Log.info("ERSE files loaded");
			} catch (err) {
				Log.error("Error (parseEredesFiles): " + err.message);
				return new JSONModel([]);
			}
		}
	};
});