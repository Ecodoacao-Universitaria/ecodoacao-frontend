describe('Perfil page', () => {
  beforeEach(() => {
    cy.visit('/src/pages/perfil.html');
  });

  it('carrega página de perfil', () => {
    cy.get('h1, h2').should('exist');
  });

  it('possui navbar de navegação', () => {
    cy.get('nav').should('exist');
  });

  it('possui campos de edição de perfil', () => {
    cy.get('input, textarea').should('exist');
  });

  it('possui botão de salvar alterações', () => {
    cy.contains(/salvar|atualizar|confirmar/i).should('exist');
  });

  it('exibe informações do usuário', () => {
    cy.get('.container, main').should('be.visible');
  });

  it('possui seção de alteração de senha', () => {
    cy.contains(/senha|password/i).should('exist');
  });

  it('campos estão editáveis', () => {
    cy.get('input').first().should('not.be.disabled');
  });
});
