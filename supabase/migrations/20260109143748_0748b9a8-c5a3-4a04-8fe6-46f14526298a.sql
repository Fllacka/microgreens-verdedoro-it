-- Insert CTA section for microgreens page
INSERT INTO microgreens_sections (id, content, is_visible, sort_order)
VALUES (
  'cta',
  '{
    "title": "Non Trovi la Varietà che Cerchi?",
    "description": "<p>La nostra selezione è in continua crescita, ma sappiamo che le tue esigenze possono essere uniche. Scopri le nostre coltivazioni personalizzate o contattaci direttamente per discutere le tue necessità.</p>",
    "primary_button_text": "Esplora Microgreens su Misura",
    "primary_button_link": "/microgreens-su-misura",
    "secondary_button_text": "Contattaci Direttamente",
    "secondary_button_link": "/contatti"
  }'::jsonb,
  true,
  4
)
ON CONFLICT (id) DO NOTHING;