import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type MediaType = 'video' | 'audio' | 'image' | 'document';

export interface MediaItem {
  id: string;
  title_sinhala: string;
  title_english: string | null;
  description: string | null;
  media_type: MediaType;
  thumbnail_url: string | null;
  duration: string | null;
  media_date: string;
  telecast_date: string | null;
  program_id: string | null;
  is_youtube: boolean;
  youtube_id: string | null;
  file_url: string | null;
  download_enabled: boolean;
  download_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  program?: {
    id: string;
    name_sinhala: string;
    name_english: string;
  } | null;
  preachers?: {
    id: string;
    profile_id: string;
    profile: {
      id: string;
      name_sinhala: string;
      name_english: string;
      profile_type: string;
    };
  }[];
}

export interface CreateMediaInput {
  title_sinhala: string;
  title_english?: string;
  description?: string;
  media_type: MediaType;
  thumbnail_url?: string;
  duration?: string;
  media_date: string;
  telecast_date?: string | null;
  program_id?: string | null;
  is_youtube: boolean;
  youtube_id?: string;
  file_url?: string;
  download_enabled: boolean;
  download_url?: string;
  preacher_ids?: string[];
}

export interface UpdateMediaInput extends CreateMediaInput {
  id: string;
}

// Fetch all media items with related data
export function useMediaItems(type?: MediaType | 'all') {
  return useQuery({
    queryKey: ['media-items', type],
    queryFn: async () => {
      let query = supabase
        .from('media_items')
        .select(`
          *,
          program:programs(id, name_sinhala, name_english),
          preachers:media_preachers(
            id,
            profile_id,
            profile:profiles(id, name_sinhala, name_english, profile_type)
          )
        `)
        .order('media_date', { ascending: false });

      if (type && type !== 'all') {
        query = query.eq('media_type', type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching media items:', error);
        throw error;
      }

      return data as MediaItem[];
    },
  });
}

// Create media item
export function useCreateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMediaInput) => {
      const { preacher_ids, ...mediaData } = input;

      // Insert media item
      const { data: media, error: mediaError } = await supabase
        .from('media_items')
        .insert(mediaData)
        .select()
        .single();

      if (mediaError) throw mediaError;

      // Insert preacher associations
      if (preacher_ids && preacher_ids.length > 0) {
        const preacherData = preacher_ids.map(profile_id => ({
          media_id: media.id,
          profile_id,
        }));

        const { error: preacherError } = await supabase
          .from('media_preachers')
          .insert(preacherData);

        if (preacherError) throw preacherError;
      }

      return media;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-items'] });
      toast({
        title: 'Success',
        description: 'Media item created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Update media item
export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMediaInput) => {
      const { id, preacher_ids, ...mediaData } = input;

      // Update media item
      const { data: media, error: mediaError } = await supabase
        .from('media_items')
        .update(mediaData)
        .eq('id', id)
        .select()
        .single();

      if (mediaError) throw mediaError;

      // Delete existing preacher associations
      const { error: deleteError } = await supabase
        .from('media_preachers')
        .delete()
        .eq('media_id', id);

      if (deleteError) throw deleteError;

      // Insert new preacher associations
      if (preacher_ids && preacher_ids.length > 0) {
        const preacherData = preacher_ids.map(profile_id => ({
          media_id: id,
          profile_id,
        }));

        const { error: preacherError } = await supabase
          .from('media_preachers')
          .insert(preacherData);

        if (preacherError) throw preacherError;
      }

      return media;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-items'] });
      toast({
        title: 'Success',
        description: 'Media item updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Delete media item
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-items'] });
      toast({
        title: 'Success',
        description: 'Media item deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Helper to extract YouTube ID from URL
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Helper to get YouTube thumbnail
export function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
}

// Upload file to storage
export async function uploadMediaFile(file: File, bucket: 'media' | 'media-thumbnails'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
