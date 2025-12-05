-- Add alt text field for featured image
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_alt TEXT;