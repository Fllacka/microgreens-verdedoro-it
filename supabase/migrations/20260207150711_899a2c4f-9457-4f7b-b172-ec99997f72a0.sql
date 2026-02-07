-- Add FAQ columns to blog_posts table
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS faq_title text DEFAULT 'Domande Frequenti',
ADD COLUMN IF NOT EXISTS faq_items jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS draft_faq_title text,
ADD COLUMN IF NOT EXISTS draft_faq_items jsonb;