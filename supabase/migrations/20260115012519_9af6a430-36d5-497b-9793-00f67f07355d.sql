-- Fix overly permissive RLS policies by restricting "Service role" policies
-- These policies should only apply when using the service_role key (server-side)
-- The service_role bypasses RLS by default, so these policies are actually redundant
-- We'll drop them since service_role already has full access

-- Drop redundant service role policies (service_role bypasses RLS by default)
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage programs" ON public.programs;
DROP POLICY IF EXISTS "Service role can manage videos" ON public.youtube_videos;
DROP POLICY IF EXISTS "Service role can manage sync log" ON public.sync_log;

-- Add proper admin management policies where missing
-- Profiles: Allow admins to manage profiles
CREATE POLICY "Admins can manage profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- YouTube videos: Allow admins to manage videos
CREATE POLICY "Admins can manage videos"
ON public.youtube_videos
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Sync log: Allow admins to manage sync log
CREATE POLICY "Admins can manage sync log"
ON public.sync_log
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));