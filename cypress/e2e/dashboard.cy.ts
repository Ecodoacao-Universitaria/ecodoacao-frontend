describe('Dashboard page', () => {
  beforeEach(() => {
    cy.visit('/src/pages/dashboard.html');
  });

  it('carrega dashboard e navbar', () => {
    cy.get('nav').should('exist');
    cy.get('main, .container').should('exist');
  });

  it('exibe título do dashboard', () => {
    cy.get('h1, h2').should('exist');
  });

  it('navbar contém elementos de navegação', () => {
    cy.get('nav').within(() => {
      cy.get('a, button').should('have.length.at.least', 1);
    });
  });

  it('página possui conteúdo principal', () => {
    cy.get('main, .container, .content').should('be.visible');
  });

  it('carrega sem erros de JavaScript', () => {
    cy.window().then((win) => {
      expect(win.console.error).to.not.be.called;
    });
  });
});
