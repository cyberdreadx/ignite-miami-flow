-- Add admin/moderator policy for viewing all profiles for admin purposes
CREATE POLICY "Admins and moderators can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.user_id = auth.uid() 
      AND (admin_profile.role = 'admin' OR admin_profile.role = 'moderator')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND (role = 'admin' OR role = 'moderator')
  )
);