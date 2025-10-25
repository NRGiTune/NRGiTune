// js/auth-modals.js

// CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = 'https://citaewfnpsfjtnuolqyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpdGFld2ZucHNmanRudW9scXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDcxMjMsImV4cCI6MjA3MzE4MzEyM30.JJ90UzR3_DLu6-YcWGZq623B-hXcPFBUrwg2gOLFOcI';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------
// FUNÇÕES AUXILIARES
// ----------------------------------------------------

function getIniciais(fullName) {
    if (!fullName) return '';
    const parts = fullName.split(' ').filter(p => p.length > 0);

    let iniciais = '';
    if (parts.length > 0) {
        iniciais += parts[0][0]; // Primeira letra do primeiro nome
    }
    if (parts.length > 1) {
        iniciais += parts[parts.length - 1][0]; // Primeira letra do apelido
    }
    return iniciais.toUpperCase();
}

/**
 * Alterna a visibilidade dos elementos Logado/Deslogado.
 */
function updateAuthUI(isLoggedIn, userName = null, userEmail = null) {
    if (isLoggedIn) {
        // Logado: Esconde Login, Mostra Avatar Link
        loginLink.style.display = 'none';
        avatarLink.style.display = 'inline-block'; // Links geralmente são inline

        // Preenche dados do avatar/menu
        const iniciais = getIniciais(userName || userEmail);
        btnAvatar.textContent = iniciais;
        userInfoName.value = userName;
        userInfoEmail.value = userEmail;

    } else {
        // Deslogado: Mostra Login Link, Esconde Avatar Link
        loginLink.style.display = 'block';
        avatarLink.style.display = 'none';
    }
}

async function checkAuthStatus() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session && session.user) {
        const user = session.user;
        const userName = user.user_metadata?.nome || user.email;
        updateAuthUI(true, userName, user.email);
    } else {
        updateAuthUI(false);
    }
}

