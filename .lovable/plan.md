
# Piano: Riordinamento Sezioni Homepage

## Situazione Attuale

Ho analizzato il codice e trovato che:

| Posizione | Sezione Attuale | Sezione Richiesta |
|-----------|-----------------|-------------------|
| 1 | Hero | Hero |
| 2 | Cosa sono i microgreens | Cosa sono i microgreens |
| 3 | Come Funziona | **Prodotti in Evidenza** |
| 4 | Ordini e Consegne | **Come Funziona** |
| 5 | Prodotti in Evidenza | Ordini e Consegne |
| 6 | Microgreens su Misura | Microgreens su Misura |
| 7 | Blog | Blog |

**Problema**: L'ordine delle sezioni e **hardcodato nel JSX** di `Index.tsx`. La colonna `sort_order` nel database esiste ma non viene usata per il rendering dinamico.

## Soluzione

Per implementare correttamente il riordinamento (e permettere futuri cambiamenti dal CMS):

### Fase 1: Aggiornare Index.tsx

Devo spostare il blocco JSX della sezione "Featured Products" **prima** di "Come Funziona" nel file.

**Ordine sezioni nel JSX dopo la modifica:**
1. Hero Section
2. Cosa sono i microgreens
3. **Featured Products** (spostato qui)
4. Come Funziona
5. Ordini e Consegne
6. Microgreens su Misura
7. Blog

### Fase 2: Aggiornare il Database

Aggiornare i valori `sort_order` per riflettere il nuovo ordine:

```sql
UPDATE homepage_sections SET sort_order = 3 WHERE id = 'featured_products';
UPDATE homepage_sections SET sort_order = 4 WHERE id = 'how_it_works';
UPDATE homepage_sections SET sort_order = 5 WHERE id = 'orders_delivery';
```

### Fase 3: Aggiornare il CMS (Homepage.tsx)

Riordinare gli AccordionItem nel CMS per corrispondere al nuovo ordine visivo:
1. Hero
2. Cosa sono i microgreens
3. **Prodotti in Evidenza**
4. Come Funziona
5. Ordini e Consegne
6. Microgreens su Misura
7. Blog
8. SEO

### Fase 4: Aggiustamenti di Design

Verificare che la transizione visiva tra le sezioni sia fluida:
- "Cosa sono i microgreens" ha sfondo `bg-background` (bianco)
- "Featured Products" ha sfondo `bg-gradient-subtle` (gradiente sottile)
- "Come Funziona" ha sfondo `bg-gradient-subtle`

Per evitare due sezioni consecutive con lo stesso sfondo, posso:
- Cambiare "Featured Products" a `bg-background` (bianco)
- Oppure aggiungere un separatore visivo sottile

**Raccomandazione**: Cambiare lo sfondo di "Featured Products" a `bg-background` per creare alternanza visiva.

## File da Modificare

| File | Modifica |
|------|----------|
| `src/pages/Index.tsx` | Spostare blocco Featured Products prima di Come Funziona, aggiustare sfondo |
| `src/pages/admin/Homepage.tsx` | Riordinare AccordionItem nel CMS |
| Database | Aggiornare sort_order via migration |

## Riepilogo Visivo Finale

```text
┌─────────────────────────────┐
│         HERO               │ bg-image (scuro)
├─────────────────────────────┤
│  COSA SONO I MICROGREENS   │ bg-background (bianco)
├─────────────────────────────┤
│   PRODOTTI IN EVIDENZA     │ bg-background (bianco) - modificato
├─────────────────────────────┤
│      COME FUNZIONA         │ bg-gradient-subtle (sfumato)
├─────────────────────────────┤
│    ORDINI E CONSEGNE       │ bg-background (bianco)
├─────────────────────────────┤
│   MICROGREENS SU MISURA    │ bg-gradient-verde (verde scuro)
├─────────────────────────────┤
│          BLOG              │ bg-gradient-subtle (sfumato)
└─────────────────────────────┘
```

Questo crea una buona alternanza di sfondi per guidare l'occhio dell'utente.
