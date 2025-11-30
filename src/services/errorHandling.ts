// api/errorHandling.ts
export interface ApiError {
  status: number;
  data: any;
  message: string;
}

export function parseError(err: any): { message: string; status?: number } {
  if (!err) return { message: 'Erro desconhecido' };
  if (typeof err === 'string') return { message: err };
  const message =
    err.message ||
    err?.payload?.detail ||
    err?.payload?.erro ||
    'Erro na operação';
  return { message, status: err.status };
}