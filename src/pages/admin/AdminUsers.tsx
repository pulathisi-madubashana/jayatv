import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Shield, ShieldCheck, ShieldOff, UserX, UserCheck, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_banned: boolean;
  permissions: Permissions | null;
}

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

const defaultPermissions: Permissions = {
  programs_view: true,
  programs_add: false,
  programs_edit: false,
  programs_delete: false,
  schedule_view: true,
  schedule_add: false,
  schedule_edit: false,
  schedule_delete: false,
  requests_view: true,
  requests_approve: false,
  requests_reject: false,
  requests_delete: false,
  events_view: true,
  events_manage: false,
  admin_users_manage: false,
  preachers_view: true,
  preachers_add: false,
  preachers_edit: false,
  preachers_delete: false,
  media_view: true,
  media_add: false,
  media_edit: false,
  media_delete: false,
};

const PERMISSION_GROUPS = [
  {
    name: 'Programs',
    permissions: [
      { key: 'programs_view', label: 'View Programs' },
      { key: 'programs_add', label: 'Add Programs' },
      { key: 'programs_edit', label: 'Edit Programs' },
      { key: 'programs_delete', label: 'Delete Programs' },
    ],
  },
  {
    name: 'Schedule',
    permissions: [
      { key: 'schedule_view', label: 'View Schedule' },
      { key: 'schedule_add', label: 'Add Schedule' },
      { key: 'schedule_edit', label: 'Edit Schedule' },
      { key: 'schedule_delete', label: 'Delete Schedule' },
    ],
  },
  {
    name: 'Dharma Requests',
    permissions: [
      { key: 'requests_view', label: 'View Requests' },
      { key: 'requests_approve', label: 'Approve Requests' },
      { key: 'requests_reject', label: 'Reject Requests' },
      { key: 'requests_delete', label: 'Delete Requests' },
    ],
  },
  {
    name: 'Events',
    permissions: [
      { key: 'events_view', label: 'View Events' },
      { key: 'events_manage', label: 'Manage Events' },
    ],
  },
  {
    name: 'Preachers',
    permissions: [
      { key: 'preachers_view', label: 'View Preachers' },
      { key: 'preachers_add', label: 'Add Preachers' },
      { key: 'preachers_edit', label: 'Edit Preachers' },
      { key: 'preachers_delete', label: 'Delete Preachers' },
    ],
  },
  {
    name: 'Media Library',
    permissions: [
      { key: 'media_view', label: 'View Media' },
      { key: 'media_add', label: 'Add Media' },
      { key: 'media_edit', label: 'Edit Media' },
      { key: 'media_delete', label: 'Delete Media' },
    ],
  },
  {
    name: 'Admin (Super Admin Only)',
    permissions: [
      { key: 'admin_users_manage', label: 'Manage Admin Users' },
    ],
  },
];

// Protected Super Admin email that cannot be deleted
const PROTECTED_SUPER_ADMIN = 'pulathisimadubashana1@gmail.com';

