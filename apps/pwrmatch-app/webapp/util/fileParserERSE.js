sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/json/JSONModel",
	"simulador/model/modelsUtils",
	"simulador/util/formatter"
], function (Log, JSONModel, modelsUtils, formatter) {
	"use strict";


	return {
		parseERSEFiles: function (that) {
			//var that = this;
			try {
				// Add ERSE as supplier
				//_addESupplierERSE(that);
				// Add ERSE regulated market offer
				_addRegMrktOffers(that);

			} catch (err) {
				Log.error("Error (parseEredesFiles): " + err.message);
				return new JSONModel([]);
			}
		}
	};


	// Add ERSE as supplier
	function _addESupplierERSE(that) {
		var oAppDataModel = that.getOwnModels().appDataModel;
		var oSuppliers = oAppDataModel.oData.suppliers;
		oSuppliers.push({
			supplierId: "ERSE",
			supplierName: "ERSE - Entidade Reguladora dos Serviços Energéticos",
			supplierLogo: "erseLogo.png"
		});

	}


	// Add ERSE regulated market offer
	function _addRegMrktOffers(that) {
		var oAppDataModel = that.getOwnModels().appDataModel;
		var oSuppliersOffers = oAppDataModel.oData.suppliersOffers;
		var supplierOffers = {
			supplierId: "ERSE",
			offerId: "MR",
			offerName: "TARIFA TRANSITÓRIA DE VENDA A CLIENTES FINAIS EM BTN (≤20,7 kVA e >1,15 kVA)",
			offerNameId: "TARIFA TRANSITÓRIA DE VENDA A CLIENTES FINAIS EM BTN (≤20,7 kVA e >1,15 kVA) [MR]",
			offerFromDate: formatter.parseXlsxFilesDate("01/01/2025"),
			offerToDate: formatter.parseXlsxFilesDate("31/12/2025"),
			segment: null,
			supplyType: "ELE",
			countType: "123",
			modality: null,
			contractDuration: "12",
			details: [],
			filteredConditions: []
		};
		oSuppliersOffers.push(supplierOffers);
		// regulated market offers
		_loadRegMrktOffersPricesFileERSE("data/erse/lstTarifas_RegM.xlsx", that);

	}


	// Load regulated market Offers and create related model
	function _loadRegMrktOffersPricesFileERSE(sPath, that) {
		fetch(sPath) // adapta "meuapp" ao namespace do projeto
			.then(response => {
				if (!response.ok) {
					throw new Error("Erro ao carregar ficheiro: " + sPath);
				}
				return response.arrayBuffer();
			})
			.then(arrayBuffer => {
				var oAppDataModel = that.getOwnModels().appDataModel;
				var oSuppliersOffers = oAppDataModel.oData.suppliersOffers;
				var oOffersPrices = oAppDataModel.oData.offersPrices;
				var oRegMarketPrices = oAppDataModel.oData.regMarketPrices;
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

						var suppliersOffers = oSuppliersOffers.filter(
							supplierOffer => supplierOffer.supplierId === item.COM
								&& supplierOffer.offerId === item.COD_Proposta
						);
						var offersPrices = {
							supplierId: item.COM,
							offerId: item.COD_Proposta,
							offerFromDate: suppliersOffers[0].offerFromDate,
							offerToDate: suppliersOffers[0].offerToDate,
							power: item.Pot_Cont,
							countingCycle: item.Contagem,
							consumptionLevel: item.Escalao,
							networkOperator: item.ORD,
							termFixed: item.TF,
							termEnergySOR: item["TV|TVFV|TVP"],
							termEnergyEF: item["TVV|TVC"],
							termEnergyE: item.TVVz,
							termFixedNG: item.TFGN,
							termEnergyNG: item.TVGN
						};
						oRegMarketPrices.push(offersPrices);
						oOffersPrices.push(offersPrices);
					}
				});

				// Suppliers list
				_loadSupplierFile("data/erse/lstComercializadores.xlsx", that);

			})
			.catch(err => {
				console.error(err);
				sap.m.MessageToast.show("Erro ao ler ficheiro local");
				//return [];
			});

	}


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
				var oAppDataModel = that.getOwnModels().appDataModel;
				var oSuppliers = oAppDataModel.oData.suppliers;
				//var oModel = that.getOwnModels().appFlowModel;
				//var suppliers = oModel.oData.suppliersERSE;
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
						var exists = oSuppliers.some(function (s) {
							return s.supplierId === item.id;
						});
						if (!exists) {
							oSuppliers.push({ supplierId: item.COM, supplierName: item.Comercializador, supplierLogo: item.Logo });
							//suppliers.push({ id: item.COM, name: item.Comercializador, logo: item.Logo });
						}
					}

				});

				// Commercial conditions list
				_loadComConditionsFile("data/erse/lstCondComerciais.xlsx", that);

			})
			.catch(err => {
				console.error(err);
				sap.m.MessageToast.show("Erro ao ler ficheiro: " + sPath);
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
				var oAppDataModel = that.getOwnModels().appDataModel;
				var oSuppliersOffers = oAppDataModel.oData.suppliersOffers;
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
							item["Data ini"] = formatter.parseXlsxFilesDate(item["Data ini"]);
							item["Data fim"] = formatter.parseXlsxFilesDate(item["Data fim"]);
							comConditions.push(item);

							var supplierOffers = {
								supplierId: item.COM,
								offerId: item.COD_Proposta,
								offerName: item.NomeProposta,
								offerNameId: item.NomeProposta + " [" + item.COD_Proposta + "]",
								offerFromDate: item["Data ini"],
								offerToDate: item["Data fim"],
								segment: item.Segmento,
								supplyType: item.Fornecimento,
								countType: item.TipoContagem,
								modality: item.TxTModalidade,
								contractDuration: item.DuracaoContrato,
								details: item
							};
							oSuppliersOffers.push(supplierOffers);
						}
					}
				});

				// Commercial conditions prices list
				_loadComConditionsPricesFile("data/erse/lstPrecos_ELEGN.xlsx", that);

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
				var oAppDataModel = that.getOwnModels().appDataModel;
				var oSuppliersOffers = oAppDataModel.oData.suppliersOffers;
				var oOffersPrices = oAppDataModel.oData.offersPrices;
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
						//date: new Date(row[0]),
						comConditionsPrices.push(item);

						var suppliersOffers = oSuppliersOffers.filter(
							supplierOffer => supplierOffer.supplierId === item.COM
								&& supplierOffer.offerId === item.COD_Proposta
						);
						var offerFromDate = null;
						var offerToDate = null;
						if (suppliersOffers[0]) {
							offerFromDate = suppliersOffers[0].offerFromDate;
							offerToDate = suppliersOffers[0].offerToDate;
						}
						var offersPrices = {
							supplierId: item.COM,
							offerId: item.COD_Proposta,
							offerFromDate: offerFromDate,
							offerToDate: offerToDate,
							power: item.Pot_Cont,
							countingCycle: item.Contagem,
							consumptionLevel: item.Escalao,
							networkOperator: item.ORD,
							termFixed: item.TF,
							termEnergySOR: item["TV|TVFV|TVP"],
							termEnergyEF: item["TVV|TVC"],
							termEnergyE: item.TVVz,
							termFixedNG: item.TFGN,
							termEnergyNG: item.TVGN
						};
						oOffersPrices.push(offersPrices);
						//var exists = comConditionsPrices.some(function (s) {
						//	return s.COM === item.COM && s.COD_Proposta === item.COD_Proposta;
						//});
						//if (!exists) {
						//	comConditionsPrices.push(item);
						//}
					}
				});

				// Commercial conditions & prices metadata
				_loadComOffersMetadataFile("data/erse/metadata.xlsx", that);

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
				var oAppDataModel = that.getOwnModels().appDataModel;
				var oMetadata = oAppDataModel.oData.metadata;
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
						descr: item[2],
						description: item[2]
					}));

				// Get commercial conditions list metadata
				var condComerciais = jsonData
					.slice(18, 84) // ignora cabeçalho
					.map(item => ({
						id: item[1],
						descr: item[2],
						description: item[2]
					}));

				comOffersMetadata.push({
					precosELEGN: precosELEGN,
					condComerciais: condComerciais
				});
				oMetadata.push({
					prices: precosELEGN,
					offers: condComerciais
				});

				// split metadata by segment
				var metadataBySegment = modelsUtils.filterOffersMetadataSegments(condComerciais);
				oAppDataModel.setProperty("/metadataBySegment", metadataBySegment);

			})
			.catch(err => {
				console.error(err);
				sap.m.MessageToast.show("Erro ao ler ficheiro local");
				//return [];
			});


	}


	// Create readings from eRedes file model
	function DELETE_createReadingsFromEredesFileModel(that, jsonData) {

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

});