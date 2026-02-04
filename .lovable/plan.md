
# Piano di Implementazione: Sistema di Ottimizzazione Immagini On-Demand

## Obiettivo
Raggiungere PageSpeed Performance 90+ su mobile con LCP < 2.5s attraverso un sistema intelligente di ottimizzazione immagini on-demand.

---

## Stato Attuale (Problemi Identificati)

### Database Media
| File | Dimensione | Width | Height | BlurHash |
|------|-----------|-------|--------|----------|
| broccoli_microgreens.jpg | 988 KB | null | null | null |
| broccoli_microgreens.png | 5.5 MB | null | null | null |
| Salad and Salmon.png | 5.9 MB | null | null | null |
| verde_doro_logo.png | 5.3 MB | null | null | null |

### Problemi Tecnici
1. **Client-side compression fallisce** silenziosamente su file > 5MB
2. **Edge function `process-image`** non ridimensiona realmente (copia file originale)
3. **Supabase `/render/image/`** disabilitato per errori ORB
4. **Nessun BlurHash** = nessun placeholder istantaneo

---

## Architettura Proposta

```text
┌─────────────────────────────────────────────────────────────────┐
│                        FLUSSO IMMAGINI                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. UPLOAD (Media Library)                                      │
│     └─> Salva originale in storage                              │
│     └─> Estrai width/height/blurhash                            │
│     └─> NON comprime (mantiene qualita originale)               │
│                                                                 │
│  2. SELEZIONE (MediaSelector con context)                       │
│     └─> Admin sceglie immagine per: hero, productCard, etc.     │
│     └─> Chiama Edge Function con context specifico              │
│     └─> Genera SOLO la versione necessaria                      │
│                                                                 │
│  3. RENDERING (SmartImage / OptimizedImage)                     │
│     └─> Usa versione ottimizzata se esiste                      │
│     └─> BlurHash come placeholder                               │
│     └─> Lazy loading per below-fold                             │
│     └─> Priority loading per hero/LCP                           │
│                                                                 │
│  4. CACHING                                                     │
│     └─> Cache-Control: 1 anno per asset statici                 │
│     └─> Versioni cached per context                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## STEP 2: Ottimizzazione On-Demand

### 2.1 Nuova Edge Function: `optimize-image`

Creare una nuova edge function che utilizza Sharp (via Deno) per ridimensionamento reale.

**File:** `supabase/functions/optimize-image/index.ts`

**Funzionalita:**
- Accetta `storagePath`, `mediaId`, e `context` (hero, productCard, etc.)
- Scarica immagine originale da storage
- Ridimensiona alle dimensioni appropriate per il context
- Converte in WebP con qualita ottimizzata
- Carica versione ottimizzata in `optimized/{context}/`
- Aggiorna record media con URL ottimizzato

**Configurazioni per Context:**

| Context | Width | Height | Quality | Aspect Ratio |
|---------|-------|--------|---------|--------------|
| hero | 1920 | auto | 85 | 16:9 |
| productCard | 800 | 800 | 85 | 1:1 |
| productDetail | 1200 | 1200 | 85 | 1:1 |
| articleCard | 800 | auto | 85 | 16:9 |
| featuredArticle | 1200 | auto | 80 | 16:9 |
| contentImage | 1536 | auto | 80 | original |
| textImageBlock | 768 | auto | 80 | original |
| sectionImage | 1200 | auto | 80 | original |
| thumbnail | 300 | 300 | 70 | 1:1 |
| logo | 400 | auto | 90 | original |

### 2.2 Aggiornare Upload in Media Library

**File:** `src/pages/admin/Media.tsx`

Modifiche:
- Rimuovere compressione client-side (causa fallimenti)
- Mantenere estrazione metadata (width, height, blurhash) con fallback robusto
- Caricare file originale senza alterazioni
- Usare canvas ridotto (max 300px) per generare BlurHash senza crash di memoria

### 2.3 Schema Database per Ottimizzazioni

Aggiungere colonna `optimized_versions` al table `media`:

```sql
-- Nuova struttura per tracking versioni ottimizzate
ALTER TABLE media ADD COLUMN IF NOT EXISTS optimized_versions jsonb DEFAULT '{}'::jsonb;

