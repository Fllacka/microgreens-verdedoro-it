

# Piano Rivisto: Ottimizzazione Performance - LCP sotto 2.5s

## Diagnosi Confermata

| Metrica | Attuale | Target |
|---------|---------|--------|
| LCP | 10.2s | < 2.5s |
| FCP | 4.3s | < 1.8s |
| Performance Score | 63 | > 90 |

**Problema critico**: L'immagine Hero (5.9MB PNG) viene scoperta solo dopo 4 chiamate API a Supabase.

---

## Soluzione in 5 Fasi

### Fase 1: Formato WebP/AVIF Universale

**Problema attuale**: `getTransformedImageUrl()` non forza il formato WebP.

**Soluzione**: Aggiornare `src/lib/image-utils.ts` per aggiungere automaticamente `format=webp` a tutte le trasformazioni.

```typescript
// In getTransformedImageUrl()
params.set('format', 'webp'); // Sempre WebP per tutti
```

**Impatto**: Ogni immagine servita dal sito sara automaticamente WebP, riducendo il peso del 25-35%.

---

### Fase 2: Compressione Client-Side Prima dell'Upload

**Problema attuale**: File da 6MB vengono caricati senza compressione.

**Soluzione**: Integrare `browser-image-compression` in `src/pages/admin/Media.tsx`.

```typescript
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.5,           // Max 500KB
    maxWidthOrHeight: 1920,   // Max full HD
    useWebWorker: true,
    fileType: 'image/webp',   // Converti sempre in WebP
    initialQuality: 0.85,
  };
  return await imageCompression(file, options);
};

// Nel handleFileUpload:
const compressedFile = await compressImage(file);
const dimensions = await getImageDimensions(compressedFile);
// Upload compressedFile invece di file
```

**Impatto**: Nessun file oltre 500KB entrera mai nello storage. Risparmio permanente di banda e spazio.

---

### Fase 3: BlurHash per Perceived Performance

**Problema attuale**: Il localStorage hack funziona solo per visitatori di ritorno.

**Soluzione**: Implementare BlurHash per migliorare la percezione di velocita per tutti.

#### 3a. Aggiungere colonna `blurhash` alla tabella media

```sql
ALTER TABLE media ADD COLUMN blurhash text;
ALTER TABLE media ADD COLUMN width integer;
ALTER TABLE media ADD COLUMN height integer;
ALTER TABLE media ADD COLUMN is_hero boolean DEFAULT false;
```

#### 3b. Generare BlurHash durante upload

```typescript
import { encode } from 'blurhash';

const generateBlurHash = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32; // Piccola dimensione per performance
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, 32, 32);
      const imageData = ctx.getImageData(0, 0, 32, 32);
      const hash = encode(imageData.data, 32, 32, 4, 3);
      resolve(hash);
    };
    img.src = URL.createObjectURL(file);
  });
};
```

#### 3c. Usare BlurHash nel componente SmartImage

Il BlurHash (stringa di ~30 caratteri) viene decodificato istantaneamente come placeholder sfocato mentre l'immagine reale carica.

---

### Fase 4: Componente SmartImage Globale

**Problema attuale**: Logica srcset/sizes sparsa in piu file.

**Soluzione**: Creare `src/components/ui/SmartImage.tsx` riutilizzabile ovunque.

```typescript
interface SmartImageProps {
  src: string;
  alt: string;
  blurhash?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  context?: ImageSizeKey;
  className?: string;
}

const SmartImage = ({
  src,
  alt,
  blurhash,
  width,
  height,
  priority = false,
  context = 'medium',
  className,
}: SmartImageProps) => {
  const [loaded, setLoaded] = useState(false);
  
  // Genera srcset con format=webp
  const srcSet = getResponsiveSrcSet(src);
  const sizes = getImageSizes(context);
  
  return (
    <div className="relative" style={{ width, height }}>
      {/* BlurHash placeholder - renderizzato istantaneamente */}
      {blurhash && !loaded && (
        <Blurhash
          hash={blurhash}
          width="100%"
          height="100%"
          className="absolute inset-0"
        />
      )}
      
      {/* Immagine reale */}
      <img
        src={getImageUrl(src, context)}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={() => setLoaded(true)}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
      />
    </div>
  );
};
```

