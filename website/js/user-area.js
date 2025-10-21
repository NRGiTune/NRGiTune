// =================================================================
// SIMULAÇÃO DE DADOS E FUNÇÕES
// (Utilize os dados reais do seu utilizador aqui)
// =================================================================
const UTILIZADOR_LOGADO = {
    nome: "Natália Teixeira",
    login: "natalia.t@email.com"
};

function simularLogout() {
    alert("A terminar sessão...");
    // Implemente a sua lógica de logout real (ex: Supabase.auth.signOut())
    // Depois de fazer logout, redirecione ou recarregue.
    window.location.reload();
}

async function carregarConteudo(url, containerId = 'conteudo-principal') {
    const container = document.getElementById(containerId);
    container.innerHTML = '<h2>A carregar...</h2>';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro de HTTP: ${response.status}`);
        }
        const htmlContent = await response.text();
        container.innerHTML = htmlContent;
    } catch (error) {
        console.error('Falha ao carregar o conteúdo:', error);
        container.innerHTML = `<h2>Erro ao carregar a página:</h2><p>${error.message}</p>`;
    }
}

// =================================================================
// LÓGICA DO MENU POPUP
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const btnAvatar = document.getElementById('btnAvatar');
    const menuDialog = document.getElementById('userMenuDialog');
    const dialogUserName = document.getElementById('dialogUserName');
    const dialogAvatar = document.getElementById('dialogAvatar');
    const linkDetalhes = document.getElementById('linkDetalhes');
    const btnLogout = document.getElementById('btnLogout');

    // Pré-popula os dados do utilizador
    const nomeArray = UTILIZADOR_LOGADO.nome.split(' ');
    const iniciais = nomeArray.length > 1
        ? nomeArray[0][0] + nomeArray[nomeArray.length - 1][0]
        : nomeArray[0][0];

    btnAvatar.textContent = iniciais.toUpperCase();
    dialogAvatar.textContent = iniciais.toUpperCase();
    dialogUserName.textContent = UTILIZADOR_LOGADO.login;

    // 1. ALTERNAR O MENU (Abre/Fecha o popup)
    btnAvatar.addEventListener('click', (event) => {
        // Previne o clique de se propagar para fechar imediatamente o menu
        event.stopPropagation();

        // Alterna a visibilidade (de none para block, ou vice-versa)
        const isHidden = menuDialog.style.display === 'none' || menuDialog.style.display === '';
        menuDialog.style.display = isHidden ? 'block' : 'none';
    });

    // 2. FECHAR O MENU QUANDO CLICAR FORA (Comportamento de popup)
    document.addEventListener('click', (event) => {
        // Se o menu estiver visível E o clique não tiver sido no botão nem dentro do menu, fechar
        if (menuDialog.style.display === 'block' &&
            !menuDialog.contains(event.target) &&
            !btnAvatar.contains(event.target)) {

            menuDialog.style.display = 'none';
        }
    });

    // 3. AÇÃO: DETALHES DA CONTA
    linkDetalhes.addEventListener('click', (event) => {
        event.preventDefault();

        menuDialog.style.display = 'none'; // Fecha o menu

        const paginaUrl = event.currentTarget.getAttribute('data-page');
        if (paginaUrl) {
            carregarConteudo(paginaUrl);
        }
    });

    // 4. AÇÃO: TERMINAR SESSÃO (LOGOUT)
    btnLogout.addEventListener('click', (event) => {
        event.preventDefault();
        menuDialog.style.display = 'none'; // Fecha o menu
        simularLogout();
    });
});