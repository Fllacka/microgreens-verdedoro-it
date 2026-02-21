
## Fix: Testo della Sezione WhatsApp

### Problema

Il blocco WhatsApp CTA (righe 266–273) usa:
- `color:#fff` per il titolo "Hai domande nel frattempo?"
- `color:rgba(255,255,255,0.8)` per il sottotesto

Questi colori bianchi diventano invisibili quando client email come Gmail o Apple Mail in modalità chiara rimuovono il `background:linear-gradient(...)`.

### Soluzione

Sostituire il gradiente verde con uno **sfondo solido crema** (`#f5f0e8`) — lo stesso già usato nella nota sul pagamento e nel footer — e impostare i colori del testo uguali al resto dell'email:

- Titolo: `color:#333` (uguale ai paragrafi del corpo)
- Sottotesto: `color:#555` (uguale ai testi secondari degli step)

Il pulsante "Scrivici su WhatsApp" mantiene il colore oro `#D4AF37` con testo bianco (il pulsante ha sempre uno sfondo proprio, quindi il testo bianco è sempre leggibile).

### Modifica tecnica

**File:** `supabase/functions/send-quote-request/index.ts` — riga 266–273

```html
<!-- PRIMA -->
<div style="background:linear-gradient(135deg, #356A35, #4A8B4A);border-radius:8px;padding:24px;margin-top:28px;text-align:center;">
  <p style="color:#fff;...">Hai domande nel frattempo?</p>
  <p style="color:rgba(255,255,255,0.8);...">Scrivici su WhatsApp...</p>

<!-- DOPO -->
<div style="background:#f5f0e8;border-radius:8px;border:2px solid #356A35;padding:24px;margin-top:28px;text-align:center;">
  <p style="color:#333;...">Hai domande nel frattempo?</p>
  <p style="color:#555;...">Scrivici su WhatsApp...</p>
```

### Passi di implementazione

1. Aggiornare il blocco WhatsApp CTA in `buildCustomerEmail` con sfondo crema e testo scuro
2. Ridistribuire la funzione edge
3. Inviare un'email di test per verificare la leggibilità
