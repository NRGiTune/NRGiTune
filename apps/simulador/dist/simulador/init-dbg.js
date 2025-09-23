sap.ui.define(["sap/ui/core/Component"], function (Component) {
  "use strict";

  sap.ui.getCore().attachInit(function () {
    Component.create({
      name: "simulador", // 👈 tem de bater com o namespace
      async: true
    }).then(function (oComponent) {
      oComponent.placeAt("content");
    });
  });
});
