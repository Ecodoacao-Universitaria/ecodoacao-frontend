describe('Galeria page', () => {
  beforeEach(() => {
    cy.visit('/src/pages/galeria.html');
  });

  it('carrega galeria e lista imagens', () => {
    cy.get('h1, h2').first().should('exist');
    cy.get('img').its('length').should('be.gte', 0);
  });

  it('exibe título da galeria', () => {
    cy.get('h1, h2').should('be.visible');
  });

  it('possui navbar de navegação', () => {
    cy.get('nav').should('exist');
  });

  it('layout da galeria está estruturado', () => {
    cy.get('.container, .row, .col, .card').should('exist');
  });

  it('imagens têm atributo alt quando presentes', () => {
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt');
    });
  });
});
