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
  const el = document.querySelector('[data-balance]') as HTMLElement | null;
  const el2 = document.getElementById('userBalance');
  if (el) el.textContent = String(val);
  if (el2) el2.textContent = String(val);
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