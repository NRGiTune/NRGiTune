sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/resource/ResourceModel",
   "sap/ui/model/json/JSONModel"
], (UIComponent, ResourceModel, JSONModel) => {
   "use strict";

   return UIComponent.extend("energitune.powermatch.Component", {
      metadata : {
         interfaces: ["sap.ui.core.IAsyncContentCreation"],
         manifest: "json"
      },

      init() {
         // call the init function of the parent
         UIComponent.prototype.init.apply(this, arguments);

         // set i18n model
         const i18nModel = new ResourceModel({
            bundleName: "energitune.powermatch.i18n.i18n"
         });
         this.setModel(i18nModel, "i18n");

         // set tariffs global model
	fetch("data/powermatch_tarifas.csv")
  	.then(res => res.text())   // read as text
  	.then(text => {
      		// Split rows
      		var rows = text.split("\n").map(r => r.split(","));

	      	// Convert to JSON (header + rows)
      		var headers = rows[0];
      		var data = rows.slice(1).map(row => {
          		let obj = {};
          		headers.forEach((h, i) => obj[h.trim()] = row[i]?.trim());
          		return obj;
      		});

      		// Create tariffs global model
      		var oModel = new JSONModel({ rows: data });
      		this.setModel(oModel, "tariffs");
  	});

      }


   });
});
