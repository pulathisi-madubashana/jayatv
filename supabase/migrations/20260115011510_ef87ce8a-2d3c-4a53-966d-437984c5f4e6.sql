-- Fix SQL injection vulnerability in has_permission function by adding explicit validation
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result boolean;
BEGIN
    -- First check if user is admin
    IF NOT public.has_role(_user_id, 'admin'::app_role) THEN
        RETURN false;
    END IF;
    
    -- SECURITY FIX: Validate that permission name is in the allowed list
    -- This prevents SQL injection via column name manipulation
    IF _permission NOT IN (
        'programs_view', 'programs_add', 'programs_edit', 'programs_delete',
        'schedule_view', 'schedule_add', 'schedule_edit', 'schedule_delete',
        'requests_view', 'requests_approve', 'requests_reject', 'requests_delete',
        'events_view', 'events_manage',
        'admin_users_manage',
        'preachers_view', 'preachers_add', 'preachers_edit', 'preachers_delete'
    ) THEN
        RETURN false;
    END IF;
    
    -- Then check specific permission (now safe since we validated the column name)
    EXECUTE format('SELECT %I FROM public.admin_permissions WHERE user_id = $1', _permission)
    INTO result
    USING _user_id;
    
    RETURN COALESCE(result, false);
END;
$$;