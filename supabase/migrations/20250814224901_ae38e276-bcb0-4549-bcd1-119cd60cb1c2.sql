-- Fix infinite recursion by dropping problematic policy and creating security definer functions
DROP POLICY IF EXISTS "Admins and moderators can view all profiles" ON public.profiles;

-- Create security definer function to get current user role from profiles table
CREATE OR REPLACE FUNCTION public.get_current_user_role_from_profiles()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user has admin/moderator role in user_roles table
CREATE OR REPLACE FUNCTION public.current_user_has_admin_or_moderator_role()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create new policy using security definer functions to avoid recursion
CREATE POLICY "Admins and moderators can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_current_user_role_from_profiles() IN ('admin', 'moderator')
  OR public.current_user_has_admin_or_moderator_role()
);