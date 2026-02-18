

## Fix: Email non arriva + Carrello non si svuota

### Problema 1: Email non arriva

Il tuo account Resend e' registrato con `verdedoro.microgreens@gmail.com`. Senza un dominio verificato, Resend permette di inviare **solo** a quell'indirizzo. Il destinatario attuale (`microgreens.verdedoro@gmail.com`) viene rifiutato.

**Fix**: Cambiare il destinatario business a `verdedoro.microgreens@gmail.com`.

Nota: l'email al cliente continuera' a non arrivare finche' non si verifica un dominio su Resend. L'email al produttore invece funzionera' subito.

### Problema 2: Carrello non si svuota

Dopo l'invio del form, il codice resetta i campi ma non chiama `clearCart()`.

**Fix**: Aggiungere `clearCart()` dopo il reset del form.

### Modifiche tecniche

**File 1: `supabase/functions/send-quote-request/index.ts`** (riga 267)
- Cambiare `to: ["microgreens.verdedoro@gmail.com"]` in `to: ["verdedoro.microgreens@gmail.com"]`

**File 2: `src/pages/Contatti.tsx`**
- Riga 37: `clearCart` e' gia' importato via `useCart()` (che include `removeItem` e `clearCart`). Aggiungere `clearCart` alla destructuring se non presente.
- Riga 117: Dopo il reset del form, aggiungere `clearCart();`

