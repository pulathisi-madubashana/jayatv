import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import ProtectedRoute from './ProtectedRoute';
import { PermissionsProvider, usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

const AdminHeader = () => {
  const { isSuperAdmin } = usePermissions();
  const { user } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {isSuperAdmin && (
          <Badge variant="default" className="bg-red-600 hover:bg-red-700 text-white gap-1">
            <ShieldCheck className="h-3 w-3" />
            Super Admin
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{user?.email}</span>
      </div>
    </header>
  );
};

const AdminLayout = () => {
  return (
    <ProtectedRoute>
      <PermissionsProvider>
        <div className="flex min-h-screen bg-background w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-auto">
            <AdminHeader />
            <main className="flex-1 p-8 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </PermissionsProvider>
    </ProtectedRoute>
  );
};

export default AdminLayout;
