describe('donationType service', () => {
  let donationType: any;
  let http: any;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    document.body.innerHTML = '';
    
    jest.mock('../services/http');
    jest.mock('../config/api');

    await jest.isolateModulesAsync(async () => {
      http = await import('../services/http');
      donationType = await import('../services/donationType');
    });
  });

  describe('listarTiposDoacao', () => {
    it('retorna lista de tipos de doação', async () => {
      const mockData = {
        results: [
          { id: 1, nome: 'Papel' },
          { id: 2, nome: 'Plástico' }
        ]
      };
      http.apiRequest.mockResolvedValue(mockData);
      
      const result = await donationType.listarTiposDoacao();
      
      expect(result).toEqual(mockData.results);
      expect(http.apiRequest).toHaveBeenCalled();
    });

    it('trata resposta com array direto', async () => {
      const mockData = [
        { id: 1, nome: 'Metal' },
        { id: 2, nome: 'Vidro' }
      ];
      http.apiRequest.mockResolvedValue(mockData);
      
      const result = await donationType.listarTiposDoacao();
      
      expect(result).toEqual(mockData);
    });

    it('retorna array vazio para resposta inválida', async () => {
      http.apiRequest.mockResolvedValue({});
      
      const result = await donationType.listarTiposDoacao();
      
      expect(result).toEqual([]);
    });

    it('atualiza cache interno', async () => {
      const mockData = {
        results: [{ id: 1, nome: 'Orgânico' }]
      };
      http.apiRequest.mockResolvedValue(mockData);
      
      await donationType.listarTiposDoacao();
      const cached = donationType.getTiposCache();
      
      expect(cached).toEqual(mockData.results);
    });
  });

  describe('getTiposCache', () => {
    it('retorna cópia do cache', async () => {
      const mockData = {
        results: [{ id: 1, nome: 'Eletrônico' }]
      };
      http.apiRequest.mockResolvedValue(mockData);
      
      await donationType.listarTiposDoacao();
      const cache1 = donationType.getTiposCache();
      cache1.push({ id: 999, nome: 'Modificado' });
      const cache2 = donationType.getTiposCache();
      
      expect(cache2).not.toContainEqual({ id: 999, nome: 'Modificado' });
    });

    it('retorna array vazio inicialmente', () => {
      const cache = donationType.getTiposCache();
      expect(Array.isArray(cache)).toBe(true);
    });
  });

  describe('populateDonationTypesSelects', () => {
    it('popula selects com tipos de doação', async () => {
      const mockData = {
        results: [
          { id: 1, nome: 'Papel' },
          { id: 2, nome: 'Plástico' }
        ]
      };
      http.apiRequest.mockResolvedValue(mockData);
      
      const select = document.createElement('select');
      select.id = 'tipo';
      document.body.appendChild(select);
      
      await donationType.populateDonationTypesSelects();
      
      const options = select.querySelectorAll('option');
      expect(options.length).toBeGreaterThan(0);
      expect(options[0].textContent).toBe('Selecione...');
    });

    it('sanitiza nomes dos tipos', async () => {
      const mockData = {
        results: [
          { id: 1, nome: '<script>alert("xss")</script>' }
        ]
      };
      http.apiRequest.mockResolvedValue(mockData);
      
      const select = document.createElement('select');
      select.id = 'tipo';
      document.body.appendChild(select);
      
      await donationType.populateDonationTypesSelects();
      
      expect(select.innerHTML).not.toContain('<script>');
      expect(select.innerHTML).toContain('&lt;script&gt;');
    });

    it('popula múltiplos selects', async () => {
      const mockData = {
        results: [{ id: 1, nome: 'Metal' }]
      };
      http.apiRequest.mockResolvedValue(mockData);
      
      const select1 = document.createElement('select');
      select1.id = 'tipo';
      const select2 = document.createElement('select');
      select2.setAttribute('data-tipo-doacao', '');
      document.body.appendChild(select1);
      document.body.appendChild(select2);
      
      await donationType.populateDonationTypesSelects();
      
      expect(select1.querySelectorAll('option').length).toBeGreaterThan(0);
      expect(select2.querySelectorAll('option').length).toBeGreaterThan(0);
    });

    it('propaga erro quando API falha', async () => {
      http.apiRequest.mockRejectedValue(new Error('API Error'));
      
      await expect(donationType.populateDonationTypesSelects()).rejects.toThrow('API Error');
    });
  });
});
