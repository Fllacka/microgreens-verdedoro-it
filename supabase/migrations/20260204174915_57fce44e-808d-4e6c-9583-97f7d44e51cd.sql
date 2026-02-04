-- Add JSONB column for tracking context-specific optimized versions
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS optimized_versions jsonb DEFAULT '{}'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.media.optimized_versions IS 'Stores context-specific optimized image versions: { "hero": { "url": "...", "width": 1920, "height": 1080, "size": 150000 }, "productCard": { "url": "...", "width": 800, "height": 800, "size": 45000 } }';