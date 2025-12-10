describe('Login page', () => {
  beforeEach(() => {
    cy.visit('/src/pages/login.html');
  });

  it('carrega e possui campos de login', () => {
    cy.get('h1, h2, h3').first().should('exist');
    cy.get('input[type="text"], input[name*="user"], input[name*="login"], input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button, input[type="submit"]').contains(/entrar|login|acessar/i);
  });

  it('exibe título da página corretamente', () => {
    cy.title().should('not.be.empty');
  });

  it('possui link para cadastro', () => {
    cy.contains(/cadastr|registr/i).should('exist');
  });

  it('campos de login estão visíveis', () => {
    cy.get('input[type="text"], input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('botão de login está habilitado', () => {
    cy.get('button, input[type="submit"]')
      .contains(/entrar|login|acessar/i)
      .should('not.be.disabled');
  });

  it('permite digitar nos campos de entrada', () => {
    cy.get('input[type="text"], input[type="email"]')
      .first()
      .type('usuario@test.com')
      .should('have.value', 'usuario@test.com');
    
    cy.get('input[type="password"]')
      .type('senha123')
      .should('have.value', 'senha123');
  });
});
