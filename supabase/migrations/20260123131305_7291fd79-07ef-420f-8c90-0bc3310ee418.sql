-- Add display_order column to programs table
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Add display_order column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Add telecast_date column to media_items table
ALTER TABLE public.media_items 
ADD COLUMN IF NOT EXISTS telecast_date date;

-- Create site_settings table for home logo and other site-wide settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view site settings (for frontend to show logo)
CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Only admins can manage site settings
CREATE POLICY "Admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default home logo setting
INSERT INTO public.site_settings (setting_key, setting_value, is_active)
VALUES ('home_logo_url', NULL, true)
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for display_order on programs
CREATE INDEX IF NOT EXISTS idx_programs_display_order ON public.programs(display_order);

-- Create index for display_order on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_display_order ON public.profiles(display_order);

-- Create index for telecast_date on media_items
CREATE INDEX IF NOT EXISTS idx_media_items_telecast_date ON public.media_items(telecast_date);

-- Add trigger for updated_at on site_settings
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for site_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;