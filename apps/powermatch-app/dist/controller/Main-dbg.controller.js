sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast",
   "sap/ui/model/json/JSONModel",
   "energitune/powermatch/util/eRedesFileProcessor",
   "energitune/powermatch/util/formatter"
], (Controller, MessageToast, JSONModel, eRedesFileProcessor, formatter) => {
   "use strict";

   return Controller.extend("energitune.powermatch.controller.Main", {

      formatter: formatter,


      onInit: function () {
         // Modelo vazio para a tabela
         this.getView().setModel(new JSONModel([]), "readingsModel");

      },


      onAfterRendering: function () {
         // Cria o gráfico na primeira vez que a view renderiza
         var ctx = document.getElementById("chartCanvas");

         if (!this._oConsumptionChart) {
            this._oConsumptionChart = new Chart(ctx, {
               type: "pie",
               data: {
                  labels: [
                     this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("hdrTtlConsEmpty"),
                     this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("hdrTtlConsRush"),
                     this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("hdrTtlConsFull")
                  ],
                  datasets: [{
                     data: [0, 0, 0] // inicia vazio
                  }]
               }
            });
         }
      },


      onFileUpload: function (oEvent) {
         var oFile = oEvent.getParameter("files")[0];
         var that = this;


         if (oFile && window.FileReader) {
            var reader = new FileReader();

            reader.onload = function (e) {

               // Processa o ficheiro eRedes
               var oModel = eRedesFileProcessor.parseEredesFile(that, e.target.result);

               // Atualiza o modelo
               that.getView().setModel(oModel, "readingsModel");

            };

            reader.readAsArrayBuffer(oFile);

         }

      },

      onShowDescription() {
         // read msg from i18n model
         const oBundle = this.getView().getModel("i18n").getResourceBundle();
         const sMsg = oBundle.getText("appDescription");

         // show message
         MessageToast.show(sMsg);
      }

   });
});