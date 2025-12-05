-- Add rich text content fields for benefits and uses
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS benefits_content TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS uses_content TEXT;