import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Loader2, Calendar, Save, X, Image, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SpecialEvent {
  id: string;
  title_sinhala: string;
  title_english: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string;
  image_url: string | null;
  program_id: string | null;
  is_active: boolean;
  whatsapp_link: string | null;
}

interface Program {
  id: string;
  name_sinhala: string;
  name_english: string;
}

const AdminEvents = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<SpecialEvent[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SpecialEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title_sinhala: '',
    title_english: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    image_url: '',
    program_id: '',
    whatsapp_link: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, programsRes] = await Promise.all([
        supabase.from('special_events').select('*').order('start_datetime', { ascending: false }),
        supabase.from('programs').select('id, name_sinhala, name_english'),
      ]);

      if (eventsRes.error) throw eventsRes.error;
      if (programsRes.error) throw programsRes.error;

      setEvents(eventsRes.data || []);
      setPrograms(programsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch events',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingEvent(null);
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    setFormData({
      title_sinhala: '',
      title_english: '',
      description: '',
      start_datetime: format(now, "yyyy-MM-dd'T'HH:mm"),
      end_datetime: format(tomorrow, "yyyy-MM-dd'T'HH:mm"),
      image_url: '',
      program_id: '',
      whatsapp_link: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: SpecialEvent) => {
    setEditingEvent(event);
    setFormData({
      title_sinhala: event.title_sinhala,
      title_english: event.title_english,
      description: event.description || '',
      start_datetime: format(new Date(event.start_datetime), "yyyy-MM-dd'T'HH:mm"),
      end_datetime: format(new Date(event.end_datetime), "yyyy-MM-dd'T'HH:mm"),
      image_url: event.image_url || '',
      program_id: event.program_id || '',
      whatsapp_link: event.whatsapp_link || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title_english || !formData.title_sinhala) {
      toast({
        title: 'Error',
        description: 'Please fill in event titles',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.start_datetime || !formData.end_datetime) {
      toast({
        title: 'Error',
        description: 'Please set start and end times',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title_sinhala: formData.title_sinhala,
        title_english: formData.title_english,
        description: formData.description || null,
        start_datetime: new Date(formData.start_datetime).toISOString(),
        end_datetime: new Date(formData.end_datetime).toISOString(),
        image_url: formData.image_url || null,
        program_id: formData.program_id || null,
        whatsapp_link: formData.whatsapp_link || null,
        is_active: true,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('special_events')
          .update(payload)
          .eq('id', editingEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('special_events')
          .insert(payload);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: editingEvent ? 'Event updated' : 'Event created',
      });

      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error',
        description: 'Failed to save event',
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
        .from('special_events')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event deleted',
      });

      setDeleteId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    }
  };

  const getEventStatus = (event: SpecialEvent) => {
    const now = new Date();
    const start = new Date(event.start_datetime);
    const end = new Date(event.end_datetime);

    if (now < start) {
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Upcoming</Badge>;
    } else if (now >= start && now <= end) {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
    } else {
      return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Ended</Badge>;
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Special Events</h1>
          <p className="text-muted-foreground">Manage special broadcasts and events</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No special events yet</p>
          <Button className="mt-4" onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Event
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                {event.image_url && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={event.image_url}
                      alt={event.title_english}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{event.title_english}</h3>
                      <p className="text-muted-foreground font-sinhala">{event.title_sinhala}</p>
                    </div>
                    {getEventStatus(event)}
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(event.start_datetime), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <span>→</span>
                    <span>{format(new Date(event.end_datetime), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(event)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label>Title (English)</Label>
              <Input
                value={formData.title_english}
                onChange={e => setFormData(prev => ({ ...prev, title_english: e.target.value }))}
                placeholder="Enter event title"
              />
            </div>

            <div>
              <Label>Title (Sinhala)</Label>
              <Input
                value={formData.title_sinhala}
                onChange={e => setFormData(prev => ({ ...prev, title_sinhala: e.target.value }))}
                placeholder="සිදුවීමේ නම ඇතුළත් කරන්න"
                className="font-sinhala"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_datetime}
                  onChange={e => setFormData(prev => ({ ...prev, start_datetime: e.target.value }))}
                />
              </div>
              <div>
                <Label>End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_datetime}
                  onChange={e => setFormData(prev => ({ ...prev, end_datetime: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Event Image URL
              </Label>
              <Input
                value={formData.image_url}
                onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/event-banner.jpg"
              />
              {formData.image_url && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Related Program (Optional)</Label>
              <Select
                value={formData.program_id || 'none'}
                onValueChange={val => setFormData(prev => ({ ...prev, program_id: val === 'none' ? '' : val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No related program</SelectItem>
                  {programs.map(program => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name_english}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp Join Link (Optional)
              </Label>
              <Input
                value={formData.whatsapp_link}
                onChange={e => setFormData(prev => ({ ...prev, whatsapp_link: e.target.value }))}
                placeholder="https://wa.me/94771234567"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: https://wa.me/[country code][number] e.g., https://wa.me/94771234567
              </p>
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
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this event.
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

export default AdminEvents;
