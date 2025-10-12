sap.ui.define([], function () {
    "use strict";

    return {
        /**
         * Formata número em moeda (€, $...) com 2 casas decimais
         * @param {number} value - valor numérico
         * @param {string} [locale="pt-PT"] - código de locale (ex: "en-US")
         * @param {string} [currency="EUR"] - código da moeda (ex: "EUR", "USD")
         * @returns {string} valor formatado
         */
        formatCurrency: function (value, locale = "pt-PT", currency = "EUR") {
            if (value === null || value === undefined || isNaN(value)) {
                return "";
            }
            return new Intl.NumberFormat(locale, {
                style: "currency",
                currency: currency
            }).format(value);
        },

        formatInteger: function (value) {
            if (value == null || value === "") return "";
            return Math.round(value); // arredonda para inteiro
        },

        /**
         * Formata data no formato local (dd/MM/yyyy, MM/dd/yyyy, etc.)
         * @param {Date|string} value - data ou string convertível
         * @param {string} [locale="pt-PT"] - código de locale
         * @returns {string} data formatada
         */
        formatDate: function (value, locale = "pt-PT") {
            if (!value) {
                return "";
            }

            let date = value instanceof Date ? value : new Date(value);

            return date.toLocaleDateString(locale, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
        },

        formatCycleText: function (sCycle) {
            var oBundle = this.getView().getModel("i18n").getResourceBundle();

            switch (sCycle) {
                case "1":
                    return oBundle.getText("contractPanelCycleSimple"); // Simples
                case "2":
                    return oBundle.getText("contractPanelCycleBiH"); // Bi-Horário
                default:
                    return oBundle.getText("contractPanelCycleTriH"); // Tri-Horário
            }
        },

        parseXlsxFilesDate: function (str) {
            if (!str) return null;
            const [dd, mm, yyyy] = str.split("/").map(Number);
            return new Date(yyyy, mm - 1, dd);
        },

        getDaysBetween: function (start, end, inclusive = false) {
            if (!(start instanceof Date) || !(end instanceof Date)) return 0;
            const diff = (end - start) / (1000 * 60 * 60 * 24);
            return inclusive ? diff + 1 : diff;
        },

        getOfferCommConditionsFilter: function (oBundle, offerCommConditions) {

            var offerCommConditionsFilter = [];
            var offerCommConditionFilter = null;

            const commConditionsFilter = Object.entries(offerCommConditions)
                .filter(([key]) => key.startsWith("Filtro"))          // only keys starting with "Filtro"
                .map(([key, value]) => ({
                    filterType: key,
                    filterValue: String(value)                          // optional: convert to string
                }));

            commConditionsFilter.forEach(commCond => {
                let commConditionsText = null;
                let commConditionsIcon = null;
                let commConditionsState = null;
                let commConditionsVisible = null;

                switch (commCond.filterType) {

                    case "Filtrofaturacao":
                        switch (commCond.filterValue) {
                            case "01":
                                commConditionsText = oBundle.getText("billingFilter01");
                                commConditionsIcon = "sap-icon://alert";
                                commConditionsState = "Information";
                                break;
                            case "10":
                                commConditionsText = oBundle.getText("billingFilter10");
                                commConditionsIcon = "sap-icon://alert";
                                commConditionsState = "Warning";
                                break;
                            default:
                                commConditionsText = oBundle.getText("billingFilter11");
                                commConditionsIcon = "sap-icon://sys-enter-2";
                                commConditionsState = "Success";
                                break;
                        }
                        commConditionsVisible = true;
                        break;

                    case "FiltroContratacao":
                        switch (commCond.filterValue) {
                            case "100":
                                commConditionsText = oBundle.getText("hiringFilter100");
                                commConditionsIcon = "sap-icon://alert";
                                commConditionsState = "Warning";
                                break;
                            case "110":
                                commConditionsText = oBundle.getText("hiringFilter110");
                                commConditionsIcon = "sap-icon://alert";
                                commConditionsState = "Warning";
                                break;
                            default:
                                commConditionsText = oBundle.getText("hiringFilter111");
                                commConditionsIcon = "sap-icon://sys-enter-2";
                                commConditionsState = "Success";
                                break;
                        }
                        commConditionsVisible = false;
                        break;

                    case "FiltroPagamento":
                        switch (commCond.filterValue) {
                            case "100":
                                commConditionsText = oBundle.getText("paymentFilter100");
                                commConditionsIcon = "sap-icon://alert";
                                commConditionsState = "Warning";
                                break;
                            default:
                                commConditionsText = oBundle.getText("paymentFilter101");
                                commConditionsIcon = "sap-icon://sys-enter-2";
                                commConditionsState = "Success";
                                break;
                        }
                        commConditionsVisible = true;
                        break;

                    case "FiltroFidelização":
                        switch (commCond.filterValue) {
                            case "Sim":
                                commConditionsText = oBundle.getText("loyaltyFilterYes");
                                commConditionsIcon = "sap-icon://alert";
                                commConditionsState = "Warning";
                                break;
                            default:
                                commConditionsText = oBundle.getText("loyaltyFilterNo");
                                commConditionsIcon = "sap-icon://sys-enter-2";
                                commConditionsState = "Success";
                                break;
                        }
                        commConditionsVisible = true;
                        break;

                    case "FiltroRestrições":
                        switch (commCond.filterValue) {
                            case "Sim":
                                commConditionsText = oBundle.getText("restrictionsFilterYes");
                                commConditionsIcon = "sap-icon://alert";
                                commConditionsState = "Warning";
                                break;
                            default:
                                commConditionsText = oBundle.getText("restrictionsFilterNo");
                                commConditionsIcon = "sap-icon://sys-enter-2";
                                commConditionsState = "Success";
                                break;
                        }
                        commConditionsVisible = true;
                        break;

                    default:
                        // case unrecognized filter
                        break;
                }

                // Se todos os valores foram definidos, adiciona ao array
                if (commConditionsText && commConditionsIcon && commConditionsState) {
                    offerCommConditionsFilter.push({
                        text: commConditionsText,
                        icon: commConditionsIcon,
                        state: commConditionsState,
                        visible: commConditionsVisible
                    });
                }
            });


            return offerCommConditionsFilter;

        }


    };
});

