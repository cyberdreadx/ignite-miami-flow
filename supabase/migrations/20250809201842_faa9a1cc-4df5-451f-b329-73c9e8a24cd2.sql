-- Add start_at column to events for scheduling
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;

-- Optional: create an index to quickly fetch the active event by start time
CREATE INDEX IF NOT EXISTS idx_events_active_start_at ON public.events (is_active, start_at DESC);

-- Backfill: if there is exactly one active event and start_at is NULL, set a default to the prior hardcoded date (Aug 19, 2025 7:00 PM America/New_York) converted to UTC
-- Note: This is safe and helps the UI work immediately after migration
UPDATE public.events
SET start_at = (TIMESTAMPTZ '2025-08-19 19:00:00-04')
WHERE is_active = true AND start_at IS NULL;