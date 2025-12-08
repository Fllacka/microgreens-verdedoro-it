-- Create contatti_sections table
CREATE TABLE public.contatti_sections (
    id TEXT NOT NULL PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contatti_sections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view contatti_sections" 
    ON public.contatti_sections 
    FOR SELECT 
    USING (true);

CREATE POLICY "Admins and editors can manage contatti_sections" 
    ON public.contatti_sections 
    FOR ALL 
    USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_contatti_sections_updated_at
    BEFORE UPDATE ON public.contatti_sections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial sections
INSERT INTO public.contatti_sections (id, content, is_visible, sort_order) VALUES
('seo', '{
    "meta_title": "Contatti - Verde D''Oro Microgreens",
    "meta_description": "Contattaci per informazioni sui nostri microgreens biologici. Richiedi un preventivo personalizzato per il tuo ristorante o per uso domestico.",
    "og_title": "",
    "og_description": "",
    "og_image_id": null,
    "canonical_url": "",
    "robots": "index, follow",
    "structured_data": null
}'::jsonb, true, 0),
('hero', '{
    "title": "Contattaci",
    "subtitle": "Siamo qui per aiutarti! Che tu sia uno chef, un ristoratore o semplicemente un appassionato di cucina sana, saremo felici di consigliarti i microgreens perfetti per le tue esigenze."
}'::jsonb, true, 1),
('form', '{
    "title": "Richiedi un Preventivo",
    "description": "Compila il form per ricevere una proposta personalizzata"
}'::jsonb, true, 2),
('contact_info', '{
    "title": "Informazioni di Contatto",
    "phone_visible": true,
    "phone_title": "Telefono",
    "phone_details": "+39 0522 000 000",
    "phone_description": "Lun-Ven 9:00-18:00",
    "email_visible": true,
    "email_title": "Email",
    "email_details": "verdedoro.microgreens@gmail.com",
    "email_description": "Risposta entro 24h",
    "address_visible": true,
    "address_title": "Indirizzo",
    "address_details": "Via delle Microgreens, 42",
    "address_description": "42121 Reggio Emilia (RE)",
    "whatsapp_visible": true,
    "whatsapp_title": "WhatsApp",
    "whatsapp_details": "+39 333 000 0000",
    "whatsapp_description": "Chat diretta"
}'::jsonb, true, 3),
('delivery', '{
    "title": "Consegne",
    "item1_visible": true,
    "item1_text": "Consegna in 24-48h in Emilia-Romagna",
    "item2_visible": true,
    "item2_text": "Spedizione gratuita per ordini superiori a €50",
    "item3_visible": true,
    "item3_text": "Packaging sostenibile e refrigerato"
}'::jsonb, true, 4),
('whatsapp_cta', '{
    "title": "Hai fretta?",
    "description": "Contattaci direttamente su WhatsApp per una risposta immediata.",
    "button_text": "Scrivici su WhatsApp",
    "whatsapp_link": "https://wa.me/39333000000?text=Ciao! Vorrei informazioni sui vostri microgreens"
}'::jsonb, true, 5);