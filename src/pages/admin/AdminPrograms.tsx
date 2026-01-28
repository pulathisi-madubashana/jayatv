import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Program {
  id: string;
  name_sinhala: string;
  name_english: string;
  description: string | null;
  logo_url: string | null;
}

interface Profile {
  id: string;
  name_sinhala: string;
  name_english: string;
  photo_url: string | null;
  profile_type: string;
}

interface ProgramPreacher {
  program_id: string;
  profile_id: string;
}

const AdminPrograms = () => {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [programPreachers, setProgramPreachers] = useState<ProgramPreacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedPreacherIds, setSelectedPreacherIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [programsRes, profilesRes, ppRes] = await Promise.all([
        supabase.from('programs').select('*').order('name_english'),
        supabase.from('profiles').select('*').order('name_english'),
        supabase.from('program_preachers').select('*'),
      ]);

      if (programsRes.error) throw programsRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (ppRes.error) throw ppRes.error;

      setPrograms(programsRes.data || []);
      setProfiles(profilesRes.data || []);
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

  const getPreachersForProgram = (programId: string) => {
    const preacherIds = programPreachers
      .filter(pp => pp.program_id === programId)
      .map(pp => pp.profile_id);
    return profiles.filter(p => preacherIds.includes(p.id));
  };

  const openEditModal = (program: Program) => {
    setSelectedProgram(program);
    const currentIds = programPreachers
      .filter(pp => pp.program_id === program.id)
      .map(pp => pp.profile_id);
    setSelectedPreacherIds(currentIds);
  };

  const togglePreacher = (preacherId: string) => {
    setSelectedPreacherIds(prev => 
      prev.includes(preacherId)
        ? prev.filter(id => id !== preacherId)
        : [...prev, preacherId]
    );
  };

  const savePreacherAssignments = async () => {
    if (!selectedProgram) return;

    setIsSaving(true);
    try {
      // Delete existing assignments
      await supabase
        .from('program_preachers')
        .delete()
        .eq('program_id', selectedProgram.id);

      // Insert new assignments
      if (selectedPreacherIds.length > 0) {
        const newAssignments = selectedPreacherIds.map(profileId => ({
          program_id: selectedProgram.id,
          profile_id: profileId,
        }));

        const { error } = await supabase
          .from('program_preachers')
          .insert(newAssignments);

        if (error) throw error;
      }

      // Update local state
      setProgramPreachers(prev => [
        ...prev.filter(pp => pp.program_id !== selectedProgram.id),
        ...selectedPreacherIds.map(profileId => ({
          program_id: selectedProgram.id,
          profile_id: profileId,
        })),
      ]);

      toast({
        title: 'Success',
        description: 'Preacher assignments updated',
      });

      setSelectedProgram(null);
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPrograms = programs.filter(p =>
    p.name_english.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name_sinhala.includes(searchQuery)
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Programs</h1>
        <p className="text-muted-foreground">Manage program-preacher associations</p>
      </motion.div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program, index) => {
            const preachers = getPreachersForProgram(program.id);
            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => openEditModal(program)}
              >
                <div className="flex items-start gap-4 mb-4">
                  {program.logo_url ? (
                    <img
                      src={program.logo_url}
                      alt={program.name_english}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {program.name_english.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {program.name_english}
                    </h3>
                    <p className="text-sm text-muted-foreground font-sinhala truncate">
                      {program.name_sinhala}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{preachers.length} Preacher{preachers.length !== 1 ? 's' : ''}</span>
                </div>

                {preachers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {preachers.slice(0, 3).map(p => (
                      <Badge key={p.id} variant="secondary" className="text-xs">
                        {p.name_english}
                      </Badge>
                    ))}
                    {preachers.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{preachers.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={!!selectedProgram} onOpenChange={() => setSelectedProgram(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Preachers to {selectedProgram?.name_english}</DialogTitle>
          </DialogHeader>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select preachers who conduct this program
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {profiles.map(profile => (
                <div
                  key={profile.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPreacherIds.includes(profile.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => togglePreacher(profile.id)}
                >
                  {profile.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={profile.name_english}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {profile.name_english.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {profile.name_english}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {profile.profile_type.replace('_', ' ')}
                    </p>
                  </div>
                  {selectedPreacherIds.includes(profile.id) && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedProgram(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={savePreacherAssignments}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPrograms;
