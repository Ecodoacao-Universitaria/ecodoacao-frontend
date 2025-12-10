describe('Dashboard page', () => {
  it('carrega dashboard e navbar', () => {
    cy.visit('/src/pages/dashboard.html');
    cy.get('nav').should('exist');
    cy.get('main, .container').should('exist');
  });
});
