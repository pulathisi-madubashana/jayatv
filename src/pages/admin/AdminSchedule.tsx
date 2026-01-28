import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Loader2, Clock, Save, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScheduleItem {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  program_id: string | null;
  program_name_sinhala: string;
  program_name_english: string;
  is_active: boolean;
}

interface Program {
  id: string;
  name_sinhala: string;
  name_english: string;
}

interface Preacher {
  id: string;
  name_sinhala: string;
  name_english: string;
  profile_type: string;
}

interface ProgramPreacher {
  program_id: string;
  profile_id: string;
}

const DAYS = [
  { value: 0, label: 'Sunday', labelSi: 'ඉරිදා' },
  { value: 1, label: 'Monday', labelSi: 'සඳුදා' },
  { value: 2, label: 'Tuesday', labelSi: 'අඟහරුවාදා' },
  { value: 3, label: 'Wednesday', labelSi: 'බදාදා' },
  { value: 4, label: 'Thursday', labelSi: 'බ්‍රහස්පතින්දා' },
  { value: 5, label: 'Friday', labelSi: 'සිකුරාදා' },
  { value: 6, label: 'Saturday', labelSi: 'සෙනසුරාදා' },
];

const AdminSchedule = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [preachers, setPreachers] = useState<Preacher[]>([]);
  const [programPreachers, setProgramPreachers] = useState<ProgramPreacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('0');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    start_time: '06:00',
    end_time: '07:00',
    program_id: '',
    program_name_sinhala: '',
    program_name_english: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [schedulesRes, programsRes, preachersRes, ppRes] = await Promise.all([
        supabase.from('program_schedule').select('*').order('start_time'),
        supabase.from('programs').select('id, name_sinhala, name_english'),
        supabase.from('profiles').select('id, name_sinhala, name_english, profile_type'),
        supabase.from('program_preachers').select('*'),
      ]);

      if (schedulesRes.error) throw schedulesRes.error;
      if (programsRes.error) throw programsRes.error;
      if (preachersRes.error) throw preachersRes.error;
      if (ppRes.error) throw ppRes.error;

      setSchedules(schedulesRes.data || []);
      setPrograms(programsRes.data || []);
      setPreachers(preachersRes.data || []);
      setProgramPreachers(ppRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch schedule data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgramSelect = (programId: string) => {
    if (programId === 'custom') {
      setFormData(prev => ({
        ...prev,
        program_id: '',
        program_name_sinhala: '',
        program_name_english: '',
      }));
    } else {
      const program = programs.find(p => p.id === programId);
      if (program) {
        setFormData(prev => ({
          ...prev,
          program_id: programId,
          program_name_sinhala: program.name_sinhala,
          program_name_english: program.name_english,
        }));
      }
    }
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({
      start_time: '06:00',
      end_time: '07:00',
      program_id: '',
      program_name_sinhala: '',
      program_name_english: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormData({
      start_time: item.start_time.slice(0, 5),
      end_time: item.end_time.slice(0, 5),
      program_id: item.program_id || '',
      program_name_sinhala: item.program_name_sinhala,
      program_name_english: item.program_name_english,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.program_name_english || !formData.program_name_sinhala) {
      toast({
        title: 'Error',
        description: 'Please fill in program names',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        day_of_week: parseInt(selectedDay),
        start_time: formData.start_time,
        end_time: formData.end_time,
        program_id: formData.program_id || null,
        program_name_sinhala: formData.program_name_sinhala,
        program_name_english: formData.program_name_english,
        is_active: true,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('program_schedule')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('program_schedule')
          .insert(payload);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: editingItem ? 'Schedule updated' : 'Schedule added',
      });

      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to save schedule',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('program_schedule')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Schedule item deleted',
      });

      setDeleteId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      });
    }
  };

  const filteredSchedules = schedules.filter(
    s => s.day_of_week === parseInt(selectedDay)
  );

  // Get preachers for a program
  const getPreachersForProgram = (programId: string | null) => {
    if (!programId) return [];
    const preacherIds = programPreachers.filter(pp => pp.program_id === programId).map(pp => pp.profile_id);
    return preachers.filter(p => preacherIds.includes(p.id));
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Program Schedule</h1>
          <p className="text-muted-foreground">Manage daily broadcast schedule</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Time Slot
        </Button>
      </motion.div>

      <Tabs value={selectedDay} onValueChange={setSelectedDay}>
        <TabsList className="grid grid-cols-7 mb-6">
          {DAYS.map(day => (
            <TabsTrigger key={day.value} value={day.value.toString()} className="text-xs sm:text-sm">
              {day.label.slice(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>

        {DAYS.map(day => (
          <TabsContent key={day.value} value={day.value.toString()}>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-foreground">
                  {day.label} <span className="text-muted-foreground font-sinhala">({day.labelSi})</span>
                </h3>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : filteredSchedules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No schedule items for this day
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredSchedules.map((item, index) => {
                    const itemPreachers = getPreachersForProgram(item.program_id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2 text-primary">
                            <Clock className="w-4 h-4" />
                            <span className="font-mono text-sm">
                              {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{item.program_name_english}</p>
                            <p className="text-sm text-muted-foreground font-sinhala">{item.program_name_sinhala}</p>
                            {itemPreachers.length > 0 && (
                              <div className="flex items-center gap-2 mt-1">
                                <Users className="w-3 h-3 text-muted-foreground" />
                                <div className="flex flex-wrap gap-1">
                                  {itemPreachers.map(p => (
                                    <Badge key={p.id} variant="outline" className="text-xs">
                                      {p.name_english}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Time Slot' : 'Add Time Slot'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={e => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Select Program (or enter custom)</Label>
              <Select
                value={formData.program_id || 'custom'}
                onValueChange={handleProgramSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Program</SelectItem>
                  {programs.map(program => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name_english}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.program_id && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Assigned Preachers:</p>
                <div className="flex flex-wrap gap-1">
                  {getPreachersForProgram(formData.program_id).length > 0 ? (
                    getPreachersForProgram(formData.program_id).map(p => (
                      <Badge key={p.id} variant="secondary" className="text-xs">
                        {p.name_english} ({p.profile_type === 'monk' ? 'Monk' : 'Lay'})
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No preachers assigned to this program</span>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label>Program Name (English)</Label>
              <Input
                value={formData.program_name_english}
                onChange={e => setFormData(prev => ({ ...prev, program_name_english: e.target.value }))}
                placeholder="Enter program name in English"
              />
            </div>

            <div>
              <Label>Program Name (Sinhala)</Label>
              <Input
                value={formData.program_name_sinhala}
                onChange={e => setFormData(prev => ({ ...prev, program_name_sinhala: e.target.value }))}
                placeholder="වැඩසටහනේ නම ඇතුළත් කරන්න"
                className="font-sinhala"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this time slot from the schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSchedule;
