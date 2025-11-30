import { apiRequest } from './http';
import { API_ENDPOINTS, multipartHeaders, authHeaders } from '../config/api';
import { showToast } from '../utils/notifications';

export async function submitDoacao(form: HTMLFormElement): Promise<void> {
  const tipoEl = form.querySelector('#tipoDoacao') as HTMLSelectElement | null;
  const descEl = form.querySelector('#descricaoDoacao') as HTMLTextAreaElement | null;
  const fotoEl = form.querySelector('#evidenciaFoto') as HTMLInputElement | null;

  const tipo = Number(tipoEl?.value ?? 0);
  const descricao = (descEl?.value || '').trim();
  const foto = fotoEl?.files?.[0];

  if (!tipo || !foto) {
    showToast('Tipo de doação e foto são obrigatórios.', 'warning');
    return;
  }

  const fd = new FormData();
  fd.append('tipo_doacao', String(tipo));
  if (descricao) fd.append('descricao', descricao);
  fd.append('evidencia_foto', foto);

  try {
    const resp = await apiRequest(API_ENDPOINTS.doacoes.criar, {
      method: 'POST',
      body: fd,
      headers: multipartHeaders(),
      absolute: true
    });
    showToast('Doação enviada com sucesso!', 'success');
    console.log('Submissão OK', resp);
    form.reset();
  } catch (err: any) {
    console.error(err);
    const msg = err?.payload?.detail || err?.message || 'Falha ao enviar doação.';
    showToast(msg, 'danger', 6000);
  }
}

export async function carregarHistoricoSubmissao(page?: number): Promise<any> {
  const qs = page ? `?page=${page}` : '';
  return apiRequest(`${API_ENDPOINTS.doacoes.historico}${qs}`, {
    method: 'GET',
    headers: authHeaders(),
    absolute: true
  });
}