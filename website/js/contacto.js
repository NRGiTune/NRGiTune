let emailJsReady = false;
let emailJsLoading = false;

// Carregar EmailJS apenas uma vez
function loadEmailJs() {
    return new Promise((resolve, reject) => {
        if (emailJsReady) {
            resolve();
            return;
        }

        if (emailJsLoading) {
            const checkInterval = setInterval(() => {
                if (emailJsReady) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            return;
        }

        emailJsLoading = true;
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js";
        script.onload = function () {
            emailjs.init("pHl3iqVWtbSFdWoLO"); // <-- O teu USER ID
            emailJsReady = true;
            resolve();
        };
        script.onerror = reject;

        document.head.appendChild(script);
    });
}

// ✅ Função principal chamada após fetch()
function initContactForm() {
    const form = document.getElementById('contactForm');
    const statusMessage = document.getElementById('status-message');

    if (!form) {
        console.warn("⚠️ contactForm não encontrado. Ignorado.");
        return;
    }

    function displayStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = '';
        statusMessage.classList.add(type);
        statusMessage.style.display = 'block';
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function sendMail(formData) {
        const datetime = new Date().toLocaleString();
        return emailjs.send("service_nprkw9l", "template_5dzeywt", {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            datetime: datetime
        });
    }

    // ✅ Listener do formulário
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        statusMessage.style.display = 'none';

        await loadEmailJs();

        const btnText = document.getElementById('btnText');
        const btnLoader = document.getElementById('btnLoader');
        const sendBtn = document.getElementById('sendBtn');

        // Mostrar loader no botão
        btnText.textContent = "A enviar...";
        btnLoader.style.display = "inline-block";
        sendBtn.disabled = true;

        if (!emailJsReady) {
            displayStatus('O serviço de email ainda está a carregar. Tente de novo.', 'error');
            return;
        }

        // Coleta dos dados
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !subject || !message) {
            displayStatus('Por favor, preencha todos os campos.', 'error');
            resetButton();
            return;
        }

        if (!isValidEmail(email)) {
            displayStatus('Por favor, insira um e-mail válido.', 'error');
            resetButton();
            return;
        }

        try {
            await sendMail({ name, email, subject, message });

            displayStatus('Mensagem enviada com sucesso! Obrigado pelo contacto.', 'success');
            form.reset();
        } catch (error) {
            console.error(error);
            displayStatus('Erro ao enviar mensagem. Tente novamente.', 'error');
        }

        resetButton();
    });

    // Função para resetar o botão
    function resetButton() {
        const btnText = document.getElementById('btnText');
        const btnLoader = document.getElementById('btnLoader');
        const sendBtn = document.getElementById('sendBtn');

        btnText.textContent = "Enviar Mensagem";
        btnLoader.style.display = "none";
        sendBtn.disabled = false;
    }


}