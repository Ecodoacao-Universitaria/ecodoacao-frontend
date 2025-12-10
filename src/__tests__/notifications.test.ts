import { 
  showToast, 
  showApiError, 
  showApiSuccess, 
  showServiceResult,
  displayErrorToast,
  addNotification 
} from '../utils/notifications';

describe('notifications', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('showToast', () => {
    it('cria container e exibe toast', () => {
      showToast('Olá mundo', 'info', 500);
      const container = document.getElementById('toast-container');
      expect(container).toBeTruthy();
      expect(container!.querySelectorAll('.toast').length).toBeGreaterThan(0);
    });

    it('cria toast com variant correto', () => {
      showToast('Sucesso!', 'success');
      const toast = document.querySelector('.toast');
      expect(toast?.innerHTML).toContain('bg-success');
    });

    it('sanitiza mensagem com escapeHtml', () => {
      showToast('<script>alert("xss")</script>', 'info');
      const toast = document.querySelector('.toast');
      expect(toast?.innerHTML).not.toContain('<script>');
      expect(toast?.innerHTML).toContain('&lt;script&gt;');
    });

    it('não duplica toasts rapidamente com mesma dedupeKey', () => {
      showToast('Duplicado', 'info', 500);
      showToast('Duplicado', 'info', 500);
      const toasts = document.querySelectorAll('.toast');
      expect(toasts.length).toBe(1);
    });

    it('usa timeout padrão de 3000ms', () => {
      showToast('Teste', 'info');
      const container = document.getElementById('toast-container');
      expect(container!.querySelectorAll('.toast').length).toBe(1);
    });

    it('aceita diferentes variantes de toast', () => {
      showToast('Danger', 'danger');
      showToast('Warning', 'warning');
      showToast('Success', 'success');
      showToast('Info', 'info');
      
      const toasts = document.querySelectorAll('.toast');
      expect(toasts.length).toBeGreaterThan(0);
    });
  });

  describe('showApiError', () => {
    it('exibe mensagem de erro da API', () => {
      const error = {
        response: {
          data: {
            erro: 'Erro customizado'
          }
        }
      };
      showApiError(error);
      const toast = document.querySelector('.toast-body');
      expect(toast?.textContent).toContain('Erro customizado');
    });

    it('usa fallback quando não há erro específico', () => {
      showApiError({}, 'Erro genérico');
      const toast = document.querySelector('.toast-body');
      expect(toast?.textContent).toContain('Erro genérico');
    });

    it('usa mensagem de error.message quando não há data', () => {
      const error = { message: 'Network error' };
      showApiError(error);
      const toast = document.querySelector('.toast-body');
      expect(toast?.textContent).toContain('Network error');
    });

    it('formata erro com código', () => {
      const error = {
        response: {
          data: {
            erro: 'Falha',
            codigo: 'ERR_001'
          }
        }
      };
      showApiError(error);
      const toast = document.querySelector('.toast-body');
      expect(toast?.textContent).toContain('Falha');
      expect(toast?.textContent).toContain('ERR_001');
    });

    it('concatena mensagens de detalhes quando presentes', () => {
      const error = {
        response: {
          data: {
            erro: 'Erro na requisição',
            codigo: 'ValidationError',
            detalhes: {
              username: [
                'Informe um nome de usuário válido. Este valor pode conter apenas letras, números e os seguintes caracteres @/./+/-/_.'
              ],
              email: [
                'Email já está em uso.'
              ]
            }
          }
        }
      };
      showApiError(error);
      const toast = document.querySelector('.toast-body');
      expect(toast?.textContent).toContain('Informe um nome de usuário válido');
      expect(toast?.textContent).toContain('Email já está em uso.');
      expect(toast?.textContent).toContain('ValidationError');
    });
  });

  describe('showApiSuccess', () => {
    it('exibe mensagem de sucesso do payload', () => {
      showApiSuccess({ mensagem: 'Operação bem-sucedida' });
      const toast = document.querySelector('.toast-body');
      expect(toast?.textContent).toContain('Operação bem-sucedida');
    });

    it('usa fallback quando payload é nulo', () => {
      showApiSuccess(null, 'Sucesso padrão');
      const toast = document.querySelector('.toast-body');
      expect(toast?.textContent).toContain('Sucesso padrão');
    });

    it('prioriza mensagem do backend', () => {
      showApiSuccess({ mensagem: 'Backend msg' }, 'Fallback');
      const toast = document.querySelector('.toast-body');
      expect(toast?.textContent).toContain('Backend msg');
    });

    it('usa propriedade message como alternativa', () => {
      showApiSuccess({ message: 'Success message' });
      const toast = document.querySelector('.toast-body');
      expect(toast?.textContent).toContain('Success message');
    });

    it('usa propriedade detail como alternativa', () => {
      showApiSuccess({ detail: 'Detail message' });
      const toast = document.querySelector('.toast-body');
      expect(toast?.textContent).toContain('Detail message');
    });
  });

  describe('showServiceResult', () => {
    it('exibe toast de sucesso quando sucesso é true', () => {
      showServiceResult({ sucesso: true, mensagem: 'Operação OK' });
      const toast = document.querySelector('.toast');
      expect(toast?.innerHTML).toContain('bg-success');
      expect(toast?.textContent).toContain('Operação OK');
    });

    it('exibe toast de erro quando sucesso é false', () => {
      showServiceResult({ sucesso: false, mensagem: 'Operação falhou' });
      const toast = document.querySelector('.toast');
      expect(toast?.textContent).toContain('Operação falhou');
    });

    it('usa mensagem padrão quando não fornecida', () => {
      showServiceResult({ sucesso: true });
      const toast = document.querySelector('.toast');
      expect(toast?.textContent).toContain('Sucesso');
    });
  });

  describe('displayErrorToast', () => {
    it('exibe erro com mensagem personalizada', () => {
      const error = { message: 'Erro específico' };
      displayErrorToast(error);
      const toast = document.querySelector('.toast-body');
      expect(toast?.textContent).toContain('Erro específico');
    });

    it('usa fallback quando erro é nulo', () => {
      displayErrorToast(null, 'Erro padrão');
      const toast = document.querySelector('.toast-body');
      expect(toast?.textContent).toContain('Erro padrão');
    });

    it('exibe toast danger para erros 500+', () => {
      const error = { message: 'Server error', status: 500 };
      displayErrorToast(error);
      const toast = document.querySelector('.toast');
      expect(toast?.innerHTML).toContain('bg-danger');
    });

    it('exibe toast warning para erros < 500', () => {
      const error = { message: 'Client error', status: 400 };
      displayErrorToast(error);
      const toast = document.querySelector('.toast');
      expect(toast?.innerHTML).toContain('bg-warning');
    });
  });

  describe('addNotification', () => {
    it('dispara evento customizado com detalhes', () => {
      const handler = jest.fn();
      window.addEventListener('ecodoacao:notification', handler);
      
      addNotification('Título', 'Mensagem', 'http://link.com');
      
      expect(handler).toHaveBeenCalled();
      const event = handler.mock.calls[0][0];
      expect(event.detail.title).toBe('Título');
      expect(event.detail.message).toBe('Mensagem');
      expect(event.detail.link).toBe('http://link.com');
      
      window.removeEventListener('ecodoacao:notification', handler);
    });
  });
});
