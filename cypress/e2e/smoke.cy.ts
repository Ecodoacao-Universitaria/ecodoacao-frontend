describe('App smoke test', () => {
  it('loads index page', () => {
    cy.visit('/');
    cy.title().should('not.be.empty');
  });
});
