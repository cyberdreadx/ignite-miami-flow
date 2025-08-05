-- Add QR code fields to media_passes table
ALTER TABLE public.media_passes 
ADD COLUMN qr_code_token TEXT,
ADD COLUMN qr_code_data TEXT,
ADD COLUMN valid_until TIMESTAMPTZ;

-- Create policy for public verification with QR token (same as tickets/subscriptions)
CREATE POLICY "Allow public verification with QR token" 
ON public.media_passes 
FOR SELECT 
USING (qr_code_token IS NOT NULL);