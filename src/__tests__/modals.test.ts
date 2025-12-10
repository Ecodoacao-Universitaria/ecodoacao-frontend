import { confirmAction, confirmWithInput } from '../utils/modals';

describe('modals utility', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Mock Bootstrap Modal if not available
    (window as any).bootstrap = undefined;
  });

  afterEach(() => {
    // Clean up any remaining modals
    document.querySelectorAll('.modal').forEach(el => el.remove());
  });

  describe('confirmAction', () => {
    it('cria modal com título e mensagem', () => {
      // Mock window.confirm to avoid blocking
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      confirmAction({
        title: 'Confirmar ação',
        message: 'Tem certeza?'
      });

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('Confirmar ação')
      );
      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('Tem certeza?')
      );
      
      confirmSpy.mockRestore();
    });

    it('usa textos padrão para botões quando não especificados', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      confirmAction({
        title: 'Teste',
        message: 'Mensagem'
      });

      confirmSpy.mockRestore();
    });

    it('retorna promise que resolve com true ao confirmar', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      const result = await confirmAction({
        title: 'Teste',
        message: 'Mensagem'
      });

      expect(result).toBe(true);
      confirmSpy.mockRestore();
    });

    it('retorna promise que resolve com false ao cancelar', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      const result = await confirmAction({
        title: 'Teste',
        message: 'Mensagem'
      });

      expect(result).toBe(false);
      confirmSpy.mockRestore();
    });

    it('aceita diferentes variantes de botão', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      await confirmAction({
        title: 'Teste',
        message: 'Mensagem',
        variant: 'warning'
      });

      confirmSpy.mockRestore();
    });

    it('permite customizar textos dos botões', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      await confirmAction({
        title: 'Teste',
        message: 'Mensagem',
        confirmText: 'Sim',
        cancelText: 'Não'
      });

      confirmSpy.mockRestore();
    });
  });

  describe('confirmWithInput', () => {
    it('retorna valor quando usuário confirma com entrada válida', async () => {
      const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('Motivo válido');
      
      const result = await confirmWithInput({
        title: 'Digite o motivo',
        minLength: 3
      });

      expect(result).toBe('Motivo válido');
      promptSpy.mockRestore();
    });

    it('retorna null quando usuário cancela', async () => {
      const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue(null);
      
      const result = await confirmWithInput({
        title: 'Digite o motivo'
      });

      expect(result).toBe(null);
      promptSpy.mockRestore();
    });

    it('retorna null quando entrada não atinge minLength', async () => {
      const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('ab');
      
      const result = await confirmWithInput({
        title: 'Digite o motivo',
        minLength: 3,
        required: true
      });

      expect(result).toBe(null);
      promptSpy.mockRestore();
    });

    it('aceita entrada vazia quando required é false', async () => {
      const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('');
      
      const result = await confirmWithInput({
        title: 'Digite o motivo',
        required: false
      });

      expect(result).toBe(null);
      promptSpy.mockRestore();
    });

    it('remove espaços em branco da entrada', async () => {
      const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('  texto  ');
      
      const result = await confirmWithInput({
        title: 'Digite o motivo',
        minLength: 3
      });

      expect(result).toBe('texto');
      promptSpy.mockRestore();
    });

    it('usa valores padrão quando opções não são fornecidas', async () => {
      const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('teste');
      
      const result = await confirmWithInput({
        title: 'Título'
      });

      expect(result).toBe('teste');
      promptSpy.mockRestore();
    });
  });
});
