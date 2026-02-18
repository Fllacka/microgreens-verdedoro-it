

## Aggiornamento Email e Miglioramento Template

### Cosa faremo

1. **Aggiornare l'indirizzo email destinatario** nella funzione di invio da `verdedoro.microgreens@gmail.com` a `microgreens.verdedoro@gmail.com`

2. **Aggiornare il link WhatsApp** nella pagina Contatti: il link attuale punta a un numero di test (333 000 0000), lo aggiorneremo al numero reale +39 320 263 8648

3. **Riprogettare le email** con un design piu pulito e moderno per entrambe:

   **Email al produttore (business):**
   - Design piu pulito e minimal, meno gradienti pesanti
   - Header con logo testuale Verde d'Oro piu elegante
   - Tabella prodotti piu leggibile con spacing migliore
   - Card dati cliente piu chiara
   - Pulsante "Rispondi al Cliente" piu evidente

   **Email al cliente (conferma):**
   - Design caldo e rassicurante
   - Riepilogo ordine piu chiaro e ordinato
   - Timeline "cosa succede ora" piu visiva
   - Link WhatsApp aggiornato al numero reale
   - Footer con indirizzo aggiornato

### Dettagli Tecnici

**File modificati:**

1. `supabase/functions/send-quote-request/index.ts`
   - Cambiare email destinatario a `microgreens.verdedoro@gmail.com` (riga 285)
   - Ridisegnare il template HTML business: colori piu soft, tipografia piu pulita, meno gradienti inline, tabella prodotti con bordi sottili e spaziatura migliorata
   - Ridisegnare il template HTML cliente: layout piu arioso, riepilogo ordine con design card, timeline con icone numeriche, CTA WhatsApp con numero reale (+39 320 263 8648)
   - Aggiornare l'indirizzo nel footer email (se hai un indirizzo reale da inserire al posto di "Via delle Microgreens, 42")

2. `src/pages/Contatti.tsx`
   - Aggiornare il fallback email da `verdedoro.microgreens@gmail.com` a `microgreens.verdedoro@gmail.com` (riga 169)

3. `src/pages/preview/ContattiPreview.tsx`
   - Stesso aggiornamento del fallback email per coerenza nella preview

### Principi di Design per le Email

- Palette: verde scuro (#2d5016) come accento, fondo bianco, grigio chiaro per le sezioni
- Tipografia: font-stack system (Segoe UI, Arial) per massima compatibilita
- Spaziatura: padding generoso (24-40px) per leggibilita su mobile
- Tabella prodotti: bordi sottili, header colorato ma non troppo saturo, righe alternate
- Bottoni: angoli arrotondati, ombra leggera, colore dorato per le CTA principali