---

### Fase 5: Preload Hero con Build-Time Injection

**Problema attuale**: L'URL dell'immagine hero e dinamico (CMS) ma il preload deve essere nel HTML statico.

**Soluzione Implementabile in Vite**: Creare un plugin Vite che inietta il preload durante il build.

#### 5a. Creare script di fetch hero URL

```typescript
// scripts/fetch-hero-url.ts
import { createClient } from '@supabase/supabase-js';

export async function getHeroImageUrl(): Promise<string | null> {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
  );
  
  const { data } = await supabase
    .from('homepage_sections')
    .select('content')
    .eq('id', 'hero')
    .single();
  
  if (data?.content?.background_image_id) {
    const { data: media } = await supabase
      .from('media')
      .select('file_path')
      .eq('id', data.content.background_image_id)
      .single();
    
    return media?.file_path || null;
  }
  return null;
}
```

#### 5b. Plugin Vite per injection

```typescript
// vite-plugin-hero-preload.ts
import { Plugin } from 'vite';
import { getHeroImageUrl } from './scripts/fetch-hero-url';
import { getImageUrl } from './src/lib/image-utils';

export function heroPreloadPlugin(): Plugin {
  return {
    name: 'hero-preload',
    async transformIndexHtml(html) {
      const heroUrl = await getHeroImageUrl();
      if (heroUrl) {
        const optimizedUrl = getImageUrl(heroUrl, 'hero');
        const preloadTag = `<link rel="preload" as="image" href="${optimizedUrl}" fetchpriority="high">`;
        return html.replace('</head>', `${preloadTag}\n</head>`);
      }
      return html;
    },
  };
}
```

#### 5c. Webhook per Auto-Rebuild (Opzionale)

Quando l'immagine hero viene cambiata nel CMS, un webhook puo triggerare il rebuild automatico su Vercel/Netlify.

---

## File da Modificare

| File | Modifica |
|------|----------|
| `src/lib/image-utils.ts` | Aggiungere `format=webp` a tutte le trasformazioni |
| `src/pages/admin/Media.tsx` | Compressione client-side + estrazione BlurHash |
| `src/components/ui/SmartImage.tsx` | Nuovo componente globale con BlurHash + srcset |
| `src/pages/Index.tsx` | Usare SmartImage per Hero e sezioni |
| `vite.config.ts` | Aggiungere plugin per preload injection |
| Database | Nuove colonne: blurhash, width, height, is_hero |
| `package.json` | Nuove dipendenze: browser-image-compression, blurhash, react-blurhash |

---

## Dipendenze da Installare

```bash
npm install browser-image-compression blurhash react-blurhash
```

---

## Impatto Previsto

| Metrica | Prima | Dopo | Miglioramento |
|---------|-------|------|---------------|
| LCP | 10.2s | ~2.0s | **-80%** |
| FCP | 4.3s | ~1.5s | **-65%** |
| Image Size (hero) | 5.9MB | ~120KB | **-98%** |
| Perceived Load | Schermo bianco | BlurHash immediato | **Istantaneo** |
| Performance Score | 63 | 90+ | **+30 punti** |

---

## Ordine di Implementazione

1. **Fase 1** - WebP universale (5 min) - Impatto immediato su tutte le immagini
2. **Fase 2** - Compressione upload (15 min) - Previene futuri problemi
3. **Fase 4** - SmartImage component (20 min) - Base per BlurHash
4. **Fase 3** - BlurHash (30 min) - Perceived performance
5. **Fase 5** - Build-time preload (20 min) - LCP ottimale

---

## Azione Immediata Consigliata

**Prima di tutto il resto**: Sostituire manualmente l'immagine hero attuale (5.9MB PNG) con una versione JPEG/WebP ottimizzata (~200KB). Questo dara un miglioramento immediato del 90% mentre implementiamo il sistema automatico.

