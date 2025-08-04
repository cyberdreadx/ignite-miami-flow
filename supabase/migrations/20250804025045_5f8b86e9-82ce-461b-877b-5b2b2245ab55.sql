-- Temporary function to debug auth.uid()
CREATE OR REPLACE FUNCTION debug_auth_uid()
RETURNS TABLE(current_uid uuid, profile_exists boolean, profile_data json)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    auth.uid() as current_uid,
    EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid()) as profile_exists,
    to_json(profiles.*) as profile_data
  FROM profiles 
  WHERE user_id = auth.uid()
  UNION ALL
  SELECT 
    auth.uid() as current_uid,
    false as profile_exists,
    NULL as profile_data
  WHERE NOT EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid());
$$;