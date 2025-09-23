sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "supabase/app/utils/supabase"
], function(Controller, supabase) {
  "use strict";

  const supabaseClient = supabase.getClient();
  
  return Controller.extend("supabase.app.controller.Profile", {
    onInit: async function() {
      const { data: { user } } = await supabaseClient.auth.getUser();

      if (!user) {
        this.getOwnerComponent().getRouter().navTo("Login");
        return;
      }

      this.byId("emailText").setText(user.email);
      this.byId("idText").setText(user.id);
    },

    onLogout: async function() {
      await supabaseClient.auth.signOut();
      this.getOwnerComponent().getRouter().navTo("Login");
    }
  });
});
