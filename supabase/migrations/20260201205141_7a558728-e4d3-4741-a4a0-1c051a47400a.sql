-- Modify foreign keys to use ON DELETE SET NULL
-- This allows deleting images from Media Library even when they're in use

-- products.image_id
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_image_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_image_id_fkey 
  FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE SET NULL;

-- products.og_image_id
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_og_image_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_og_image_id_fkey 
  FOREIGN KEY (og_image_id) REFERENCES media(id) ON DELETE SET NULL;

-- blog_posts.featured_image_id
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_featured_image_id_fkey;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_featured_image_id_fkey 
  FOREIGN KEY (featured_image_id) REFERENCES media(id) ON DELETE SET NULL;

-- blog_posts.og_image_id
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_og_image_id_fkey;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_og_image_id_fkey 
  FOREIGN KEY (og_image_id) REFERENCES media(id) ON DELETE SET NULL;

-- pages.og_image_id
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_og_image_id_fkey;
ALTER TABLE pages ADD CONSTRAINT pages_og_image_id_fkey 
  FOREIGN KEY (og_image_id) REFERENCES media(id) ON DELETE SET NULL;