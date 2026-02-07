
# Piano: Componente ArticleCard Unificato

## Obiettivo
Creare un unico componente `ArticleCard` riutilizzabile per uniformare le card degli articoli blog in tutte e tre le posizioni:
1. Pagina `/blog` (overview)
2. Homepage sezione "Dal nostro blog"
3. Pagina articolo sezione "Articoli Correlati"

---

## Analisi Attuale

| Posizione | Altezza Immagine | Struttura | Pulsante |
|-----------|------------------|-----------|----------|
| /blog | h-48 (192px) | flex-col + flex-1 | "Leggi" fisso in basso |
| Homepage | h-48 (192px) | CardContent semplice | Nessuno, card cliccabile |
| Articoli Correlati | h-48 (192px) | div p-6 | "Leggi articolo" |

**Problema principale**: Le card hanno strutture diverse e il rapporto immagine non corrisponde al formato consigliato 16:9 (800×450px).

---

## Soluzione: Componente ArticleCard

### Struttura del Componente

```text
┌─────────────────────────────────┐
│                                 │
│      Immagine (aspect-video)    │  ← 16:9 ratio
│      16:9 = ~56.25%             │
│                                 │
├─────────────────────────────────┤
│  [Categoria]    [Clock] 3 min   │  ← Badge + tempo lettura
├─────────────────────────────────┤
│  Titolo Articolo                │  ← max 2 righe
│  (line-clamp-2)                 │
├─────────────────────────────────┤
│  Excerpt breve del contenuto    │  ← max 3 righe (flex-1)
│  dell'articolo...               │
├─────────────────────────────────┤
│  12 Gen 2025          [Leggi]   │  ← fisso in basso
└─────────────────────────────────┘
```

### Props del Componente

```typescript
interface ArticleCardProps {
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  publishedAt: string;
  imageUrl?: string;
  readTime?: string;
  showButton?: boolean;        // default: true
  buttonText?: string;         // default: "Leggi"
  className?: string;
  priority?: boolean;          // per lazy loading
  blurhash?: string;
}
```

### Dimensioni Unificate

- **Immagine**: `aspect-video` (16:9) invece di `h-48` fisso
- **Larghezza immagine ottimizzata**: 800px (già configurato come `articleCard`)
- **Altezza risultante**: ~56.25% della larghezza (automatica con aspect-ratio)

---

## File da Creare/Modificare

| File | Azione |
|------|--------|
| `src/components/ArticleCard.tsx` | **CREARE** - Nuovo componente unificato |
| `src/pages/Blog.tsx` | Sostituire card inline con ArticleCard |
| `src/pages/Index.tsx` | Sostituire card blog con ArticleCard |
| `src/pages/BlogArticle.tsx` | Sostituire card correlati con ArticleCard |

---

## Dettagli Implementazione

### 1. Nuovo Componente ArticleCard

Creeremo `src/components/ArticleCard.tsx` con:
- Immagine con aspect-video (16:9)
- OptimizedImage con context="articleCard"
- Layout flex per contenuto
- Pulsante fissato in basso
- Supporto per card cliccabile o con pulsante

### 2. Aggiornamento Blog.tsx

- Importare ArticleCard
- Rimuovere Card inline attuale
- Passare dati formattati al nuovo componente

### 3. Aggiornamento Index.tsx

- Importare ArticleCard  
- Sostituire la card nella sezione blog
- Mantenere la card cliccabile (senza pulsante esplicito o con wrapper Link)

### 4. Aggiornamento BlogArticle.tsx

- Importare ArticleCard
- Sostituire le card nella sezione "Articoli Correlati"

---

## Vantaggi

1. **Consistenza visiva**: Stesse dimensioni e proporzioni ovunque
2. **Manutenibilità**: Un solo componente da aggiornare
3. **Rispetto linee guida**: Immagini 16:9 come da specifiche
4. **DRY**: Nessuna duplicazione di codice

---

## Note Tecniche

- L'aspect ratio 16:9 si ottiene con la classe Tailwind `aspect-video`
- Il componente usa OptimizedImage con size/context "articleCard" (800px width)
- Il layout flex-col con flex-1 sull'excerpt garantisce il pulsante sempre in basso
- La card mantiene hover-lift per feedback visivo
