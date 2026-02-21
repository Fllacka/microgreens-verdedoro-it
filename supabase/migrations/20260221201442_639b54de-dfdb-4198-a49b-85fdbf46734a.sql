ALTER TABLE public.site_settings
  ADD COLUMN favicon_id UUID REFERENCES public.media(id) ON DELETE SET NULL;