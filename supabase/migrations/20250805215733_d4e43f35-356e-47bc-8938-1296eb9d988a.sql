-- Allow moderators and admins to update any ticket (for marking as used)
CREATE POLICY "Moderators and admins can update any ticket" 
ON public.tickets 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
    WHERE p.user_id = auth.uid() 
    AND (p.role = 'admin' OR ur.role = 'moderator' OR ur.role = 'admin')
  )
);