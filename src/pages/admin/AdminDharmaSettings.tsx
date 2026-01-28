import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Loader2, Search, Users, Upload, ImageIcon,
  Youtube, Link as LinkIcon, Play, CheckCircle2, AlertCircle, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import VideoPlayerModal from '@/components/media/VideoPlayerModal';
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

interface YouTubeVideo {
  id: string;
  youtube_id: string;
  title: string;
  thumbnail_url: string | null;
  duration: string | null;
  published_at: string | null;
  program_id: string | null;
  profile_id: string | null;
  auto_detected: boolean;
}

const PROFILE_TYPES = [
  { value: 'monk', label: 'Monk / ස්වාමීන් වහන්සේ' },
  { value: 'lay_speaker', label: 'Lay Speaker / ගිහි දේශක' },
];

const PROGRAM_CATEGORIES = [
  'Discussion',
  'Meditation',
  'Motivational',
  'Educational',
  'Sermon',
  'Other',
];

const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const AdminDharmaSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('programs');
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [programs, setPrograms] = useState<Program[]>([]);
  const [preachers, setPreachers] = useState<Preacher[]>([]);
  const [programPreachers, setProgramPreachers] = useState<ProgramPreacher[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);

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

  // YouTube modal
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubePreview, setYoutubePreview] = useState<{
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
  } | null>(null);
  const [isFetchingYouTube, setIsFetchingYouTube] = useState(false);
  const [youtubeFetchError, setYoutubeFetchError] = useState('');
  const [selectedVideoPrograms, setSelectedVideoPrograms] = useState<string[]>([]);
  const [selectedVideoPreachers, setSelectedVideoPreachers] = useState<string[]>([]);
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState<YouTubeVideo | null>(null);
  const [previewVideo, setPreviewVideo] = useState<{ youtubeId: string; title: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [preacherFilter, setPreacherFilter] = useState('all');
  const [videoSearchQuery, setVideoSearchQuery] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [programsRes, preachersRes, ppRes, videosRes] = await Promise.all([
        supabase.from('programs').select('*').order('name_english'),
        supabase.from('profiles').select('*').order('name_english'),
        supabase.from('program_preachers').select('*'),
        supabase.from('youtube_videos').select('*').order('published_at', { ascending: false }),
      ]);

      if (programsRes.error) throw programsRes.error;
      if (preachersRes.error) throw preachersRes.error;
      if (ppRes.error) throw ppRes.error;
      if (videosRes.error) throw videosRes.error;

      setPrograms(programsRes.data || []);
      setPreachers(preachersRes.data || []);
      setProgramPreachers(ppRes.data || []);
      setYoutubeVideos(videosRes.data || []);
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

  const toggleProgramRequest = async (program: Program) => {
    try {
      const { error } = await supabase
        .from('programs')
        .update({ allow_deshana_request: !program.allow_deshana_request })
        .eq('id', program.id);
      if (error) throw error;
      setPrograms(prev => prev.map(p =>
        p.id === program.id ? { ...p, allow_deshana_request: !p.allow_deshana_request } : p
      ));
    } catch (error) {
      console.error('Error toggling request status:', error);
      toast({ title: 'Error', description: 'Failed to update program', variant: 'destructive' });
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

  // ============ YOUTUBE VIDEOS ============
  const openYouTubeModal = () => {
    setYoutubeUrl('');
    setYoutubePreview(null);
    setYoutubeFetchError('');
    setSelectedVideoPrograms([]);
    setSelectedVideoPreachers([]);
    setIsYouTubeModalOpen(true);
  };

  const fetchYouTubeData = async () => {
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      setYoutubeFetchError('Invalid YouTube URL. Please enter a valid YouTube video link.');
      return;
    }

    // Check if video already exists
    const existingVideo = youtubeVideos.find(v => v.youtube_id === videoId);
    if (existingVideo) {
      setYoutubeFetchError('This video has already been added.');
      return;
    }

    setIsFetchingYouTube(true);
    setYoutubeFetchError('');

    try {
      // Fetch from YouTube Data API
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { videoId },
      });

      if (error) throw error;

      if (data?.title) {
        setYoutubePreview({
          id: videoId,
          title: data.title,
          thumbnail: data.thumbnail || getYouTubeThumbnail(videoId),
          duration: data.duration || '',
        });
      } else {
        // Fallback: Just use the video ID with auto-generated thumbnail
        setYoutubePreview({
          id: videoId,
          title: `YouTube Video - ${videoId}`,
          thumbnail: getYouTubeThumbnail(videoId),
          duration: '',
        });
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      // Fallback to basic info
      setYoutubePreview({
        id: videoId,
        title: `YouTube Video - ${videoId}`,
        thumbnail: getYouTubeThumbnail(videoId),
        duration: '',
      });
    } finally {
      setIsFetchingYouTube(false);
    }
  };

  const saveYouTubeVideo = async () => {
    if (!youtubePreview) return;

    setIsSavingVideo(true);
    try {
      // Save to youtube_videos table for admin tracking
      const videoData = {
        youtube_id: youtubePreview.id,
        title: youtubePreview.title,
        thumbnail_url: youtubePreview.thumbnail,
        duration: youtubePreview.duration || null,
        program_id: selectedVideoPrograms[0] || null,
        profile_id: selectedVideoPreachers[0] || null,
        auto_detected: false,
        published_at: new Date().toISOString(),
      };

      const { data: newVideo, error } = await supabase
        .from('youtube_videos')
        .insert(videoData)
        .select()
        .single();

      if (error) throw error;

      // ALSO save to media_items table for website display
      const mediaItemData = {
        title_sinhala: youtubePreview.title,
        title_english: youtubePreview.title,
        media_type: 'video',
        is_youtube: true,
        youtube_id: youtubePreview.id,
        thumbnail_url: youtubePreview.thumbnail,
        duration: youtubePreview.duration || null,
        program_id: selectedVideoPrograms[0] || null,
        media_date: new Date().toISOString().split('T')[0],
      };

      const { data: mediaItem, error: mediaError } = await supabase
        .from('media_items')
        .insert(mediaItemData)
        .select()
        .single();

      if (mediaError) {
        console.error('Error saving to media_items:', mediaError);
        // Continue anyway, youtube_videos was saved
      }

      // Link media item to preachers if selected
      if (mediaItem && selectedVideoPreachers.length > 0) {
        const preacherLinks = selectedVideoPreachers.map(preacherId => ({
          media_id: mediaItem.id,
          profile_id: preacherId,
        }));
        
        await supabase.from('media_preachers').insert(preacherLinks);
      }

      setYoutubeVideos(prev => [newVideo, ...prev]);
      toast({ title: 'Success', description: 'YouTube video added and linked successfully' });
      setIsYouTubeModalOpen(false);
    } catch (error) {
      console.error('Error saving video:', error);
      toast({ title: 'Error', description: 'Failed to save video', variant: 'destructive' });
    } finally {
      setIsSavingVideo(false);
    }
  };

  const deleteYouTubeVideo = async () => {
    if (!deletingVideo) return;
    try {
      // Delete from youtube_videos
      const { error } = await supabase.from('youtube_videos').delete().eq('id', deletingVideo.id);
      if (error) throw error;
      
      // Also delete from media_items (by youtube_id)
      await supabase.from('media_items').delete().eq('youtube_id', deletingVideo.youtube_id);
      
      setYoutubeVideos(prev => prev.filter(v => v.id !== deletingVideo.id));
      toast({ title: 'Success', description: 'Video deleted from all locations' });
      setDeletingVideo(null);
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({ title: 'Error', description: 'Failed to delete video', variant: 'destructive' });
    }
  };

  // Filters
  const filteredPrograms = programs.filter(p =>
    p.name_english.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name_sinhala.includes(searchQuery)
  );

  const filteredPreachers = preachers.filter(p => {
    const matchesSearch = p.name_english.toLowerCase().includes(searchQuery.toLowerCase()) || p.name_sinhala.includes(searchQuery);
    const matchesType = preacherFilter === 'all' || p.profile_type === preacherFilter;
    return matchesSearch && matchesType;
  });

  const filteredVideos = youtubeVideos.filter(v =>
    v.title.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
    v.youtube_id.includes(videoSearchQuery)
  );

  const requestablePrograms = programs.filter(p => p.allow_deshana_request);

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
        <h1 className="text-3xl font-bold text-foreground mb-2">Dharma Deshana Settings</h1>
        <p className="text-muted-foreground">
          Manage programs, preachers, and YouTube videos for Dharma Deshana requests
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-foreground">{programs.length}</p>
          <p className="text-sm text-muted-foreground">Total Programs</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-primary">{requestablePrograms.length}</p>
          <p className="text-sm text-muted-foreground">Requestable</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-foreground">{preachers.length}</p>
          <p className="text-sm text-muted-foreground">Preachers</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-red-500">{youtubeVideos.length}</p>
          <p className="text-sm text-muted-foreground">YouTube Videos</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="preachers">Preachers</TabsTrigger>
          <TabsTrigger value="youtube">YouTube Videos</TabsTrigger>
        </TabsList>

        {/* PROGRAMS TAB */}
        <TabsContent value="programs" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => openProgramModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Program
            </Button>
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
                  className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors"
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
                      <h3 className="font-semibold text-foreground truncate">{program.name_english}</h3>
                      <p className="text-sm text-muted-foreground font-sinhala truncate">{program.name_sinhala}</p>
                      {program.category && (
                        <Badge variant="secondary" className="mt-1 text-xs">{program.category}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{assignedPreachers.length} Preacher{assignedPreachers.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`request-${program.id}`} className="text-xs text-muted-foreground">
                        Requestable
                      </Label>
                      <Switch
                        id={`request-${program.id}`}
                        checked={program.allow_deshana_request}
                        onCheckedChange={() => toggleProgramRequest(program)}
                      />
                    </div>
                  </div>

                  {assignedPreachers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {assignedPreachers.slice(0, 3).map(p => (
                        <Badge key={p.id} variant="outline" className="text-xs">{p.name_english}</Badge>
                      ))}
                      {assignedPreachers.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{assignedPreachers.length - 3}</Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openAssignmentModal(program)}>
                      <Users className="w-4 h-4 mr-1" />
                      Assign Preachers
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openProgramModal(program)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeletingProgram(program)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredPrograms.length === 0 && (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground">No programs found</p>
              <Button className="mt-4" onClick={() => openProgramModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Program
              </Button>
            </div>
          )}
        </TabsContent>

        {/* PREACHERS TAB */}
        <TabsContent value="preachers" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search preachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={preacherFilter} onValueChange={setPreacherFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="monk">Monks</SelectItem>
                  <SelectItem value="lay_speaker">Lay Speakers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => openPreacherModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Preacher
            </Button>
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
                        <span className="text-2xl font-bold text-primary">{preacher.name_english.charAt(0)}</span>
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
                    <div className="flex flex-wrap gap-2 mb-4">
                      {assignedPrograms.slice(0, 2).map(prog => (
                        <Badge key={prog.id} variant="outline" className="text-xs">{prog.name_english}</Badge>
                      ))}
                      {assignedPrograms.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{assignedPrograms.length - 2}</Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => openPreacherModal(preacher)}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeletingPreacher(preacher)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredPreachers.length === 0 && (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground">No preachers found</p>
              <Button className="mt-4" onClick={() => openPreacherModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Preacher
              </Button>
            </div>
          )}
        </TabsContent>

        {/* YOUTUBE TAB */}
        <TabsContent value="youtube" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={videoSearchQuery}
                onChange={(e) => setVideoSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={openYouTubeModal} className="bg-red-600 hover:bg-red-700">
              <Youtube className="w-4 h-4 mr-2" />
              Add YouTube Video
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video, index) => {
              const program = programs.find(p => p.id === video.program_id);
              const preacher = preachers.find(p => p.id === video.profile_id);
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors group"
                >
                  <div className="aspect-video relative">
                    <img
                      src={video.thumbnail_url || getYouTubeThumbnail(video.youtube_id)}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => setPreviewVideo({ youtubeId: video.youtube_id, title: video.title })}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => setDeletingVideo(video)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {video.duration && (
                      <Badge className="absolute bottom-2 right-2 bg-black/80">{video.duration}</Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-foreground line-clamp-2 text-sm mb-2">{video.title}</h3>
                    <div className="flex flex-wrap gap-1">
                      {program && (
                        <Badge variant="outline" className="text-xs">{program.name_english}</Badge>
                      )}
                      {preacher && (
                        <Badge variant="secondary" className="text-xs">{preacher.name_english}</Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <Youtube className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No YouTube videos added yet</p>
              <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={openYouTubeModal}>
                <Youtube className="w-4 h-4 mr-2" />
                Add First Video
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Program Modal */}
      <Dialog open={isProgramModalOpen} onOpenChange={setIsProgramModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Edit Program' : 'Add Program'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name (English) *</Label>
                <Input
                  value={programForm.name_english}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, name_english: e.target.value }))}
                  placeholder="Program name"
                />
              </div>
              <div className="space-y-2">
                <Label>Name (Sinhala) *</Label>
                <Input
                  value={programForm.name_sinhala}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, name_sinhala: e.target.value }))}
                  placeholder="වැඩසටහනේ නම"
                  className="font-sinhala"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={programForm.description}
                onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Program description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={programForm.category}
                  onValueChange={(value) => setProgramForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="allow-request"
                  checked={programForm.allow_deshana_request}
                  onCheckedChange={(checked) => setProgramForm(prev => ({ ...prev, allow_deshana_request: checked }))}
                />
                <Label htmlFor="allow-request">Allow Dharma Deshana Requests</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProgramModalOpen(false)}>Cancel</Button>
            <Button onClick={saveProgram} disabled={isSavingProgram}>
              {isSavingProgram && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingProgram ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preacher Modal */}
      <Dialog open={isPreacherModalOpen} onOpenChange={setIsPreacherModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPreacher ? 'Edit Preacher' : 'Add Preacher'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name (English) *</Label>
                <Input
                  value={preacherForm.name_english}
                  onChange={(e) => setPreacherForm(prev => ({ ...prev, name_english: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Name (Sinhala) *</Label>
                <Input
                  value={preacherForm.name_sinhala}
                  onChange={(e) => setPreacherForm(prev => ({ ...prev, name_sinhala: e.target.value }))}
                  placeholder="සම්පූර්ණ නම"
                  className="font-sinhala"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={preacherForm.profile_type}
                onValueChange={(value) => setPreacherForm(prev => ({ ...prev, profile_type: value }))}
              >
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
            <ImageUpload
              value={preacherForm.photo_url}
              onChange={(url) => setPreacherForm(prev => ({ ...prev, photo_url: url }))}
              label="Profile Photo"
              folder="profiles"
              placeholder="https://example.com/photo.jpg"
            />
            <div className="space-y-2">
              <Label>Short Bio</Label>
              <Textarea
                value={preacherForm.biography}
                onChange={(e) => setPreacherForm(prev => ({ ...prev, biography: e.target.value }))}
                placeholder="Brief biography..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreacherModalOpen(false)}>Cancel</Button>
            <Button onClick={savePreacher} disabled={isSavingPreacher}>
              {isSavingPreacher && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingPreacher ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preacher Assignment Modal */}
      <Dialog open={!!assigningProgram} onOpenChange={() => setAssigningProgram(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Preachers to {assigningProgram?.name_english}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select preachers who will appear for this program in Dharma Deshana requests.
            </p>
            {['monk', 'lay_speaker'].map(type => {
              const typePreachers = preachers.filter(p => p.profile_type === type);
              if (typePreachers.length === 0) return null;
              return (
                <div key={type} className="space-y-2">
                  <h4 className="font-medium text-sm text-foreground">
                    {type === 'monk' ? 'Monks' : 'Lay Speakers'}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {typePreachers.map(preacher => (
                      <div
                        key={preacher.id}
                        onClick={() => togglePreacher(preacher.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedPreacherIds.includes(preacher.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {preacher.photo_url ? (
                          <img src={preacher.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">{preacher.name_english.charAt(0)}</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{preacher.name_english}</p>
                          <p className="text-xs text-muted-foreground font-sinhala">{preacher.name_sinhala}</p>
                        </div>
                        <Checkbox checked={selectedPreacherIds.includes(preacher.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssigningProgram(null)}>Cancel</Button>
            <Button onClick={savePreacherAssignments} disabled={isSavingAssignment}>
              {isSavingAssignment && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTube Add Modal */}
      <Dialog open={isYouTubeModalOpen} onOpenChange={setIsYouTubeModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              Add YouTube Video
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>YouTube URL *</Label>
              <div className="flex gap-2">
                <Input
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    setYoutubeFetchError('');
                    setYoutubePreview(null);
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1"
                />
                <Button
                  onClick={fetchYouTubeData}
                  disabled={!youtubeUrl || isFetchingYouTube}
                >
                  {isFetchingYouTube ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LinkIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {youtubeFetchError && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{youtubeFetchError}</AlertDescription>
                </Alert>
              )}
            </div>

            {youtubePreview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Alert className="border-emerald-500/50 bg-emerald-500/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <AlertDescription className="text-emerald-600">
                    Video found! Review the details below.
                  </AlertDescription>
                </Alert>

                <div className="bg-secondary/30 rounded-xl overflow-hidden">
                  <img
                    src={youtubePreview.thumbnail}
                    alt={youtubePreview.title}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-medium text-foreground">{youtubePreview.title}</h4>
                    {youtubePreview.duration && (
                      <p className="text-sm text-muted-foreground mt-1">Duration: {youtubePreview.duration}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Link to Program (optional)</Label>
                <Select
                    value={selectedVideoPrograms[0] || '_none'}
                    onValueChange={(val) => setSelectedVideoPrograms(val === '_none' ? [] : [val])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a program..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">No program</SelectItem>
                      {programs.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name_english}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Link to Preacher (optional)</Label>
                  <Select
                    value={selectedVideoPreachers[0] || '_none'}
                    onValueChange={(val) => setSelectedVideoPreachers(val === '_none' ? [] : [val])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a preacher..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">No preacher</SelectItem>
                      {preachers.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name_english} ({p.profile_type === 'monk' ? 'Monk' : 'Lay Speaker'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsYouTubeModalOpen(false)}>Cancel</Button>
            <Button
              onClick={saveYouTubeVideo}
              disabled={!youtubePreview || isSavingVideo}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSavingVideo && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <AlertDialog open={!!deletingProgram} onOpenChange={() => setDeletingProgram(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProgram?.name_english}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteProgram} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingPreacher} onOpenChange={() => setDeletingPreacher(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preacher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPreacher?.name_english}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deletePreacher} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingVideo} onOpenChange={() => setDeletingVideo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteYouTubeVideo} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Video Preview Modal */}
      {previewVideo && (
        <VideoPlayerModal
          isOpen={!!previewVideo}
          onClose={() => setPreviewVideo(null)}
          youtubeId={previewVideo.youtubeId}
          title={previewVideo.title}
        />
      )}
    </div>
  );
};

export default AdminDharmaSettings;
