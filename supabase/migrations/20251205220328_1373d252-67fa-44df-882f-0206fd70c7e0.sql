-- Create homepage_sections table
CREATE TABLE public.homepage_sections (
    id TEXT PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view homepage sections"
ON public.homepage_sections
FOR SELECT
USING (true);

CREATE POLICY "Admins and editors can manage homepage sections"
ON public.homepage_sections
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_homepage_sections_updated_at
BEFORE UPDATE ON public.homepage_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content for all sections
INSERT INTO public.homepage_sections (id, content, sort_order) VALUES
('hero', '{
  "badge_text": "Microgreens di Reggio Emilia",
  "title_part1": "Verde",
  "title_highlight": "D''Oro",
  "subtitle": "Microgreens freschi, nutrienti e sostenibili, coltivati con cura a Reggio Emilia. Porta sulla tua tavola il meglio della natura.",
  "primary_button_text": "Scopri i Microgreens",
  "primary_button_link": "/microgreens",
  "secondary_button_text": "Contattaci",
  "secondary_button_link": "/contatti",
  "background_image_id": null
}'::jsonb, 1),

('what_are_microgreens', '{
  "heading": "Cosa sono i Microgreens?",
  "description": "I microgreens sono giovani piantine raccolte dopo 7-21 giorni dalla germinazione. Nonostante le loro dimensioni ridotte, questi piccoli vegetali sono veri concentrati di nutrienti, con un contenuto vitaminico fino a 40 volte superiore rispetto alle piante mature.",
  "image_id": null,
  "features": [
    {"title": "Super Nutrienti", "description": "Fino a 40x più vitamine e minerali rispetto alle verdure mature"},
    {"title": "Freschi Sempre", "description": "Consegnati entro 24 ore dalla raccolta per massima freschezza"},
    {"title": "100% Naturali", "description": "Coltivati senza pesticidi, OGM o additivi chimici"},
    {"title": "Gusto Intenso", "description": "Sapori concentrati che esaltano ogni piatto"}
  ],
  "cta_text": "Scopri i Benefici",
  "cta_link": "/microgreens"
}'::jsonb, 2),

('how_it_works', '{
  "heading": "Come Funziona?",
  "subtitle": "Dal nostro laboratorio alla tua tavola in pochi semplici passi",
  "steps": [
    {"number": "01", "icon": "Sprout", "title": "Coltivazione", "description": "Coltiviamo i microgreens in ambiente controllato, garantendo qualità e sicurezza"},
    {"number": "02", "icon": "Package", "title": "Raccolta", "description": "Raccogliamo al momento giusto per preservare tutti i nutrienti"},
    {"number": "03", "icon": "Truck", "title": "Consegna", "description": "Consegniamo freschi entro 24 ore dalla raccolta"},
    {"number": "04", "icon": "UtensilsCrossed", "title": "Gusto", "description": "Pronti per arricchire i tuoi piatti con gusto e salute"}
  ]
}'::jsonb, 3),

('orders_delivery', '{
  "heading": "Ordini e Consegne",
  "description": "Consegniamo i nostri microgreens freschi direttamente a casa tua o al tuo ristorante nella zona di Reggio Emilia e provincia. Ordina entro le 18:00 per ricevere il giorno successivo.",
  "button_text": "Scopri le Zone di Consegna",
  "button_link": "/contatti"
}'::jsonb, 4),

('featured_products', '{
  "heading": "I Nostri Microgreens in Evidenza",
  "subtitle": "Scopri le nostre varietà più amate, coltivate con passione e dedizione",
  "button_text": "Vedi Tutti i Prodotti",
  "button_link": "/microgreens",
  "product_slugs": []
}'::jsonb, 5),

('custom_microgreens', '{
  "heading": "Microgreens su Misura per la Tua Attività",
  "description1": "Sei un ristorante, un catering o un''attività che cerca microgreens personalizzati? Collaboriamo con te per creare varietà su misura che si adattano perfettamente alla tua cucina e alle tue esigenze.",
  "description2": "Dalla selezione delle varietà alla pianificazione delle consegne, siamo il partner ideale per portare freschezza e innovazione nel tuo menù.",
  "button_text": "Richiedi una Consulenza",
  "button_link": "/microgreens-custom",
  "image_id": null
}'::jsonb, 6),

('blog', '{
  "heading": "Dal Nostro Blog",
  "subtitle": "Scopri ricette, consigli e curiosità sul mondo dei microgreens",
  "posts_count": 3,
  "button_text": "Leggi Tutti gli Articoli",
  "button_link": "/blog"
}'::jsonb, 7);