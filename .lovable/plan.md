

## Piano: Rimuovere ultimo riferimento a process-image

### Situazione attuale

- **Frontend**: Nessuna chiamata a `supabase.functions.invoke('process-image')` trovata. Già pulito.
- **Config**: `supabase/config.toml` contiene ancora il blocco `[functions.process-image]` con `verify_jwt = false`. Questo è l'unico riferimento rimasto nell'intero progetto.

### Cosa fare

1. **Rimuovere** il blocco `[functions.process-image]` e `verify_jwt = false` da `supabase/config.toml` (righe 9-10).

Nessun altro file richiede modifiche.

