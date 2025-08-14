-- Add admin/moderator policy for viewing all tickets
CREATE POLICY "Admins and moderators can view all tickets" 
ON public.tickets 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND (role = 'admin' OR role = 'moderator')
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND (role = 'admin' OR role = 'moderator')
  )
);