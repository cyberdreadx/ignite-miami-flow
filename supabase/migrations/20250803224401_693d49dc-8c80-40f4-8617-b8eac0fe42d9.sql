-- Create a function to promote a user to admin (for initial setup)
-- This should be run manually in the SQL editor to set your first admin

-- Example usage (replace with your actual email):
-- SELECT promote_user_to_admin('your-email@example.com');

CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find the user by email
  SELECT au.id INTO user_record
  FROM auth.users au
  WHERE au.email = user_email;

  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Update or insert the user's role to admin
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (user_record.id, user_email, 'admin')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'admin';

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;