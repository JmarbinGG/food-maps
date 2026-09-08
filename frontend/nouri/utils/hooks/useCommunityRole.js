import { useAuthContext } from '../AuthContext.jsx';

export function useCommunityRole() {
  const { user, isAdmin } = useAuthContext();
  if (isAdmin) return 'admin';
  const role = String(user?.role || '').toLowerCase();
  if (role === 'donor') return 'donor';
  if (role === 'volunteer') return 'volunteer';
  if (role === 'dispatcher' || role === 'organizer') return 'organizer';
  return 'recipient';
}
