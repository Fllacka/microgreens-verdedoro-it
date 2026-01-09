UPDATE microgreens_sections 
SET content = content || '{"primary_button_visible": true, "secondary_button_visible": true}'::jsonb
WHERE id = 'cta';