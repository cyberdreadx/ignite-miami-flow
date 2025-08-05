-- Create media_passes table to track photographer media pass purchases
CREATE TABLE public.media_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  pass_type TEXT NOT NULL CHECK (pass_type IN ('30', '150')),
  photographer_name TEXT NOT NULL,
  instagram_handle TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.media_passes ENABLE ROW LEVEL SECURITY;

-- Create policies for media passes
CREATE POLICY "Users can view their own media passes" 
ON public.media_passes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media passes" 
ON public.media_passes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow edge functions to manage media passes" 
ON public.media_passes 
FOR ALL 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_media_passes_updated_at
BEFORE UPDATE ON public.media_passes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();