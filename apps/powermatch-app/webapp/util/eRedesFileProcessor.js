sap.ui.define([
    "sap/base/Log",
    "sap/ui/model/json/JSONModel"
], function(Log, JSONModel) {
    "use strict";

    // Update consumptions chart
    function updateConsumptionChart(that, consTotals) {
    // Atualiza dados no gráfico já existente
    if (that._oConsumptionChart) {
        		var oBundle = that.getOwnerComponent().getModel("i18n").getResourceBundle();

		var consTotal = consTotals.totalConsEmpty + consTotals.totalConsRush + consTotals.totalConsFull;

        		that._oConsumptionChart.data.labels = [
            		oBundle.getText("hdrTtlConsEmpty"),
            		oBundle.getText("hdrTtlConsRush"),
            		oBundle.getText("hdrTtlConsFull")
        		];

        		that._oConsumptionChart.data.datasets[0].data = [
        	    		[consTotals.totalConsEmpty/consTotal*100],
        	    		[consTotals.totalConsRush/consTotal*100],
        	    		[consTotals.totalConsFull/consTotal*100]
	        ];

        		that._oConsumptionChart.update();
    	}
    }


    // Filtrar modelo por data
    function _filterByDate(oData, sDate) {

	// Converter string -> Date
    	const oCheckDate = new Date(sDate); // e.g. "2025-08-16"

    	const aFiltered = oData.filter(oItem => {
        		const oStart = new Date(oItem.startDate);
        		const oEnd   = new Date(oItem.endDate);
        		return oCheckDate >= oStart && oCheckDate <= oEnd;
    		});

    	return aFiltered;
	}


    // Create model for eRedes reading file
    function _createLeiturasModel(that, jsonData) {

	// Get i18n model
	var oBundle = that.oView.oParent.oModels.i18n.getResourceBundle();


                  // Get readings address, CPE and counter nr
                    var header = jsonData.slice(0,3).map((row, index) => ({
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
        				readingRush: row[6],
        				readingFull: row[7]
    			}));

		// Sort readings by date descending
		var readingsDataSorded = readingsData.sort((a, b) => new Date(b.date) - new Date(a.date));
	      	// Get end date
      		var sEndDate = readingsDataSorded[0].date;
      		var oEndDate = new Date(sEndDate);
	      	// Get end date row
      		var oEndDateRow = readingsDataSorded[0];
		// Add header date to
		header.push({["hdrDateTo"]: oEndDateRow.date });

		// Sort readings by date ascending
		readingsDataSorded = readingsData.sort((a, b) => new Date(a.date) - new Date(b.date));

	      	// Get start date
      		var sStartDate = readingsDataSorded[0].date;
      		var oStartDate = new Date(sStartDate);
	      	// Get start date row
      		var oStartDateRow = readingsDataSorded[0];
		// Add header date from
		header.push({["hdrDateFrom"]: oStartDateRow.date });

	      	// Filter the first day of each month
      		var readingsDataFiltered = readingsDataSorded.filter(function(item) {
        			var d = new Date(item.date);
        			return d.getDate() === 1;
      		});

      		// If start date is first day → ignore start date row
      		if (oStartDate.getDate() === 1) {
        			readingsDataFiltered.shift(); // removes start date row
      		}

      		// If end date not the first day → add end date row
      		if (oEndDate.getDate() !== 1) {
        			readingsDataFiltered.push(oEndDateRow); // adds end date row
      		}

		// Get tariffs model
		var tariffsData = that.oView.oParent.oModels.tariffs.oData.rows;

      		// Consumption calculation
      		readingsDataFiltered.forEach(function(item, index, arr) {
        		if (index === 0) {
          		// Primeiro cálculo feito com base na data inicial
          		item.consEmpty = item.readingEmpty - oStartDateRow.readingEmpty;
          		item.consRush = item.readingRush - oStartDateRow.readingRush;
          		item.consFull = item.readingFull - oStartDateRow.readingFull;
        		} else {
          		// Restantes são baseados no registo anterior
          		item.consEmpty = item.readingEmpty - arr[index - 1].readingEmpty;
          		item.consRush = item.readingRush - arr[index - 1].readingRush;
          		item.consFull = item.readingFull - arr[index - 1].readingFull;
        		}
		// Add tariffs list by reading date
		item.tariffs = _filterByDate(tariffsData, item.date);
		
		});

		// Consumption totals
		var consTotals = readingsDataFiltered.reduce((acc, item) => {
    			acc.totalConsEmpty += item.consEmpty || 0;
    			acc.totalConsRush  += item.consRush  || 0;
    			acc.totalConsFull  += item.consFull  || 0;
    			return acc;
		}, {
    			totalConsEmpty: 0,
    			totalConsRush: 0,
    			totalConsFull: 0
		});

		// Add header total consumptions: empty, rush and full
		header.push({["hdrTtlConsEmpty"]: consTotals.totalConsEmpty });
		header.push({["hdrTtlConsRush"]: consTotals.totalConsRush });
		header.push({["hdrTtlConsFull"]: consTotals.totalConsFull });
		header.push({["hdrTtlCons"]: consTotals.totalConsEmpty 
						+ consTotals.totalConsRush
						+ consTotals.totalConsFull
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
      		readingsDataExpanded.forEach(function(item, index, arr) {
			// Simple tariff calculation
			item.tariffSimple = (item.consEmpty + item.consRush + item.consFull ) * item.priceSimple;
			item.tariffBiHourly = (item.consRush + item.consFull ) * item.priceOutEmpty
						+ item.consEmpty * item.priceEmpty;
			item.tariffTriHourly = item.consEmpty * item.priceEmpty  
						+ item.consRush * item.priceRush
						+ item.consFull * item.priceFull;
		});


		// Totals calculation
		var readingsDataTotals = readingsDataExpanded.reduce((acc, item) => {
  			const key = item.id;

  			if (!acc[key]) {
    				acc[key] = {
      				supplierName: item.name,
      				tariff: item.description,
      				totalSimple: 0,
				totalBiHourly: 0,
				totalTriHourly: 0
    			};
  			}

   			acc[key].totalSimple += item.tariffSimple;
   			acc[key].totalBiHourly += item.tariffBiHourly;
   			acc[key].totalTriHourly += item.tariffTriHourly;

  			return acc;
			}, {});

            var oData = {
                header,
                data: readingsDataTotals
            };

	return oData; 
    }


    return {
        parseEredesFile: function(that, e) {

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


        }
    };

});