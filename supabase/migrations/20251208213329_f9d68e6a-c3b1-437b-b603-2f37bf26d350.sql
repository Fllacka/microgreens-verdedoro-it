-- Create microgreens_sections table for CMS management
CREATE TABLE public.microgreens_sections (
  id text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.microgreens_sections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins and editors can manage microgreens_sections" 
ON public.microgreens_sections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Anyone can view microgreens_sections" 
ON public.microgreens_sections 
FOR SELECT 
USING (true);

-- Insert default sections with initial content
INSERT INTO public.microgreens_sections (id, content, sort_order) VALUES
('seo', '{
  "meta_title": "I Nostri Microgreens - Verde D''Oro",
  "meta_description": "Scopri la nostra selezione di microgreens biologici coltivati a Reggio Emilia. Basilico, ravanello rosso, pisello e molte altre varietà per la tua cucina gourmet.",
  "og_title": "",
  "og_description": "",
  "og_image_id": null,
  "canonical_url": "",
  "robots": "index, follow",
  "structured_data": null
}'::jsonb, 0),
('hero', '{
  "title": "I Nostri Microgreens",
  "subtitle": "Scopri la nostra selezione di microgreens coltivati con passione nel cuore dell''Emilia-Romagna. Ogni varietà è scelta per il suo sapore unico e i suoi benefici nutrizionali eccezionali."
}'::jsonb, 1),
('info', '{
  "title": "Perché i Nostri Microgreens Sono Speciali",
  "feature1_title": "Coltivazione Biologica",
  "feature1_description": "Utilizziamo esclusivamente semi biologici certificati e metodi di coltivazione naturali, senza pesticidi o fertilizzanti chimici.",
  "feature2_title": "Massima Freschezza",
  "feature2_description": "I nostri microgreens vengono raccolti al momento ottimale e consegnati entro 24 ore per garantire sapore e proprietà nutrizionali al massimo.",
  "feature3_title": "Tradizione Italiana",
  "feature3_description": "Ogni varietà è selezionata per esaltare i sapori della cucina italiana, dalle erbe aromatiche ai microgreens più innovativi.",
  "image_id": null,
  "image_alt": "Varietà di microgreens freschi"
}'::jsonb, 2);