-- Esempio struttura:
-- {
--   "hero": { "url": "...", "width": 1920, "height": 1080, "size": 150000 },
--   "productCard": { "url": "...", "width": 800, "height": 800, "size": 45000 }
-- }
```

---

## STEP 3: Ottimizzazione Context-Aware

### 3.1 Aggiornare MediaSelector

**File:** `src/components/admin/MediaSelector.tsx`

Modifiche:
- Aggiungere prop `context: ImageSizeKey` per specificare dove sara usata l'immagine
- Quando si seleziona un'immagine, chiamare edge function con il context
- Mostrare preview nel formato corretto per quel context
- Passare URL ottimizzato al parent component

**Nuova interfaccia:**
```typescript
interface MediaSelectorProps {
  value: string | null;
  onChange: (imageId: string | null, imageUrl: string | null, optimizedUrl?: string | null) => void;
  context?: ImageSizeKey; // 'hero' | 'productCard' | 'articleCard' etc.
  altText?: string;
  onAltTextChange?: (altText: string) => void;
  showAltText?: boolean;
}
```

### 3.2 Aggiornare IMAGE_SIZES

**File:** `src/lib/image-utils.ts`

Gia definito, ma aggiungere:
- `productDetail` per pagina prodotto
- `ogImage` per Open Graph (1200x630)
- Aspect ratio specifici per ogni context

---

## STEP 4: Output HTML Automatico

### 4.1 Migliorare SmartImage Component

**File:** `src/components/ui/SmartImage.tsx`

Modifiche:
- Accettare `optimizedUrl` come prop prioritaria
- Se presente BlurHash, mostrarlo immediatamente
- Generare srcset solo se abbiamo versioni multiple
- Applicare width/height espliciti dal database

**Props aggiornate:**
```typescript
interface SmartImageProps {
  src: string;
  alt: string;
  blurhash?: string | null;
  width?: number;
  height?: number;
  priority?: boolean;
  context?: ImageSizeKey;
  optimizedUrl?: string; // URL pre-ottimizzato dal CMS
  // ...
}
```

### 4.2 Preload per Hero Images

**File:** `vite-plugin-hero-preload.ts`

Il plugin esiste gia. Verificare che:
- Usa URL ottimizzato (non originale)
- Tipo corretto (image/webp)
- fetchpriority="high"

### 4.3 Aggiornare Pagine Pubbliche

**Files da aggiornare:**
- `src/pages/Index.tsx` - Hero section
- `src/pages/ProductDetail.tsx` - Product image
- `src/components/ProductCard.tsx` - Card images
- `src/pages/Blog.tsx` - Article cards
- `src/pages/BlogArticle.tsx` - Featured image

Per ogni pagina:
- Passare BlurHash dal database a SmartImage
- Passare width/height espliciti
- Usare `priority={true}` per above-the-fold

---

## STEP 5: Interfaccia CMS

### 5.1 Preview Contestuale in MediaSelector

**File:** `src/components/admin/MediaSelector.tsx`

Aggiungere:
- Preview dell'immagine nel formato del context selezionato
- Badge con dimensioni risultanti (es. "1920x1080")
- Badge con dimensione file stimata
- Warning se risoluzione sorgente troppo bassa

### 5.2 Focus Point / Crop Control (Fase Futura)

Per una fase successiva:
- Componente per selezionare punto focale
- Salvataggio in database
- Crop intelligente in edge function

---

## STEP 6: Cache Headers

### 6.1 Storage Upload con Cache Lungo

**File:** `src/pages/admin/Media.tsx` (gia implementato)

```typescript
await supabase.storage
  .from("cms-media")
  .upload(filePath, file, {
    cacheControl: '31536000', // 1 anno
  });
```

### 6.2 Edge Function Response Headers

**File:** `supabase/functions/optimize-image/index.ts`

```typescript
await supabase.storage
  .from("cms-media")
  .upload(optimizedPath, optimizedBuffer, {
    contentType: 'image/webp',
    cacheControl: '31536000', // 1 anno
    upsert: true,
  });
```

---

## File da Creare/Modificare

### Nuovi File
| File | Descrizione |
|------|-------------|
| `supabase/functions/optimize-image/index.ts` | Edge function per ottimizzazione reale con Sharp |

### File da Modificare
| File | Modifiche |
|------|-----------|
| `src/pages/admin/Media.tsx` | Rimuovere compressione, migliorare estrazione metadata |
| `src/lib/image-compression.ts` | Rendere piu robusto BlurHash per file grandi |
| `src/components/admin/MediaSelector.tsx` | Aggiungere prop `context`, trigger ottimizzazione on-demand |
| `src/components/ui/SmartImage.tsx` | Supporto `optimizedUrl`, BlurHash migliorato |
| `src/components/ui/optimized-image.tsx` | Allineare con SmartImage |
| `src/lib/image-utils.ts` | Aggiungere nuovi context e aspect ratios |
| `src/pages/Index.tsx` | Passare BlurHash e dimensioni a hero |
| `src/pages/ProductDetail.tsx` | Usare SmartImage con BlurHash |
| `src/components/ProductCard.tsx` | Passare BlurHash dal database |

### Migrazione Database
```sql
-- Aggiungere colonna per versioni ottimizzate per context
ALTER TABLE media ADD COLUMN IF NOT EXISTS optimized_versions jsonb DEFAULT '{}'::jsonb;
```

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

## Ordine di Implementazione

1. **Database Migration** - Aggiungere `optimized_versions`
2. **Edge Function** - Creare `optimize-image` con Sharp
3. **Media Upload** - Correggere estrazione metadata
4. **MediaSelector** - Aggiungere context e trigger ottimizzazione
5. **SmartImage** - Supporto BlurHash e optimizedUrl
6. **Pagine Pubbliche** - Integrare BlurHash e dimensioni
7. **Test End-to-End** - Verificare flusso completo
