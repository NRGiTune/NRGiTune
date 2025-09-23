sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "supabase/app/utils/supabase"
], function(Controller, supabase) {
  "use strict";

  const supabaseClient = supabase.getClient();
  console.log(supabase);

  return Controller.extend("supabase.app.controller.Register", {
    onRegister: async function() {
      const email = this.byId("regEmail").getValue();
      const password = this.byId("regPassword").getValue();

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
      });

      if (error) {
        sap.m.MessageToast.show("Erro: " + error.message);
      } else {
        sap.m.MessageToast.show("Verifica o teu email para confirmar.");
        this.getOwnerComponent().getRouter().navTo("Login");
      }
    }
  });
});
