-- Create events table for storing event information
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to active events
CREATE POLICY "Anyone can view active events" 
ON public.events 
FOR SELECT 
USING (is_active = true);

-- Create policy for authenticated users to manage events (for admin)
CREATE POLICY "Authenticated users can manage events" 
ON public.events 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create storage buckets for image management
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('event-images', 'event-images', true),
  ('gallery', 'gallery', true),
  ('logos', 'logos', true);

-- Create storage policies for public read access
CREATE POLICY "Public read access for event images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id IN ('event-images', 'gallery', 'logos'));

-- Create storage policies for authenticated upload/update
CREATE POLICY "Authenticated users can upload event images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id IN ('event-images', 'gallery', 'logos'));

CREATE POLICY "Authenticated users can update event images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id IN ('event-images', 'gallery', 'logos'));

CREATE POLICY "Authenticated users can delete event images" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id IN ('event-images', 'gallery', 'logos'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default event data
INSERT INTO public.events (title, subtitle, time, location, description) VALUES (
  '🔥 SkateBurn Tuesdays',
  'Miami''s Fire, Flow, & Skate Jam',
  '8PM–Midnight',
  'SkateBird Miami (NW 83rd & Biscayne Blvd, El Portal)',
  'Live DJs, open skating, LED flow props, fire spinning & flow arts showcase, local vendors, community hangout'
);