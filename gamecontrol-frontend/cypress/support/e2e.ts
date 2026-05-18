// Cria um comando personalizado chamado loginAs para simular usuário logado.
Cypress.Commands.add('loginAs', () => {
  // Salva um token falso no localStorage, simulando autenticação.
  window.localStorage.setItem('token', 'fake-token');

  // Salva um ID de usuário no localStorage, simulando usuário logado.
  window.localStorage.setItem('userId', '1');
});

// Declara o tipo do comando personalizado para o TypeScript reconhecer cy.loginAs().
declare global {
  // Abre o namespace do Cypress.
  namespace Cypress {
    // Adiciona o comando loginAs na interface Chainable.
    interface Chainable {
      // Define que cy.loginAs() pode ser chamado nos testes.
      loginAs(): Chainable<void>;
    }
  }
}

export {}