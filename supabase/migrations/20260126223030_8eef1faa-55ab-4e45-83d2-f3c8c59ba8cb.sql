-- Add draft columns for site_settings to support draft/published workflow
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS draft_header_settings JSONB,
ADD COLUMN IF NOT EXISTS draft_footer_settings JSONB,
ADD COLUMN IF NOT EXISTS has_draft_header_changes BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_draft_footer_changes BOOLEAN DEFAULT FALSE;