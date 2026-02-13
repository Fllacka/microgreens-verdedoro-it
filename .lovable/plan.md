

## Eliminare il Flash di Contenuto Placeholder - Soluzione Definitiva

### Causa Radice Identificata

Il loading guard funziona per il primo caricamento, ma ci sono due problemi residui:

1. **Homepage - caricamento a due fasi**: `loading` diventa `false` dopo le sezioni, ma i prodotti in evidenza vengono caricati in un secondo `useEffect` separato. Durante questa finestra, vengono mostrati prodotti hardcoded che poi vengono sostituiti dai reali.

2. **Tutte le pagine - fallback `||` nel JSX**: espressioni come `{heroSection?.content?.title || "I Nostri Microgreens"}` mostrano il placeholder se la chiave non esiste ancora nel momento del render, anche se `loading` e `false`.

### Soluzione: Combinazione di Opzione A + fix del caricamento a due fasi

**Approccio**: Assicurarsi che TUTTI i dati necessari siano disponibili prima di mostrare il contenuto, e rimuovere i fallback visibili dall'utente.

### File da modificare

**1. `src/pages/Index.tsx`**

- Spostare `fetchFeaturedProducts` DENTRO il `fetchData` iniziale, cosi che `loading` diventi `false` solo quando anche i prodotti in evidenza sono pronti
- Rafforzare il guard: `if (loading || Object.keys(sections).length === 0)` per verificare che i dati CMS siano effettivamente presenti
- Rimuovere i `defaultProducts` hardcoded (righe 331-355) e il relativo flag `hasDefaultProducts`, dato che non servono piu con il loading guard

**2. `src/pages/Microgreens.tsx`**

- Rafforzare il guard: `if (loading || Object.keys(sections).length === 0)` per coprire il caso in cui `loading` diventa `false` prima che `sections` sia popolato

**3. `src/pages/ChiSiamo.tsx`**

- Stesso rafforzamento del guard: `if (loading || Object.keys(sections).length === 0)`

**4. `src/pages/Blog.tsx`**

- Stesso rafforzamento del guard: `if (loading || Object.keys(sections).length === 0)`

### Dettaglio tecnico

**Index.tsx - Unificare il caricamento**:

```text
Prima:
  useEffect 1: fetchSections() + fetchBlogPosts() → setLoading(false)
  useEffect 2: quando sections.featured_products cambia → fetchFeaturedProducts()

Dopo:
  useEffect 1: fetchSections() → fetchFeaturedProducts() → fetchBlogPosts() → setLoading(false)
  (tutto in sequenza dentro un unico flusso)
```

Il flusso diventa:
1. Fetch sezioni CMS
2. Dalle sezioni, estrai gli slug dei prodotti in evidenza
3. Fetch prodotti in evidenza
4. Fetch blog posts
5. Solo ora: `setLoading(false)`

**Tutte le pagine - Guard rafforzato**:

```tsx
// Prima
if (loading) {
  return <Layout><PageLoading /></Layout>;
}

// Dopo
if (loading || Object.keys(sections).length === 0) {
  return <Layout><PageLoading /></Layout>;
}
```

### Impatto

- La Homepage non mostrera piu prodotti hardcoded che poi vengono sostituiti
- Tutte le pagine verificano che i dati CMS siano effettivamente presenti prima del render
- I fallback `||` nel JSX restano come sicurezza ma non saranno piu visibili all'utente perche i dati sono sempre pronti quando la pagina viene mostrata
- Nessuna dipendenza aggiuntiva necessaria

