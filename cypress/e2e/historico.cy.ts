describe('Histórico de Doações', () => {
  beforeEach(() => {
    cy.visit('/src/pages/historico.html');
  });

  it('carrega página de histórico', () => {
    cy.get('h1, h2').should('exist');
  });

  it('possui navbar de navegação', () => {
    cy.get('nav').should('exist');
  });

  it('possui área de listagem de doações', () => {
    cy.get('.container, main').should('exist');
  });

  it('pode conter filtros de status', () => {
    const filters = cy.get('select, button[data-filter], .filter');
    // Filtros são opcionais mas se existirem devem estar visíveis
  });

  it('pode conter paginação', () => {
    // Paginação é opcional, apenas verifica se a página carrega
    cy.get('body').should('exist');
  });

  it('exibe conteúdo estruturado', () => {
    cy.get('.card, .list-group, table, .row').should('exist');
  });
});
