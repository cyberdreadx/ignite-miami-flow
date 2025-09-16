-- Add admin delete policy for tickets
CREATE POLICY "Admins can delete tickets" 
ON public.tickets 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = 'admin'
  )
);