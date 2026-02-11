
# Fix: "Modifiche non salvate" - Soluzione Globale

## Problema
Su tutte le pagine CMS, dopo aver salvato/pubblicato, il dialog "Modifiche non salvate" appare erroneamente perche' il `useEffect` di tracking scatta DOPO il salvataggio a causa degli aggiornamenti di stato.

## Soluzione: Hook Centralizzato `useChangeTracking`

Creare un nuovo hook riutilizzabile che gestisce il tracking delle modifiche con protezione anti-falso-positivo integrata. Questo vale per tutte le pagine esistenti e future.

```text
PRIMA (ogni pagina implementa manualmente):
  useRef(initialDataLoaded) + useEffect + setHasChanges + bug post-save

DOPO (hook unico con protezione integrata):
  const { hasChanges, markSaved, trackingReady } = useChangeTracking(deps)
```

---

## File da CREARE

### `src/hooks/useChangeTracking.ts`

Un hook che:
- Accetta le dipendenze da osservare (formData, seoData, ecc.)
- Ignora il primo caricamento (come `initialDataLoaded`)
- Ha un metodo `markSaved()` che sopprime il prossimo ciclo di change detection
- Restituisce `hasChanges` e `setReady()` per segnalare quando i dati iniziali sono caricati

---

## File da MODIFICARE (7 pagine)

Tutte le pagine che usano il pattern `initialDataLoaded` + `setHasChanges`:

| File | Modifica |
|------|----------|
| `src/pages/admin/ProductEdit.tsx` | Usare `useChangeTracking` al posto del pattern manuale |
| `src/pages/admin/BlogEdit.tsx` | Usare `useChangeTracking` |
| `src/pages/admin/PageEdit.tsx` | Usare `useChangeTracking` |
| `src/pages/admin/CosaSonoMicrogreens.tsx` | Usare `useChangeTracking` |
| `src/pages/admin/Settings.tsx` | Usare `useChangeTracking` (osserva `logoId, headerSettings, footerSettings`) |
| `src/pages/admin/Contatti.tsx` | Aggiungere `justSaved` ref nelle funzioni save/publish (usa `setHasChanges(true)` manuale) |
| `src/pages/admin/MicrogreensCustom.tsx` | Aggiungere `justSaved` ref nelle funzioni save/publish (usa `setHasChanges(true)` manuale) |

## Dettagli Tecnici

### Nuovo Hook `useChangeTracking`

```typescript
export function useChangeTracking(dependencies: any[]) {
  const [hasChanges, setHasChanges] = useState(false);
  const initialDataLoaded = useRef(false);
  const justSaved = useRef(false);

  useEffect(() => {
    if (justSaved.current) {
      justSaved.current = false;
      return;
    }
    if (initialDataLoaded.current) {
      setHasChanges(true);
    }
  }, dependencies);

  const markSaved = () => {
    justSaved.current = true;
    setHasChanges(false);
  };

  const setReady = () => {
    initialDataLoaded.current = true;
  };

  return { hasChanges, setHasChanges, markSaved, setReady };
}
```

### Uso nelle pagine (esempio PageEdit.tsx)

```typescript
// PRIMA:
const [hasChanges, setHasChanges] = useState(false);
const initialDataLoaded = useRef(false);

useEffect(() => {
  if (initialDataLoaded.current) setHasChanges(true);
}, [formData, seoData]);

// nelle funzioni save: setHasChanges(false);
// nel fetchPage: initialDataLoaded.current = true;

// DOPO:
const { hasChanges, markSaved, setReady } = useChangeTracking([formData, seoData]);

// nelle funzioni save: markSaved();
// nel fetchPage: setReady();
```

### Per Contatti e MicrogreensCustom (tracking manuale)

Queste pagine non usano `useEffect` per tracking ma chiamano `setHasChanges(true)` direttamente nei handler. Per queste, basta aggiungere un `justSaved` ref:

```typescript
const justSaved = useRef(false);

// Nei handler onChange:
if (!justSaved.current) setHasChanges(true);

// Nelle funzioni save/publish:
justSaved.current = true;
setHasChanges(false);
setTimeout(() => { justSaved.current = false; }, 100);
```

## Risultato

- Il dialog "Modifiche non salvate" apparira' SOLO quando ci sono vere modifiche
- La soluzione e' centralizzata: le pagine future useranno `useChangeTracking` automaticamente
- Nessun impatto visivo o funzionale sulle pagine
