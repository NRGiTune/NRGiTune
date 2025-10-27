// script.js (carregado pela página principal)

class PaginaFilhaComponente extends HTMLElement {
  constructor() {
    super();
    // Cria um Shadow DOM para isolamento (opcional, mas recomendado)
    const shadow = this.attachShadow({ mode: 'open' }); 

    // O HTML da página filha (aqui, apenas um template)
    shadow.innerHTML = `
https://nrgitune.pt/pwrmatch-app/webapp/index.html
    `;

    // Acessa uma função JS na página principal (globalmente disponível)
    shadow.querySelector('#btnAcao').addEventListener('click', () => {
        // Assume que 'minhaFuncaoPrincipal' está definida no escopo global
        if (typeof minhaFuncaoPrincipal === 'function') {
            minhaFuncaoPrincipal('Ação acionada pelo componente filho!');
        }
    });
  }
}

// Define o novo elemento
customElements.define('pagina-filha', PaginaFilhaComponente); 

// Função definida no JS da página principal
function minhaFuncaoPrincipal(msg) {
    console.log('Recebido na página principal:', msg);
}