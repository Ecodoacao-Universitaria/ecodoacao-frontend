describe('doacoes.services', () => {
  let doacoes: any;

  beforeEach(async () => {
    jest.resetModules();
    
    jest.mock('../services/http');
    jest.mock('../config/api');

    await jest.isolateModulesAsync(async () => {
      doacoes = await import('../services/doacoes.services');
    });
  });

  describe('getStatusInfo', () => {
    it('retorna info correta para status PENDENTE', () => {
      const info = doacoes.getStatusInfo('PENDENTE');
      expect(info.label).toBe('Pendente');
      expect(info.variant).toBe('secondary');
    });

    it('retorna info correta para status APROVADA', () => {
      const info = doacoes.getStatusInfo('APROVADA');
      expect(info.label).toBe('Aprovada');
      expect(info.variant).toBe('success');
    });

    it('retorna info correta para status RECUSADA', () => {
      const info = doacoes.getStatusInfo('RECUSADA');
      expect(info.label).toBe('Recusada');
      expect(info.variant).toBe('danger');
    });

    it('trata status em minúscula corretamente', () => {
      const info = doacoes.getStatusInfo('pendente');
      expect(info.label).toBe('Pendente');
      expect(info.variant).toBe('secondary');
    });

    it('retorna warning para status desconhecido', () => {
      const info = doacoes.getStatusInfo('INVALIDO');
      expect(info.label).toBe('INVALIDO');
      expect(info.variant).toBe('warning');
    });

    it('trata status vazio', () => {
      const info = doacoes.getStatusInfo('');
      expect(info.label).toBe('Desconhecido');
      expect(info.variant).toBe('warning');
    });

    it('trata status null/undefined', () => {
      const info = doacoes.getStatusInfo(null as any);
      expect(info.label).toBe('Desconhecido');
      expect(info.variant).toBe('warning');
    });
  });

  describe('validarImagemDoacao', () => {
    it('aceita imagem JPEG válida', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      expect(doacoes.validarImagemDoacao(file)).toBe(true);
    });

    it('aceita imagem PNG válida', () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      expect(doacoes.validarImagemDoacao(file)).toBe(true);
    });

    it('aceita imagem JPG válida', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      expect(doacoes.validarImagemDoacao(file)).toBe(true);
    });

    it('rejeita formato inválido', () => {
      const file = new File(['content'], 'test.gif', { type: 'image/gif' });
      Object.defineProperty(file, 'size', { value: 1024 });
      const result = doacoes.validarImagemDoacao(file);
      expect(result).toBe('Formato inválido. Use JPG ou PNG.');
    });

    it('rejeita arquivo muito grande', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB
      const result = doacoes.validarImagemDoacao(file);
      expect(result).toBe('A imagem deve ter no máximo 5MB.');
    });

    it('aceita arquivo no limite de 5MB', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 }); // exactly 5MB
      expect(doacoes.validarImagemDoacao(file)).toBe(true);
    });

    it('rejeita arquivo vazio', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 100 });
      const result = doacoes.validarImagemDoacao(file);
      expect(result).toBe('Formato inválido. Use JPG ou PNG.');
    });
  });

  describe('formatarDataDoacao', () => {
    it('formata data corretamente no formato pt-BR', () => {
      const result = doacoes.formatarDataDoacao('2024-01-15T10:30:00Z');
      // Verifica se contém elementos da data/hora
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('formata data com timezone corretamente', () => {
      const result = doacoes.formatarDataDoacao('2024-12-25T23:59:59-03:00');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('formata data atual corretamente', () => {
      const now = new Date().toISOString();
      const result = doacoes.formatarDataDoacao(now);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });
});
