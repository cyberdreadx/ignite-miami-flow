-- Temporarily allow all authenticated users to read profiles for debugging
CREATE POLICY "Debug: All authenticated users can read profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);