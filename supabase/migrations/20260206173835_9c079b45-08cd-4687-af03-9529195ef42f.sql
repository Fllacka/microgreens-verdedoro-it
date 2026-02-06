-- No schema changes needed - FAQ data will be stored in the existing 
-- cosa_sono_microgreens_sections table as part of the content JSONB field
-- with section id 'faq' or within the 'content' section

-- We'll use a new section row with id='faq' to store FAQ items
-- The structure will be: content: { items: [{id, question, answer}...] }

-- Insert the FAQ section if it doesn't exist
INSERT INTO cosa_sono_microgreens_sections (id, content, is_visible, sort_order)
VALUES ('faq', '{"items": [], "title": "Domande Frequenti sui Microgreens"}'::jsonb, true, 3)
ON CONFLICT (id) DO NOTHING;