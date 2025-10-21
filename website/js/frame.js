// 1. Start - Load dinamic content
async function carregarConteudo(url) {
    const container = document.getElementById('dinamic-content');

    // Limpa o conteúdo anterior e mostra uma mensagem de carregamento
    container.innerHTML = '<h2>A carregar...</h2>';

    try {
        // Usa a API Fetch para obter o conteúdo do ficheiro HTML
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro de HTTP: ${response.status}`);
        }

        const htmlContent = await response.text();

        // 2. Injeta o conteúdo no container
        container.innerHTML = htmlContent;

    } catch (error) {
        console.error('Falha ao carregar o conteúdo:', error);
        container.innerHTML = `<h2>Erro ao carregar a página:</h2><p>${error.message}</p>`;
    }
}
// 1. End - Load dinamic content

/**
 * Extrai as iniciais a partir do nome completo.
 * @param {string} fullName 
 * @returns {string} Iniciais (2 letras)
 */
function getInitials(fullName) {
    if (!fullName || typeof fullName !== 'string') return 'U';

    const parts = fullName.trim().split(/\s+/);
    let initials = '';

    if (parts.length > 0) {
        initials += parts[0][0];
        // Pega a primeira letra do último nome se houver mais de uma palavra
        if (parts.length > 1) {
            initials += parts[parts.length - 1][0];
        }
    }

    return initials.toUpperCase();
}



// Lógica Principal - Executada assim que o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {

    // 1. Start - Load dinamic content
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

    // Opcional: Carregar a primeira página por padrão ao iniciar
    const defaultUrl = menuLinks[0]?.getAttribute('data-url');
    if (defaultUrl) {
        carregarConteudo(defaultUrl);
    }
    // 1. END - Load dinamic content



});