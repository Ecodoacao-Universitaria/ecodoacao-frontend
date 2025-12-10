describe('Submissão de Doação', () => {
  beforeEach(() => {
    cy.visit('/src/pages/doacao.html');
  });

  it('carrega página de doação', () => {
    cy.get('h1, h2').should('exist');
  });

  it('possui navbar de navegação', () => {
    cy.get('nav').should('exist');
  });

  it('possui formulário de submissão', () => {
    cy.get('form').should('exist');
  });

  it('possui campo de seleção de tipo de doação', () => {
    cy.get('select, input[type="radio"]').should('exist');
  });

  it('possui campo de upload de foto', () => {
    cy.get('input[type="file"]').should('exist');
  });

  it('possui campo de descrição', () => {
    cy.get('textarea, input[name*="descri"]').should('exist');
  });

  it('botão de enviar está presente', () => {
    cy.contains(/enviar|submeter|doar/i).should('exist');
  });

  it('permite selecionar tipo de doação', () => {
    cy.get('select, input[type="radio"]').first().should('be.visible');
  });

  it('permite digitar descrição', () => {
    cy.get('textarea').then(($textarea) => {
      if ($textarea.length) {
        cy.wrap($textarea).type('Descrição da doação').should('have.value', 'Descrição da doação');
      }
    });
  });
});
