-- Allow posts to have null content (for media-only posts)
ALTER TABLE public.posts ALTER COLUMN content DROP NOT NULL;