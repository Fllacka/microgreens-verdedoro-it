-- Pulisci tutti i riferimenti orfani in draft_image_id
UPDATE products 
SET draft_image_id = NULL 
WHERE draft_image_id IS NOT NULL 
  AND draft_image_id NOT IN (SELECT id FROM media);

-- Pulisci tutti i riferimenti orfani in draft_og_image_id
UPDATE products 
SET draft_og_image_id = NULL 
WHERE draft_og_image_id IS NOT NULL 
  AND draft_og_image_id NOT IN (SELECT id FROM media);

-- Aggiungi vincolo FK su draft_image_id con ON DELETE SET NULL
ALTER TABLE products
ADD CONSTRAINT products_draft_image_id_fkey 
FOREIGN KEY (draft_image_id) 
REFERENCES media(id) 
ON DELETE SET NULL;

-- Aggiungi vincolo FK su draft_og_image_id con ON DELETE SET NULL
ALTER TABLE products
ADD CONSTRAINT products_draft_og_image_id_fkey 
FOREIGN KEY (draft_og_image_id) 
REFERENCES media(id) 
ON DELETE SET NULL;