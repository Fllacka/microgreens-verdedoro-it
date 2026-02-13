

## Header completamente opaco

### Problema
Anche con `backdrop-blur-sm`, lo sfondo dell'header resta troppo trasparente e le immagini hero rendono illeggibile la navigazione.

### Soluzione
Rendere lo sfondo dell'header 100% opaco (`bg-background`) in entrambi gli stati (top e scrolled), eliminando qualsiasi trasparenza.

### Dettaglio tecnico

**File: `src/components/Navigation.tsx` (righe 204-207)**

```text
Prima:
  scrolled  → "bg-background/98 backdrop-blur-sm"
  top       → "bg-background/95 backdrop-blur-sm"

Dopo:
  scrolled  → "bg-background shadow-sm"
  top       → "bg-background"
```

Si rimuovono le classi `backdrop-blur-sm` (non servono più con sfondo opaco) e le opacità `/98` e `/95`. L'header mantiene la transizione di padding e l'ombra allo scroll.

