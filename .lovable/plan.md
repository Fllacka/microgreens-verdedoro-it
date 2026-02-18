

## Fix Completo Email: Dominio Verificato + API Key + Indirizzo Corretto

### Cosa c'e' di sbagliato ora

I log mostrano chiaramente l'errore di Resend:
> "You can only send testing emails to your own email address (microgreens.verdedoro@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain."

Tre problemi nella funzione attuale:

1. Il campo `from` usa `onboarding@resend.dev` (dominio di test Resend) invece del dominio verificato `microgreens.verdedoro.it`
2. Il campo `to` ha l'indirizzo invertito: `verdedoro.microgreens@gmail.com` invece di `microgreens.verdedoro@gmail.com`
3. La API key potrebbe essere quella vecchia -- va aggiornata con la nuova "VerdeDoro Website"

### Cosa faremo

1. **Aggiornare la API key** di Resend nel backend con quella nuova "VerdeDoro Website"
2. **Correggere il mittente (`from`)** in entrambe le email:
   - Da: `"Verde d'Oro <onboarding@resend.dev>"`
   - A: `"Verde d'Oro <noreply@microgreens.verdedoro.it>"`
3. **Correggere il destinatario business (`to`)**:
   - Da: `["verdedoro.microgreens@gmail.com"]`
   - A: `["microgreens.verdedoro@gmail.com"]`

### Risultato atteso

- L'email al produttore arrivera' a `microgreens.verdedoro@gmail.com`
- L'email di conferma al cliente verra' inviata dal dominio verificato
- Entrambe le email passeranno i controlli di Resend

### Dettagli tecnici

**Segreto da aggiornare:**
- `RESEND_API_KEY` -- verra' aggiornato con la nuova chiave "VerdeDoro Website"

**File: `supabase/functions/send-quote-request/index.ts`**

Riga 266: cambiare `from` da `"Verde d'Oro <onboarding@resend.dev>"` a `"Verde d'Oro <noreply@microgreens.verdedoro.it>"`

Riga 267: cambiare `to` da `["verdedoro.microgreens@gmail.com"]` a `["microgreens.verdedoro@gmail.com"]`

Riga 278: cambiare `from` da `"Verde d'Oro <onboarding@resend.dev>"` a `"Verde d'Oro <noreply@microgreens.verdedoro.it>"`

