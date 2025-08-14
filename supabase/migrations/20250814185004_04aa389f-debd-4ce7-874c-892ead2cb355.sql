-- Remove the recursive policy that's still causing infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles for management" ON public.profiles;

-- Also remove the duplicate policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;