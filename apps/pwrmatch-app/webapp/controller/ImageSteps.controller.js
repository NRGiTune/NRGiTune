sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("simulador.controller.ImageSteps", {
    onInit: function () {
      // Modelo com imagens e passos associados
      var oModel = new JSONModel({
        images: [
          {
            src: "imgs/guide-001/guide-001-01.png",
            steps: [
              { step: "Selecionar: 'Os meus locais'" },
              { step: "Selecionar: 'Leituras'" },
              { step: "Selecionar: 'Consultar histórico'" },
              { step: "Selecionar: 'Local'" },
              { step: "Ajustar o periodo pretendido e exportar para excel" }
            ]
          },
          {
            src: "imgs/guide-001/guide-001-02.png",
            steps: [
              { step: "Selecionar 'Leituras'" },
              { step: ". . ." }
            ]
          },
          {
            src: "imgs/guide-001/guide-001-03.png",
            steps: [
              { step: "Selecionar 'Leituras'" },
              { step: ". . ." }
            ]
          },
          {
            src: "imgs/guide-001/guide-001-04.png",
            steps: [
              { step: "Selecionar 'Leituras'" },
              { step: ". . ." }
            ]
          },
          {
            src: "imgs/guide-001/guide-001-05.png",
            steps: [
              { step: "Selecionar 'Leituras'" },
              { step: ". . ." }
            ]
          }
        ],
        activeSteps: [] // preenchido ao mudar imagem
      });

      this.getView().setModel(oModel);
      this._updateSteps(0); // inicializa com a primeira imagem
    },

    onImageChanged: function (oEvent) {
      var iIndex = oEvent.getParameter("newActivePage");
      this._updateSteps(iIndex);
    },

    _updateSteps: function (iIndex) {
      var oModel = this.getView().getModel();
      var aImages = oModel.getProperty("/images");
      if (aImages[iIndex]) {
        oModel.setProperty("/activeSteps", aImages[iIndex].steps);
      }
    },

    onZoomChange: function (oEvent) {
      var fValue = oEvent.getParameter("value");
      var oCarousel = this.byId("imageCarousel");
      var aImages = oCarousel.getPages();

      aImages.forEach(function (oImage) {
        oImage.addStyleClass("zoom-" + fValue.toString().replace(".", "-"));
        oImage.$().css("transform", "scale(" + fValue + ")");
      });
    }
  });
});
