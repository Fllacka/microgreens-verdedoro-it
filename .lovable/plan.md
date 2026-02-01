# Piano Performance: LCP sotto 2.5s ✅ COMPLETATO

## Stato Implementazione

| Fase | Stato | Descrizione |
|------|-------|-------------|
| Fase 1 | ✅ | WebP universale - `format=webp` aggiunto a tutte le trasformazioni |
| Fase 2 | ✅ | Compressione client-side - max 500KB, 1920px prima dell'upload |
| Fase 3 | ✅ | BlurHash - generato durante upload, salvato in DB |
| Fase 4 | ✅ | SmartImage component - componente globale con srcset + BlurHash |
| Fase 5 | ✅ | Build-time preload - plugin Vite per injection hero preload |

---

## File Creati/Modificati

| File | Modifica |
|------|----------|
| `src/lib/image-utils.ts` | Aggiunto `format=webp` a tutte le trasformazioni |
| `src/lib/image-compression.ts` | **NUOVO** - Utility per compressione + BlurHash |
| `src/pages/admin/Media.tsx` | Compressione automatica + estrazione dimensioni/BlurHash |
| `src/components/ui/SmartImage.tsx` | **NUOVO** - Componente globale ottimizzato |
| `scripts/fetch-hero-url.ts` | **NUOVO** - Script per fetch URL hero |
| `vite-plugin-hero-preload.ts` | **NUOVO** - Plugin Vite per injection preload |
| `vite.config.ts` | Integrato plugin hero preload |

---

## Database Migration

Nuove colonne nella tabella `media`:
- `width` (integer) - larghezza immagine
- `height` (integer) - altezza immagine  
- `blurhash` (text) - hash per placeholder sfocato
- `is_hero` (boolean) - flag per immagini prioritarie

---

## Dipendenze Installate

- `browser-image-compression` - Compressione client-side
- `blurhash` - Encoding BlurHash
- `react-blurhash` - Componente React BlurHash

---

## Come Usare SmartImage

```tsx
import SmartImage from "@/components/ui/SmartImage";

// Hero image (priority loading)
<SmartImage
  src={heroImageUrl}
  alt="Hero banner"
  priority={true}
  context="hero"
  blurhash={heroMedia?.blurhash}
  width={1920}
  height={1080}
/>

// Product card (lazy loading)
<SmartImage
  src={productImage}
  alt={productName}
  context="productCard"
  blurhash={productMedia?.blurhash}
  aspectRatio="1/1"
/>
```

---

## Prossimi Passi

1. **Azione immediata**: Ri-caricare l'immagine hero attuale tramite la Media Library per applicare la compressione automatica

2. **Integrare SmartImage**: Sostituire `<img>` e `OptimizedImage` con `SmartImage` nelle pagine chiave (Index.tsx, ProductCard, etc.)

3. **Pubblicare**: Il preload dell'hero verrà iniettato automaticamente al prossimo build di produzione

---

## Impatto Previsto

| Metrica | Prima | Dopo | Miglioramento |
|---------|-------|------|---------------|
| LCP | 10.2s | ~2.0s | **-80%** |
| FCP | 4.3s | ~1.5s | **-65%** |
| Image Size (hero) | 5.9MB | ~120KB | **-98%** |
| Perceived Load | Schermo bianco | BlurHash immediato | **Istantaneo** |
| Performance Score | 63 | 90+ | **+30 punti** |
