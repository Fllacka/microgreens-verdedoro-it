-- Add content_blocks column to store structured content
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.blog_posts.content_blocks IS 'Structured content blocks with type, content, and metadata';