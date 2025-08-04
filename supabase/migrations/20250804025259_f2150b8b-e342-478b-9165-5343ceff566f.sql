-- Fix the debug function with proper search path
CREATE OR REPLACE FUNCTION debug_auth_uid()
RETURNS TABLE(current_uid uuid, profile_exists boolean, profile_data json)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    auth.uid() as current_uid,
    EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid()) as profile_exists,
    to_json(public.profiles.*) as profile_data
  FROM public.profiles 
  WHERE user_id = auth.uid()
  UNION ALL
  SELECT 
    auth.uid() as current_uid,
    false as profile_exists,
    NULL as profile_data
  WHERE NOT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid());
$$;