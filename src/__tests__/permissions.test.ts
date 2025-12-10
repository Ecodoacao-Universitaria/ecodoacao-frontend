import * as auth from '../services/auth.services';
import { getUserRoles, isAdmin } from '../utils/permissions';

jest.mock('../services/auth.services');

describe('permissions', () => {
  const mocked = auth as jest.Mocked<typeof auth>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('monta roles normalizadas em maiúsculas', () => {
    mocked.getUserClaims.mockReturnValue({ roles: ['user'], role: 'viewer', is_staff: true } as any);
    const roles = getUserRoles();
    expect(roles).toEqual(expect.arrayContaining(['USER', 'VIEWER', 'STAFF']));
  });

  it('isAdmin detecta perfis administrativos', () => {
    mocked.getUserClaims.mockReturnValue({ roles: ['admin'] } as any);
    expect(isAdmin()).toBe(true);
  });
});
