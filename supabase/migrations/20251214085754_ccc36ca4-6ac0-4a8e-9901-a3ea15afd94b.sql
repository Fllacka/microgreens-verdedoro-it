-- Create table for Cosa Sono Microgreens page content
CREATE TABLE public.cosa_sono_microgreens_sections (
  id TEXT NOT NULL PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cosa_sono_microgreens_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Anyone can view cosa_sono_microgreens_sections" 
ON public.cosa_sono_microgreens_sections 
FOR SELECT 
USING (true);

CREATE POLICY "Admins and editors can manage cosa_sono_microgreens_sections" 
ON public.cosa_sono_microgreens_sections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cosa_sono_microgreens_sections_updated_at
BEFORE UPDATE ON public.cosa_sono_microgreens_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sections with current static content
INSERT INTO public.cosa_sono_microgreens_sections (id, content, sort_order) VALUES
('seo', '{
  "metaTitle": "Cosa sono i Microgreens? Guida Completa | Verde d''Oro",
  "metaDescription": "Scopri cosa sono i microgreens: piccole piante ricche di nutrienti, facili da coltivare e perfette per arricchire i tuoi piatti. Guida completa con benefici e usi.",
  "ogTitle": "Cosa sono i Microgreens? Guida Completa",
  "ogDescription": "Scopri cosa sono i microgreens: piccole piante ricche di nutrienti, facili da coltivare e perfette per arricchire i tuoi piatti.",
  "canonicalUrl": "",
  "robots": "index, follow",
  "changeFrequency": "monthly",
  "priority": "0.8",
  "structuredData": ""
}'::jsonb, 0),
('hero', '{
  "title": "Cosa sono i Microgreens?",
  "subtitle": "Scopri il mondo delle micro-verdure: nutrienti, sostenibili e sorprendenti"
}'::jsonb, 1),
('content', '{
  "blocks": []
}'::jsonb, 2);