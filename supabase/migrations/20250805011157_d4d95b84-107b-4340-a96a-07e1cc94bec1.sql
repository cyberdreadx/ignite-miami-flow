-- Add RLS policy to allow public verification of tickets with valid QR codes
CREATE POLICY "Allow public verification with QR token" 
ON public.tickets 
FOR SELECT 
USING (qr_code_token IS NOT NULL);

-- Add RLS policy to allow public verification of subscriptions with valid QR codes  
CREATE POLICY "Allow public verification with QR token"
ON public.subscriptions
FOR SELECT
USING (qr_code_token IS NOT NULL);