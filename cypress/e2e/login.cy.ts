describe('Login page', () => {
  it('carrega e possui campos de login', () => {
    cy.visit('/src/pages/login.html');
    cy.get('h1, h2, h3').first().should('exist');
    cy.get('input[type="text"], input[name*="user"], input[name*="login"], input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button, input[type="submit"]').contains(/entrar|login|acessar/i);
  });
});
