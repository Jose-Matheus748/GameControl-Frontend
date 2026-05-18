describe('login', () => {
  it('testando se o login funciona', () => {
    cy.visit('/login');

    cy.get('[name="email"]').type('testecypress@email.com');
    cy.get('[name="password"]').type('1234');
    cy.get('.mt-2').click();

    cy.location('pathname').should('eq', '/');

    cy.contains('Bem-vindo, testeCy!').should('be.visible');
  });
});
