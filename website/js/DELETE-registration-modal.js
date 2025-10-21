// js/registration-modal.js

// CONFIGURAÇÃO SUPABASE (Reutilize as credenciais)
const SUPABASE_URL = 'https://citaewfnpsfjtnuolqyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpdGFld2ZucHNmanRudW9scXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDcxMjMsImV4cCI6MjA3MzE4MzEyM30.JJ90UzR3_DLu6-YcWGZq623B-hXcPFBUrwg2gOLFOcI';
// A variável 'supabase' deve estar globalmente disponível via CDN no HTML
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


document.addEventListener('DOMContentLoaded', function() {
    
    // Referências aos elementos do modal
    const btnLogIn = document.getElementById('btnLogIn');
    const modal = document.getElementById('registrationModal');
    const closeModalBtn = document.getElementById('closeModal');
    const registrationForm = document.getElementById('registrationForm');
    const regSubmitButton = document.getElementById('regSubmitButton');
    const regMessage = document.getElementById('regMessage');

    // Funções de Controlo do Modal
    const openModal = () => modal.classList.remove('hidden');
    const closeModal = () => modal.classList.add('hidden');

    // 1. Abrir Modal ao Clicar no botão 'Log In / Regista-te'
    if (btnLogIn) {
        btnLogIn.addEventListener('click', function(e) {
            e.preventDefault(); // Impede que o <a> pai siga para login.html
            openModal();
        });
    }

    // 2. Fechar Modal (Botão 'X')
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    // 3. Fechar Modal (Clicar fora)
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });


    // 4. Lógica de Registo do Supabase
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const fullName = document.getElementById('reg-name').value;
            
            regSubmitButton.disabled = true;
            regSubmitButton.textContent = 'A registar...';
            regMessage.textContent = 'A enviar dados...';
            regMessage.style.color = '#000';

            // Chamada de Registo Supabase com metadados para o nome
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName // Armazena o nome para o avatar/perfil
                    }
                }
            });

            regSubmitButton.disabled = false;
            regSubmitButton.textContent = 'Registar';
            
            if (error) {
                // Erro de API (ex: email já existe)
                regMessage.textContent = `Erro: ${error.message}`;
                regMessage.style.color = 'red';
                console.error(error);
            } else if (data.user) {
                // Sucesso: O utilizador registou-se, mas o Supabase espera CONFIRMAÇÃO POR EMAIL.
                regMessage.textContent = 'Sucesso! Verifique o seu e-mail para confirmar a sua conta.';
                regMessage.style.color = 'var(--color-primary)';
                
                // NOTA: O utilizador não está logado até clicar no link do email.
                // Fecha a pop-up após 3 segundos para que o utilizador veja a mensagem.
                setTimeout(closeModal, 3000); 

            } else {
                 // Caso o Supabase não retorne erro nem user, mas sim uma confirmação
                 regMessage.textContent = 'O seu registo foi enviado. Por favor, verifique o seu e-mail.';
                 regMessage.style.color = 'var(--color-primary)';
                 setTimeout(closeModal, 3000);
            }
        });
    }

});