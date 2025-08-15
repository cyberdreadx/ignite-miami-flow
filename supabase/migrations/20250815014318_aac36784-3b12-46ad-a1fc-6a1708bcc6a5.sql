-- Fix the tickets that should be associated with the SkateBurn Tuesdays event
-- All tickets with valid_until = '2025-08-21 23:59:59.999+00' should be for the August 19th event

UPDATE public.tickets 
SET event_id = '7f34c96b-04f8-49cc-9d3d-a9ff80313ea3'
WHERE event_id IS NULL 
  AND valid_until = '2025-08-21 23:59:59.999+00'
  AND status = 'paid';