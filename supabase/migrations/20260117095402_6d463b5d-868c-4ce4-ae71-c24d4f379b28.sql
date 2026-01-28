-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.programs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.program_preachers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.program_schedule;