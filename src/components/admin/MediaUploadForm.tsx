import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Youtube, Link, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon, FileText, Headphones, Video, ExternalLink, HardDrive, CloudDownload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useCreateMedia, 
  useUpdateMedia, 
  MediaItem, 
  MediaType, 
  extractYouTubeId, 
  getYouTubeThumbnail,
  uploadMediaFile 
} from '@/hooks/useMediaData';

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  video: 500 * 1024 * 1024, // 500MB
  audio: 100 * 1024 * 1024, // 100MB
  image: 10 * 1024 * 1024,  // 10MB
  document: 50 * 1024 * 1024, // 50MB
};

// Allowed file types
const ALLOWED_FILE_TYPES = {
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/aac'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const mediaSchema = z.object({
  title_sinhala: z.string().min(1, 'Title (Sinhala) is required').max(200, 'Title must be less than 200 characters'),
  title_english: z.string().max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  media_type: z.enum(['video', 'audio', 'image', 'document']),
  media_source: z.enum(['upload', 'external']),
  media_date: z.string().min(1, 'Date is required'),
  telecast_date: z.string().optional(),
  program_id: z.string().optional(),
  is_youtube: z.boolean(),
  youtube_url: z.string().optional(),
  external_url: z.string().optional(),
  duration: z.string().optional(),
  download_enabled: z.boolean(),
  download_url: z.string().optional(),
  preacher_ids: z.array(z.string()).optional(),
});

type MediaFormData = z.infer<typeof mediaSchema>;

const mediaTypeIcons = {
  video: Video,
  audio: Headphones,
  image: ImageIcon,
  document: FileText,
};

