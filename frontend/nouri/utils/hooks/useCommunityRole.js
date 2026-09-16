import { useAuthContext } from '../AuthContext.jsx';

/**
 * Active community role for Nouri UI.
 *
 * Prefer the user's active `role` (donor/recipient/…) so an admin who
 * switched into recipient/donor UX is treated as that role — not always
 * "admin" because `is_admin` stays true for the session.
 * Returns null until auth/role is known so chrome does not flash defaults.
 */
export function useCommunityRole() {
  const { user, isAdmin } = useAuthContext();
  if (!user && !isAdmin) return null;
  const role = String(user?.role || '').toLowerCase().trim();
  if (role === 'donor') return 'donor';
  if (role === 'recipient') return 'recipient';
  if (role === 'volunteer') return 'volunteer';
  if (role === 'dispatcher' || role === 'organizer') return 'organizer';
  if (role === 'driver') return 'driver';
  if (role === 'admin') return 'admin';
  // Durable admin with no active UX role yet.
  if (isAdmin) return 'admin';
  if (!user) return null;
  return null;
}
