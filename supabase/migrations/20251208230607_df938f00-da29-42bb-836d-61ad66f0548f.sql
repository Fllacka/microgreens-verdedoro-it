-- Create microgreens_custom_sections table
CREATE TABLE public.microgreens_custom_sections (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.microgreens_custom_sections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view microgreens_custom_sections" 
ON public.microgreens_custom_sections 
FOR SELECT 
USING (true);

CREATE POLICY "Admins and editors can manage microgreens_custom_sections" 
ON public.microgreens_custom_sections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_microgreens_custom_sections_updated_at
BEFORE UPDATE ON public.microgreens_custom_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sections with initial content
INSERT INTO public.microgreens_custom_sections (id, content, sort_order) VALUES
('seo', '{
  "meta_title": "Microgreens su Misura | Verde d''Oro",
  "meta_description": "Coltivazione su misura di microgreens per chef e ristoranti. Oltre 50 varietà disponibili su ordinazione.",
  "og_title": "Microgreens su Misura | Verde d''Oro",
  "og_description": "Coltivazione su misura di microgreens per chef e ristoranti.",
  "canonical_url": "",
  "robots": "index, follow",
  "change_frequency": "monthly",
  "priority": "0.7",
  "structured_data": ""
}'::jsonb, 0),
('hero', '{
  "title": "Microgreens su Misura",
  "image_url": "",
  "image_alt": "Varietà di microgreens"
}'::jsonb, 1),
('intro', '{
  "text": "La nostra selezione standard di microgreens rappresenta solo l''inizio delle possibilità. Oltre alle varietà che coltiviamo regolarmente, offriamo un servizio di coltivazione su misura pensato per chef, ristoranti e appassionati di cucina che cercano ingredienti unici e specifici. Che si tratti di una varietà particolare per un piatto signature, di un blend esclusivo per il vostro menu, o di micro ortaggi rari difficili da reperire.",
  "image_url": "",
  "image_alt": "Chef con microgreens"
}'::jsonb, 2),
('varieties', '{
  "title": "Varietà Disponibili su Ordinazione",
  "description": "Il nostro catalogo completo comprende oltre 50 varietà di microgreens coltivabili su richiesta, suddivise per famiglie botaniche: erbe aromatiche, legumi speciali, brassicaceae rare, cereali antichi e fiori commestibili. Consultate l''elenco completo delle varietà disponibili su ordinazione e, nel caso la vostra ricerca specifica non fosse presente, contattateci lo stesso - faremo il possibile per trovarla.",
  "categories": [
    {
      "id": "1",
      "name": "Erbe aromatiche e officinali",
      "items": ["Anice Angel / Anice Menta Turquoise", "Basilico Cannella Bronze / Greco / Rosso / Pompei / Thai / Verde Zena", "Cerfoglio Unicorn", "Finocchio Napo / Rosso Lupin"],
      "is_visible": true
    },
    {
      "id": "2",
      "name": "Brassicaceae",
      "items": ["Cavolo Broccolo / Cappuccio / Nero di Toscana / Rapa Rosso Bacco / Romanesco / Verde Osiride", "Senape Bianca Yeti / Nera Hotdog / Rossa / Verde Snack", "Ravanello Bianco / Daikon / Nero / Red Rubin / Verde"],
      "is_visible": true
    },
    {
      "id": "3",
      "name": "Legumi",
      "items": ["Cece Magno", "Fagiolo Azuki Doraemon / Mungo Isidoro", "Fava Giunone", "Lenticchie Maranello / Verdi Siena"],
      "is_visible": true
    },
    {
      "id": "4",
      "name": "Ortaggi a radice e bulbi",
      "items": ["Carotta Peline", "Cipolla Pinga", "Porro Cinese Pucca / Matteo", "Sedano Elfo"],
      "is_visible": true
    },
    {
      "id": "5",
      "name": "Foglie e insalate",
      "items": ["Acetosa a Vena Rossa Sidro", "Bieta Agata / Bull''s Blood Granada / Coral / Gialla Mimosa / Rossa Confetti / Rossa Sunset", "Cavolo Riccio Nero / Verde / Rosso", "Indivia Scarola Bionda Cupido / A Cuore Pieno"],
      "is_visible": true
    },
    {
      "id": "6",
      "name": "Cereali",
      "items": ["Grano Incas / Saraceno Inai", "Quinoa Rio"],
      "is_visible": true
    },
    {
      "id": "7",
      "name": "Semi Oleosi e Aromatici",
      "items": ["Chia Helmet", "Lino Bruno", "Sesamo Neo Ardesia"],
      "is_visible": true
    },
    {
      "id": "8",
      "name": "Piante Spontanee e fiori commestibili",
      "items": ["Borragine Emerald", "Calendula Cheope", "Malva Skin", "Nasturzio Ruby / Woodland"],
      "is_visible": true
    }
  ]
}'::jsonb, 3),
('cta', '{
  "title": "Inizia il Tuo Progetto su Misura",
  "description": "Raccontaci la varietà che cerchi e trasformiamo insieme la tua idea in microgreens unici.",
  "button_text": "Richiedi la Tua Varietà di Microgreens",
  "button_link": "/contatti"
}'::jsonb, 4);