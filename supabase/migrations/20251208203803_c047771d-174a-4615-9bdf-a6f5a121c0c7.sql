-- Create chi_siamo_sections table to store About page content
CREATE TABLE public.chi_siamo_sections (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chi_siamo_sections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins and editors can manage chi_siamo_sections"
ON public.chi_siamo_sections
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Anyone can view chi_siamo_sections"
ON public.chi_siamo_sections
FOR SELECT
USING (true);

-- Insert default sections with current content
INSERT INTO public.chi_siamo_sections (id, content, sort_order) VALUES
('seo', '{
  "meta_title": "Chi Siamo - Verde D''Oro Microgreens",
  "meta_description": "Scopri la storia di Verde D''Oro, azienda familiare di Reggio Emilia specializzata in microgreens biologici. Passione, sostenibilità ed eccellenza italiana.",
  "og_title": "Chi Siamo - Verde D''Oro Microgreens",
  "og_description": "La nostra storia nasce dalla passione per l''agricoltura sostenibile. Scopri i valori e la missione di Verde D''Oro.",
  "robots": "index, follow",
  "canonical_url": ""
}'::jsonb, 0),
('hero', '{
  "title": "La Nostra Storia",
  "description": "Nel cuore dell''Emilia-Romagna, dove la tradizione agricola si sposa con l''innovazione, nasce Verde D''Oro Microgreens. La nostra storia inizia dalla passione per l''agricoltura sostenibile e dalla volontà di portare sulle tavole italiane il meglio della natura.",
  "button_text": "Scopri i Nostri Prodotti",
  "button_link": "/microgreens"
}'::jsonb, 1),
('mission', '{
  "title": "La Nostra Missione",
  "description": "Vogliamo rivoluzionare il modo di intendere l''alimentazione sana e sostenibile, offrendo microgreens di altissima qualità che racchiudono tutto il sapore e i nutrienti della tradizione agricola italiana. Ogni prodotto Verde D''Oro è il risultato di ricerca, passione e rispetto per l''ambiente.",
  "values": [
    {"icon": "Leaf", "title": "Sostenibilità", "description": "Coltiviamo nel rispetto dell''ambiente, utilizzando metodi naturali e sostenibili per preservare la terra per le future generazioni."},
    {"icon": "Heart", "title": "Passione", "description": "Ogni microgreen è coltivato con amore e dedizione, dalla semina alla raccolta, per garantire il massimo della qualità e del sapore."},
    {"icon": "Users", "title": "Famiglia", "description": "Siamo un''azienda familiare che crede nei valori tradizionali dell''agricoltura italiana, trasmessi di generazione in generazione."},
    {"icon": "Award", "title": "Eccellenza", "description": "La nostra missione è portare sulle vostre tavole solo il meglio, con standard qualitativi che non accettano compromessi."}
  ]
}'::jsonb, 2),
('story', '{
  "title": "Da Reggio Emilia al Mondo",
  "paragraphs": [
    "La nostra avventura è iniziata nel 2020, quando abbiamo deciso di trasformare la nostra passione per l''agricoltura in una realtà imprenditoriale. Situati nelle fertili terre di Reggio Emilia, abbiamo scelto di specializzarci nei microgreens per la loro incredibile densità nutrizionale e il loro potenziale culinario inesplorato.",
    "Quello che ci distingue è l''attenzione maniacale alla qualità: dalla selezione dei semi biologici alle tecniche di coltivazione innovative, ogni fase del processo è seguita personalmente dal nostro team. Non utilizziamo pesticidi o fertilizzanti chimici, affidandoci esclusivamente ai metodi naturali che la terra dell''Emilia ci ha insegnato.",
    "Oggi, Verde D''Oro fornisce ristoranti stellati, chef appassionati e famiglie che credono in un''alimentazione sana e consapevole. La nostra visione è semplice: portare l''eccellenza italiana nel mondo dei microgreens, un germoglio alla volta."
  ],
  "stats": [
    {"value": "25+", "label": "Varietà di Microgreens"},
    {"value": "100%", "label": "Biologico e Naturale"},
    {"value": "24h", "label": "Dalla Raccolta alla Consegna"}
  ],
  "certifications": ["Agricoltura Biologica", "Produzione Sostenibile", "Qualità Italiana"]
}'::jsonb, 3),
('cta', '{
  "title": "Unisciti alla Rivoluzione Verde",
  "description": "Scopri il sapore autentico dei nostri microgreens e diventa parte della nostra storia. Insieme possiamo costruire un futuro più sostenibile e gustoso.",
  "primary_button_text": "Esplora i Nostri Microgreens",
  "primary_button_link": "/microgreens"
}'::jsonb, 4);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chi_siamo_sections_updated_at
BEFORE UPDATE ON public.chi_siamo_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();