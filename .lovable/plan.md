

## Piano: Pulizia del vecchio sistema di ottimizzazione immagini

### Contesto

Il vecchio sistema generava automaticamente thumbnails/medium/large + WebP via Edge Function `process-image`, salvando gli URL in `optimized_urls` e `optimized_versions` nella tabella `media`. Ora il cropping manuale con `ImageCropper` rende tutto questo superfluo. L'immagine viene ritagliata e caricata direttamente nel formato finale.

### Cosa rimuovere

**1. Edge Function `process-image`**
- Eliminare `supabase/functions/process-image/index.ts`
- Rimuovere la configurazione `[functions.process-image]` da `supabase/config.toml`

**2. Interfaccia `OptimizedUrls` e campi correlati in `ImageDialog.tsx`**
- Rimuovere l'interfaccia `OptimizedUrls` (thumbnail, medium, large, webp_*)
- Rimuovere `is_optimized` e `optimized_urls` dall'interfaccia `MediaFile`
- Semplificare `onSelectImage` callback: `(url: string, alt: string)` — senza terzo parametro
- Rimuovere la funzione `processImage` e lo stato `processingId`
- Rimuovere il badge "Ottimizzato" che mostra `is_optimized`

**3. Props deprecate in `OptimizedImage.tsx`**
- Rimuovere le props `optimizedUrls`, `size`, `context`, `blurhash`, `optimizedUrl` dall'interfaccia

**4. Query Supabase che selezionano campi inutili** (11 file)
- `Navigation.tsx`: rimuovere `, optimized_urls` dalla select su media
- `Footer.tsx`: idem
- `Microgreens.tsx`: idem
- `ProductDetail.tsx`: rimuovere `optimized_versions, blurhash` dalla select
- `CosaSonoMicrogreens.tsx`: rimuovere `optimized_versions, blurhash` dalla select e dal type della mediaMap
- `BlogArticle.tsx`: idem
- `preview/MicrogreensPreview.tsx`: rimuovere `optimized_urls`
- `preview/ProductPreview.tsx`: rimuovere `optimized_urls`
- `preview/BlogPreview.tsx`: rimuovere `optimized_versions, blurhash` e semplificare mediaMap type
- `preview/CosaSonoMicrogreensPreview.tsx`: idem

**5. Variabile `optimizedUrl` inutilizzata**
- In `CosaSonoMicrogreens.tsx`, `BlogArticle.tsx`, `preview/BlogPreview.tsx`, `preview/CosaSonoMicrogreensPreview.tsx`: la variabile `optimizedUrl` viene calcolata da `optimized_versions?.productCard?.url` ma non viene mai usata. Rimuovere.

**6. Migrazione database (opzionale ma consigliata)**
- Rimuovere le colonne `optimized_urls`, `is_optimized`, `blurhash`, `optimized_versions` dalla tabella `media`
- Questo pulirà anche il file `types.ts` auto-generato

### Cosa NON toccare
- `ImageCropper.tsx` — è il nuovo sistema, resta
- `image-utils.ts` — contiene solo `formatBytes()`, già pulito, resta
- `width`/`height` nella tabella `media` — utili per layout e CLS prevention

### Dettagli tecnici

File coinvolti: ~14 file di codice + 1 Edge Function + 1 config + 1 migrazione DB.

La migrazione SQL sarà:
```sql
ALTER TABLE media DROP COLUMN IF EXISTS optimized_urls;
ALTER TABLE media DROP COLUMN IF EXISTS is_optimized;
ALTER TABLE media DROP COLUMN IF EXISTS blurhash;
ALTER TABLE media DROP COLUMN IF EXISTS optimized_versions;
```

