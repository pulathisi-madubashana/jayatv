import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Loader2, Save, ArrowUp, ArrowDown, FolderOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Program {
  id: string;
  name_sinhala: string;
  name_english: string;
  logo_url: string | null;
  is_active: boolean;
  display_order: number;
}

interface Profile {
  id: string;
  name_sinhala: string;
  name_english: string;
  photo_url: string | null;
  profile_type: string;
  display_order: number;
}

const AdminOrdering = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('programs');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileTypeFilter, setProfileTypeFilter] = useState<'monk' | 'lay_speaker'>('monk');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [programsRes, profilesRes] = await Promise.all([
        supabase.from('programs').select('id, name_sinhala, name_english, logo_url, is_active, display_order').order('display_order').order('name_english'),
        supabase.from('profiles').select('id, name_sinhala, name_english, photo_url, profile_type, display_order').order('display_order').order('name_english'),
      ]);

      if (programsRes.error) throw programsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setPrograms(programsRes.data || []);
      setProfiles(profilesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const moveItem = <T extends { id: string; display_order: number }>(
    items: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    direction: 'up' | 'down'
  ) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap items
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Update display_order values
    newItems.forEach((item, i) => {
      item.display_order = i + 1;
    });

    setItems(newItems);
  };

  const saveOrder = async (type: 'programs' | 'profiles') => {
    setIsSaving(true);
    try {
      const items = type === 'programs' ? programs : profiles;
      const table = type === 'programs' ? 'programs' : 'profiles';

      // Update each item's display_order
      for (const item of items) {
        const { error } = await supabase
          .from(table)
          .update({ display_order: item.display_order })
          .eq('id', item.id);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `${type === 'programs' ? 'Program' : 'Profile'} order saved successfully`,
      });
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: 'Error',
        description: 'Failed to save order',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProfiles = profiles.filter(p => p.profile_type === profileTypeFilter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Display Order</h1>
        <p className="text-muted-foreground">Control the order of programs and preachers on the website</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="programs" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Programs
          </TabsTrigger>
          <TabsTrigger value="profiles" className="gap-2">
            <Users className="w-4 h-4" />
            Preachers
          </TabsTrigger>
        </TabsList>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Drag or use arrows to reorder. Changes reflect on home page and programs list.
            </p>
            <Button onClick={() => saveOrder('programs')} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Order
            </Button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {programs.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-4 p-4 ${index !== programs.length - 1 ? 'border-b border-border' : ''} hover:bg-secondary/50 transition-colors`}
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="w-5 h-5 cursor-grab" />
                  <span className="text-sm font-mono w-8">{index + 1}</span>
                </div>

                {program.logo_url ? (
                  <img
                    src={program.logo_url}
                    alt={program.name_english}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{program.name_english}</p>
                  <p className="text-sm text-muted-foreground truncate font-sinhala">{program.name_sinhala}</p>
                </div>

                {!program.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveItem(programs, setPrograms, index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveItem(programs, setPrograms, index, 'down')}
                    disabled={index === programs.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {programs.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No programs found
              </div>
            )}
          </div>
        </TabsContent>

        {/* Profiles Tab */}
        <TabsContent value="profiles" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant={profileTypeFilter === 'monk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setProfileTypeFilter('monk')}
              >
                Monks
              </Button>
              <Button
                variant={profileTypeFilter === 'lay_speaker' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setProfileTypeFilter('lay_speaker')}
              >
                Lay Speakers
              </Button>
            </div>
            <Button onClick={() => saveOrder('profiles')} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Order
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Order affects display on home page featured section and preachers list.
          </p>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {filteredProfiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-4 p-4 ${index !== filteredProfiles.length - 1 ? 'border-b border-border' : ''} hover:bg-secondary/50 transition-colors`}
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="w-5 h-5 cursor-grab" />
                  <span className="text-sm font-mono w-8">{index + 1}</span>
                </div>

                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.name_english}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{profile.name_english}</p>
                  <p className="text-sm text-muted-foreground truncate font-sinhala">{profile.name_sinhala}</p>
                </div>

                <Badge variant="outline">
                  {profile.profile_type === 'monk' ? 'Monk' : 'Lay Speaker'}
                </Badge>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      // Find actual index in full profiles array
                      const actualIndex = profiles.findIndex(p => p.id === profile.id);
                      moveItem(profiles, setProfiles, actualIndex, 'up');
                    }}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const actualIndex = profiles.findIndex(p => p.id === profile.id);
                      moveItem(profiles, setProfiles, actualIndex, 'down');
                    }}
                    disabled={index === filteredProfiles.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {filteredProfiles.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No {profileTypeFilter === 'monk' ? 'monks' : 'lay speakers'} found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOrdering;
