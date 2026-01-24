-- Add draft columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS draft_name TEXT,
ADD COLUMN IF NOT EXISTS draft_description TEXT,
ADD COLUMN IF NOT EXISTS draft_grid_description TEXT,
ADD COLUMN IF NOT EXISTS draft_content TEXT,
ADD COLUMN IF NOT EXISTS draft_content_title TEXT,
ADD COLUMN IF NOT EXISTS draft_category TEXT,
ADD COLUMN IF NOT EXISTS draft_price NUMERIC,
ADD COLUMN IF NOT EXISTS draft_price_tiers JSONB,
ADD COLUMN IF NOT EXISTS draft_benefits TEXT[],
ADD COLUMN IF NOT EXISTS draft_uses TEXT[],
ADD COLUMN IF NOT EXISTS draft_benefits_content TEXT,
ADD COLUMN IF NOT EXISTS draft_benefits_title TEXT,
ADD COLUMN IF NOT EXISTS draft_uses_content TEXT,
ADD COLUMN IF NOT EXISTS draft_uses_title TEXT,
ADD COLUMN IF NOT EXISTS draft_image_id UUID,
ADD COLUMN IF NOT EXISTS draft_image_alt TEXT,
ADD COLUMN IF NOT EXISTS draft_faq_items JSONB,
ADD COLUMN IF NOT EXISTS draft_slug TEXT,
ADD COLUMN IF NOT EXISTS draft_meta_title TEXT,
ADD COLUMN IF NOT EXISTS draft_meta_description TEXT,
ADD COLUMN IF NOT EXISTS draft_og_title TEXT,
ADD COLUMN IF NOT EXISTS draft_og_description TEXT,
ADD COLUMN IF NOT EXISTS draft_og_image_id UUID,
ADD COLUMN IF NOT EXISTS draft_canonical_url TEXT,
ADD COLUMN IF NOT EXISTS draft_robots TEXT,
ADD COLUMN IF NOT EXISTS draft_change_frequency TEXT,
ADD COLUMN IF NOT EXISTS draft_priority NUMERIC,
ADD COLUMN IF NOT EXISTS draft_structured_data JSONB,
ADD COLUMN IF NOT EXISTS has_draft_changes BOOLEAN DEFAULT FALSE;

-- Add draft columns to blog_posts table
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS draft_title TEXT,
ADD COLUMN IF NOT EXISTS draft_slug TEXT,
ADD COLUMN IF NOT EXISTS draft_excerpt TEXT,
ADD COLUMN IF NOT EXISTS draft_content TEXT,
ADD COLUMN IF NOT EXISTS draft_content_blocks JSONB,
ADD COLUMN IF NOT EXISTS draft_category TEXT,
ADD COLUMN IF NOT EXISTS draft_tags TEXT[],
ADD COLUMN IF NOT EXISTS draft_featured_image_id UUID,
ADD COLUMN IF NOT EXISTS draft_meta_title TEXT,
ADD COLUMN IF NOT EXISTS draft_meta_description TEXT,
ADD COLUMN IF NOT EXISTS draft_og_title TEXT,
ADD COLUMN IF NOT EXISTS draft_og_description TEXT,
ADD COLUMN IF NOT EXISTS draft_og_image_id UUID,
ADD COLUMN IF NOT EXISTS draft_canonical_url TEXT,
ADD COLUMN IF NOT EXISTS draft_robots TEXT,
ADD COLUMN IF NOT EXISTS draft_change_frequency TEXT,
ADD COLUMN IF NOT EXISTS draft_priority NUMERIC,
ADD COLUMN IF NOT EXISTS draft_structured_data JSONB,
ADD COLUMN IF NOT EXISTS has_draft_changes BOOLEAN DEFAULT FALSE;

-- Add draft columns to pages table
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS draft_title TEXT,
ADD COLUMN IF NOT EXISTS draft_slug TEXT,
ADD COLUMN IF NOT EXISTS draft_content TEXT,
ADD COLUMN IF NOT EXISTS draft_template TEXT,
ADD COLUMN IF NOT EXISTS draft_meta_title TEXT,
ADD COLUMN IF NOT EXISTS draft_meta_description TEXT,
ADD COLUMN IF NOT EXISTS draft_og_title TEXT,
ADD COLUMN IF NOT EXISTS draft_og_description TEXT,
ADD COLUMN IF NOT EXISTS draft_og_image_id UUID,
ADD COLUMN IF NOT EXISTS draft_canonical_url TEXT,
ADD COLUMN IF NOT EXISTS draft_robots TEXT,
ADD COLUMN IF NOT EXISTS draft_change_frequency TEXT,
ADD COLUMN IF NOT EXISTS draft_priority NUMERIC,
ADD COLUMN IF NOT EXISTS draft_structured_data JSONB,
ADD COLUMN IF NOT EXISTS has_draft_changes BOOLEAN DEFAULT FALSE;

-- Add draft columns to all section tables
ALTER TABLE homepage_sections
ADD COLUMN IF NOT EXISTS draft_content JSONB,
ADD COLUMN IF NOT EXISTS draft_is_visible BOOLEAN,
ADD COLUMN IF NOT EXISTS has_draft_changes BOOLEAN DEFAULT FALSE;

ALTER TABLE chi_siamo_sections
ADD COLUMN IF NOT EXISTS draft_content JSONB,
ADD COLUMN IF NOT EXISTS draft_is_visible BOOLEAN,
ADD COLUMN IF NOT EXISTS has_draft_changes BOOLEAN DEFAULT FALSE;

ALTER TABLE microgreens_sections
ADD COLUMN IF NOT EXISTS draft_content JSONB,
ADD COLUMN IF NOT EXISTS draft_is_visible BOOLEAN,
ADD COLUMN IF NOT EXISTS has_draft_changes BOOLEAN DEFAULT FALSE;

ALTER TABLE microgreens_custom_sections
ADD COLUMN IF NOT EXISTS draft_content JSONB,
ADD COLUMN IF NOT EXISTS draft_is_visible BOOLEAN,
ADD COLUMN IF NOT EXISTS has_draft_changes BOOLEAN DEFAULT FALSE;

ALTER TABLE contatti_sections
ADD COLUMN IF NOT EXISTS draft_content JSONB,
ADD COLUMN IF NOT EXISTS draft_is_visible BOOLEAN,
ADD COLUMN IF NOT EXISTS has_draft_changes BOOLEAN DEFAULT FALSE;

ALTER TABLE blog_overview_sections
ADD COLUMN IF NOT EXISTS draft_content JSONB,
ADD COLUMN IF NOT EXISTS draft_is_visible BOOLEAN,
ADD COLUMN IF NOT EXISTS has_draft_changes BOOLEAN DEFAULT FALSE;

ALTER TABLE cosa_sono_microgreens_sections
ADD COLUMN IF NOT EXISTS draft_content JSONB,
ADD COLUMN IF NOT EXISTS draft_is_visible BOOLEAN,
ADD COLUMN IF NOT EXISTS has_draft_changes BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN products.has_draft_changes IS 'True when there are unpublished draft changes';
COMMENT ON COLUMN blog_posts.has_draft_changes IS 'True when there are unpublished draft changes';
COMMENT ON COLUMN pages.has_draft_changes IS 'True when there are unpublished draft changes';