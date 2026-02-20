
## Fix: Email Soggetto e Icone dei Passaggi

### Problemi identificati

**1. Soggetto errato**
Il soggetto attuale è `"✓ Abbiamo ricevuto la tua richiesta - Verde d'Oro"`.
Da aggiornare a: `"Conferma richiesta - Verde D'Oro Microgreens"`.

**2. Icone dei passaggi non visibili**
Le icone (Conferma, Coltivazione, Consegna) vengono inserite come `<img src="data:image/svg+xml,...">`. Gmail e la maggior parte dei client email **bloccano i data URI** all'interno dei tag `<img>` per motivi di sicurezza. Ecco perché 2 icone su 3 risultano rotte, mentre la terza (Consegna) mostra solo il cerchio verde senza icona.

La soluzione corretta è **inserire l'SVG direttamente nell'HTML** del cerchio, senza passare per un tag `<img>`. L'SVG inline è pienamente supportato da tutti i principali client email.

---

### Modifiche da apportare

**File:** `supabase/functions/send-quote-request/index.ts`

#### 1. Soggetto email cliente (riga 317)
```
DA:  "✓ Abbiamo ricevuto la tua richiesta - Verde d'Oro"
A:   "Conferma richiesta - Verde D'Oro Microgreens"
```

#### 2. Icone passaggi — da `<img data:uri>` a SVG inline

Sostituire il pattern attuale:
```html
<div style="width:48px;height:48px;border-radius:50%;background:...;text-align:center;line-height:48px;">
  <img src="data:image/svg+xml,..." width="24" height="24" style="vertical-align:middle;" />
</div>
```

Con SVG direttamente inlineato dentro il div:
```html
<div style="width:48px;height:48px;border-radius:50%;background:...;display:inline-block;text-align:center;">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
       fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
       style="margin-top:12px;">
    <!-- percorsi SVG -->
  </svg>
</div>
```

Questo metodo non richiede encoding e funziona in tutti i client email.

---

### Sequenza di implementazione

1. Aggiornare il soggetto dell'email cliente nella funzione `handler`
2. Sostituire le tre sezioni step nella funzione `buildCustomerEmail` con SVG inline
3. Ridistribuire la funzione edge
4. Inviare un'email di test per verificare che tutte e tre le icone siano visibili
