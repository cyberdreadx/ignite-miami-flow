-- Create waiver_completions table to track signed waivers
CREATE TABLE public.waiver_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  waiver_url TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.waiver_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own waiver completions" 
ON public.waiver_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own waiver completions" 
ON public.waiver_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to check if user has completed waiver
CREATE OR REPLACE FUNCTION public.has_completed_waiver(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.waiver_completions 
    WHERE waiver_completions.user_id = has_completed_waiver.user_id
  );
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_waiver_completions_updated_at
BEFORE UPDATE ON public.waiver_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();