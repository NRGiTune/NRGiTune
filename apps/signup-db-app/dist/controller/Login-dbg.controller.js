sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "supabase/app/utils/supabase"
], function(Controller, supabaseClient) {
  "use strict";

  const supabase = supabaseClient.supabase;
  // const supabase = supabaseClient.getClient();
  console.log(supabase);

  return Controller.extend("supabase.app.controller.Login", {
    onLogin: async function() {
      const email = this.byId("email").getValue();
      const password = this.byId("password").getValue();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        sap.m.MessageToast.show("Erro: " + error.message);
      } else {
        this.getOwnerComponent().getRouter().navTo("Profile");
      }
    },

    onGoRegister: function() {
      this.getOwnerComponent().getRouter().navTo("Register");
    }
  });
});
