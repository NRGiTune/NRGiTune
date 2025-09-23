sap.ui.define([
  "sap/ui/core/UIComponent",
  "supabase/app/model/models"
], function(UIComponent, models) {
  "use strict";

  return UIComponent.extend("supabase.app.Component", {
    metadata: { manifest: "json" },

    init: function() {
      UIComponent.prototype.init.apply(this, arguments);

      // modelo global de utilizador
      this.setModel(models.createUserModel(), "user");

      this.getRouter().initialize();
    }
  });
});
