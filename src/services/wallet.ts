// Serviço de carteira/loja (saldo do usuário e badges adquiridas)
let _ownedBadges: number[] = [];
let balance = 0;

export function getBalance(): number {
  return balance;
}

export function setBalance(v: number): void {
  balance = Number(v || 0);
  updateBalanceUI(balance);
}

export function updateBalanceUI(v?: number): void {
  const val = typeof v === 'number' ? v : balance;
  document.querySelectorAll('[data-balance]').forEach(el => {
    el.textContent = String(val);
  });
  const userBalance = document.getElementById('userBalance');
  if (userBalance) {
    userBalance.innerHTML = `<span data-balance>${val}</span> Moedas`;
  }
}

export function hydrateBalanceFromDashboard(v: number): void {
  setBalance(v);
}

export function getOwnedBadges(): number[] {
  return _ownedBadges.slice();
}

export function setOwnedBadges(list: number[]): void {
  _ownedBadges = Array.isArray(list) ? [...new Set(list.map(Number))] : [];
}

export function addOwnedBadge(id: number): void {
  if (!_ownedBadges.includes(id)) _ownedBadges.push(id);
}

export function resetWalletState(): void {
  balance = 0;
  _ownedBadges = [];
}