sap.ui.define([], function () {
  "use strict";

  // instância do supabase
  const { createClient } = window.supabase; // assumindo que o SDK já está carregado via <script>

  const supabaseUrl = "https://citaewfnpsfjtnuolqyo.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpdGFld2ZucHNmanRudW9scXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDcxMjMsImV4cCI6MjA3MzE4MzEyM30.JJ90UzR3_DLu6-YcWGZq623B-hXcPFBUrwg2gOLFOcI";
  const supabaseClient = createClient(supabaseUrl, supabaseKey);

  return {
    getClient: function () {
      return supabaseClient;
    }
  };
});