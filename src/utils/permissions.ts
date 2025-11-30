import { getUserClaims } from '../services/auth.services';

export function getUserRoles(): string[] {
  const claims = getUserClaims();
  if (!claims) return [];
  const roles: string[] = [
    ...(Array.isArray(claims.roles) ? claims.roles : []),
    claims.role,
    claims.perfil,
    claims.tipo,
    claims.is_staff ? 'STAFF' : undefined,
    claims.is_superuser ? 'SUPERUSER' : undefined,
  ].filter(Boolean).map((r: string) => String(r).toUpperCase());
  return roles;
}

export function isAdmin(): boolean {
  const roles = getUserRoles();
  return roles.includes('ADMIN') ||
         roles.includes('SUPERUSER') ||
         roles.includes('STAFF') ||
         roles.includes('SUPER') ||
         roles.includes('ADM') ||
         roles.includes('ADMINISTRATOR');
}