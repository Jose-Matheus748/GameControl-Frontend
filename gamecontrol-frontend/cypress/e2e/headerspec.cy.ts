describe('Header', () => {
  it('deve mostrar texto da logo, searchbar de busca de jogos, botão Ver Jogos, e botão de login no header', () => {
    cy.visit('/');

    cy.get('.px-8').within(() => {
      cy.get('.justify-start > .flex').contains('GameControl');
      cy.get('input[placeholder="Buscar jogos..."]').should('be.visible');
      cy.contains('Ver Jogos').should('be.visible').click();

      cy.location('pathname').should('eq', '/games');

      cy.wait(5000);

      cy.contains('Login').should('be.visible').click();

      cy.wait(5000);

      cy.location('pathname').should('eq', '/login');

      cy.wait(5000);

      cy.contains('GameControl').click();

      cy.location('pathname').should('eq', '/');
    });
  });

  it('deve buscar um jogo e depois apagar o texto lentamente no botão de pesquisa', () => {
    const jogo = 'Elden Ring';

    cy.visit('/');

    cy.get('input[placeholder="Buscar jogos..."]').type(`${jogo}{enter}`);

    cy.location('pathname').should('eq', '/games');

    cy.wait(2000);

    cy.contains(jogo).should('be.visible');

    jogo.split('').forEach(() => {
      cy.get('input[placeholder="Buscar jogos..."]').type('{backspace}', {
        delay: 550,
      });
    });

    cy.get('input[placeholder="Buscar jogos..."]').should('have.value', '');

    cy.wait(3000);

    cy.visit('/');
  });
});
