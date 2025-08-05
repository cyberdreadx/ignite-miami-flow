-- Remove test tickets that don't have Stripe session IDs and were used by "Test System"
-- This will clean up false revenue from test data

DELETE FROM public.tickets 
WHERE stripe_session_id IS NULL 
  AND used_by = 'Test System';