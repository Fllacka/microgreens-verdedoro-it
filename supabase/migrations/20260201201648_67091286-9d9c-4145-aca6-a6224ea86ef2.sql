-- Add columns for image dimensions, blurhash, and hero priority
ALTER TABLE media ADD COLUMN IF NOT EXISTS width integer;
ALTER TABLE media ADD COLUMN IF NOT EXISTS height integer;
ALTER TABLE media ADD COLUMN IF NOT EXISTS blurhash text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS is_hero boolean DEFAULT false;