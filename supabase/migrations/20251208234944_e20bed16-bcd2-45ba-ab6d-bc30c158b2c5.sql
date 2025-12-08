-- Create blog overview sections table for CMS
CREATE TABLE public.blog_overview_sections (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_overview_sections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view blog_overview_sections" 
ON public.blog_overview_sections 
FOR SELECT 
USING (true);

CREATE POLICY "Admins and editors can manage blog_overview_sections" 
ON public.blog_overview_sections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Insert default sections
INSERT INTO public.blog_overview_sections (id, content, is_visible, sort_order) VALUES
('hero', '{"badge": "Il Mondo dei Microgreens", "title": "Blog di Microgreens", "subtitle": "Esplora il mondo dei microgreens attraverso ricette originali, guide agli usi culinari, approfondimenti sui benefici nutrizionali e consigli pratici per consumo e conservazione."}'::jsonb, true, 0),
('categories', '{"title": "Esplora per Categoria"}'::jsonb, true, 1),
('featured', '{"title": "Articolo in Evidenza"}'::jsonb, true, 2),
('latest', '{"title": "Ultimi Articoli", "empty_text": "Nessun articolo disponibile al momento.", "loading_text": "Caricamento articoli..."}'::jsonb, true, 3),
('newsletter', '{"title": "Non Perdere Nessun Articolo", "subtitle": "Iscriviti alla nostra newsletter per ricevere le ultime novità, ricette esclusive e consigli pratici direttamente nella tua inbox.", "button_text": "Iscriviti alla Newsletter"}'::jsonb, true, 4),
('seo', '{"meta_title": "Blog Microgreens - Ricette, Benefici e Consigli | Verde D''Oro", "meta_description": "Scopri il mondo dei microgreens: ricette, benefici nutrizionali, consigli per la conservazione e guide pratiche.", "robots": "index, follow", "change_frequency": "weekly", "priority": "0.8"}'::jsonb, true, 5);