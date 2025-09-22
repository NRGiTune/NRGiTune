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
        }
    };
});

