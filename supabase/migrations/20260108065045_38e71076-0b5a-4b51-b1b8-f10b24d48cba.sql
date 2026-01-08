-- Add price_tiers JSONB column to products table for weight-based pricing
-- Structure: [{ "weight": 100, "price": 5.50 }, { "weight": 200, "price": 9.90 }]
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS price_tiers jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.products.price_tiers IS 'Array of weight-price tiers: [{ weight: number (grams), price: number (euros) }]';