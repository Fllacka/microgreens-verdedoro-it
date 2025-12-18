-- Add editable section titles to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS content_title text DEFAULT 'Panoramica del Prodotto',
ADD COLUMN IF NOT EXISTS benefits_title text DEFAULT 'Benefici',
ADD COLUMN IF NOT EXISTS uses_title text DEFAULT 'Usi Culinari';