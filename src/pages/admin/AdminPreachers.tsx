import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface Preacher {
  id: string;
  name_sinhala: string;
  name_english: string;
  photo_url: string | null;
  biography: string | null;
  profile_type: string;
}

interface Program {
  id: string;
  name_english: string;
  name_sinhala: string;
}

interface PreacherProgram {
  program_id: string;
}

const PROFILE_TYPES = [
  { value: 'monk', label: 'Monk / ස්වාමීන් වහන්සේ' },
  { value: 'lay_speaker', label: 'Lay Speaker / ගිහි දේශක' },
];

const AdminPreachers = () => {
  const { toast } = useToast();
  const [preachers, setPreachers] = useState<Preacher[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Edit/Create modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreacher, setEditingPreacher] = useState<Preacher | null>(null);
  const [formData, setFormData] = useState({
    name_english: '',
    name_sinhala: '',
    photo_url: '',
    biography: '',
    profile_type: 'monk',
  });
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog
  const [deletePreacher, setDeletePreacher] = useState<Preacher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchPreachers();
    fetchPrograms();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('preachers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchPreachers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const fetchPreachers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name_english');

      if (error) throw error;
      setPreachers(data || []);
    } catch (error) {
      console.error('Error fetching preachers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch preachers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('id, name_english, name_sinhala')
        .eq('is_active', true)
        .order('name_english');

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchPreacherPrograms = async (preacherId: string) => {
    try {
      const { data, error } = await supabase
        .from('program_preachers')
        .select('program_id')
        .eq('profile_id', preacherId);

      if (error) throw error;
      return (data || []).map((p: PreacherProgram) => p.program_id);
    } catch (error) {
      console.error('Error fetching preacher programs:', error);
      return [];
    }
  };

  const openCreateModal = () => {
    setEditingPreacher(null);
    setFormData({
      name_english: '',
      name_sinhala: '',
      photo_url: '',
      biography: '',
      profile_type: 'monk',
    });
    setSelectedPrograms([]);
    setIsModalOpen(true);
  };

  const openEditModal = async (preacher: Preacher) => {
    setEditingPreacher(preacher);
    setFormData({
      name_english: preacher.name_english,
      name_sinhala: preacher.name_sinhala,
      photo_url: preacher.photo_url || '',
      biography: preacher.biography || '',
      profile_type: preacher.profile_type || 'monk',
    });
    
    // Fetch linked programs
    const linkedPrograms = await fetchPreacherPrograms(preacher.id);
    setSelectedPrograms(linkedPrograms);
    
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // Validation
    const trimmedEnglish = formData.name_english.trim();
    const trimmedSinhala = formData.name_sinhala.trim();

    if (!trimmedEnglish) {
      toast({
        title: 'Validation Error',
        description: 'Name (English) is required',
        variant: 'destructive',
      });
      return;
    }

    if (!trimmedSinhala) {
      toast({
        title: 'Validation Error',
        description: 'Name (Sinhala) is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.profile_type) {
      toast({
        title: 'Validation Error',
        description: 'Profile type is required',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicate names (excluding current preacher if editing)
    const duplicateCheck = preachers.find(p => 
      p.name_english.toLowerCase() === trimmedEnglish.toLowerCase() &&
      p.id !== editingPreacher?.id
    );

    if (duplicateCheck) {
      toast({
        title: 'Duplicate Name',
        description: 'A preacher with this English name already exists',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      let preacherId: string;

      if (editingPreacher) {
        // Update existing
        const { error } = await supabase
          .from('profiles')
          .update({
            name_english: trimmedEnglish,
            name_sinhala: trimmedSinhala,
            photo_url: formData.photo_url.trim() || null,
            biography: formData.biography.trim() || null,
            profile_type: formData.profile_type,
          })
          .eq('id', editingPreacher.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        preacherId = editingPreacher.id;

        // Update local state immediately
        setPreachers(prev =>
          prev.map(p => p.id === editingPreacher.id ? {
            ...p,
            name_english: trimmedEnglish,
            name_sinhala: trimmedSinhala,
            photo_url: formData.photo_url.trim() || null,
            biography: formData.biography.trim() || null,
            profile_type: formData.profile_type,
          } : p)
        );

        toast({ 
          title: 'Success', 
          description: 'Preacher updated successfully' 
        });
      } else {
        // Create new
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            name_english: trimmedEnglish,
            name_sinhala: trimmedSinhala,
            photo_url: formData.photo_url.trim() || null,
            biography: formData.biography.trim() || null,
            profile_type: formData.profile_type,
          })
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }

        preacherId = data.id;

        // Update local state immediately
        setPreachers(prev => [...prev, data]);
        
        toast({ 
          title: 'Success', 
          description: 'Preacher created successfully' 
        });
      }

      // Update program links
      await updateProgramLinks(preacherId, selectedPrograms);

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving:', error);
      
      let errorMessage = 'Failed to save preacher';
      
      if (error.message?.includes('row-level security')) {
        errorMessage = 'Permission denied. Please make sure you are logged in as an admin.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateProgramLinks = async (preacherId: string, programIds: string[]) => {
    try {
      // Delete existing links
      await supabase
        .from('program_preachers')
        .delete()
        .eq('profile_id', preacherId);

      // Insert new links
      if (programIds.length > 0) {
        const links = programIds.map(programId => ({
          program_id: programId,
          profile_id: preacherId,
        }));

        const { error } = await supabase
          .from('program_preachers')
          .insert(links);

        if (error) {
          console.error('Error updating program links:', error);
        }
      }
    } catch (error) {
      console.error('Error updating program links:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletePreacher) return;

    setIsDeleting(true);
    try {
      // Delete program links first
      await supabase
        .from('program_preachers')
        .delete()
        .eq('profile_id', deletePreacher.id);

      // Delete preacher
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deletePreacher.id);

      if (error) throw error;

      setPreachers(prev => prev.filter(p => p.id !== deletePreacher.id));
      toast({ 
        title: 'Success', 
        description: 'Preacher deleted successfully' 
      });
      setDeletePreacher(null);
    } catch (error: any) {
      console.error('Error deleting:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete preacher',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleProgramSelection = (programId: string) => {
    setSelectedPrograms(prev => 
      prev.includes(programId)
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };

  const filteredPreachers = preachers.filter(p => {
    const matchesSearch = p.name_english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name_sinhala.includes(searchQuery);
    const matchesType = filterType === 'all' || p.profile_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Preachers</h1>
          <p className="text-muted-foreground">Manage monks and lay speakers</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Preacher
        </Button>
      </motion.div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search preachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button
            variant={filterType === 'monk' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('monk')}
          >
            Monks
          </Button>
          <Button
            variant={filterType === 'lay_speaker' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('lay_speaker')}
          >
            Lay Speakers
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredPreachers.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <p className="text-muted-foreground">No preachers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPreachers.map((preacher, index) => (
            <motion.div
              key={preacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                {preacher.photo_url ? (
                  <img
                    src={preacher.photo_url}
                    alt={preacher.name_english}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {preacher.name_english.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {preacher.name_english}
                  </h3>
                  <p className="text-sm text-muted-foreground font-sinhala truncate">
                    {preacher.name_sinhala}
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs capitalize">
                    {preacher.profile_type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {preacher.biography && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {preacher.biography}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditModal(preacher)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setDeletePreacher(preacher)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPreacher ? 'Edit Preacher' : 'Add New Preacher'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Profile Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.profile_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, profile_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Name (English) <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formData.name_english}
                onChange={(e) => setFormData(prev => ({ ...prev, name_english: e.target.value }))}
                placeholder={formData.profile_type === 'monk' ? 'Venerable Monk Name' : 'Speaker Name'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Name (Sinhala) <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formData.name_sinhala}
                onChange={(e) => setFormData(prev => ({ ...prev, name_sinhala: e.target.value }))}
                placeholder={formData.profile_type === 'monk' ? 'ස්වාමීන් වහන්සේගේ නාමය' : 'දේශකයාගේ නාමය'}
                className="font-sinhala"
              />
            </div>

            <ImageUpload
              value={formData.photo_url}
              onChange={(url) => setFormData(prev => ({ ...prev, photo_url: url }))}
              label="Profile Photo"
              folder="profiles"
              placeholder="https://example.com/photo.jpg"
            />

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Biography / Temple / Notes
              </Label>
              <Textarea
                value={formData.biography}
                onChange={(e) => setFormData(prev => ({ ...prev, biography: e.target.value }))}
                placeholder={formData.profile_type === 'monk' ? 'Temple name and brief biography...' : 'Brief description...'}
                rows={3}
              />
            </div>

            {/* Program Linking */}
            {programs.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-foreground mb-3 block">
                  Associated Programs
                </Label>
                <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-3 space-y-2">
                  {programs.map((program) => (
                    <div key={program.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`program-${program.id}`}
                        checked={selectedPrograms.includes(program.id)}
                        onCheckedChange={() => toggleProgramSelection(program.id)}
                      />
                      <label
                        htmlFor={`program-${program.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {program.name_english}
                        <span className="text-muted-foreground ml-2 font-sinhala">
                          ({program.name_sinhala})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
                {selectedPrograms.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedPrograms.length} program(s) selected
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingPreacher ? 'Save Changes' : 'Create Preacher'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePreacher} onOpenChange={() => setDeletePreacher(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preacher?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deletePreacher?.name_english}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPreachers;
