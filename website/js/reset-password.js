
// ✅ Função principal chamada após fetch()
function initResetPasswordForm() {

    // ----------------------------------------------------
    // FUNÇÕES DOM
    // ----------------------------------------------------
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const loadingCheck = document.getElementById('loading-check');
    const statusMessage = document.getElementById('status-message');
    const newPasswordInput = document.getElementById('resetPasswNew');
    const confirmPasswordInput = document.getElementById('resetPasswConfirm');
    const resetBtn = document.getElementById('resetBtn');

    function displayStatus(message, type) {
        statusMessage.textContent = message;
        if (type === "success") {
            statusMessage.className = 'success';
        } else {
            statusMessage.className = 'error';
        }
        statusMessage.classList.add(type);
        statusMessage.style.display = 'block';
    }

    // B. Lógica de Visualização da Senha
    const toggleResetPassword = document.getElementById('toggleResetPassword');
    const resetPasswNew = document.getElementById('resetPasswNew');

    if (toggleResetPassword && resetPasswNew) {
        toggleResetPassword.addEventListener('click', function () {
            const type = resetPasswNew.getAttribute('type') === 'password' ? 'text' : 'password';
            resetPasswNew.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // C. Lógica de Visualização da Confirmar Senha
    const toggleResetPasswordConfirm = document.getElementById('toggleResetPasswordConfirm');
    const resetPasswConfirm = document.getElementById('resetPasswConfirm');

    if (toggleResetPasswordConfirm && resetPasswConfirm) {
        toggleResetPasswordConfirm.addEventListener('click', function () {
            const type = resetPasswConfirm.getAttribute('type') === 'password' ? 'text' : 'password';
            resetPasswConfirm.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // ----------------------------------------------------
    // LÓGICA DE REDEFINIÇÃO
    // ----------------------------------------------------

    /**
     * 1. Verifica a sessão de autenticação.
     * O Supabase trata automaticamente dos tokens na URL e cria uma sessão temporária.
     */
    async function initialize() {
        // O getSession() verifica a URL e tenta autenticar a sessão
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        loadingCheck.style.display = 'none';

        if (session) {
            // Se houver uma sessão, o utilizador está temporariamente logado para redefinir a senha
            resetPasswordForm.style.display = 'block';
            displayStatus('Sessão validada. Defina a sua nova senha.', 'success');
        } else if (error) {
            displayStatus(`Erro de validação: ${error.message}`, 'error');
        }
        else {
            // Isso pode acontecer se o token tiver expirado ou for inválido
            displayStatus('Link inválido ou expirado. Por favor, solicite uma nova redefinição de senha.', 'error');
        }
    }

    /**
     * 2. Processa o envio do formulário de nova senha.
     */
    resetPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        statusMessage.style.display = 'none';
        resetBtn.disabled = true;
        resetBtn.textContent = 'A redefinir...';

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword !== confirmPassword) {
            displayStatus('As senhas não coincidem. Por favor, tente novamente.', 'error');
            resetBtn.disabled = false;
            resetBtn.textContent = 'Redefinir Senha';
            return;
        }

        if (newPassword.length < 6) {
            displayStatus('A senha deve ter no mínimo 6 caracteres.', 'error');
            resetBtn.disabled = false;
            resetBtn.textContent = 'Redefinir Senha';
            return;
        }

        // A função updateUser() atualiza a senha do utilizador atualmente logado (a sessão temporária)
        const { error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });

        if (!error) {
            displayStatus('Senha redefinida com sucesso! A ser redirecionado para o login...', 'success');

            // Limpa a sessão temporária (boa prática)
            await supabaseClient.auth.signOut();

            // Redireciona o utilizador para a página de login
            setTimeout(() => {
                window.location.href = 'index.html'; // Altere para o seu ficheiro de login
            }, 3000);

        } else {
            displayStatus(`Erro ao redefinir a senha: ${error.message}`, 'error');
            resetBtn.disabled = false;
            resetBtn.textContent = 'Redefinir Senha';
        }
    });

    // Inicia o processo de verificação da sessão ao carregar a página
    initialize();

}