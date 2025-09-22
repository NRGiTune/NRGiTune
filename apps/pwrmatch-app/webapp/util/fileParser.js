sap.ui.define([], function () {
  "use strict";
  return {
    parseCSV: function (text) {
      // simples parse: cabeçalho: date,vazio,cheio,ponta
      var lines = text.split(/\r?\n/).filter(Boolean);
      var headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      var data = [];
      for (var i=1;i<lines.length;i++) {
        var cols = lines[i].split(",");
        if (cols.length >= headers.length) {
          var obj = {};
          headers.forEach(function (h, j) { obj[h] = cols[j] ? cols[j].trim() : ""; });
          data.push(obj);
        }
      }
      return data;
    }
  };
});
