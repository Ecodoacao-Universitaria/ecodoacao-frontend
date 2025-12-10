describe('badge.services', () => {
  let badge: any;

  beforeEach(async () => {
    jest.resetModules();
    
    jest.mock('../services/http');
    jest.mock('../config/api');

    await jest.isolateModulesAsync(async () => {
      badge = await import('../services/badge.services');
    });
  });

  describe('formatarDataConquista', () => {
    it('formata data ISO corretamente no formato pt-BR', () => {
      const result = badge.formatarDataConquista('2024-03-15');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).toContain('15/03/2024');
    });

    it('formata data com timestamp corretamente', () => {
      const result = badge.formatarDataConquista('2024-12-25T10:30:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).toContain('25/12/2024');
    });

    it('formata data com timezone', () => {
      const result = badge.formatarDataConquista('2024-06-10T23:59:59-03:00');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('formata data de ano bissexto', () => {
      const result = badge.formatarDataConquista('2024-02-29');
      expect(result).toContain('29/02/2024');
    });

    it('formata primeira data do ano', () => {
      const result = badge.formatarDataConquista('2024-01-01');
      expect(result).toContain('01/01/2024');
    });

    it('formata última data do ano', () => {
      const result = badge.formatarDataConquista('2024-12-31');
      expect(result).toContain('31/12/2024');
    });
  });
});
