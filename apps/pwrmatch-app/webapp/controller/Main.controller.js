sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "simulador/util/fileParserEredes",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Title",
  "simulador/model/checkConsReadModel"
], function (Controller, JSONModel, eRedesFileParser, Dialog, Button, Title, checkConsReadModel) {
  "use strict";
  return Controller.extend("simulador.controller.Main", {
    onInit: function () {
      // wire drop zone after rendering
      this.getView().addEventDelegate({
        //onAfterShow: this._attachDrop.bind(this)
        onAfterRendering: this._attachDrop.bind(this)        
      });

      var oModel = new JSONModel({
        // eRedes Readings select options
        optionValEFRVisible: true,
        optionValEFRTypeVisible: true,
        // Message visibility
        optionValEFRMsgVisible: false,
        optionValEFRMsgType: "Ok",
        optionValEFRMsgIcon: "",
        optionValEFRMsg: "",
        // Table columns visibility
        consColsVisible: true,
        readColsVisible: false,
        toDateColVisible: true,
      });
      this.getView().setModel(oModel);

    },

    _attachDrop: function () {
      if (this._dropzoneInitialized) return;
      this._dropzoneInitialized = true;

      const that = this;
      const dropzone = document.getElementById("dropzone");
      const fileInput = document.getElementById("fileInput");

      if (dropzone && fileInput) {
        // Drag & drop
        // Dragover → muda borda
        dropzone.addEventListener("dragover", function (e) {
          e.preventDefault();
          dropzone.style.borderColor = "#0070f2"; // destaque azul
          dropzone.style.backgroundColor = "#e6f2ff"; // opcional
        });
        // Dragleave → voltar à borda original
        dropzone.addEventListener("dragleave", function () {
          dropzone.style.borderColor = "#ccc";
          dropzone.style.backgroundColor = "transparent"; // opcional
        });
        dropzone.addEventListener("drop", function (e) {
          e.preventDefault();
          dropzone.style.borderColor = "#ccc";
          const files = e.dataTransfer.files;
          that._handleFiles(files);
        });
        // Click na dropzone → open file picker
        dropzone.addEventListener("click", function () {
          fileInput.value = "";
          fileInput.click();
        });
        // Change selection
        fileInput.onchange = function (e) {
          that._handleFiles(e.target.files);
        };
      }


    },

    // .xls(x) files handel function
    _handleFiles: function (files) {
      if (!files || files.length === 0) return;
      const file = files[0];

      // Get i18n model
      //var oBundle = that.oView.oParent.oModels.i18n.getResourceBundle();

      // Checks if .xsl or .xlsx file
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        sap.m.MessageToast.show("Por favor selecione um ficheiro Excel (.xlsx ou .xls)");
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        var that = this;
        var oData = eRedesFileParser.parseEredesFile(that, e);
        // To DELETE
        var oAppFlowModel = that.getOwnerComponent().getModel("appFlowModel");
        oAppFlowModel.setProperty("/consReadRows", oData.oData.consReadRows);
        // To DELETE
        var oAppDataModel = that.getOwnerComponent().getModel("appDataModel");
        oAppDataModel.setProperty("/consumptions", oData.consumptions.consumptions);

        const status = checkConsReadModel.checkConsumptions(oAppDataModel);
        sap.m.MessageToast.show("Ficheiro carregado: " + file.name);
        this.getOwnerComponent().getRouter().navTo("simulate");
      };

      reader.readAsArrayBuffer(file);
    },

    onOptionReadings: function (oEvt) {
      var idx = oEvt.getParameter("selectedIndex");
      var has = idx === 0;
      this.getView().getModel().setProperty("/optionValEFRVisible", has);
    },

    onOptionValEFRSelect: function (oEvt) {
      var idx = oEvt.getParameter("selectedIndex");
      var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
      var msgVisible = false;
      var msgIcon = "";
      var msgType = 0;  // 0 - Success; 1 - Information; 2 - Warning; 3 - Error
      var msgText = "";
      var consColsVisible = false;
      var readColsVisible = false;
      var msgVisible = false;
      switch (idx) {
        case 1: // Readings
          msgVisible = true;
          msgIcon = "sap-icon://message-warning";
          msgType = 2;
          msgText = oResourceBundle.getText("valTypeRMsg");
          consColsVisible = false;
          readColsVisible = true;
          break;

        case 2: // Both
          msgVisible = true;
          msgIcon = "sap-icon://message-information";
          msgType = 1;
          msgText = oResourceBundle.getText("valTypeCRMsg");
          consColsVisible = true;
          readColsVisible = false;
          break;

        case 3: // No values for empty; full & rush
          msgVisible = true;
          msgIcon = "sap-icon://message-warning";
          msgType = 2;
          msgText = oResourceBundle.getText("valNoEFRMsg");
          consColsVisible = false;
          readColsVisible = false; break;

        default: // Consuption
          msgVisible = false;
          msgIcon = "";
          msgType = 0;
          msgText = "";
          consColsVisible = true;
          readColsVisible = false;
          break;
      }
      this.getView().getModel().setProperty("/optionValEFRMsgVisible", msgVisible);
      this.getView().getModel().setProperty("/optionValEFRMsgIcon", msgIcon);
      this.getView().getModel().setProperty("/optionValEFRMsgType", msgType);
      this.getView().getModel().setProperty("/optionValEFRMsg", msgText);
      this.getView().getModel().setProperty("/consColsVisible", consColsVisible);
      this.getView().getModel().setProperty("/readColsVisible", readColsVisible);
    },

    onNextFromMain: function () {
      this.getOwnerComponent().getRouter().navTo("simulate");
    },

    onAddRow: function () {
      var o = this.getView().getModel("appDataModel");
      var a = o.getProperty("/consumptions");
      a.push({ fromDate: null, toDate: null, consumptionSimple: null, 
                consumptionEmpty: null, consumptionFull: null, consumptionRush: null, 
                readingsEmpty: null, readingsFull: null, readingsRush: null, checkState: "None", checkMsg: "" });
      o.setProperty("/consumptions", a);
    },

    onCheckConsumptions: function () {
      var oAppDataModel = this.getView().getModel("appDataModel");
      //var oModel = this.getView().getModel("appFlowModel");
      const status = checkConsReadModel.checkConsumptions(oAppDataModel);
    },

    onDeleteRow: function (oEvent) {
      const oItem = oEvent.getSource().getParent(); // a linha (ColumnListItem)
      const sPath = oItem.getBindingContextPath();   // contexto path
      if (sPath) {
        const oModel = this.getView().getModel("appDataModel");
        const aData = oModel.getProperty("/consumptions");
        const iIndex = parseInt(sPath.split("/")[2], 10);
        aData.splice(iIndex, 1);
        oModel.setProperty("/consReadRows", aData);
      }
    },

    // Show eRedes Readings Help Dialog
    onShowEredesReadingsHelp: function () {
      // buscar detalhes
      var sup = [];
      var t = [];
      var ttl = "eRedes Readings Help"
      this._openEredesReadingsDialog(sup, t, ttl);
    },

    // Show Invoice Consuption/Readings Values Help Dialog
    onShowValEFRHelp: function () {
      // buscar detalhes
      var sup = [];
      var t = [];
      var ttl = "Invoice Consuption/Readings Values Help"
      this._openEredesReadingsDialog(sup, t, ttl);
    },

    _openEredesReadingsDialog: function (supplier, offer, ttl) {
      var that = this;
      if (this._oDlg) {
        this._oDlg.destroy();
        this._oDlg = null; // limpar referência
      };
      if (!this._oDlg) {
        this._oDlg = new sap.m.Dialog({
          title: ttl,
          content: [
            new sap.m.Text({ text: "Em construção..." })
          ],
          endButton: new sap.m.Button({
            text: "Fechar",
            press: function () {
              this._oDlg.close();
            }.bind(this)
          })
        });

        this.getView().addDependent(this._oDlg);
      }

      this._oDlg.open();
    },

    onOpenImageStepsDialog: function () {
      var oView = this.getView();

      if (!this._oImageStepsDialog) {
        this._oImageStepsDialog = new sap.m.Dialog({
          title: "Guia Visual",
          contentWidth: "90%",
          contentHeight: "90%",
          resizable: true,
          draggable: true,
          content: [
            new sap.ui.core.mvc.XMLView({
              viewName: "simulador.view.ImageSteps"
            })
          ],
          beginButton: new sap.m.Button({
            text: "Fechar",
            press: function () {
              this._oImageStepsDialog.close();
            }.bind(this)
          })
        });

        oView.addDependent(this._oImageStepsDialog);
      }

      this._oImageStepsDialog.open();
    },

    onShowCheckedMsgs: function () {
      var oView = this.getView();

      // reutiliza o diálogo se já existir
      if (!this._oCheckedMsgsDialog) {
        this._oCheckedMsgsDialog = new sap.m.Dialog({
          title: "Mensagens de Validação",
          contentWidth: "500px",
          contentHeight: "400px",
          resizable: true,
          draggable: true,
          content: [
            new sap.m.List({
              items: {
                path: "appDataModel>/consumptions",
                template: new sap.m.CustomListItem({
                  content: [
                    new sap.m.ObjectStatus({
                      class: "sapUiSmallMarginBottom sapUiSmallMarginStart",
                      active: true,
                      inverted: false,
                      state: "{appDataModel>checked}",   // Error, Warning, Success, Information
                      text: "{appDataModel>checkMsg}"    // mensagem
                    })
                  ]
                })
              }
            })
          ],
          buttons: [
            new sap.m.Button({
              text: "Fechar",
              press: function () {
                this._oCheckedMsgsDialog.close();
              }.bind(this)
            })
          ]
        });

        // adiciona o diálogo como dependente da view
        oView.addDependent(this._oCheckedMsgsDialog);
      }

      this._oCheckedMsgsDialog.open();
    }



  });
});
