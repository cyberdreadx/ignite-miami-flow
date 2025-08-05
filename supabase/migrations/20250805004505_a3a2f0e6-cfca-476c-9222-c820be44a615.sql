-- Add QR code fields to tickets table
ALTER TABLE public.tickets 
ADD COLUMN qr_code_token TEXT UNIQUE,
ADD COLUMN qr_code_data TEXT,
ADD COLUMN used_at TIMESTAMPTZ,
ADD COLUMN used_by TEXT;

-- Add QR code fields to subscriptions table  
ALTER TABLE public.subscriptions
ADD COLUMN qr_code_token TEXT UNIQUE,
ADD COLUMN qr_code_data TEXT;

-- Create function to generate unique QR token
CREATE OR REPLACE FUNCTION public.generate_qr_token()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QR_' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8)) || '_' || EXTRACT(EPOCH FROM NOW())::bigint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;