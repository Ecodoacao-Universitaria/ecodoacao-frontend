// Serviço de carteira/loja (saldo do usuário e badges adquiridas)
import { addNotification } from './notifications';

const BALANCE_KEY = 'ecodoacao_balance';
const OWNED_KEY = 'ecodoacao_owned_badges';

export function getBalance(): number {
  const raw = localStorage.getItem(BALANCE_KEY);
  const v = Number(raw ?? NaN);
  if (!isFinite(v)) {
    const def = 250;
    setBalance(def);
    return def;
  }
  return v;
}

export function setBalance(value: number) {
  localStorage.setItem(BALANCE_KEY, String(value));
  updateBalanceDisplays(value);
}

export function formatCoins(n: number) {
  return `${n} Moedas`;
}

export function getOwnedBadges(): number[] {
  const raw = localStorage.getItem(OWNED_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveOwnedBadges(arr: number[]) {
  localStorage.setItem(OWNED_KEY, JSON.stringify(arr));
}

export function addOwnedBadge(id: number) {
  const arr = getOwnedBadges();
  if (!arr.includes(id)) {
    arr.push(id);
    saveOwnedBadges(arr);
  }
}

export function isOwned(id: number) {
  return getOwnedBadges().includes(id);
}

export function canAfford(price: number) {
  return getBalance() >= price;
}

export function purchaseBadge(id: number, price: number, title?: string) {
  const bal = getBalance();
  if (bal < price) return false;
  setBalance(bal - price);
  addOwnedBadge(id);
  // criar notificação
  addNotification('Compra realizada', title ? `Você adquiriu a badge: ${title}` : 'Você adquiriu uma badge.', '/src/pages/galeria.html');
  return true;
}

function updateBalanceDisplays(value: number) {
  // atualiza elementos com id balanceAmount ou userBalance
  const amount = document.getElementById('balanceAmount');
  if (amount) amount.textContent = String(value);
  const userBalance = document.getElementById('userBalance');
  if (userBalance) userBalance.innerHTML = `💰 <span id="balanceAmount">${value}</span> Moedas`;
}
