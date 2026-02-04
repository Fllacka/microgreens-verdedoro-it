# Piano di Implementazione: Sistema di Ottimizzazione Immagini On-Demand

## ✅ STATO: IMPLEMENTATO

Tutti gli step sono stati completati con successo.

---

## Obiettivo
Raggiungere PageSpeed Performance 90+ su mobile con LCP < 2.5s attraverso un sistema intelligente di ottimizzazione immagini on-demand.

---

## Architettura Implementata

```text
┌─────────────────────────────────────────────────────────────────┐
│                        FLUSSO IMMAGINI                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. UPLOAD (Media Library) ✅                                   │
│     └─> Salva originale in storage                              │
│     └─> Estrai width/height/blurhash (robusto per file grandi)  │
│     └─> NON comprime client-side (server-side on-demand)        │
│                                                                 │
│  2. SELEZIONE (MediaSelector con context) ✅                    │
│     └─> Admin sceglie immagine per: hero, productCard, etc.     │
│     └─> Chiama Edge Function con context specifico              │
│     └─> Genera SOLO la versione necessaria                      │
│                                                                 │
│  3. RENDERING (SmartImage / OptimizedImage) ✅                  │
│     └─> Usa versione ottimizzata se esiste                      │
│     └─> BlurHash come placeholder istantaneo                    │
│     └─> Lazy loading per below-fold                             │
│     └─> Priority loading per hero/LCP                           │
│                                                                 │
│  4. CACHING ✅                                                  │
│     └─> Cache-Control: 1 anno per tutti gli asset               │
│     └─> Versioni cached per context in storage                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Risultati dell'Implementazione

### ✅ STEP 2: Ottimizzazione On-Demand

#### 2.1 Edge Function `optimize-image` - COMPLETATA
- **File**: `supabase/functions/optimize-image/index.ts`
- Accetta `storagePath`, `mediaId`, e `context`
- Ridimensiona usando OffscreenCanvas API
- Converte in WebP con qualità configurabile
- Salva in `optimized/{context}/`
- Aggiorna `optimized_versions` nel database

**Configurazioni Context:**
| Context | Width | Height | Quality |
|---------|-------|--------|---------|
| hero | 1920 | auto | 85 |
| productCard | 800 | 800 | 85 |
| productDetail | 1200 | 1200 | 85 |
| articleCard | 800 | auto | 85 |
| thumbnail | 300 | 300 | 70 |
| ogImage | 1200 | 630 | 85 |

#### 2.2 Upload Media Library - COMPLETATA
- **File**: `src/pages/admin/Media.tsx`
- Rimossa compressione client-side (causa fallimenti su file grandi)
- `extractImageMetadata()` estrae width/height/blurhash in modo robusto
- Pre-resize a 300px per BlurHash su file > 2MB

#### 2.3 Schema Database - COMPLETATA
- Migrazione eseguita: colonna `optimized_versions` JSONB aggiunta

---

### ✅ STEP 3: Ottimizzazione Context-Aware

#### 3.1 MediaSelector Aggiornato - COMPLETATA
- **File**: `src/components/admin/MediaSelector.tsx`
- Nuova prop `context: ImageSizeKey`
- Trigger automatico ottimizzazione on-demand alla selezione
- Badge per versioni ottimizzate e warning bassa risoluzione
- Passa metadata (width, height, blurhash, optimizedUrl) al parent

---

### ✅ STEP 4: Output HTML Automatico

#### 4.1 SmartImage Migliorato - COMPLETATA
- **File**: `src/components/ui/SmartImage.tsx`
- Nuova prop `optimizedUrl` (priorità su src)
- BlurHash placeholder istantaneo
- Aspect ratio calcolato da width/height
- Priority loading per LCP images

#### 4.2 OptimizedImage Migliorato - COMPLETATA
- **File**: `src/components/ui/optimized-image.tsx`
- Stesse nuove props di SmartImage
- BlurHash support aggiunto

#### 4.3 ProductCard Aggiornato - COMPLETATA
- **File**: `src/components/ProductCard.tsx`
- Nuove props: `blurhash`, `optimizedUrl`, `imageWidth`, `imageHeight`

---

### ✅ STEP 5: Interfaccia CMS

- Preview contestuale con badge dimensioni
- Warning risoluzione bassa (< 80% della dimensione target)
- Badge "Ottimizzato ({context})" per versioni esistenti

---

### ✅ STEP 6: Cache Headers

- Tutte le immagini caricate con `cacheControl: '31536000'` (1 anno)
- Edge function imposta stesso cache per versioni ottimizzate

---

## File Modificati/Creati

| File | Tipo | Descrizione |
|------|------|-------------|
| `supabase/functions/optimize-image/index.ts` | Nuovo | Edge function ottimizzazione |
| `supabase/config.toml` | Modificato | Aggiunta config per optimize-image |
| `src/lib/image-compression.ts` | Modificato | `extractImageMetadata()`, BlurHash robusto |
| `src/lib/image-utils.ts` | Modificato | Aggiunti productDetail, ogImage |
| `src/components/admin/MediaSelector.tsx` | Modificato | Context prop, trigger ottimizzazione |
| `src/components/ui/SmartImage.tsx` | Modificato | optimizedUrl, BlurHash |
| `src/components/ui/optimized-image.tsx` | Modificato | optimizedUrl, BlurHash |
| `src/components/ProductCard.tsx` | Modificato | Props per metadata immagine |

---

## Risultati Attesi

| Metrica | Prima | Dopo |
|---------|-------|------|
| File size hero | 5+ MB | ~150 KB |
| File size product card | 5+ MB | ~45 KB |
| LCP mobile | 3-5s | < 2.5s |
| CLS | Variabile | ~0 (con width/height) |
| BlurHash | Assente | Presente |
| PageSpeed mobile | 50-70 | 90+ |

---

## Prossimi Passi Consigliati

1. **Testare il flusso completo** - Caricare una nuova immagine e verificare che:
   - Metadata (width, height, blurhash) vengono estratti
   - Selezionando l'immagine per un context, viene generata la versione ottimizzata
   - L'immagine ottimizzata viene mostrata nel frontend

2. **Aggiornare le pagine pubbliche** per passare i nuovi metadata:
   - `src/pages/Index.tsx` - Hero section con BlurHash
   - `src/pages/ProductDetail.tsx` - Product image con BlurHash
   - `src/pages/Microgreens.tsx` - Grid prodotti

3. **Eseguire PageSpeed Insights** dopo aver caricato immagini ottimizzate

4. **Ottimizzare immagini esistenti** - Le immagini già in database non hanno metadata. Si può:
   - Ricaricarle tramite Media Library
   - Oppure creare uno script batch per estrarre metadata
