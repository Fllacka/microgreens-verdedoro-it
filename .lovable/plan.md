

## Aggiornamento Footer Email Cliente

### Problema
Il footer attuale occupa troppo spazio verticale con tre righe separate (nome brand, citta, copyright) su sfondo crema, risultando ridondante dato che il brand e gia presente nell'header e nella sezione WhatsApp.

### Soluzione
Semplificare il footer riducendolo a una singola riga compatta con copyright e citta sulla stessa linea, mantenendo lo stesso sfondo crema (`#f5f0e8`) per coerenza visiva. Rimuovere la riga "Verde d'Oro — Microgreens Premium" che e ridondante.

### Modifica tecnica

**File:** `supabase/functions/send-quote-request/index.ts` — righe 256-262

Da:
```html
<tr><td style="background:#f5f0e8;padding:24px 40px;text-align:center;border-top:1px solid #e5e7e3;">
  <p style="color:#356A35;margin:0 0 4px;font-weight:600;font-size:13px;">Verde d'Oro — Microgreens Premium</p>
  <p style="color:#999;margin:0;font-size:11px;">Reggio Emilia (RE)</p>
  <p style="color:#bbb;margin:8px 0 0;font-size:11px;">© 2026 Verde d'Oro. Tutti i diritti riservati.</p>
</td></tr>
```

A:
```html
<tr><td style="background:#f5f0e8;padding:16px 40px;text-align:center;border-top:1px solid #e5e7e3;">
  <p style="color:#999;margin:0;font-size:11px;">© 2026 Verde d'Oro · Reggio Emilia (RE)</p>
</td></tr>
```

### Passi
1. Aggiornare il blocco footer in `buildCustomerEmail`
2. Ridistribuire la funzione edge

