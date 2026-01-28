import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, LogOut, Clock, Calendar, Shield, LayoutGrid, Settings, MessageSquare, Inbox, ArrowUpDown, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import jayaTVLogo from '@/assets/jaya-tv-logo.png';

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { path: '/admin/dharma-settings', label: 'Dharma Deshana Settings', icon: Settings },
  { path: '/admin/requests', label: 'Dharma Deshana Requests', icon: MessageSquare },
  { path: '/admin/schedule', label: 'Program Schedule', icon: Clock },
  { path: '/admin/events', label: 'Special Events', icon: Calendar },
  { path: '/admin/media', label: 'Media Library', icon: LayoutGrid },
  { path: '/admin/ordering', label: 'Display Order', icon: ArrowUpDown },
  { path: '/admin/contact-messages', label: 'Contact Messages', icon: Inbox },
];

const AdminSidebar = () => {
  const { signOut } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 min-h-screen bg-card border-r border-border flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img
            src={jayaTVLogo}
            alt="Jaya TV"
            className="w-10 h-10 rounded-lg"
          />
          <div>
            <h2 className="font-bold text-foreground">Jaya TV</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
          {/* Super Admin only: Admin Management */}
          {isSuperAdmin && (
            <li>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-red-400 hover:bg-red-950/50 hover:text-red-300'
                  }`
                }
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">🔐 Admin Management</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
