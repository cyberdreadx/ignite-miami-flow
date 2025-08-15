-- Associate the tickets from August 12th with the SkateBurn Tuesdays event
-- These are the only tickets purchased for the new event
UPDATE public.tickets 
SET event_id = '7f34c96b-04f8-49cc-9d3d-a9ff80313ea3'
WHERE id IN (
  'a55543ac-bee8-4b1f-bf2b-7007c765aa93',
  '0200efa2-bbf9-482e-aa41-47d4cb2bf7aa'
) 
AND status = 'paid';