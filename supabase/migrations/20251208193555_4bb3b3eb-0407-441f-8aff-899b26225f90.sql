-- Add SEO row to homepage_sections for centralized SEO management
INSERT INTO public.homepage_sections (id, content, is_visible, sort_order)
VALUES (
  'seo',
  '{
    "meta_title": "Verde D''Oro - Microgreens Freschi a Reggio Emilia",
    "meta_description": "Microgreens coltivati con passione a Reggio Emilia. Consegna in giornata per ristoranti, chef e privati. Scopri i nostri germogli freschi e nutrienti.",
    "og_title": "Verde D''Oro - Microgreens Freschi a Reggio Emilia",
    "og_description": "Microgreens coltivati con passione a Reggio Emilia. Consegna in giornata per ristoranti, chef e privati.",
    "canonical_url": "",
    "robots": "index, follow",
    "structured_data": ""
  }'::jsonb,
  true,
  0
)
ON CONFLICT (id) DO NOTHING;