-- Fix security warnings by setting proper search_path for functions
CREATE OR REPLACE FUNCTION public.get_current_user_role_from_profiles()
RETURNS TEXT 
SECURITY DEFINER 
STABLE
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL;

-- Fix security warnings by setting proper search_path for functions  
CREATE OR REPLACE FUNCTION public.current_user_has_admin_or_moderator_role()
RETURNS BOOLEAN 
SECURITY DEFINER 
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
  );
$$ LANGUAGE SQL;