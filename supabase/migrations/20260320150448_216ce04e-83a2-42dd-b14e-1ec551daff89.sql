ALTER TABLE public.media DROP COLUMN IF EXISTS optimized_urls;
ALTER TABLE public.media DROP COLUMN IF EXISTS is_optimized;
ALTER TABLE public.media DROP COLUMN IF EXISTS blurhash;
ALTER TABLE public.media DROP COLUMN IF EXISTS optimized_versions;