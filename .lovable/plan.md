

# Piano: Fix Draft Preview per Homepage

## Problema Identificato

Ho trovato **due problemi** distinti:

### Problema 1: Preview non mostra i contenuti Draft
| Componente | Comportamento Attuale | Problema |
|------------|----------------------|----------|
| `HomepagePreview.tsx` | Renderizza `<Index />` direttamente | `Index.tsx` legge solo le colonne live |
| `Index.tsx` | Fetcha `content` e `is_visible` | Non legge `draft_content` e `draft_is_visible` |

**Risultato**: Quando clicchi "Salva e Anteprima", vedi sempre i dati pubblicati, mai le modifiche draft.

### Problema 2: Errore Console "React.jsx: type is invalid"
L'icona `SeedingHand` è inclusa in `ICON_OPTIONS` ma **non** in `ICON_COMPONENTS` nel file `Homepage.tsx`, causando un errore quando l'admin seleziona quell'icona.

---

## Soluzione Proposta

### Fase 1: Creare una versione Preview della Homepage

Invece di riutilizzare `Index.tsx`, devo creare una logica specifica per la preview che:
1. Fetchi i dati prioritizzando `draft_content` con fallback a `content`
2. Applichi lo stesso pattern usato nelle altre preview (ChiSiamo, Blog, etc.)

**Approccio tecnico:**
- Modificare `HomepagePreview.tsx` per fetchare direttamente i dati draft invece di usare `<Index />`
- Oppure: Passare un prop `isPreview` a `Index.tsx` che cambia la logica di fetch

**Scelta consigliata**: Modificare `Index.tsx` per accettare un prop `isPreview` che, se `true`, legge dalle colonne draft. Questo mantiene la coerenza del rendering e evita duplicazione del codice.

### Fase 2: Fix errore icona mancante

Aggiungere `SeedingHand` (che usa il componente `SeedingHandIcon`) alla mappa `ICON_COMPONENTS` in `Homepage.tsx`.

---

## File da Modificare

| File | Modifica |
|------|----------|
| `src/pages/Index.tsx` | Aggiungere prop `isPreview` e logica per leggere draft |
| `src/pages/preview/HomepagePreview.tsx` | Passare `isPreview={true}` a Index |
| `src/pages/admin/Homepage.tsx` | Aggiungere `SeedingHand: SeedingHandIcon` a ICON_COMPONENTS |

---

## Dettaglio Implementazione

### Index.tsx - Aggiungere supporto Preview

```typescript
// Aggiungere prop
interface IndexProps {
  isPreview?: boolean;
}

const Index = ({ isPreview = false }: IndexProps) => {
  // ...

  const fetchSections = async () => {
    // Modificare la query per includere draft columns
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("id, content, is_visible, draft_content, draft_is_visible")
      .order("sort_order");

    if (!error && data) {
      const sectionsMap: Record<string, HomepageSection> = {};
      data.forEach(section => {
        // Se in preview, prioritizza draft con fallback a live
        const content = isPreview 
          ? (section.draft_content ?? section.content)
          : section.content;
        const isVisible = isPreview
          ? (section.draft_is_visible ?? section.is_visible)
          : section.is_visible;
          
        sectionsMap[section.id] = {
          id: section.id,
          content: content as Record<string, any>,
          is_visible: isVisible,
        };
      });
      setSections(sectionsMap);
      // ... rest of image fetching
    }
  };
};
```

### HomepagePreview.tsx - Passare prop

```typescript
// Cambiare da:
<Index />

// A:
<Index isPreview={true} />
```

### Homepage.tsx - Fix icona mancante

```typescript
import SeedingHandIcon from "@/components/icons/SeedingHandIcon";

const ICON_COMPONENTS: Record<string, LucideIcon | React.ComponentType<{className?: string}>> = {
  SeedingHand: SeedingHandIcon,  // <-- Aggiungere questa riga
  Leaf, Heart, Truck, Shield, Sprout, Package, UtensilsCrossed, Star,
  ShoppingBag, Scissors, Bike, Sparkles, Flame, Sun, ChefHat, ArrowRight, Hand, HandCoins,
};
```

---

## Comportamento Finale

1. **Sito Live** (`/`): `Index` viene chiamato senza props, quindi `isPreview = false` e legge solo dati pubblicati
2. **Preview** (`/preview/homepage`): `Index` viene chiamato con `isPreview={true}`, quindi legge dati draft con fallback a live
3. **Admin** (`/admin/homepage`): Il selettore icone funziona correttamente senza errori console

---

## Considerazioni

Questo approccio:
- Evita duplicazione del codice di rendering della homepage
- Mantiene coerenza visiva tra preview e sito live
- Segue lo stesso pattern delle altre pagine preview del CMS
- Risolve anche l'errore console relativo all'icona mancante

