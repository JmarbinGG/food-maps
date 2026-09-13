import { useAuthContext } from '../AuthContext.jsx';

/**
 * Active community role for Nouri UI. Returns null until auth/role is known
 * so chrome does not flash recipient defaults.
 */
export function useCommunityRole() {
  const { user, isAdmin } = useAuthContext();
  if (isAdmin) return 'admin';
  if (!user) return null;
  const role = String(user?.role || '').toLowerCase().trim();
  if (!role) return null;
  if (role === 'donor') return 'donor';
  if (role === 'recipient') return 'recipient';
  if (role === 'volunteer') return 'volunteer';
  if (role === 'dispatcher' || role === 'organizer') return 'organizer';
  if (role === 'driver') return 'driver';
  if (role === 'admin') return 'admin';
  return null;
}
