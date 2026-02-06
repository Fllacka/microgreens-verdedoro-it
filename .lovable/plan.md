
# Piano: Centratura Blocchi e Larghezza 95%

## Problemi Identificati

1. **Text Only & Heading blocks**: Usano `max-w-3xl` (~768px) invece di `max-w-4xl` (~896px) come richiesto. Non sono perfettamente centrati.

2. **Standalone Image blocks**: Usa `max-w-5xl` (~1024px) invece di `max-w-4xl` (~896px).

3. **Text + Image blocks**: La larghezza attuale (~98%) deve diventare 95% (2.5% margine su ogni lato).

---

## Modifiche da Effettuare

### File: `src/components/ContentBlockRenderer.tsx`

**1. Riga 164 - Heading blocks**
Cambiare da `max-w-3xl` a `max-w-4xl`:
```jsx
<div key={block.id} className="max-w-4xl mx-auto px-4">
```

**2. Riga 173 - Text blocks**
Cambiare da `max-w-3xl` a `max-w-4xl`:
```jsx
<div key={block.id} className="max-w-4xl mx-auto px-4 py-6 md:py-8">
```

**3. Riga 188 - Standalone Image blocks**
Cambiare da `max-w-5xl` a `max-w-4xl`:
```jsx
<div key={block.id} className="max-w-4xl mx-auto px-4">
```

**4. Righe 83 e 115 - Text + Image blocks (Top/Bottom e Left/Right)**
Cambiare i margini per ottenere esattamente 95% di larghezza (2.5% su ogni lato):
```jsx
// Da:
className="bg-secondary/30 rounded-2xl p-6 md:p-10 mx-2 sm:mx-4 lg:mx-6 xl:mx-8"

// A:
className="bg-secondary/30 rounded-2xl p-6 md:p-10 mx-[2.5%]"
```

L'uso di `mx-[2.5%]` applica un margine percentuale su ogni lato, garantendo sempre il 95% di larghezza indipendentemente dalla dimensione dello schermo.

---

## Riepilogo Finale

| Tipo Blocco | Prima | Dopo |
|-------------|-------|------|
| Heading | `max-w-3xl` (~768px) | `max-w-4xl` (~896px), centrato |
| Text Only | `max-w-3xl` (~768px) | `max-w-4xl` (~896px), centrato |
| Standalone Image | `max-w-5xl` (~1024px) | `max-w-4xl` (~896px), centrato |
| Text + Image | ~98% width | Esattamente 95% width |

---

## Visualizzazione

```text
┌─────────────────────────────────────────────────────────────────┐
│                         PAGINA                                   │
│                                                                  │
│           ┌─────────────────────────────────┐                    │
│           │     HEADING / TEXT ONLY         │  ~896px            │
│           │     (perfettamente centrato)    │  centrato          │
│           └─────────────────────────────────┘                    │
│                                                                  │
│    ┌─────────────────────────────────────────────────────────┐   │
│    │                    TEXT + IMAGE                         │   │
│ 2.5%│  ┌─────────────────────┐  ┌───────────────────────┐   │2.5%│
│    │  │      IMMAGINE       │  │        TESTO          │   │    │
│    │  │      (500px h)      │  │    (allineato top)    │   │    │
│    │  └─────────────────────┘  └───────────────────────┘   │    │
│    └─────────────────────────────────────────────────────────┘   │
│                              95% width                           │
│           ┌─────────────────────────────────┐                    │
│           │      STANDALONE IMAGE           │  ~896px            │
│           │      (centrata)                 │  centrato          │
│           └─────────────────────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
