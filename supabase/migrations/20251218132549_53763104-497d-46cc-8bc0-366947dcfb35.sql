-- Add FAQ items column to products table
ALTER TABLE public.products 
ADD COLUMN faq_items jsonb DEFAULT '[]'::jsonb;