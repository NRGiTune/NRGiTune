sap.ui.define([
  "sap/ui/core/UIComponent"
], function (UIComponent) {
  "use strict";

  return UIComponent.extend("simulador.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      // chamada ao init da superclasse
      UIComponent.prototype.init.apply(this, arguments);

      // inicializa o router definido no manifest.json
      this.getRouter().initialize();
    }
  });
});
