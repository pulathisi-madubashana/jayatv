-- Create media_items table for storing all media content
CREATE TABLE public.media_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_sinhala TEXT NOT NULL,
  title_english TEXT,
  description TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'audio', 'image', 'document')),
  thumbnail_url TEXT,
  duration TEXT,
  media_date DATE NOT NULL DEFAULT CURRENT_DATE,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  is_youtube BOOLEAN NOT NULL DEFAULT false,
  youtube_id TEXT,
  file_url TEXT,
  download_enabled BOOLEAN NOT NULL DEFAULT false,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for media to preacher many-to-many relationship
CREATE TABLE public.media_preachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id UUID NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(media_id, profile_id)
);

-- Add media permissions to admin_permissions table
ALTER TABLE public.admin_permissions
ADD COLUMN IF NOT EXISTS media_view BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS media_add BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS media_edit BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS media_delete BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS on media_items
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on media_preachers
ALTER TABLE public.media_preachers ENABLE ROW LEVEL SECURITY;

-- Public can view all media items
CREATE POLICY "Anyone can view media items"
ON public.media_items
FOR SELECT
USING (true);

-- Admins with media permissions can manage media items
CREATE POLICY "Admins with media_add can insert media"
ON public.media_items
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND 
  (SELECT media_add FROM public.admin_permissions WHERE user_id = auth.uid())
);

CREATE POLICY "Admins with media_edit can update media"
ON public.media_items
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND 
  (SELECT media_edit FROM public.admin_permissions WHERE user_id = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND 
  (SELECT media_edit FROM public.admin_permissions WHERE user_id = auth.uid())
);

CREATE POLICY "Admins with media_delete can delete media"
ON public.media_items
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND 
  (SELECT media_delete FROM public.admin_permissions WHERE user_id = auth.uid())
);

-- Public can view media_preachers
CREATE POLICY "Anyone can view media preachers"
ON public.media_preachers
FOR SELECT
USING (true);

-- Admins with media permissions can manage media_preachers
CREATE POLICY "Admins with media_add can insert media preachers"
ON public.media_preachers
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND 
  (SELECT media_add FROM public.admin_permissions WHERE user_id = auth.uid())
);

CREATE POLICY "Admins with media_edit can update media preachers"
ON public.media_preachers
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND 
  (SELECT media_edit FROM public.admin_permissions WHERE user_id = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND 
  (SELECT media_edit FROM public.admin_permissions WHERE user_id = auth.uid())
);

CREATE POLICY "Admins with media_delete can delete media preachers"
ON public.media_preachers
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND 
  (SELECT media_delete FROM public.admin_permissions WHERE user_id = auth.uid())
);

-- Create updated_at trigger for media_items
CREATE TRIGGER update_media_items_updated_at
BEFORE UPDATE ON public.media_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for media thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-thumbnails', 'media-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media bucket
CREATE POLICY "Anyone can view media files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Admins can upload media files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  has_role(auth.uid(), 'admin'::app_role) AND
  (SELECT media_add FROM public.admin_permissions WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can update media files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  has_role(auth.uid(), 'admin'::app_role) AND
  (SELECT media_edit FROM public.admin_permissions WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can delete media files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  has_role(auth.uid(), 'admin'::app_role) AND
  (SELECT media_delete FROM public.admin_permissions WHERE user_id = auth.uid())
);

-- Storage policies for thumbnails bucket
CREATE POLICY "Anyone can view media thumbnails"
ON storage.objects
FOR SELECT
USING (bucket_id = 'media-thumbnails');

CREATE POLICY "Admins can upload media thumbnails"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media-thumbnails' AND
  has_role(auth.uid(), 'admin'::app_role) AND
  (SELECT media_add FROM public.admin_permissions WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can update media thumbnails"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media-thumbnails' AND
  has_role(auth.uid(), 'admin'::app_role) AND
  (SELECT media_edit FROM public.admin_permissions WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can delete media thumbnails"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media-thumbnails' AND
  has_role(auth.uid(), 'admin'::app_role) AND
  (SELECT media_delete FROM public.admin_permissions WHERE user_id = auth.uid())
);