// Donation Types Management Service - Shared storage operations
export interface DonationType {
  id: number;
  name: string;
}

export function getDonationTypes(): DonationType[] {
  const raw = localStorage.getItem('ecodoacao_types');
  if (!raw) return ensureDefaultDonationTypes();
  try {
    const parsed = JSON.parse(raw) as DonationType[];
    if (!Array.isArray(parsed) || parsed.length === 0) return ensureDefaultDonationTypes();
    return parsed;
  } catch {
    return ensureDefaultDonationTypes();
  }
}

export function saveDonationTypes(types: DonationType[]) {
  localStorage.setItem('ecodoacao_types', JSON.stringify(types));
}

export function ensureDefaultDonationTypes(): DonationType[] {
  const defaults: DonationType[] = [
    { id: 1, name: 'Reuso de Livros' },
    { id: 2, name: 'Descarte Eletrônico' },
    { id: 3, name: 'Doação de Roupas' },
    { id: 4, name: 'Doação de Alimentos' },
  ];
  saveDonationTypes(defaults);
  return defaults;
}

export function populateDonationTypes() {
  const selects = document.querySelectorAll<HTMLSelectElement>('select#tipo');
  if (!selects || selects.length === 0) return;
  const types = getDonationTypes();
  for (const sel of selects) {
    // preserve a placeholder option if present
    const placeholder = Array.from(sel.options).find(o => o.value === '');
    sel.innerHTML = '';
    if (placeholder) sel.appendChild(placeholder);
    for (const t of types) {
      const opt = document.createElement('option');
      opt.value = t.name;
      opt.textContent = t.name;
      sel.appendChild(opt);
    }
  }
}
