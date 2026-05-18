describe('registro', () => {
  it('testando se o registro funciona', () => {
    cy.visit('/register');

    cy.get('[name="username"]').type('testeCyp3');
    cy.get('[name="email"]').type('testeCyp3@email.com');
    cy.get('[name="password"]').type('1234');

    cy.get('.mt-2').click();
    
    cy.location('pathname').should('eq', '/');

    cy.contains('Bem-vindo, testeCyp3!').should('be.visible');
  });
});
