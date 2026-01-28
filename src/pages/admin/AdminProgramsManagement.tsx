import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Loader2, Search, Users, Settings, Eye, EyeOff, FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface Program {
  id: string;
  name_sinhala: string;
  name_english: string;
  description: string | null;
  logo_url: string | null;
  category: string | null;
  is_active: boolean;
  allow_deshana_request: boolean;
}

interface Preacher {
  id: string;
  name_sinhala: string;
  name_english: string;
  photo_url: string | null;
  profile_type: string;
  biography: string | null;
}

interface ProgramPreacher {
  program_id: string;
  profile_id: string;
}

const CATEGORIES = [
  { value: 'Discussion', label: 'Discussion / සාකච්ඡා' },
  { value: 'Meditation', label: 'Meditation / භාවනා' },
  { value: 'Motivational', label: 'Motivational / අභිප්‍රේරණ' },
  { value: 'Educational', label: 'Educational / අධ්‍යාපනික' },
  { value: 'Outreach', label: 'Outreach / ප්‍රචාරණ' },
  { value: 'Reflection', label: 'Reflection / මෙනෙහි' },
  { value: 'Sermons', label: 'Sermons / බණ' },
  { value: 'Other', label: 'Other / වෙනත්' },
];

const PROFILE_TYPES = [
  { value: 'monk', label: 'Monk / ස්වාමීන් වහන්සේ' },
  { value: 'lay_speaker', label: 'Lay Speaker / ගිහි දේශක' },
];

