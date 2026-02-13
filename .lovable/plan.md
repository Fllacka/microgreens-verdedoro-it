

## Eliminare il Flash di Contenuto Placeholder (FOPC)

### Problema
Quattro pagine renderizzano immediatamente il contenuto di fallback (testi e immagini placeholder) prima che i dati CMS arrivino dal database. Questo causa un "flash" visivo quando il contenuto reale sostituisce quello placeholder.

Le pagine coinvolte:
- **Homepage** (`Index.tsx`) - hero image e testi placeholder visibili prima del caricamento CMS
- **Microgreens** (`Microgreens.tsx`) - hero e titoli con fallback
- **Chi Siamo** (`ChiSiamo.tsx`) - contenuti placeholder
- **Blog** (`Blog.tsx`) - lista articoli

Quattro altre pagine (`CosaSonoMicrogreens`, `ProductDetail`, `BlogArticle`, `MicrogreensCustom`) hanno gia un guard `if (loading)` e non sono affette.

### Soluzione
Aggiungere un **loading guard** all'inizio del `return` di ogni pagina affetta: se `loading` e `true`, mostrare il componente `PageLoading` (spinner gia esistente nel progetto) invece del contenuto con fallback. Una volta che i dati CMS sono caricati, la pagina viene renderizzata direttamente con il contenuto corretto.

### Dettaglio tecnico

Per ognuna delle 4 pagine, aggiungere prima del `return` principale:

```tsx
if (loading) {
  return (
    <Layout>
      <PageLoading />
    </Layout>
  );
}
```

**File da modificare:**

1. **`src/pages/Index.tsx`** (~riga 356) - Aggiungere import di `PageLoading` e guard prima del return
2. **`src/pages/Microgreens.tsx`** (~riga 150) - Aggiungere import di `PageLoading` e guard prima del return. Rimuovere anche il testo "Caricamento prodotti..." inline (riga 239) dato che non sara piu raggiungibile durante il loading
3. **`src/pages/ChiSiamo.tsx`** - Aggiungere import di `PageLoading` e guard prima del return
4. **`src/pages/Blog.tsx`** - Aggiungere import di `PageLoading` e guard prima del return

### Impatto
- Nessun cambio funzionale: il contenuto mostrato dopo il caricamento resta identico
- Le pagine mostreranno uno spinner centrato per pochi millisecondi invece di contenuto placeholder che poi "salta"
- Pattern gia usato con successo nelle altre 4 pagine del sito
- Nessuna dipendenza aggiuntiva necessaria

