// 1. START - Load dinamic content
async function carregarConteudo(url) {
    const container = document.getElementById('dinamic-content');

    // Mensagem de loading
    container.innerHTML = '<h2>A carregar...</h2>';

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro de HTTP: ${response.status}`);
        }

        const htmlContent = await response.text();

        // ✅ Injectar HTML carregado
        container.innerHTML = htmlContent;

        // ✅ Se for a página de contacto, inicializa o formulário
        if (url.includes('contacto')) {
            if (typeof initContactForm === "function") {
                initContactForm(); // <-- Muito importante!
            } else {
                console.warn("⚠️ initContactForm não encontrado. Certifica-te que contacto.js está incluído.");
            }
        }

    } catch (error) {
        console.error('Falha ao carregar o conteúdo:', error);
        container.innerHTML = `<h2>Erro ao carregar a página:</h2><p>${error.message}</p>`;
    }
}
// 1. END - Load dinamic content

// 2. START - Get URL parameter
/**
 * Obtém o valor de um parâmetro de consulta (query parameter) da URL.
 * @param {string} name - O nome do parâmetro.
 * @returns {string | null} O valor do parâmetro ou null.
 */
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
// 2. END - Get URL parameter


// Lógica Principal - Executada assim que o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {

    // 1. START - Load dinamic content from menu
    const menuLinks = document.querySelectorAll('#menu a');

    menuLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Previne o comportamento padrão do link (que é navegar para outra página)
            event.preventDefault();

            // Obtém a URL do ficheiro a partir do atributo data-url
            const url = event.currentTarget.getAttribute('data-url');

            if (url) {
                carregarConteudo(url);
            }
        });
    });
    // 1. END - Load dinamic content from menu

    // 2. START - Load dinamic content from menu
    const footerLinks = document.querySelectorAll('#footer a');

    footerLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Previne o comportamento padrão do link (que é navegar para outra página)
            event.preventDefault();

            // Obtém a URL do ficheiro a partir do atributo data-url
            const url = event.currentTarget.getAttribute('data-url');

            if (url) {
                carregarConteudo(url);
            }
        });
    });
    // 2. END - Load dinamic content from menu

    // 3. START - Load dinamic content from URL parameter
    const urlFromQuery = getQueryParam('content');
    let urlToLoad = null;
    if (urlFromQuery) {
        // Opção 1: Usar o URL passado no parâmetro da URL (ex: ?url=detalhes.html)
        urlToLoad = urlFromQuery;
    } else {
        // Opção 2: Se nenhum parâmetro foi passado, usa o 'data-url' do primeiro link do menu
        const defaultLink = menuLinks[0];
        if (defaultLink) {
            urlToLoad = defaultLink.getAttribute('data-url');
        }
    }
    carregarConteudo(urlToLoad);
    // 3. END - Load dinamic content from URL parameter


});