document.addEventListener('DOMContentLoaded', function () {

    // === 1. REFERÊNCIAS GLOBAIS ===

    const btnLogout = document.getElementById('btnLogout');
    const btnAvatar = document.getElementById('btnAvatar');
    const userInfoName = document.getElementById('userInfoName');
    const userInfoEmail = document.getElementById('userInfoEmail');

    // Botão que abre o modal
    const btnLogIn = document.getElementById('btnLogIn');
    const loginLink = document.getElementById('loginLink');
    const avatarLink = document.getElementById('avatarLink');

    // Modais
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registrationModal');
    const recoverModal = document.getElementById('recoverModal');
    const userInfoModal = document.getElementById('userInfoModal');

    // Botões de fecho
    const closeLoginModalBtn = document.getElementById('closeLoginModal');
    const closeRegisterModalBtn = document.getElementById('closeModal');
    const closeRecoverModalBtn = document.getElementById('closeRecoverModal');
    const closeUserInfoModalBtn = document.getElementById('closeUserInfoModal');

    // Links de troca entre modais
    const openRegisterFromLogin = document.getElementById('openRegisterFromLogin');
    const openLoginFromRegister = document.getElementById('openLoginFromRegister');
    const openRecoverFromLogin = document.getElementById('openRecoverFromLogin');
    const openLoginFromRecover = document.getElementById('openLoginFromRecover');

    // Formulários
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');
    const recoverPasswordForm = document.getElementById('recoverPasswordForm');

    // === 2. FUNÇÕES DE GESTÃO DE MODAL ===

    function openModal(modalElement) {
        // Fecha todos os modais primeiro
        loginModal.classList.add('hidden');
        registerModal.classList.add('hidden');
        recoverModal.classList.add('hidden');
        userInfoModal.classList.add('hidden');

        // Abre o modal desejado
        modalElement.classList.remove('hidden');
    }

    function closeModal(modalElement) {
        modalElement.classList.add('hidden');
    }

    // === 3. EVENTOS DE ABERTURA E FECHO ===

    // Abrir Login Modal pelo botão principal
    if (btnLogIn && loginLink) {
        btnLogIn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(loginModal);
        });
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(loginModal);
        });
    }

    // Alternar entre Login e Registo
    if (openRegisterFromLogin) {
        openRegisterFromLogin.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(registerModal);
        });
    }
    if (openLoginFromRegister) {
        openLoginFromRegister.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(loginModal);
        });
    }

    // Abrir Recuperação a partir do Login
    if (openRecoverFromLogin) {
        openRecoverFromLogin.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(recoverModal);
        });
    }

    // Voltar para Login a partir da Recuperação
    if (openLoginFromRecover) {
        openLoginFromRecover.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(loginModal);
        });
    }

    // Abrir User Info Modal pelo botão avatar
    if (avatarLink) {
        avatarLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(userInfoModal);
        });
    }

    // Fechar Modais (Botão X)
    if (closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', () => closeModal(loginModal));
    if (closeRegisterModalBtn) closeRegisterModalBtn.addEventListener('click', () => closeModal(registerModal));
    if (closeRecoverModalBtn) closeRecoverModalBtn.addEventListener('click', () => closeModal(recoverModal));
    if (closeUserInfoModalBtn) closeUserInfoModalBtn.addEventListener('click', () => closeModal(userInfoModal));

    // Fechar Modais (Clicar fora)
    window.addEventListener('click', function (event) {
        if (event.target === loginModal) {
            closeModal(loginModal);
        }
        if (event.target === registerModal) {
            closeModal(registerModal);
        }
        if (event.target === recoverModal) {
            closeModal(recoverModal);
        }
        if (event.target === userInfoModal) {
            closeModal(userInfoModal);
        }
    });

    // === 4. LÓGICA ESPECÍFICA DO FORMULÁRIO DE LOGIN ===

    // A. Lógica de Login do Supabase
    if (loginForm) {
        const loginSubmitButton = document.getElementById('loginSubmitButton');
        const loginMessage = document.getElementById('loginMessage');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email-login').value;
            const password = document.getElementById('password-login').value;

            loginSubmitButton.disabled = true;
            loginSubmitButton.textContent = 'A entrar...';
            loginMessage.textContent = '';

            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

            loginSubmitButton.disabled = false;
            loginSubmitButton.textContent = 'Entrar';

            if (error) {
                loginMessage.textContent = `Erro: ${error.message}`;
                loginMessage.style.color = 'red';
                console.error(error);
            } else if (data.user) {
                // Login bem-sucedido: Fechar modal e redirecionar
                closeModal(loginModal);
                checkAuthStatus();
            }
        });
    }

    // B. Lógica de Visualização da Senha (Login)
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const passwordLoginInput = document.getElementById('password-login');

    if (toggleLoginPassword && passwordLoginInput) {
        toggleLoginPassword.addEventListener('click', function () {
            const type = passwordLoginInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordLoginInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }


    // === 5. LÓGICA ESPECÍFICA DO FORMULÁRIO DE REGISTO ===

    // A. (Integre aqui a lógica completa do seu script 'registration-modal.js' anterior)
    if (registrationForm) {
        const regSubmitButton = document.getElementById('regSubmitButton');
        const regMessage = document.getElementById('regMessage');

        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const fullName = document.getElementById('reg-name').value;

            regSubmitButton.disabled = true;
            regSubmitButton.textContent = 'A registar...';
            regMessage.textContent = 'A enviar dados...';
            regMessage.style.color = '#000';

            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { full_name: fullName }
                }
            });

            regSubmitButton.disabled = false;
            regSubmitButton.textContent = 'Registar';

            if (error) {
                regMessage.textContent = `Erro: ${error.message}`;
                regMessage.style.color = 'red';
            } else if (data.user) {
                regMessage.textContent = 'Sucesso! Verifique o seu e-mail para confirmar a sua conta.';
                regMessage.style.color = 'var(--color-primary)';
                // Fechar o modal de registo após sucesso
                setTimeout(() => closeModal(registerModal), 3000);
            } else {
                regMessage.textContent = 'O seu registo foi enviado. Por favor, verifique o seu e-mail.';
                regMessage.style.color = 'var(--color-primary)';
                setTimeout(() => closeModal(registerModal), 3000);
            }
        });
    }

    // B. Lógica de Visualização da Senha (Login)
    const toggleRegPassword = document.getElementById('toggleRegPassword');
    const passwordRegInput = document.getElementById('reg-password');

    if (toggleRegPassword && passwordRegInput) {
        toggleRegPassword.addEventListener('click', function () {
            const type = passwordRegInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordRegInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // === 6. LÓGICA ESPECÍFICA DO FORMULÁRIO DE RECUPERAÇÃO ===
    if (recoverPasswordForm) {
        const emailInput = document.getElementById('email-recover');
        const submitButton = document.getElementById('recoverSubmitButton');
        const messageDisplay = document.getElementById('recoverMessage');

        // IMPORTANTE: URL para onde o utilizador será redirecionado
        // CRIE esta página para concluir o processo de redefinição
        const REDIRECT_TO_URL = window.location.origin + '/website/index.html?content=reset-password.html';

        recoverPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value;

            submitButton.disabled = true;
            submitButton.textContent = 'A enviar...';
            messageDisplay.textContent = '';

            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: REDIRECT_TO_URL,
            });

            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Link';

            if (error) {
                messageDisplay.textContent = `Erro: ${error.message}`;
                messageDisplay.style.color = 'red';
                console.error('Erro ao enviar link de recuperação:', error);
            } else {
                messageDisplay.textContent = 'Link de recuperação enviado! Verifique o seu e-mail. Esta janela irá fechar.';
                messageDisplay.style.color = 'var(--color-primary)';

                // Fechar o modal após sucesso e limpar o campo
                emailInput.value = '';
                setTimeout(() => closeModal(recoverModal), 5000);
            }
        });
    }



    // === 7. LÓGICA ESPECÍFICA DO FORMULÁRIO DE USER INFO ===
    const userAccLinks = document.querySelectorAll('#userAccountNav a');
    userAccLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Previne o comportamento padrão do link (que é navegar para outra página)
            event.preventDefault();

            const url = event.currentTarget.getAttribute('data-url');

            if (url) {
                carregarConteudo(url);
                //const userInfoModal = document.getElementById('userInfoModal');
                closeModal(userInfoModal);
            }
        });
    });

    // Check user log status
    checkAuthStatus();
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            const user = session?.user;
            if (user) {
                const userName = user.user_metadata?.full_name || user.email;
                //updateAuthUI(true, userName, user.email);
            }
        } else if (event === 'SIGNED_OUT') {
            //updateAuthUI(false);
        }
    });
    // Ação de Terminar Sessão (Logout)
    btnLogout.addEventListener('click', async (event) => {
        event.preventDefault();
        await supabaseClient.auth.signOut();
        closeModal(userInfoModal);
        checkAuthStatus();
    });

});

// NOTA: A lógica do Avatar (updateAuthUI, getInitials, onAuthStateChange) 
// deve ser mantida no seu ficheiro 'js/auth-ui.js', que deve ser carregado PRIMEIRO.
// Se quiser tudo num só, mova a lógica do 'auth-ui.js' para este ficheiro 'auth-modals.js'.