import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'user' | 'ceo' | 'moderator';

export function useUserRoles(userId: string | undefined) {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRoles([]);
      setIsLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (error) throw error;

        const userRoles = data?.map(r => r.role as AppRole) || [];
        setRoles(userRoles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [userId]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isAdmin = hasRole('admin');
  const isCeo = hasRole('ceo');
  const isAdminOrCeo = isAdmin || isCeo;

  return {
    roles,
    isLoading,
    hasRole,
    isAdmin,
    isCeo,
    isAdminOrCeo
  };
}