const AdminProgramsManagement = () => {
  const { toast } = useToast();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState('programs');
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [programs, setPrograms] = useState<Program[]>([]);
  const [preachers, setPreachers] = useState<Preacher[]>([]);
  const [programPreachers, setProgramPreachers] = useState<ProgramPreacher[]>([]);

  // Program modal
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programForm, setProgramForm] = useState({
    name_english: '',
    name_sinhala: '',
    description: '',
    logo_url: '',
    category: 'Discussion',
    is_active: true,
    allow_deshana_request: true,
  });
  const [isSavingProgram, setIsSavingProgram] = useState(false);
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null);

  // Preacher modal
  const [isPreacherModalOpen, setIsPreacherModalOpen] = useState(false);
  const [editingPreacher, setEditingPreacher] = useState<Preacher | null>(null);
  const [preacherForm, setPreacherForm] = useState({
    name_english: '',
    name_sinhala: '',
    photo_url: '',
    profile_type: 'monk',
    biography: '',
  });
  const [isSavingPreacher, setIsSavingPreacher] = useState(false);
  const [deletingPreacher, setDeletingPreacher] = useState<Preacher | null>(null);

  // Preacher assignment modal
  const [assigningProgram, setAssigningProgram] = useState<Program | null>(null);
  const [selectedPreacherIds, setSelectedPreacherIds] = useState<string[]>([]);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [preacherFilter, setPreacherFilter] = useState('all');
  const [programStatusFilter, setProgramStatusFilter] = useState('all');

  const canAdd = isSuperAdmin || hasPermission('programs_add');
  const canEdit = isSuperAdmin || hasPermission('programs_edit');
  const canDelete = isSuperAdmin || hasPermission('programs_delete');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [programsRes, preachersRes, ppRes] = await Promise.all([
        supabase.from('programs').select('*').order('name_english'),
        supabase.from('profiles').select('*').order('name_english'),
        supabase.from('program_preachers').select('*'),
      ]);

      if (programsRes.error) throw programsRes.error;
      if (preachersRes.error) throw preachersRes.error;
      if (ppRes.error) throw ppRes.error;

      setPrograms(programsRes.data || []);
      setPreachers(preachersRes.data || []);
      setProgramPreachers(ppRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ============ PROGRAMS ============
  const openProgramModal = (program?: Program) => {
    if (program) {
      setEditingProgram(program);
      setProgramForm({
        name_english: program.name_english,
        name_sinhala: program.name_sinhala,
        description: program.description || '',
        logo_url: program.logo_url || '',
        category: program.category || 'Discussion',
        is_active: program.is_active,
        allow_deshana_request: program.allow_deshana_request,
      });
    } else {
      setEditingProgram(null);
      setProgramForm({
        name_english: '',
        name_sinhala: '',
        description: '',
        logo_url: '',
        category: 'Discussion',
        is_active: true,
        allow_deshana_request: true,
      });
    }
    setIsProgramModalOpen(true);
  };

  const saveProgram = async () => {
    if (!programForm.name_english || !programForm.name_sinhala) {
      toast({ title: 'Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    setIsSavingProgram(true);
    try {
      const data = {
        name_english: programForm.name_english,
        name_sinhala: programForm.name_sinhala,
        description: programForm.description || null,
        logo_url: programForm.logo_url || null,
        category: programForm.category,
        is_active: programForm.is_active,
        allow_deshana_request: programForm.allow_deshana_request,
      };

      if (editingProgram) {
        const { error } = await supabase.from('programs').update(data).eq('id', editingProgram.id);
        if (error) throw error;
        setPrograms(prev => prev.map(p => p.id === editingProgram.id ? { ...p, ...data } : p));
      } else {
        const { data: newProgram, error } = await supabase.from('programs').insert(data).select().single();
        if (error) throw error;
        setPrograms(prev => [...prev, newProgram]);
      }

      toast({ title: 'Success', description: `Program ${editingProgram ? 'updated' : 'created'}` });
      setIsProgramModalOpen(false);
    } catch (error) {
      console.error('Error saving program:', error);
      toast({ title: 'Error', description: 'Failed to save program', variant: 'destructive' });
    } finally {
      setIsSavingProgram(false);
    }
  };

  const deleteProgram = async () => {
    if (!deletingProgram) return;
    try {
      const { error } = await supabase.from('programs').delete().eq('id', deletingProgram.id);
      if (error) throw error;
      setPrograms(prev => prev.filter(p => p.id !== deletingProgram.id));
      setProgramPreachers(prev => prev.filter(pp => pp.program_id !== deletingProgram.id));
      toast({ title: 'Success', description: 'Program deleted' });
      setDeletingProgram(null);
    } catch (error) {
      console.error('Error deleting program:', error);
      toast({ title: 'Error', description: 'Failed to delete program', variant: 'destructive' });
    }
  };

  // ============ PREACHERS ============
  const openPreacherModal = (preacher?: Preacher) => {
    if (preacher) {
      setEditingPreacher(preacher);
      setPreacherForm({
        name_english: preacher.name_english,
        name_sinhala: preacher.name_sinhala,
        photo_url: preacher.photo_url || '',
        profile_type: preacher.profile_type || 'monk',
        biography: preacher.biography || '',
      });
    } else {
      setEditingPreacher(null);
      setPreacherForm({ name_english: '', name_sinhala: '', photo_url: '', profile_type: 'monk', biography: '' });
    }
    setIsPreacherModalOpen(true);
  };

  const savePreacher = async () => {
    if (!preacherForm.name_english || !preacherForm.name_sinhala) {
      toast({ title: 'Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    setIsSavingPreacher(true);
    try {
      const data = {
        name_english: preacherForm.name_english,
        name_sinhala: preacherForm.name_sinhala,
        photo_url: preacherForm.photo_url || null,
        profile_type: preacherForm.profile_type,
        biography: preacherForm.biography || null,
      };

      if (editingPreacher) {
        const { error } = await supabase.from('profiles').update(data).eq('id', editingPreacher.id);
        if (error) throw error;
        setPreachers(prev => prev.map(p => p.id === editingPreacher.id ? { ...p, ...data } : p));
      } else {
        const { data: newPreacher, error } = await supabase.from('profiles').insert(data).select().single();
        if (error) throw error;
        setPreachers(prev => [...prev, newPreacher]);
      }

      toast({ title: 'Success', description: `Preacher ${editingPreacher ? 'updated' : 'created'}` });
      setIsPreacherModalOpen(false);
    } catch (error) {
      console.error('Error saving preacher:', error);
      toast({ title: 'Error', description: 'Failed to save preacher', variant: 'destructive' });
    } finally {
      setIsSavingPreacher(false);
    }
  };

  const deletePreacher = async () => {
    if (!deletingPreacher) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', deletingPreacher.id);
      if (error) throw error;
      setPreachers(prev => prev.filter(p => p.id !== deletingPreacher.id));
      setProgramPreachers(prev => prev.filter(pp => pp.profile_id !== deletingPreacher.id));
      toast({ title: 'Success', description: 'Preacher deleted' });
      setDeletingPreacher(null);
    } catch (error) {
      console.error('Error deleting preacher:', error);
      toast({ title: 'Error', description: 'Failed to delete preacher', variant: 'destructive' });
    }
  };

  // ============ PREACHER ASSIGNMENTS ============
  const openAssignmentModal = (program: Program) => {
    setAssigningProgram(program);
    const currentIds = programPreachers.filter(pp => pp.program_id === program.id).map(pp => pp.profile_id);
    setSelectedPreacherIds(currentIds);
  };

  const togglePreacher = (preacherId: string) => {
    setSelectedPreacherIds(prev =>
      prev.includes(preacherId) ? prev.filter(id => id !== preacherId) : [...prev, preacherId]
    );
  };

  const savePreacherAssignments = async () => {
    if (!assigningProgram) return;
    setIsSavingAssignment(true);
    try {
      await supabase.from('program_preachers').delete().eq('program_id', assigningProgram.id);
      if (selectedPreacherIds.length > 0) {
        const newAssignments = selectedPreacherIds.map(profileId => ({
          program_id: assigningProgram.id,
          profile_id: profileId,
        }));
        const { error } = await supabase.from('program_preachers').insert(newAssignments);
        if (error) throw error;
      }
      setProgramPreachers(prev => [
        ...prev.filter(pp => pp.program_id !== assigningProgram.id),
        ...selectedPreacherIds.map(profileId => ({ program_id: assigningProgram.id, profile_id: profileId })),
      ]);
      toast({ title: 'Success', description: 'Preacher assignments updated' });
      setAssigningProgram(null);
    } catch (error) {
      console.error('Error saving assignments:', error);
      toast({ title: 'Error', description: 'Failed to save assignments', variant: 'destructive' });
    } finally {
      setIsSavingAssignment(false);
    }
  };

  const getPreachersForProgram = (programId: string) => {
    const preacherIds = programPreachers.filter(pp => pp.program_id === programId).map(pp => pp.profile_id);
    return preachers.filter(p => preacherIds.includes(p.id));
  };

  const getProgramsForPreacher = (preacherId: string) => {
    const programIds = programPreachers.filter(pp => pp.profile_id === preacherId).map(pp => pp.program_id);
    return programs.filter(p => programIds.includes(p.id));
  };

  // Filters
  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.name_english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name_sinhala.includes(searchQuery);
    const matchesStatus = programStatusFilter === 'all' ||
      (programStatusFilter === 'active' && p.is_active) ||
      (programStatusFilter === 'inactive' && !p.is_active);
    return matchesSearch && matchesStatus;
  });

  const filteredPreachers = preachers.filter(p => {
    const matchesSearch = p.name_english.toLowerCase().includes(searchQuery.toLowerCase()) || p.name_sinhala.includes(searchQuery);
    const matchesType = preacherFilter === 'all' || p.profile_type === preacherFilter;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Programs & Preachers Management</h1>
        <p className="text-muted-foreground">Manage all programs, preachers, and their relationships</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{programs.length}</p>
              <p className="text-sm text-muted-foreground">Total Programs</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Eye className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{programs.filter(p => p.is_active).length}</p>
              <p className="text-sm text-muted-foreground">Active Programs</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Users className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{preachers.filter(p => p.profile_type === 'monk').length}</p>
              <p className="text-sm text-muted-foreground">Monks</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{preachers.filter(p => p.profile_type === 'lay_speaker').length}</p>
              <p className="text-sm text-muted-foreground">Lay Speakers</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="preachers">Preachers</TabsTrigger>
        </TabsList>

        {/* PROGRAMS TAB */}
        <TabsContent value="programs" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Search programs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={programStatusFilter} onValueChange={setProgramStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {canAdd && (
              <Button onClick={() => openProgramModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Program
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program, index) => {
              const assignedPreachers = getPreachersForProgram(program.id);
              return (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-card border rounded-2xl p-6 transition-colors ${program.is_active ? 'border-border hover:border-primary/50' : 'border-destructive/30 opacity-60'}`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {program.logo_url ? (
                      <img src={program.logo_url} alt={program.name_english} className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{program.name_english.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{program.name_english}</h3>
                        {!program.is_active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground font-sinhala truncate">{program.name_sinhala}</p>
                      {program.category && (
                        <Badge variant="secondary" className="mt-1 text-xs">{program.category}</Badge>
                      )}
                    </div>
                  </div>

                  {program.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{program.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Users className="w-4 h-4" />
                    <span>{assignedPreachers.length} Preacher{assignedPreachers.length !== 1 ? 's' : ''}</span>
                    {program.allow_deshana_request && (
                      <Badge variant="outline" className="ml-auto text-xs">Deshana Enabled</Badge>
                    )}
                  </div>

                  {assignedPreachers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {assignedPreachers.slice(0, 3).map(p => (
                        <Badge key={p.id} variant="secondary" className="text-xs">{p.name_english}</Badge>
                      ))}
                      {assignedPreachers.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{assignedPreachers.length - 3}</Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openAssignmentModal(program)}>
                      <Users className="w-4 h-4 mr-1" />
                      Preachers
                    </Button>
                    {canEdit && (
                      <Button variant="ghost" size="sm" onClick={() => openProgramModal(program)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeletingProgram(program)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredPrograms.length === 0 && (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground">No programs found</p>
              {canAdd && (
                <Button className="mt-4" onClick={() => openProgramModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Program
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* PREACHERS TAB */}
        <TabsContent value="preachers" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Search preachers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={preacherFilter} onValueChange={setPreacherFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="monk">Monks</SelectItem>
                  <SelectItem value="lay_speaker">Lay Speakers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {canAdd && (
              <Button onClick={() => openPreacherModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Preacher
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPreachers.map((preacher, index) => {
              const assignedPrograms = getProgramsForPreacher(preacher.id);
              return (
                <motion.div
                  key={preacher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {preacher.photo_url ? (
                      <img src={preacher.photo_url} alt={preacher.name_english} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">{preacher.name_english.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{preacher.name_english}</h3>
                      <p className="text-sm text-muted-foreground font-sinhala truncate">{preacher.name_sinhala}</p>
                      <Badge variant={preacher.profile_type === 'monk' ? 'default' : 'secondary'} className="mt-1 text-xs">
                        {preacher.profile_type === 'monk' ? 'Monk' : 'Lay Speaker'}
                      </Badge>
                    </div>
                  </div>

                  {preacher.biography && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{preacher.biography}</p>
                  )}

                  {assignedPrograms.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Assigned to:</p>
                      <div className="flex flex-wrap gap-1">
                        {assignedPrograms.map(p => (
                          <Badge key={p.id} variant="outline" className="text-xs">{p.name_english}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {canEdit && (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openPreacherModal(preacher)}>
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeletingPreacher(preacher)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredPreachers.length === 0 && (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground">No preachers found</p>
              {canAdd && (
                <Button className="mt-4" onClick={() => openPreacherModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Preacher
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* PROGRAM MODAL */}
      <Dialog open={isProgramModalOpen} onOpenChange={setIsProgramModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Edit Program' : 'Add Program'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>English Name *</Label>
                <Input
                  value={programForm.name_english}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, name_english: e.target.value }))}
                  placeholder="Program name"
                />
              </div>
              <div>
                <Label>Sinhala Name *</Label>
                <Input
                  value={programForm.name_sinhala}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, name_sinhala: e.target.value }))}
                  placeholder="වැඩසටහන් නම"
                  className="font-sinhala"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={programForm.description}
                onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Program description..."
                rows={3}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={programForm.category} onValueChange={(v) => setProgramForm(prev => ({ ...prev, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ImageUpload
              value={programForm.logo_url}
              onChange={(url) => setProgramForm(prev => ({ ...prev, logo_url: url }))}
              label="Program Logo"
              folder="programs"
              placeholder="https://example.com/logo.jpg"
              previewClassName="w-20 h-20 rounded-lg"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={programForm.is_active}
                  onCheckedChange={(checked) => setProgramForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active (visible on website)</Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={programForm.allow_deshana_request}
                onCheckedChange={(checked) => setProgramForm(prev => ({ ...prev, allow_deshana_request: checked }))}
              />
              <Label>Allow Dharma Deshana requests</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsProgramModalOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={saveProgram} disabled={isSavingProgram}>
                {isSavingProgram ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingProgram ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PREACHER MODAL */}
      <Dialog open={isPreacherModalOpen} onOpenChange={setIsPreacherModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPreacher ? 'Edit Preacher' : 'Add Preacher'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select value={preacherForm.profile_type} onValueChange={(v) => setPreacherForm(prev => ({ ...prev, profile_type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>English Name *</Label>
                <Input
                  value={preacherForm.name_english}
                  onChange={(e) => setPreacherForm(prev => ({ ...prev, name_english: e.target.value }))}
                  placeholder="Preacher name"
                />
              </div>
              <div>
                <Label>Sinhala Name *</Label>
                <Input
                  value={preacherForm.name_sinhala}
                  onChange={(e) => setPreacherForm(prev => ({ ...prev, name_sinhala: e.target.value }))}
                  placeholder="නම"
                  className="font-sinhala"
                />
              </div>
            </div>
            <ImageUpload
              value={preacherForm.photo_url}
              onChange={(url) => setPreacherForm(prev => ({ ...prev, photo_url: url }))}
              label="Profile Photo"
              folder="profiles"
              placeholder="https://example.com/photo.jpg"
            />
            <div>
              <Label>Biography</Label>
              <Textarea
                value={preacherForm.biography}
                onChange={(e) => setPreacherForm(prev => ({ ...prev, biography: e.target.value }))}
                placeholder="Short biography..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsPreacherModalOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={savePreacher} disabled={isSavingPreacher}>
                {isSavingPreacher ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingPreacher ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ASSIGN PREACHERS MODAL */}
      <Dialog open={!!assigningProgram} onOpenChange={() => setAssigningProgram(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Preachers to {assigningProgram?.name_english}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select preachers to assign to this program:</p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {preachers.map(preacher => (
                <div
                  key={preacher.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPreacherIds.includes(preacher.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => togglePreacher(preacher.id)}
                >
                  {preacher.photo_url ? (
                    <img src={preacher.photo_url} alt={preacher.name_english} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{preacher.name_english.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{preacher.name_english}</p>
                    <p className="text-xs text-muted-foreground">{preacher.profile_type === 'monk' ? 'Monk' : 'Lay Speaker'}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPreacherIds.includes(preacher.id) ? 'border-primary bg-primary' : 'border-muted-foreground'
                  }`}>
                    {selectedPreacherIds.includes(preacher.id) && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setAssigningProgram(null)}>Cancel</Button>
              <Button className="flex-1" onClick={savePreacherAssignments} disabled={isSavingAssignment}>
                {isSavingAssignment ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save ({selectedPreacherIds.length} selected)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE PROGRAM DIALOG */}
      <AlertDialog open={!!deletingProgram} onOpenChange={() => setDeletingProgram(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete "{deletingProgram?.name_english}". Videos linked to this program will remain but lose their program association.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteProgram} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE PREACHER DIALOG */}
      <AlertDialog open={!!deletingPreacher} onOpenChange={() => setDeletingPreacher(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preacher?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete "{deletingPreacher?.name_english}". Programs and videos linked to this preacher will remain but lose their preacher association.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deletePreacher} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProgramsManagement;
