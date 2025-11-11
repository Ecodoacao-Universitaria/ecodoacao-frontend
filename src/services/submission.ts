// Submission Management Service - Shared utility for local storage operations
export interface Submission {
  id: number;
  tipo: string;
  descricao: string;
  arquivoNome?: string;
  data: string; // ISO
  status: string;
}

export function getSubmissions(): Submission[] {
  const raw = localStorage.getItem('ecodoacao_submissions');
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Submission[];
  } catch {
    return [];
  }
}

export function saveSubmission(sub: Submission) {
  const arr = getSubmissions();
  arr.unshift(sub); // newest first
  localStorage.setItem('ecodoacao_submissions', JSON.stringify(arr));
}