interface MediaUploadFormProps {
  editingItem: MediaItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MediaUploadForm({ editingItem, onSuccess, onCancel }: MediaUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(editingItem?.file_url || null);
  const [uploadedThumbnailUrl, setUploadedThumbnailUrl] = useState<string | null>(editingItem?.thumbnail_url || null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  const createMedia = useCreateMedia();
  const updateMedia = useUpdateMedia();

  // Fetch programs
  const { data: programs = [] } = useQuery({
    queryKey: ['programs-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('id, name_sinhala, name_english')
        .eq('is_active', true)
        .order('name_english');
      if (error) throw error;
      return data;
    },
  });

  // Fetch profiles (monks and lay speakers)
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name_sinhala, name_english, profile_type')
        .order('name_english');
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      title_sinhala: editingItem?.title_sinhala || '',
      title_english: editingItem?.title_english || '',
      description: editingItem?.description || '',
      media_type: editingItem?.media_type || 'video',
      media_source: editingItem?.download_url && !editingItem?.file_url ? 'external' : 'upload',
      media_date: editingItem?.media_date || new Date().toISOString().split('T')[0],
      telecast_date: editingItem?.telecast_date || '',
      program_id: editingItem?.program_id || '',
      is_youtube: editingItem?.is_youtube || false,
      youtube_url: editingItem?.youtube_id ? `https://youtube.com/watch?v=${editingItem.youtube_id}` : '',
      external_url: editingItem?.download_url || '',
      duration: editingItem?.duration || '',
      download_enabled: editingItem?.download_enabled || false,
      download_url: editingItem?.download_url || '',
      preacher_ids: editingItem?.preachers?.map(p => p.profile_id) || [],
    },
  });

  const mediaType = form.watch('media_type');
  const mediaSource = form.watch('media_source');
  const isYoutube = form.watch('is_youtube');
  const downloadEnabled = form.watch('download_enabled');
  const youtubeUrl = form.watch('youtube_url');
  const isExternalSource = mediaSource === 'external';

  // Auto-generate thumbnail for YouTube videos
  useEffect(() => {
    if (isYoutube && youtubeUrl) {
      const youtubeId = extractYouTubeId(youtubeUrl);
      if (youtubeId) {
        setUploadedThumbnailUrl(getYouTubeThumbnail(youtubeId));
      }
    }
  }, [isYoutube, youtubeUrl]);

  const validateFile = (file: File, type: 'file' | 'thumbnail'): string | null => {
    if (type === 'thumbnail') {
      if (!ALLOWED_FILE_TYPES.image.includes(file.type)) {
        return 'Thumbnail must be an image (JPEG, PNG, GIF, or WebP)';
      }
      if (file.size > FILE_SIZE_LIMITS.image) {
        return 'Thumbnail size must be less than 10MB';
      }
      return null;
    }

    const currentMediaType = form.getValues('media_type');
    const allowedTypes = ALLOWED_FILE_TYPES[currentMediaType];
    const sizeLimit = FILE_SIZE_LIMITS[currentMediaType];
    const sizeLimitMB = sizeLimit / (1024 * 1024);

    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type for ${currentMediaType}. Allowed: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }
    if (file.size > sizeLimit) {
      return `File size must be less than ${sizeLimitMB}MB for ${currentMediaType}`;
    }
    return null;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    
    // Validate file
    const validationError = validateFile(file, type);
    if (validationError) {
      setUploadError(validationError);
      e.target.value = ''; // Reset input
      return;
    }

    setIsUploading(true);
    setUploadProgress(`Uploading ${type === 'thumbnail' ? 'thumbnail' : 'file'}...`);
    
    try {
      const bucket = type === 'thumbnail' ? 'media-thumbnails' : 'media';
      const url = await uploadMediaFile(file, bucket);
      
      if (type === 'thumbnail') {
        setUploadedThumbnailUrl(url);
        setUploadProgress('Thumbnail uploaded successfully!');
      } else {
        setUploadedFileUrl(url);
        setUploadProgress('File uploaded successfully!');
      }
      
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const onSubmit = async (data: MediaFormData) => {
    const youtubeId = data.is_youtube && data.youtube_url ? extractYouTubeId(data.youtube_url) : null;
    const isExternal = data.media_source === 'external';

    // For external sources (Google Drive), require thumbnail
    if (isExternal && !uploadedThumbnailUrl) {
      setUploadError('Thumbnail is required for external link-based media');
      return;
    }

    // For images, use the file URL as the thumbnail if no separate thumbnail was uploaded
    const thumbnailUrl = data.media_type === 'image' 
      ? (uploadedThumbnailUrl || uploadedFileUrl || undefined)
      : (uploadedThumbnailUrl || undefined);

    // Determine the download URL - for external sources, use the external_url
    const downloadUrl = isExternal 
      ? (data.external_url || undefined)
      : (data.download_url || undefined);

    const mediaData = {
      title_sinhala: data.title_sinhala,
      title_english: data.title_english || undefined,
      description: data.description || undefined,
      media_type: data.media_type as MediaType,
      thumbnail_url: thumbnailUrl,
      duration: data.duration || undefined,
      media_date: data.media_date,
      telecast_date: data.telecast_date || null,
      program_id: data.program_id || null,
      is_youtube: data.is_youtube && !isExternal,
      youtube_id: youtubeId || undefined,
      file_url: isExternal ? undefined : (uploadedFileUrl || undefined),
      download_enabled: isExternal ? true : data.download_enabled, // External links are always downloadable
      download_url: downloadUrl,
      preacher_ids: data.preacher_ids || [],
    };

    if (editingItem) {
      await updateMedia.mutateAsync({ id: editingItem.id, ...mediaData });
    } else {
      await createMedia.mutateAsync(mediaData);
    }

    onSuccess();
  };

  const isPending = createMedia.isPending || updateMedia.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Error/Success Messages */}
        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        {uploadProgress && !uploadError && (
          <Alert className="border-emerald-500/50 bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <AlertDescription className="text-emerald-600">{uploadProgress}</AlertDescription>
          </Alert>
        )}

        {/* Media Type */}
        <FormField
          control={form.control}
          name="media_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Media Type *</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value);
                // Reset file when type changes
                setUploadedFileUrl(null);
                setUploadError('');
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(['video', 'audio', 'image', 'document'] as const).map((type) => {
                    const Icon = mediaTypeIcons[type];
                    return (
                      <SelectItem key={type} value={type}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormDescription>
                Max size: Video 500MB, Audio 100MB, Image 10MB, Document 50MB
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Media Source */}
        <FormField
          control={form.control}
          name="media_source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Media Source *</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    field.onChange('upload');
                    setUploadError('');
                  }}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    field.value === 'upload'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                  }`}
                >
                  <Upload className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Upload File</p>
                    <p className="text-xs text-muted-foreground">Upload from your device</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    field.onChange('external');
                    setUploadedFileUrl(null);
                    setUploadError('');
                  }}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    field.value === 'external'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                  }`}
                >
                  <CloudDownload className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">External Link</p>
                    <p className="text-xs text-muted-foreground">Google Drive or other URL</p>
                  </div>
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Titles */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title_sinhala"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title (Sinhala) *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="සිංහල මාතෘකාව" className="font-sinhala" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title_english"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title (English)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="English title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter description..." rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Program */}
        <FormField
          control={form.control}
          name="program_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="other" className="text-muted-foreground italic">
                    Other (No specific program)
                  </SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex flex-col">
                        <span>{p.name_english}</span>
                        <span className="text-xs text-muted-foreground font-sinhala">{p.name_sinhala}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preachers */}
        <FormField
          control={form.control}
          name="preacher_ids"
          render={() => (
            <FormItem>
              <FormLabel>Monks / Lay Speakers</FormLabel>
              <FormDescription>Select one or more preachers (optional)</FormDescription>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-secondary/30">
                {/* Group by profile type */}
                {['monk', 'lay_speaker'].map((type) => {
                  const typeProfiles = profiles.filter(p => p.profile_type === type);
                  if (typeProfiles.length === 0) return null;
                  return (
                    <div key={type} className="col-span-full">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-2 first:mt-0">
                        {type === 'monk' ? '🙏 Monks' : '👤 Lay Speakers'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {typeProfiles.map((profile) => (
                          <FormField
                            key={profile.id}
                            control={form.control}
                            name="preacher_ids"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0 bg-background/50 rounded-md px-2 py-1.5 hover:bg-background transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(profile.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, profile.id]);
                                      } else {
                                        field.onChange(current.filter((id) => id !== profile.id));
                                      }
                                    }}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                </FormControl>
                                <Label className="text-sm font-normal cursor-pointer flex-1 truncate">
                                  {profile.name_english}
                                </Label>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
                {profiles.length === 0 && (
                  <p className="col-span-full text-sm text-muted-foreground text-center py-4">
                    No preachers available. Add preachers in the Preachers section first.
                  </p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="media_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telecast_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telecast Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Date when this was broadcasted on TV</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Duration (for video/audio) */}
        {(mediaType === 'video' || mediaType === 'audio') && (
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 1:30:00 or 45:30" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* YouTube Toggle (for video with upload source) */}
        {mediaType === 'video' && !isExternalSource && (
          <FormField
            control={form.control}
            name="is_youtube"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>YouTube Video</FormLabel>
                  <p className="text-sm text-muted-foreground">Is this a YouTube video?</p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {/* YouTube URL */}
        {isYoutube && !isExternalSource && (
          <FormField
            control={form.control}
            name="youtube_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube URL</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    <Input {...field} placeholder="https://youtube.com/watch?v=..." className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* External URL (Google Drive, etc.) */}
        {isExternalSource && (
          <FormField
            control={form.control}
            name="external_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External Download Link *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <Input 
                      {...field} 
                      placeholder="https://drive.google.com/uc?export=download&id=..." 
                      className="pl-10" 
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  For Google Drive: Use the direct download link format
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Example: https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
                  </span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* File Upload - only for upload source */}
        {!isYoutube && !isExternalSource && (
          <div className="space-y-2">
            <Label>
              {mediaType === 'image' ? 'Upload Photo *' : 'Upload File'}
            </Label>
            {mediaType === 'image' && (
              <p className="text-sm text-muted-foreground">
                Supported formats: JPG, PNG, WEBP (Max 10MB)
              </p>
            )}
            <div className="flex items-center gap-4">
              <Input
                type="file"
                onChange={(e) => handleFileUpload(e, 'file')}
                disabled={isUploading}
                accept={
                  mediaType === 'video' ? 'video/*' :
                  mediaType === 'audio' ? 'audio/*' :
                  mediaType === 'image' ? 'image/jpeg,image/png,image/webp' :
                  '.pdf,.doc,.docx'
                }
              />
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {uploadedFileUrl && (
              <div className="space-y-2">
                <p className="text-sm text-emerald-600 flex items-center gap-1">
                  <Link className="h-3 w-3" />
                  {mediaType === 'image' ? 'Photo uploaded successfully' : 'File uploaded successfully'}
                </p>
                {mediaType === 'image' && (
                  <div className="relative inline-block">
                    <img 
                      src={uploadedFileUrl} 
                      alt="Uploaded photo preview" 
                      className="h-24 w-32 object-cover rounded-lg border border-border shadow-sm" 
                    />
                    <span className="absolute top-1 left-1 bg-emerald-600 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      Preview
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Thumbnail Upload - Required for external source, optional for uploaded video/audio */}
        {((mediaType === 'video' || mediaType === 'audio') && !isYoutube) || isExternalSource ? (
          <div className="space-y-2">
            <Label className={isExternalSource ? 'text-primary' : ''}>
              Thumbnail {isExternalSource ? '* (Required for external links)' : '(Optional)'}
            </Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                onChange={(e) => handleFileUpload(e, 'thumbnail')}
                disabled={isUploading}
                accept="image/*"
              />
              {uploadedThumbnailUrl && (
                <img src={uploadedThumbnailUrl} alt="Thumbnail" className="h-12 w-20 object-cover rounded" />
              )}
            </div>
            {isExternalSource && !uploadedThumbnailUrl && (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Please upload a thumbnail image for external link media
              </p>
            )}
          </div>
        ) : null}

        {/* Download Settings - Hidden for external sources as they're always downloadable */}
        {isExternalSource ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CloudDownload className="h-5 w-5" />
              <div>
                <p className="font-medium">External Link Media</p>
                <p className="text-sm text-muted-foreground">
                  Download is automatically enabled for external link-based media. 
                  Users will be redirected to the provided link when clicking Download.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-4">
            <FormField
              control={form.control}
              name="download_enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Download</FormLabel>
                    <FormDescription>Allow users to download this media from the library</FormDescription>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {downloadEnabled && (
              <FormField
                control={form.control}
                name="download_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Download URL (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://example.com/file.mp4" 
                        className="bg-background"
                      />
                    </FormControl>
                    <FormDescription>Leave empty to use the uploaded file URL</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending || isUploading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isPending || isUploading}
            className="bg-primary hover:bg-primary/90 min-w-[120px]"
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editingItem ? 'Update' : 'Upload'} Media
          </Button>
        </div>
      </form>
    </Form>
  );
}
