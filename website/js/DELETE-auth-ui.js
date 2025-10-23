// js/auth-ui.js

// CONFIGURAÇÃO SUPABASE (Substitua pelos seus dados REAIS de produção)
const SUPABASE_URL = 'https://citaewfnpsfjtnuolqyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpdGFld2ZucHNmanRudW9scXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDcxMjMsImV4cCI6MjA3MzE4MzEyM30.JJ90UzR3_DLu6-YcWGZq623B-hXcPFBUrwg2gOLFOcI';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


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

/**
 * Atualiza a visibilidade do botão de login e do avatar.
 * @param {object | null} user - O objeto de utilizador do Supabase.
 */
function updateAuthUI(user) {
    const btnLogIn = document.getElementById('btnLogIn');
    const avatarSpan = document.getElementById('avatar'); // Onde as iniciais vão
    const avatarContainer = document.getElementById('user-auth-area'); // O elemento pai que controlamos

    if (!btnLogIn || !avatarSpan || !avatarContainer) {
        console.error("Elementos de UI de autenticação não encontrados. Verifique os IDs.");
        return;
    }

    if (user) {
        // UTILIZADOR LIGADO (LOGGED IN)
        //btnLogIn.parentElement.classList.add('hidden'); // Esconde o <a> pai do botão
        avatarContainer.classList.remove('hidden');    // Mostra o container do avatar

        // Extrai o nome dos metadados
        const fullName = user.user_metadata?.full_name || user.user_metadata?.display_name || user.email;
        avatarSpan.textContent = getInitials(fullName);

    } else {
        // UTILIZADOR DESLIGADO (LOGGED OUT)
        btnLogIn.parentElement.classList.remove('hidden'); // Mostra o botão
        //avatarContainer.classList.add('hidden');           // Esconde o avatar
        avatarContainer.classList.remove('hidden');    // Mostra o container do avatar
        avatarSpan.textContent = '';
    }
}

// Lógica Principal - Executada assim que o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {

    // 1. Verificar o estado atual ao carregar a página
    // Isto é vital para persistir o estado de login através de recargas de página.
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        updateAuthUI(session?.user || null);
    }).catch(e => {
        console.error("Erro ao obter a sessão Supabase:", e);
        updateAuthUI(null); // Trata o erro como utilizador offline
    });

    // 2. Escutar alterações em tempo real (ex: login, logout)
    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session?.user || null);
    });

    // Adicione aqui outros listeners de eventos que precisem do DOM (ex: o login do formulário)
    // Exemplo de como faria o logout (opcional, para testar a troca de estado):
    /*
    const logoutButton = document.getElementById('logout-button'); // Adicione este ID a um botão de Logout
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            const { error } = await supabaseClient.auth.signOut();
            if (error) console.error('Erro ao fazer logout:', error);
            // A função updateAuthUI() será chamada automaticamente pelo onAuthStateChange
        });
    }
    */


    // Referências necessárias para eventos
    const authArea = document.getElementById('authArea');
    const userMenuDialog = document.getElementById('userMenuDialog');
    const btnLogout = document.getElementById('btnLogout');

    // 1. LÓGICA DE ABRIR/FECHAR DIALOG
    if (authArea) {
        // Abrir/Fechar o Dialog ao clicar no container do avatar
        authArea.addEventListener('click', (e) => {
            // Impedimos o clique de fechar o dialog imediatamente
            e.stopPropagation();
            userMenuDialog.classList.toggle('hidden');
        });
    }

    // Fechar o Dialog ao clicar fora (no documento)
    document.addEventListener('click', (e) => {
        if (authArea && userMenuDialog) {
            // Se o clique não foi dentro da área de autenticação E o dialog está visível
            if (!authArea.contains(e.target) && !userMenuDialog.classList.contains('hidden')) {
                userMenuDialog.classList.add('hidden');
            }
        }
    });

    // 2. LÓGICA DE LOGOUT
    if (btnLogout) {
        btnLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            const { error } = await supabaseClient.auth.signOut();
            if (error) console.error('Erro ao fazer logout:', error);
            // O updateAuthUI() será chamado automaticamente pelo onAuthStateChange
        });
    }

    // 3. Inicializar a UI e escutar mudanças (Manter)
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        updateAuthUI(session?.user || null);
    }).catch(e => {
        console.error("Erro ao obter a sessão Supabase:", e);
        updateAuthUI(null);
    });

    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session?.user || null);
    });






});