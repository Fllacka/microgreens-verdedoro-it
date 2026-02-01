
# Piano: Modificare Foreign Keys con ON DELETE SET NULL

## Analisi Completa delle Foreign Keys

Ho identificato **6 foreign keys** che referenziano la tabella `media`. Di queste:
- **5 bloccano** l'eliminazione (comportamento RESTRICT di default)
- **1 è già configurata** correttamente (`site_settings_logo_id_fkey`)

### Stato Attuale

| Tabella | Colonna | Constraint | Stato |
|---------|---------|------------|-------|
| `products` | `image_id` | `products_image_id_fkey` | Blocca |
| `products` | `og_image_id` | `products_og_image_id_fkey` | Blocca |
| `blog_posts` | `featured_image_id` | `blog_posts_featured_image_id_fkey` | Blocca |
| `blog_posts` | `og_image_id` | `blog_posts_og_image_id_fkey` | Blocca |
| `pages` | `og_image_id` | `pages_og_image_id_fkey` | Blocca |
| `site_settings` | `logo_id` | `site_settings_logo_id_fkey` | OK |

Le colonne `draft_*_image_id` (es. `draft_image_id`, `draft_featured_image_id`) non hanno foreign keys, quindi non bloccano l'eliminazione.

---

## Implementazione

### Migrazione Database

Creare una migrazione SQL che modifica le 5 foreign keys bloccanti:

```sql
-- products.image_id
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_image_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_image_id_fkey 
  FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE SET NULL;

-- products.og_image_id
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_og_image_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_og_image_id_fkey 
  FOREIGN KEY (og_image_id) REFERENCES media(id) ON DELETE SET NULL;

-- blog_posts.featured_image_id
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_featured_image_id_fkey;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_featured_image_id_fkey 
  FOREIGN KEY (featured_image_id) REFERENCES media(id) ON DELETE SET NULL;

-- blog_posts.og_image_id
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_og_image_id_fkey;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_og_image_id_fkey 
  FOREIGN KEY (og_image_id) REFERENCES media(id) ON DELETE SET NULL;

-- pages.og_image_id
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_og_image_id_fkey;
ALTER TABLE pages ADD CONSTRAINT pages_og_image_id_fkey 
  FOREIGN KEY (og_image_id) REFERENCES media(id) ON DELETE SET NULL;
```

---

## Copertura Completa del Sito

Questa modifica abilita l'eliminazione di immagini usate in:

| Area del Sito | Colonne Coinvolte |
|---------------|-------------------|
| **Prodotti** | `image_id`, `og_image_id` |
| **Blog Posts** | `featured_image_id`, `og_image_id` |
| **Pagine Generiche** | `og_image_id` |
| **Impostazioni Sito** | `logo_id` (gia OK) |
| **Sezioni CMS** | Nessuna FK (usano `content` JSON) |

Le sezioni delle pagine (`homepage_sections`, `chi_siamo_sections`, `microgreens_sections`, etc.) salvano gli ID immagine dentro campi JSONB (`content.background_image_id`, etc.), quindi non hanno foreign keys e non bloccano mai l'eliminazione.

---

## Comportamento Dopo la Modifica

**Prima**: Tentando di eliminare un'immagine usata da un prodotto:
- Errore: "violates foreign key constraint"
- Impossibile procedere

**Dopo**: Eliminando un'immagine usata da un prodotto:
- L'immagine viene eliminata dallo storage e dal database
- Il campo `image_id` del prodotto diventa `NULL`
- Il prodotto continua a esistere, mostrando un placeholder

---

## File da Modificare

| File | Modifica |
|------|----------|
| Nuova migrazione SQL | Ricreare 5 FK con `ON DELETE SET NULL` |

---

## Risultato Atteso

Dopo l'implementazione potrai:
1. Andare nella Media Library
2. Eliminare qualsiasi immagine, anche se usata da prodotti/blog/pagine
3. Ricaricare le immagini ottimizzate (il sistema le comprimera a ~200KB con BlurHash)
4. Riassegnarle ai contenuti nel CMS
