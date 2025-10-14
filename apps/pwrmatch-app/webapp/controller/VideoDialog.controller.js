sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("simulador.controller.VideoDialog", {
        onInit: function () {
            // Modelo com lista de vídeos
            const oModel = new JSONModel({
                selectedVideo: null,
                videos: [
                    { title: "Introdução", file: "videos/intro.m4v" },
                    { title: "Como usar", file: "videos/tutorial.m4v" },
                    { title: "Exemplo prático", file: "videos/guid002.m4v" }
                ]
            });
            this.getView().setModel(oModel, "videoModel");
        },

        onSelectVideo: function (oEvent) {
            const oItem = oEvent.getParameter("listItem");
            const oCtx = oItem.getBindingContext("videoModel");
            const oData = oCtx.getObject();

            this.getView().getModel("videoModel").setProperty("/selectedVideo", oData.file);

            // Atualiza o vídeo
            const videoElem = document.getElementById("videoPlayer");
            if (videoElem) {
                videoElem.src = oData.file;
                videoElem.play();
            }
        },

        onPlay: function () {
            document.getElementById("videoPlayer").play();
        },

        onPause: function () {
            document.getElementById("videoPlayer").pause();
        },

        onStop: function () {
            const video = document.getElementById("videoPlayer");
            video.pause();
            video.currentTime = 0;
        },

        onCloseDialog: function () {
            var oDialog = this.byId("videoDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onVolumeChange: function (oEvent) {
            const volume = oEvent.getParameter("value");
            document.getElementById("videoPlayer").volume = volume / 100;
        }
    });
});
