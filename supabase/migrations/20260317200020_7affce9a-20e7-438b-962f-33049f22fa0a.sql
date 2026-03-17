
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage app settings"
  ON public.app_settings
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

INSERT INTO public.app_settings (key, value)
VALUES ('staff_pin', '7291')
ON CONFLICT (key) DO NOTHING;
