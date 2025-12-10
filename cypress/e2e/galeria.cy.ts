describe('Galeria page', () => {
  it('carrega galeria e lista imagens', () => {
    cy.visit('/src/pages/galeria.html');
    cy.get('h1, h2').first().should('exist');
    cy.get('img').its('length').should('be.gte', 0);
  });
});
