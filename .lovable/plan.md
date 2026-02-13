

## Ridurre il blur dell'header

Mantenere la trasparenza attuale dell'header ma ridurre l'intensità del backdrop-blur per un effetto più leggero.

### Modifica

**File: `src/components/Navigation.tsx` (riga ~192-195)**

Aggiornare le classi del `<nav>`:

- **Stato scrolled**: cambiare `backdrop-blur-md` in `backdrop-blur-sm`
- **Stato iniziale (top)**: cambiare `backdrop-blur` in `backdrop-blur-sm` e rimuovere la regola `supports-[backdrop-filter]:bg-background/60` che abbassa ulteriormente l'opacità al 60%

Il risultato sarà un header che mantiene la sua trasparenza naturale (`bg-background/95` e `bg-background/98`) con un blur più sottile, senza quella regola che lo rende quasi trasparente sui browser moderni.

### Dettaglio tecnico

```text
Prima:
  scrolled  → "bg-background/98 backdrop-blur-md"
  top       → "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"

Dopo:
  scrolled  → "bg-background/98 backdrop-blur-sm"
  top       → "bg-background/95 backdrop-blur-sm"
```

Una sola riga da modificare, nessun impatto funzionale.
