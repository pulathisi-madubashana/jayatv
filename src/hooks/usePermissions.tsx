import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Permissions {
  programs_view: boolean;
  programs_add: boolean;
  programs_edit: boolean;
  programs_delete: boolean;
  schedule_view: boolean;
  schedule_add: boolean;
  schedule_edit: boolean;
  schedule_delete: boolean;
  requests_view: boolean;
  requests_approve: boolean;
  requests_reject: boolean;
  requests_delete: boolean;
  events_view: boolean;
  events_manage: boolean;
  admin_users_manage: boolean;
  preachers_view: boolean;
  preachers_add: boolean;
  preachers_edit: boolean;
  preachers_delete: boolean;
  media_view: boolean;
  media_add: boolean;
  media_edit: boolean;
  media_delete: boolean;
}

interface PermissionsContextType {
  permissions: Permissions | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  hasPermission: (permission: keyof Permissions) => boolean;
  refetchPermissions: () => Promise<void>;
}

const defaultPermissions: Permissions = {
  programs_view: false,
  programs_add: false,
  programs_edit: false,
  programs_delete: false,
  schedule_view: false,
  schedule_add: false,
  schedule_edit: false,
  schedule_delete: false,
  requests_view: false,
  requests_approve: false,
  requests_reject: false,
  requests_delete: false,
  events_view: false,
  events_manage: false,
  admin_users_manage: false,
  preachers_view: false,
  preachers_add: false,
  preachers_edit: false,
  preachers_delete: false,
  media_view: false,
  media_add: false,
  media_edit: false,
  media_delete: false,
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = async () => {
    if (!user || !isAdmin) {
      setPermissions(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no permissions found, user might be new admin - set defaults
        if (error.code === 'PGRST116') {
          setPermissions(defaultPermissions);
        } else {
          console.error('Error fetching permissions:', error);
          setPermissions(defaultPermissions);
        }
      } else {
        setPermissions(data as Permissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions(defaultPermissions);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [user, isAdmin]);

  const hasPermission = (permission: keyof Permissions): boolean => {
    if (!permissions) return false;
    // Super admins have all permissions
    if (permissions.admin_users_manage) return true;
    return permissions[permission] ?? false;
  };

  const isSuperAdmin = permissions?.admin_users_manage ?? false;

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        isLoading,
        isSuperAdmin,
        hasPermission,
        refetchPermissions: fetchPermissions,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
