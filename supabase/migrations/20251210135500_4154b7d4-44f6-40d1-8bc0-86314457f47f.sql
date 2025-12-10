-- Add header_settings and footer_settings JSONB columns to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN header_settings jsonb DEFAULT '{
  "navigation_items": [
    {"id": "1", "name": "Chi Siamo", "url": "/chi-siamo", "visible": true, "order": 1},
    {"id": "2", "name": "I Nostri Microgreens", "url": "/microgreens", "visible": true, "order": 2},
    {"id": "3", "name": "Microgreens su Misura", "url": "/microgreens-su-misura", "visible": true, "order": 3},
    {"id": "4", "name": "Blog", "url": "/blog", "visible": true, "order": 4},
    {"id": "5", "name": "Contatti", "url": "/contatti", "visible": true, "order": 5}
  ],
  "cta_button": {
    "text": "Ordina Ora",
    "url": "/contatti",
    "visible": true
  }
}'::jsonb,
ADD COLUMN footer_settings jsonb DEFAULT '{
  "brand_description": "<p>Coltiviamo microgreens freschi e nutrienti con passione e dedizione, portando sulla tua tavola il meglio della natura.</p>",
  "social_links": [
    {"platform": "instagram", "url": "https://instagram.com", "visible": true},
    {"platform": "facebook", "url": "https://facebook.com", "visible": true},
    {"platform": "youtube", "url": "https://youtube.com", "visible": true}
  ],
  "quick_links": {
    "title": "Link Utili",
    "items": [
      {"id": "1", "name": "Chi Siamo", "url": "/chi-siamo", "visible": true, "order": 1},
      {"id": "2", "name": "I Nostri Microgreens", "url": "/microgreens", "visible": true, "order": 2},
      {"id": "3", "name": "Microgreens su Misura", "url": "/microgreens-su-misura", "visible": true, "order": 3},
      {"id": "4", "name": "Blog", "url": "/blog", "visible": true, "order": 4},
      {"id": "5", "name": "Contatti", "url": "/contatti", "visible": true, "order": 5}
    ]
  },
  "contact_info": {
    "title": "Contatti",
    "address": "Via dei Microgreens, 123\n00100 Roma, Italia",
    "phone": "+39 06 1234567",
    "email": "info@verdedoro.it"
  },
  "cta_button": {
    "text": "Contattaci",
    "url": "/contatti",
    "visible": true
  },
  "copyright": "{year} Verde dOro. Tutti i diritti riservati.",
  "legal_links": [
    {"id": "1", "name": "Privacy Policy", "url": "/privacy", "visible": true},
    {"id": "2", "name": "Termini di Servizio", "url": "/termini", "visible": true}
  ]
}'::jsonb;