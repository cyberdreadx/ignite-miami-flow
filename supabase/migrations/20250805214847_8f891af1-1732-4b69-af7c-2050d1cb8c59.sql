-- Allow public access to basic profile info for ticket verification
CREATE POLICY "Allow public access to basic profile info for verification" 
ON public.profiles 
FOR SELECT 
TO anon 
USING (true);