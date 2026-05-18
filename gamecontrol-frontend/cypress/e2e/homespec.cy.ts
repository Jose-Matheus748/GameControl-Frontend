describe('Rotas principais', () => {
  beforeEach(() => {
    // Intercepta a chamada do jogo da semana.
    cy.intercept('GET', '**/api/games/115289', {
      // Simula resposta bem-sucedida.
      statusCode: 200,

      // Retorna dados mínimos de um jogo.
      body: {
        id: 115289,
        title: 'Jogo da Semana',
        description: 'Descrição teste',
        coverImageUrl: 'https://placehold.co/300x450',
        externalLink: '#',
      },
    });

    // Intercepta a chamada da média de avaliações do jogo da semana.
    cy.intercept('GET', '**/api/reviews/game/115289/average', {
      // Simula resposta bem-sucedida.
      statusCode: 200,

      // Retorna uma média fake.
      body: 4,
    });
  });

  // Testa se a home abre corretamente.
  it('deve abrir a home', () => {
    // Visita a rota inicial.
    cy.visit('/');

    // Verifica se o nome do app aparece no header.
    cy.contains('GameControl').should('be.visible');

    // Verifica se o botão principal da home aparece.
    cy.contains('Ver Todos os Jogos').should('be.visible');

    // Verifica se o botão de login aparece
    cy.contains('Login').should('be.visible');
  });
});
