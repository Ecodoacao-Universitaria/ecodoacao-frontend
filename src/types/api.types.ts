// Tipos compartilhados para chamadas à API

// ---- Erros genéricos ----
export interface ApiError {
  status: number;
  data: any;
  message: string;
}

// ---- Auth / Contas ----
export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RefreshResponse {
  access: string;
}

export interface NovoUsuarioPayload {
  username: string;
  email: string;
  password: string;
}

export type UsuarioRole = 'Admin' | 'Usuário' | 'Superusuário';

export interface Usuario {
  id: number;
  username: string;
  email: string;
  saldo_moedas: number;
  is_staff: boolean;
  is_active: boolean;
  role: string;
  date_joined: string;
}

// Paginação DRF genérica
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Query params listagem de usuários
export interface UsuarioListQuery {
  is_active?: boolean;
  is_staff?: boolean;
  search?: string;
  page?: number;
}

export type UsuarioListResponse = Paginated<Usuario> | Usuario[];

export interface UsuarioUpdatePayload {
  is_staff?: boolean;
  is_active?: boolean;
  username?: string;
  email?: string;
}

export interface AtualizarPerfilPayload {
  username?: string;
  email?: string;
}

export interface AlterarSenhaPayload {
  senha_atual: string;
  nova_senha: string;
}

export interface AlterarSenhaResponse {
  detail: string; 
}

// ---- Doações ----
export type DoacaoStatus = 'PENDENTE' | 'APROVADA' | 'RECUSADA';

export interface Doacao {
  id: number;
  doador: string;
  tipo_doacao: string;
  status: DoacaoStatus;
  evidencia_foto: string | null;
  data_submissao: string;
  motivo_recusa?: string | null;
  data_validacao?: string | null;
  validado_por?: string | null;
}

export interface TipoDoacao {
  id: number;
  nome: string;
  moedas_atribuidas: number;
}

export interface CriarDoacaoPayload {
  tipo_doacao: number;
  evidencia_foto: File;
  descricao?: string;
}

export interface ValidarDoacaoPayload {
  status: 'APROVADA' | 'RECUSADA';
  motivo_recusa?: string;
}

export interface ValidarDoacaoResponse {
  id: number;
  status: DoacaoStatus;
  mensagem: string;
  moedas_ganhas?: number;
  saldo_atual?: number;
  badges_conquistadas?: string[];
  motivo_recusa?: string;
}

export interface HistoricoDoacaoQuery {
  status?: DoacaoStatus;
  page?: number;
}

export type DoacaoListResponse = Paginated<Doacao>;

// ---- Badges ----
export type BadgeTipo = 'CONQUISTA' | 'COMPRA';

export interface Badge {
  id: number;
  nome: string;
  descricao: string;
  icone: string | null;
  icone_url?: string | null;
  tipo: BadgeTipo;
  tipo_display: string;
  custo_moedas: number;
  criterio_doacoes: number | null;
  criterio_moedas: number | null;
  ativo: boolean;
  criado_em: string;
}
export interface UsuarioBadge {
  id: number;
  badge: Badge;
  data_conquista: string;
}

export interface ComprarBadgePayload {
  badge_id: number;
}

export interface ComprarBadgeResponse {
  sucesso: boolean;
  mensagem: string;
  saldo_restante?: number;
}

export interface CriarBadgePayload {
  nome: string;
  descricao: string;
  tipo: 'CONQUISTA' | 'COMPRA';
  custo_moedas?: number;
  criterio_doacoes?: number | null;
  criterio_moedas?: number | null;
  ativo?: boolean;
  icone?: File | string | null;
}

export type BadgeListResponse = Paginated<Badge>;
export type MinhasBadgesResponse = UsuarioBadge[];
export type BadgesDisponiveisResponse = Badge[];

// ---- Dashboard ----
export interface DashboardUsuario {
  username: string;
  email: string;
  saldo_moedas: number;
  badges_conquistados: Badge[];
  role: string;
}

// ---- Utilidades ----
export function isPaginated<T>(data: any): data is Paginated<T> {
  return data && typeof data === 'object' && 'results' in data && 'count' in data;
}