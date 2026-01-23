-- Add grid_description column for optimized product card descriptions
ALTER TABLE products 
ADD COLUMN grid_description TEXT;

COMMENT ON COLUMN products.grid_description IS 'Descrizione breve ottimizzata per le card del product grid (max 120 caratteri)';