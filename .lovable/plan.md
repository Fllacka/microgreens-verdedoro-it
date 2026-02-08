
# Piano: Risolvere l'Errore di Foreign Key su Publish Prodotti

## Problema Identificato

L'errore `"products_image_id_fkey" violates foreign key constraint` si verifica perché:

1. Il prodotto "Pak Choi" ha un `draft_image_id` che punta a un record media **eliminato**
2. L'ID `a2cae300-0424-4645-b2e7-ebf8e4c1b617` non esiste più nella tabella `media`
3. Quando si pubblica, il codice copia `draft_image_id` in `image_id`, causando il fallimento del vincolo FK

### Stato Attuale del Prodotto

| Campo | Valore |
|-------|--------|
| `image_id` | `null` |
| `draft_image_id` | `a2cae300-0424-4645-b2e7-ebf8e4c1b617` (non esiste!) |

---

## Soluzione Proposta

### 1. Fix Immediato: Pulire il Riferimento Orfano

Eseguire una query per rimuovere il `draft_image_id` orfano dal prodotto Pak Choi:

```sql
UPDATE products 
SET draft_image_id = NULL 
WHERE id = 'a4edbed2-123d-4e4a-a1b0-091009a24c58';
```

### 2. Fix Preventivo: Aggiungere Foreign Key su `draft_image_id`

Attualmente solo `image_id` ha un vincolo FK con `ON DELETE SET NULL`. Aggiungere lo stesso vincolo a `draft_image_id` per evitare riferimenti orfani in futuro:

```sql
ALTER TABLE products
ADD CONSTRAINT products_draft_image_id_fkey 
FOREIGN KEY (draft_image_id) 
REFERENCES media(id) 
ON DELETE SET NULL;
```

### 3. Fix nel Codice: Validazione Pre-Publish

Aggiungere una validazione nel `publishProduct()` per verificare che l'immagine esista prima di pubblicare:

```typescript
// Prima di pubblicare, verifica che l'immagine esista
if (formData.image_id) {
  const { data: mediaExists } = await supabase
    .from("media")
    .select("id")
    .eq("id", formData.image_id)
    .maybeSingle();
  
  if (!mediaExists) {
    // L'immagine non esiste più, pulisci il riferimento
    formData.image_id = null;
    toast({
      title: "Attenzione",
      description: "L'immagine selezionata non esiste più. Seleziona una nuova immagine.",
      variant: "destructive",
    });
    return;
  }
}
```

---

## File da Modificare

| File | Azione |
|------|--------|
| Database | Aggiungere FK constraint su `draft_image_id` |
| `src/pages/admin/ProductEdit.tsx` | Aggiungere validazione immagine pre-publish |

---

## Azioni nel Dettaglio

### Passo 1: Migration Database

Creare una migration per:
1. Pulire tutti i riferimenti orfani esistenti in `draft_image_id`
2. Aggiungere il vincolo FK con ON DELETE SET NULL

### Passo 2: Modifica ProductEdit.tsx

Aggiungere nella funzione `publishProduct()`:
- Validazione che l'immagine esista prima del publish
- Messaggio di errore chiaro se l'immagine è stata eliminata
- Pulizia automatica del riferimento orfano

---

## Benefici

1. **Fix immediato**: L'utente potrà pubblicare il prodotto Pak Choi
2. **Prevenzione futura**: Il vincolo FK eviterà nuovi riferimenti orfani
3. **UX migliorata**: Messaggi di errore chiari invece di errori tecnici del database
