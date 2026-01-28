import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Tv, Users, Clock, CheckCircle, XCircle, Calendar, CalendarClock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalPrograms: number;
  totalPreachers: number;
  totalScheduleItems: number;
  activeEvents: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalPrograms: 0,
    totalPreachers: 0,
    totalScheduleItems: 0,
    activeEvents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [requestsRes, programsRes, preachersRes, scheduleRes, eventsRes] = await Promise.all([
        supabase.from('dharma_requests').select('status'),
        supabase.from('programs').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('program_schedule').select('*', { count: 'exact', head: true }),
        supabase.from('special_events').select('end_datetime').gte('end_datetime', new Date().toISOString()),
      ]);

      const requests = requestsRes.data || [];

      setStats({
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        approvedRequests: requests.filter(r => r.status === 'approved').length,
        rejectedRequests: requests.filter(r => r.status === 'rejected').length,
        totalPrograms: programsRes.count || 0,
        totalPreachers: preachersRes.count || 0,
        totalScheduleItems: scheduleRes.count || 0,
        activeEvents: eventsRes.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Requests', 
      value: stats.totalRequests, 
      icon: FileText, 
      color: 'bg-blue-500/10 text-blue-500' 
    },
    { 
      label: 'Pending', 
      value: stats.pendingRequests, 
      icon: Clock, 
      color: 'bg-yellow-500/10 text-yellow-500' 
    },
    { 
      label: 'Approved', 
      value: stats.approvedRequests, 
      icon: CheckCircle, 
      color: 'bg-green-500/10 text-green-500' 
    },
    { 
      label: 'Rejected', 
      value: stats.rejectedRequests, 
      icon: XCircle, 
      color: 'bg-red-500/10 text-red-500' 
    },
    { 
      label: 'Schedule Items', 
      value: stats.totalScheduleItems, 
      icon: CalendarClock, 
      color: 'bg-orange-500/10 text-orange-500' 
    },
    { 
      label: 'Active Events', 
      value: stats.activeEvents, 
      icon: Calendar, 
      color: 'bg-pink-500/10 text-pink-500' 
    },
    { 
      label: 'Programs', 
      value: stats.totalPrograms, 
      icon: Tv, 
      color: 'bg-purple-500/10 text-purple-500' 
    },
    { 
      label: 'Preachers', 
      value: stats.totalPreachers, 
      icon: Users, 
      color: 'bg-primary/10 text-primary' 
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Welcome to Jaya TV Admin Panel</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                <p className="text-4xl font-bold text-foreground">
                  {isLoading ? '—' : stat.value}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