const AdminUsers = () => {
  const { isSuperAdmin } = usePermissions();
  const { user: currentUser, session } = useAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    permissions: { ...defaultPermissions },
  });

  const fetchAdminUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-admin-users', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAdminUsers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching admin users:', error);
      toast.error(error.message || 'Failed to load admin users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchAdminUsers();
    }
  }, [session?.access_token]);

  const handleOpenDialog = (user?: AdminUser) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        password: '',
        permissions: user.permissions || { ...defaultPermissions },
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        password: '',
        permissions: { ...defaultPermissions },
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser && (!formData.email || !formData.password)) {
      toast.error('Email and password are required for new users');
      return;
    }

    if (!selectedUser && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      if (selectedUser) {
        // Update permissions only
        const { error: permError } = await supabase
          .from('admin_permissions')
          .upsert({
            user_id: selectedUser.user_id,
            ...formData.permissions,
          });

        if (permError) throw permError;

        toast.success('Admin user updated successfully');
      } else {
        // Create new admin user via edge function (uses admin API for proper user creation)
        const { data, error } = await supabase.functions.invoke('create-admin-user', {
          body: {
            email: formData.email,
            password: formData.password,
            permissions: formData.permissions,
          },
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        toast.success('Admin user created successfully! They can log in immediately.');
      }

      setIsDialogOpen(false);
      fetchAdminUsers();
    } catch (error: any) {
      console.error('Error saving admin user:', error);
      toast.error(error.message || 'Failed to save admin user');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    // Prevent deleting protected Super Admin
    if (selectedUser.email === PROTECTED_SUPER_ADMIN) {
      toast.error('Cannot delete the primary Super Admin account');
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      // Remove admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.user_id);

      if (roleError) throw roleError;

      // Remove permissions
      await supabase
        .from('admin_permissions')
        .delete()
        .eq('user_id', selectedUser.user_id);

      toast.success('Admin user removed successfully');
      setIsDeleteDialogOpen(false);
      fetchAdminUsers();
    } catch (error) {
      console.error('Error deleting admin user:', error);
      toast.error('Failed to delete admin user');
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const action = user.is_banned ? 'enable' : 'disable';
      const { data, error } = await supabase.functions.invoke('toggle-admin-status', {
        body: { targetUserId: user.user_id, action },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success(`Admin ${action === 'enable' ? 'enabled' : 'disabled'} successfully`);
      fetchAdminUsers();
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast.error(error.message || 'Failed to update admin status');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('reset-admin-password', {
        body: { targetUserId: selectedUser.user_id, newPassword },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('Password reset successfully');
      setIsPasswordDialogOpen(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const togglePermission = (key: keyof Permissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const grantAllPermissions = () => {
    const allTrue: Permissions = {} as Permissions;
    Object.keys(defaultPermissions).forEach(key => {
      (allTrue as any)[key] = true;
    });
    setFormData(prev => ({ ...prev, permissions: allTrue }));
  };

  const revokeAllPermissions = () => {
    setFormData(prev => ({ ...prev, permissions: { ...defaultPermissions } }));
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-8 text-center">
          <ShieldOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            Only Super Admins can manage admin users.
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-500" />
            Admin Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage admin accounts and permissions</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Admin User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{adminUsers.length}</p>
                <p className="text-sm text-muted-foreground">Total Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-500/10">
                <ShieldCheck className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {adminUsers.filter(u => u.permissions?.admin_users_manage).length}
                </p>
                <p className="text-sm text-muted-foreground">Super Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {adminUsers.filter(u => !u.is_banned).length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <UserX className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {adminUsers.filter(u => u.is_banned).length}
                </p>
                <p className="text-sm text-muted-foreground">Disabled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.map((user) => (
                <TableRow key={user.id} className={user.is_banned ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {user.email}
                      {user.user_id === currentUser?.id && (
                        <Badge variant="outline" className="ml-1">You</Badge>
                      )}
                      {user.email === PROTECTED_SUPER_ADMIN && (
                        <Badge variant="default" className="ml-1 bg-red-600">Primary</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.permissions?.admin_users_manage ? (
                      <Badge className="bg-red-600 hover:bg-red-700">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Super Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_banned ? (
                      <Badge variant="destructive">Disabled</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(user)}
                        title="Edit Permissions"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsPasswordDialogOpen(true);
                        }}
                        title="Reset Password"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      {user.user_id !== currentUser?.id && user.email !== PROTECTED_SUPER_ADMIN && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(user)}
                            title={user.is_banned ? 'Enable' : 'Disable'}
                          >
                            {user.is_banned ? (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <UserX className="h-4 w-4 text-orange-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {adminUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No admin users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Edit Admin User' : 'Add New Admin User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? 'Update the admin user permissions'
                : 'Create a new admin account with specific permissions'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-4 mt-4">
              {!selectedUser && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  </div>
                </>
              )}
              {selectedUser && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Email:</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">User ID:</p>
                    <p className="font-mono text-sm">{selectedUser.user_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status:</p>
                    <Badge variant={selectedUser.is_banned ? 'destructive' : 'default'}>
                      {selectedUser.is_banned ? 'Disabled' : 'Active'}
                    </Badge>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4 mt-4">
              <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={grantAllPermissions}>
                  Grant All
                </Button>
                <Button variant="outline" size="sm" onClick={revokeAllPermissions}>
                  Revoke All
                </Button>
              </div>

              {PERMISSION_GROUPS.map((group) => (
                <Card key={group.name}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 pt-0">
                    {group.permissions.map((perm) => (
                      <div key={perm.key} className="flex items-center space-x-2">
                        <Switch
                          id={perm.key}
                          checked={formData.permissions[perm.key as keyof Permissions]}
                          onCheckedChange={() => togglePermission(perm.key as keyof Permissions)}
                        />
                        <Label htmlFor={perm.key} className="text-sm cursor-pointer">
                          {perm.label}
                        </Label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
              {selectedUser ? 'Update' : 'Create'} Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter a new password for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsPasswordDialogOpen(false);
              setNewPassword('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} className="bg-red-600 hover:bg-red-700">
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove admin privileges from <strong>{selectedUser?.email}</strong>. 
              They will no longer be able to access the admin dashboard. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Remove Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default AdminUsers;
