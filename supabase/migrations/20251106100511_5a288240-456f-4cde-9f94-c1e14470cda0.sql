-- Add content_blocks column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS content_blocks jsonb DEFAULT '[]'::jsonb;