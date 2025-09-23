// model/models.js
sap.ui.define([
  "sap/ui/model/json/JSONModel"
], function(JSONModel) {
  "use strict";
  
  return {
    createUserModel: function() {
      return new JSONModel({
        id: "",
        email: "",
        name: ""
      });
    }
  };
});
