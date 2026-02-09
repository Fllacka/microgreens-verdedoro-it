
# Piano: Rimozione Sistema di Ottimizzazione Immagini

## Obiettivo
Semplificare il flusso delle immagini: **carica → inserisci**. Niente compressione, ridimensionamento, conversione WebP, BlurHash, Edge Function o configurazioni per contesto.

---

## Componenti da Rimuovere/Modificare

### 1. File da ELIMINARE

| File | Motivo |
|------|--------|
| `supabase/functions/optimize-image/` | Edge Function per ottimizzazione server-side |
| `src/lib/image-compression.ts` | Libreria compressione client-side + BlurHash |
| `src/components/ui/SmartImage.tsx` | Componente con BlurHash placeholder |

### 2. File da SEMPLIFICARE

| File | Modifiche |
|------|-----------|
| `src/lib/image-utils.ts` | Rimuovere configurazioni contesto, mantenere solo helper URL base |
| `src/components/ui/optimized-image.tsx` | Convertire in semplice `<img>` wrapper senza BlurHash/srcset |
| `src/components/admin/MediaSelector.tsx` | Rimuovere: context prop, chiamata optimize-image, badge ottimizzazione |
| `src/pages/admin/Media.tsx` | Rimuovere: compressImage, BlurHash generation, badge ottimizzazione |

### 3. Pagine Frontend da SEMPLIFICARE

| File | Modifiche |
|------|-----------|
| `src/pages/Index.tsx` | Usare `file_path` diretto invece di `optimized_versions.hero.url` |
| `src/pages/ProductDetail.tsx` | Rimuovere riferimenti a `optimized_versions` |
| `src/components/ProductCard.tsx` | Semplificare `OptimizedImage` → `<img>` base |
| `src/components/ArticleCard.tsx` | Semplificare `OptimizedImage` → `<img>` base |
| `src/components/ContentBlockRenderer.tsx` | Usare `<img>` semplice |

---

## Nuovo Flusso Semplificato

```text
PRIMA (complesso):
┌────────────────────────────────────────────────────────────────────┐
│ Upload → Pre-resize → BlurHash → Store → Select Context →         │
│ Edge Function → Resize/Crop/WebP → Store Optimized → Display      │
└────────────────────────────────────────────────────────────────────┘

DOPO (semplice):
┌─────────────────────────────────────┐
│ Upload → Store → Display            │
└─────────────────────────────────────┘
```

---

## Dettagli Implementazione

### A. Nuovo `MediaSelector.tsx` (semplificato)

```typescript
// PRIMA: context, optimizedUrl, blurhash, chiamata Edge Function
onChange(file.id, file.file_path, optimizedUrl, { width, height, blurhash })

// DOPO: solo ID e URL
onChange(file.id, file.file_path)
```

- Rimuovere prop `context`
- Rimuovere chiamata a `supabase.functions.invoke('optimize-image')`
- Rimuovere badge "Ottimizzato"
- Rimuovere calcolo dimensioni attese

### B. Nuovo `Media.tsx` (upload semplice)

```typescript
// PRIMA
const result = await compressImage(file);
fileToUpload = result.file;
width = result.width;
height = result.height;
blurhash = result.blurhash;

// DOPO
const fileToUpload = file; // Nessuna elaborazione
```

- Rimuovere import `compressImage`
- Upload diretto del file originale
- Rimuovere badge BlurHash/dimensioni

### C. Nuovo componente `SimpleImage.tsx`

```typescript
interface SimpleImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

const SimpleImage = ({ src, alt, className, loading = "lazy" }) => (
  <img 
    src={src} 
    alt={alt} 
    className={className}
    loading={loading}
  />
);
```

### D. Database: Colonne che Rimangono Inutilizzate

Le seguenti colonne nella tabella `media` non verranno più popolate (ma non le eliminiamo per evitare migration distruttive):

- `blurhash` → null
- `optimized_versions` → null  
- `optimized_urls` → null
- `is_optimized` → false
- `width` / `height` → opzionali (utili per layout, ma non obbligatori)

---

## Dipendenze npm da RIMUOVERE

```json
// Possono essere rimosse da package.json:
"blurhash": "^2.0.5",
"react-blurhash": "^0.3.0",
"browser-image-compression": "^2.0.2"
```

---

## Riepilogo Modifiche per File

| Azione | File |
|--------|------|
| **ELIMINA** | `supabase/functions/optimize-image/` |
| **ELIMINA** | `src/lib/image-compression.ts` |
| **ELIMINA** | `src/components/ui/SmartImage.tsx` |
| **SEMPLIFICA** | `src/lib/image-utils.ts` |
| **SEMPLIFICA** | `src/components/ui/optimized-image.tsx` |
| **SEMPLIFICA** | `src/components/admin/MediaSelector.tsx` |
| **SEMPLIFICA** | `src/pages/admin/Media.tsx` |
| **AGGIORNA** | `src/pages/Index.tsx` |
| **AGGIORNA** | `src/pages/ProductDetail.tsx` |
| **AGGIORNA** | `src/components/ProductCard.tsx` |
| **AGGIORNA** | `src/components/ArticleCard.tsx` |
| **AGGIORNA** | `src/components/ContentBlockRenderer.tsx` |
| **AGGIORNA** | Tutte le pagine preview che usano OptimizedImage |

---

## Risultato Finale

**Workflow semplificato:**
1. Vai nella Media Library
2. Clicca "Carica File"
3. Seleziona immagine (nessuna elaborazione)
4. Immagine salvata così com'è
5. Seleziona l'immagine nel prodotto/articolo/pagina
6. L'immagine viene mostrata con un semplice `<img src="...">` 

**Nessuna:**
- Compressione automatica
- Conversione WebP
- BlurHash placeholder
- Edge Function
- Configurazioni per contesto
- Pre-resize
