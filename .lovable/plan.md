

## Favicon CMS — Campo nella sezione "Logo & Generali"

### Cosa viene aggiunto

Un campo "Favicon" nella tab "Logo & Generali" delle Impostazioni, subito sotto il selettore del Logo. L'admin potra caricare un'immagine dalla Media Library e il favicon verra aggiornato dinamicamente sul sito senza modificare `index.html` manualmente.

### Come funziona

1. L'admin seleziona un'immagine dalla Media Library (ideale: PNG/ICO 32x32 o 64x64, oppure SVG)
2. L'URL viene salvato nel database insieme alle altre impostazioni del sito
3. Un componente React inietta dinamicamente il tag `<link rel="icon">` nell'`<head>` della pagina
4. Ogni volta che il favicon cambia nel CMS, il sito lo aggiorna automaticamente

### Best practice implementate

- Supporto per formati PNG, ICO, SVG e WebP
- Tag `<link rel="icon">` con attributo `type` dinamico basato sull'estensione del file
- Tag aggiuntivo `<link rel="apple-touch-icon">` per dispositivi iOS
- Fallback al file `/favicon.ico` statico se nessun favicon e configurato nel CMS
- Guida inline con requisiti consigliati (32x32 o 64x64 px, PNG con sfondo trasparente)

---

### Dettagli tecnici

#### 1. Migrazione database

Aggiungere colonna `favicon_id` (UUID, nullable, FK verso `media`) alla tabella `site_settings`.

```sql
ALTER TABLE public.site_settings
  ADD COLUMN favicon_id UUID REFERENCES public.media(id) ON DELETE SET NULL;
```

#### 2. Componente `DynamicFavicon`

Nuovo componente `src/components/DynamicFavicon.tsx` che:
- Fa una query a `site_settings` per ottenere `favicon_id` con join su `media.file_path`
- Crea/aggiorna un tag `<link rel="icon">` nel `<head>` del documento
- Aggiunge anche un tag `<link rel="apple-touch-icon">` per iOS
- Determina automaticamente il `type` MIME dall'estensione del file (image/png, image/x-icon, image/svg+xml, etc.)
- Fallback a `/favicon.ico` se nessun favicon e configurato

#### 3. Aggiornamento Settings.tsx

Nella tab "Logo & Generali", aggiungere un secondo `MediaSelector` per il favicon sotto quello del logo, con:
- Label "Favicon del Sito"
- Guida con requisiti (32x32 o 64x64 px, PNG consigliato)
- State `faviconId` / `faviconUrl`
- Salvataggio nella colonna `favicon_id` di `site_settings` (insieme al `logo_id` nel `handleSave` e `handlePublish`)

#### 4. Aggiornamento Layout.tsx

Importare e montare `<DynamicFavicon />` nel Layout principale, cosi il favicon e attivo su tutte le pagine del sito.

#### 5. Aggiornamento query fetch in Settings.tsx

Estendere la select query per includere `favicon_id` e il join sulla media corrispondente.

### Sequenza

1. Migrazione DB (aggiunta colonna `favicon_id`)
2. Creare componente `DynamicFavicon`
3. Aggiornare `Settings.tsx` (UI + save/publish)
4. Montare `DynamicFavicon` in `Layout.tsx`
