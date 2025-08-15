-- Update existing tickets to associate them with the correct events
-- Based on their purchase date and validity period

-- First, let's update tickets that were purchased for the August 19th event
-- These would be tickets with valid_until around 8/21/2025
UPDATE public.tickets 
SET event_id = (
  SELECT id FROM public.events 
  WHERE title = 'SkateBurn Tuesdays' 
  AND is_active = true 
  LIMIT 1
)
WHERE event_id IS NULL 
  AND valid_until IS NOT NULL
  AND valid_until::date = '2025-08-21'::date;

-- Also update tickets purchased in the last few days that don't have an event_id
-- but should be for the current/upcoming event
UPDATE public.tickets 
SET event_id = (
  SELECT id FROM public.events 
  WHERE title = 'SkateBurn Tuesdays' 
  AND is_active = true 
  LIMIT 1
)
WHERE event_id IS NULL 
  AND created_at >= '2025-08-17'::date  -- Last few days
  AND status = 'paid';

-- For any remaining tickets without an event_id, leave them as legacy
-- but this should now properly categorize recent purchases