
# Piano: Implementazione Draft/Published per Header/Footer e Fix Bug Preview

## Problema Identificato

Ho analizzato le tre aree richieste e trovato i seguenti risultati:

| Pagina | Stato Draft/Published | Problema |
|--------|----------------------|----------|
| Chi Siamo | Funziona | Nessuno |
| Blog | Funziona (con bug) | La preview cerca solo per `slug` pubblicato, non per `draft_slug` |
| Header/Footer | NON implementato | Le modifiche vanno direttamente live |

## Soluzioni Proposte

### 1. Aggiungere Draft/Published per Header e Footer

**Modifiche al Database:**
- Aggiungere colonne `draft_header_settings` e `draft_footer_settings` alla tabella `site_settings`
- Aggiungere flag `has_draft_header_changes` e `has_draft_footer_changes`

**Modifiche al Codice:**
- Aggiornare `Settings.tsx` per separare "Salva" (draft) da "Pubblica" (live)
- Aggiornare `Navigation.tsx` e `Footer.tsx` per leggere solo dalle colonne live (non draft)

### 2. Fix Bug Preview per Blog con Slug Modificato

Aggiornare `BlogPreview.tsx` per cercare l'articolo con:
```sql
WHERE slug = :slug OR draft_slug = :slug
```

### 3. Fix Bug Preview per Pages con Slug Modificato

Stesso problema in `PagePreview.tsx` - deve cercare anche per `draft_slug`.

## Dettaglio Implementazione

### Fase 1: Migrazione Database

```sql
-- Aggiungere colonne draft per site_settings
ALTER TABLE site_settings 
ADD COLUMN draft_header_settings JSONB,
ADD COLUMN draft_footer_settings JSONB,
ADD COLUMN has_draft_header_changes BOOLEAN DEFAULT FALSE,
ADD COLUMN has_draft_footer_changes BOOLEAN DEFAULT FALSE;
```

### Fase 2: Aggiornare Settings.tsx

1. Modificare `fetchSettings()` per caricare draft con fallback a live
2. Creare funzione `handleSave()` che salva solo nelle colonne draft
3. Creare funzione `handlePublish()` che copia draft → live
4. Aggiungere `PublishActionBar` con indicatore "Modifiche non pubblicate"
5. Separare logica per Header e Footer (possibilità di pubblicare separatamente)

### Fase 3: Fix BlogPreview.tsx

```typescript
// Cambiare la query da:
.eq("slug", slug)

// A:
.or(`slug.eq.${slug},draft_slug.eq.${slug}`)
```

### Fase 4: Fix PagePreview.tsx

Stessa modifica per supportare la ricerca per `draft_slug`.

## File da Modificare

| File | Modifica |
|------|----------|
| `supabase/migrations/...` | Nuova migrazione per colonne draft site_settings |
| `src/pages/admin/Settings.tsx` | Separare Save/Publish, aggiungere PublishActionBar |
| `src/pages/preview/BlogPreview.tsx` | Query per slug OR draft_slug |
| `src/pages/preview/PagePreview.tsx` | Query per slug OR draft_slug |
| `src/integrations/supabase/types.ts` | Auto-generato dopo migrazione |

## Considerazioni Tecniche

### Perche separare Header/Footer draft?
Potrebbe essere utile permettere di salvare modifiche all'Header senza toccare il Footer e viceversa. Tuttavia, per semplicita, propongo un unico pulsante "Pubblica" che pubblica entrambi.

### Comportamento Navigation.tsx e Footer.tsx
Questi componenti sono gia corretti - leggono dalle colonne live (`header_settings`, `footer_settings`), quindi non vedranno i draft. Solo dopo la pubblicazione le modifiche saranno visibili sul sito.

### Preview per Header/Footer?
A differenza delle altre pagine, non esiste una route dedicata `/preview/settings`. Le modifiche al Header/Footer si vedranno su TUTTE le pagine preview (Chi Siamo, Blog, etc.) perche usano lo stesso Layout. Questo e gia il comportamento corretto.
