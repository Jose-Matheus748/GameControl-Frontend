describe('API de Games', () => {
  it('deve ir até a página 5 e depois voltar', () => {
    cy.visit('/games');

    cy.contains('Catálogo').should('be.visible');
    cy.contains('198 jogos encontrados').should('be.visible');

    cy.wait(4000);

    for (let i = 0; i < 4; i++) {
      cy.get('[aria-label="Próxima página"]').click()
      cy.scrollTo('bottom', { duration: 3000 })
      cy.scrollTo('top', { duration: 3000 })
      cy.wait(1000);
    }

    for (let i = 4; i > 0; i--) {
      cy.get('[aria-label="Página anterior"]').click()
      cy.scrollTo('bottom', { duration: 3000 })
      cy.scrollTo('top', { duration: 3000 })
      cy.wait(1000);
    }

    cy.contains('span', '5').should('be.visible');
    cy.contains('span', '1').should('be.visible');

    cy.contains('button', 'Anterior').should('be.visible')
    cy.contains('button', 'Próxima').should('be.visible')

  });
});
