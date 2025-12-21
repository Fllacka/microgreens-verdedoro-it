-- Add optimized image columns to media table
ALTER TABLE public.media 
ADD COLUMN IF NOT EXISTS optimized_urls jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_optimized boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.media.optimized_urls IS 'JSON object containing URLs for different image sizes: { thumbnail, medium, large, original, webp_thumbnail, webp_medium, webp_large }';
COMMENT ON COLUMN public.media.is_optimized IS 'Flag indicating if the image has been processed and optimized';