

## Piano: Aggiungere aspectRatio ai MediaSelector per le immagini Hero

### Problema

Tutte le `MediaSelector` per le immagini hero (Homepage, Blog, Microgreens, Chi Siamo, Microgreens Custom, Blog Overview) non passano `aspectRatio`, quindi il cropper usa il default `1:1` (quadrato). Le hero images dovrebbero usare **16:9** (Homepage hero) o **16:5** (Blog hero background) secondo le specifiche del progetto.

### Cosa fare

Aggiungere la prop `aspectRatio` a ogni `MediaSelector` usata per immagini hero nei pannelli admin:

| File admin | Sezione | Ratio da usare |
|---|---|---|
| `Homepage.tsx` | Hero background_image_id (riga ~420) | `16 / 9` |
| `Homepage.tsx` | What are microgreens image_id (riga ~474) | `4 / 3` |
| `Homepage.tsx` | Custom microgreens image_id (riga ~840) | `4 / 3` |
| `BlogOverview.tsx` | Hero background_image_id (riga ~376) | `16 / 5` |
| `Microgreens.tsx` | Hero background_image_id (riga ~310) | `16 / 9` |
| `Microgreens.tsx` | Info image_id (riga ~603) | `4 / 3` |
| `MicrogreensCustom.tsx` | Hero image_id (riga ~358) | `16 / 9` |
| `ChiSiamo.tsx` | Hero image_id (riga ~338) | `4 / 3` |

### Opzione per semplificare (costanti condivise)

Creare un file `src/lib/aspect-ratios.ts` con costanti riutilizzabili:

```typescript
export const ASPECT_RATIOS = {
  HERO: 16 / 9,
  BLOG_HERO: 16 / 5,
  SECTION: 4 / 3,
  PRODUCT: 1,
  BLOG_CARD: 16 / 9,
} as const;
```

Così ogni `MediaSelector` importa la costante invece di scrivere il numero inline, e se in futuro cambi idea sul ratio lo modifichi in un solo posto.

### Dettagli tecnici

- Nessuna modifica a `MediaSelector.tsx` o `ImageCropper.tsx` — già supportano `aspectRatio` come prop
- Solo aggiunta di prop ai componenti nelle pagine admin
- File coinvolti: 6 pagine admin + 1 nuovo file costanti

