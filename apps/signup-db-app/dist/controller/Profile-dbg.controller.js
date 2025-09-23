sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "supabase/app/utils/supabase"
], function(Controller, supabaseClient) {
  "use strict";

  const supabase = supabaseClient.supabase;
  // const supabase = supabaseClient.getClient();
  console.log(supabase);

  return Controller.extend("supabase.app.controller.Profile", {
    onInit: async function() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        this.getOwnerComponent().getRouter().navTo("Login");
        return;
      }

      this.byId("emailText").setText(user.email);
      this.byId("idText").setText(user.id);
    },

    onLogout: async function() {
      await supabase.auth.signOut();
      this.getOwnerComponent().getRouter().navTo("Login");
    }
  });
});
