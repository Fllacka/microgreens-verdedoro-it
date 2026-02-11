

# Hero Title Visibility: Design Sofisticato

## Problema
Con sfondi hero variabili dal CMS, il titolo "VERDE D'ORO" rischia di perdersi su immagini chiare o colorate. Attualmente c'e' solo un overlay `bg-black/30` uniforme.

## Soluzione Proposta: Glassmorphism Backdrop + Text Shadow

Un approccio a tre livelli che garantisce leggibilita' su qualsiasi sfondo senza sacrificare l'estetica premium:

### Livello 1 - Gradient Overlay Direzionale
Sostituire l'overlay uniforme `bg-black/30` con un gradiente che si concentra nella zona del testo (sinistra/basso), lasciando il resto dell'immagine piu' visibile:

```css
bg-gradient-to-r from-black/60 via-black/30 to-transparent
```

Questo crea un effetto cinematografico dove il testo ha sempre uno sfondo scuro naturale, mentre l'immagine resta visibile a destra.

### Livello 2 - Text Shadow Multi-Layer
Aggiungere un'ombra di testo stratificata al titolo H1 e al sottotitolo per creare un alone di contrasto attorno ad ogni lettera:

```css
text-shadow: 
  0 2px 8px rgba(0,0,0,0.5),
  0 4px 24px rgba(0,0,0,0.3);
```

Questo garantisce leggibilita' anche dove il gradiente e' piu' leggero.

### Livello 3 - Sottile linea decorativa dorata
Una sottile linea orizzontale dorata sotto il titolo che separa visivamente "VERDE D'ORO" dal sottotitolo, aggiungendo eleganza e ancorandone la posizione visiva.

---

## File da Modificare

| File | Modifica |
|------|----------|
| `src/pages/Index.tsx` | Overlay gradiente, text-shadow sul titolo, linea decorativa |
| `src/index.css` | Classe utility per text-shadow riutilizzabile |

## Dettagli Tecnici

### `src/index.css`
Aggiungere una classe utility:
```css
.text-shadow-hero {
  text-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 4px 24px rgba(0,0,0,0.3);
}
```

### `src/pages/Index.tsx`
1. Cambiare l'overlay da `bg-black/30` a `bg-gradient-to-r from-black/55 via-black/30 to-black/10`
2. Aggiungere `text-shadow-hero` al titolo H1 e al sottotitolo
3. Aggiungere un elemento decorativo dorato sotto il titolo:
```html
<div className="w-24 h-0.5 bg-gradient-to-r from-oro-primary to-oro-primary/0 mb-6" />
```

## Risultato Visivo
- Il titolo rimane perfettamente leggibile su qualsiasi sfondo
- L'effetto e' sottile e premium, non invasivo
- L'immagine di sfondo resta valorizzata (non coperta da un overlay troppo scuro)
- La linea dorata richiama il colore "D'ORO" e aggiunge raffinatezza

