describe('wallet service', () => {
  let wallet: any;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    
    jest.mock('../services/http');
    jest.mock('../config/api');

    await jest.isolateModulesAsync(async () => {
      wallet = await import('../services/wallet');
      wallet.resetWalletState();
    });
  });

  describe('balance management', () => {
    it('retorna saldo inicial como 0', () => {
      expect(wallet.getBalance()).toBe(0);
    });

    it('define e retorna saldo corretamente', () => {
      wallet.setBalance(100);
      expect(wallet.getBalance()).toBe(100);
    });

    it('converte valores não numéricos para número', () => {
      wallet.setBalance('150' as any);
      expect(wallet.getBalance()).toBe(150);
    });

    it('trata valores inválidos como 0', () => {
      wallet.setBalance(null as any);
      expect(wallet.getBalance()).toBe(0);
    });

    it('atualiza elementos com data-balance no DOM', () => {
      const el = document.createElement('span');
      el.setAttribute('data-balance', '');
      document.body.appendChild(el);
      
      wallet.setBalance(250);
      expect(el.textContent).toBe('250');
    });

    it('atualiza userBalance element no DOM', () => {
      const el = document.createElement('div');
      el.id = 'userBalance';
      document.body.appendChild(el);
      
      wallet.setBalance(75);
      expect(el.textContent).toContain('75');
    });

    it('atualiza userBalance existente com data-balance span', () => {
      const el = document.createElement('div');
      el.id = 'userBalance';
      const span = document.createElement('span');
      span.setAttribute('data-balance', '');
      el.appendChild(span);
      document.body.appendChild(el);
      
      wallet.setBalance(200);
      expect(span.textContent).toBe('200');
    });

    it('updateBalanceUI usa saldo atual quando valor não é fornecido', () => {
      const el = document.createElement('span');
      el.setAttribute('data-balance', '');
      document.body.appendChild(el);
      
      wallet.setBalance(100);
      wallet.updateBalanceUI();
      expect(el.textContent).toBe('100');
    });
  });

  describe('owned badges management', () => {
    it('retorna lista vazia inicialmente', () => {
      expect(wallet.getOwnedBadges()).toEqual([]);
    });

    it('define e retorna badges corretamente', () => {
      wallet.setOwnedBadges([1, 2, 3]);
      expect(wallet.getOwnedBadges()).toEqual([1, 2, 3]);
    });

    it('retorna cópia da lista de badges', () => {
      wallet.setOwnedBadges([1, 2]);
      const badges = wallet.getOwnedBadges();
      badges.push(3);
      expect(wallet.getOwnedBadges()).toEqual([1, 2]);
    });

    it('remove duplicatas ao definir badges', () => {
      wallet.setOwnedBadges([1, 2, 2, 3, 1]);
      expect(wallet.getOwnedBadges()).toEqual([1, 2, 3]);
    });

    it('adiciona badge sem duplicar', () => {
      wallet.setOwnedBadges([1, 2]);
      wallet.addOwnedBadge(3);
      expect(wallet.getOwnedBadges()).toEqual([1, 2, 3]);
    });

    it('não duplica badge ao adicionar existente', () => {
      wallet.setOwnedBadges([1, 2]);
      wallet.addOwnedBadge(2);
      expect(wallet.getOwnedBadges()).toEqual([1, 2]);
    });

    it('trata valores não array como lista vazia', () => {
      wallet.setOwnedBadges(null as any);
      expect(wallet.getOwnedBadges()).toEqual([]);
    });
  });

  describe('resetWalletState', () => {
    it('reseta saldo e badges para valores iniciais', () => {
      wallet.setBalance(500);
      wallet.setOwnedBadges([1, 2, 3]);
      
      wallet.resetWalletState();
      
      expect(wallet.getBalance()).toBe(0);
      expect(wallet.getOwnedBadges()).toEqual([]);
    });
  });
});
