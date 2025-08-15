-- Revert the previous migration that associated too many tickets
-- First, set all tickets back to NULL event_id that were incorrectly associated
UPDATE public.tickets 
SET event_id = NULL
WHERE event_id = '7f34c96b-04f8-49cc-9d3d-a9ff80313ea3';

-- Now only associate tickets that were purchased AFTER the new event was created (around August 17th)
-- Only tickets created after 2025-08-17 should be for the new SkateBurn Tuesdays event
UPDATE public.tickets 
SET event_id = '7f34c96b-04f8-49cc-9d3d-a9ff80313ea3'
WHERE event_id IS NULL 
  AND valid_until = '2025-08-21 23:59:59.999+00'
  AND status = 'paid'
  AND created_at >= '2025-08-17 00:00:00+00';