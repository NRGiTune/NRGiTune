//@ui5-bundle simulador/Component-preload.js
sap.ui.predefine("simulador/Component", ["sap/ui/core/UIComponent"],function(t){"use strict";return t.extend("simulador.Component",{metadata:{manifest:"json"},init:function(){t.prototype.init.apply(this,arguments);this.getRouter().initialize()}})});
sap.ui.predefine("simulador/controller/App.controller", ["sap/ui/core/mvc/Controller"],function(n){"use strict";return n.extend("simulador.controller.App",{onInit:function(){}})});
sap.ui.predefine("simulador/controller/Home.controller", ["sap/ui/core/mvc/Controller"],function(n){"use strict";return n.extend("simulador.controller.Home",{onInit:function(){}})});
sap.ui.predefine("simulador/init", ["sap/ui/core/Component"],function(t){"use strict";sap.ui.getCore().attachInit(function(){t.create({name:"simulador",async:true}).then(function(t){t.placeAt("content")})})});
sap.ui.predefine("simulador/simulador/init", ["sap/ui/core/Component"],function(t){"use strict";sap.ui.getCore().attachInit(function(){t.create({name:"simulador",async:true}).then(function(t){t.placeAt("content")})})});
sap.ui.require.preload({
	"simulador/manifest.json":'{"sap.app":{"id":"simulador","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"1.0.0"},"title":"Simulador","description":"Exemplo de app com routing"},"sap.ui":{"technology":"UI5","deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"rootView":{"viewName":"simulador.view.App","type":"XML","async":true,"id":"appView"},"dependencies":{"minUI5Version":"1.84","libs":{"sap.m":{},"sap.ui.core":{}}},"routing":{"config":{"routerClass":"sap.m.routing.Router","viewType":"XML","async":true,"viewPath":"simulador.view","controlAggregation":"pages","controlId":"app","transition":"slide"},"routes":[{"pattern":"","name":"Home","target":"Home"}],"targets":{"Home":{"viewName":"Home"}}}}}',
	"simulador/view/App.view.xml":'<mvc:View\n    controllerName="simulador.controller.App"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns="sap.m"\n    displayBlock="true"><App id="app"/></mvc:View>\n',
	"simulador/view/Home.view.xml":'<mvc:View\n    controllerName="simulador.controller.Home"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns="sap.m"><Page id="homePage" title="Página Inicial"><content><Text text="Bem-vindo à aplicação 🚀"/></content></Page></mvc:View>\n'
});
//# sourceMappingURL=Component-preload.js.map
