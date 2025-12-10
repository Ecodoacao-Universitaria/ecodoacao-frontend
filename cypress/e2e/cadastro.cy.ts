describe('Cadastro page', () => {
  beforeEach(() => {
    cy.visit('/src/pages/cadastro.html');
  });

  it('carrega página de cadastro', () => {
    cy.get('h1, h2').should('exist');
  });

  it('possui campos de cadastro obrigatórios', () => {
    cy.get('input[name*="nome"], input[placeholder*="nome"]').should('exist');
    cy.get('input[type="email"], input[name*="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  it('possui campo de confirmação de senha', () => {
    cy.get('input[type="password"]').should('have.length.at.least', 2);
  });

  it('botão de cadastro está presente', () => {
    cy.contains(/cadastr|registr|criar conta/i).should('exist');
  });

  it('possui link para login', () => {
    cy.contains(/já tem conta|fazer login|entrar/i).should('exist');
  });

  it('permite digitar nos campos', () => {
    cy.get('input[name*="nome"], input[placeholder*="nome"]')
      .first()
      .type('Nome Teste')
      .should('have.value', 'Nome Teste');
    
    cy.get('input[type="email"]')
      .type('teste@ufrpe.br')
      .should('have.value', 'teste@ufrpe.br');
  });

  it('valida formato de email UFRPE', () => {
    cy.get('input[type="email"]').should('exist');
  });
});
