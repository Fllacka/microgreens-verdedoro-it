

## Fix: Sfondo solido per la sidebar mobile del CMS

### Problema
La sidebar mobile del CMS non ha uno sfondo solido perche le variabili CSS `--sidebar` (usate dal componente Shadcn Sidebar) non sono definite nel foglio di stile. Le classi come `bg-sidebar` e `text-sidebar-foreground` non producono alcun colore, lasciando la sidebar trasparente e il testo illeggibile sopra il contenuto della pagina.

### Soluzione
Aggiungere le variabili CSS `--sidebar-*` necessarie nel file `src/index.css`, all'interno del blocco `:root` esistente. Questo dara alla sidebar uno sfondo bianco solido con testo scuro, bordi e accent coerenti con il tema del sito.

---

### Dettagli tecnici

#### File: `src/index.css`

Aggiungere le seguenti variabili CSS nel blocco `:root` (dopo le variabili esistenti come `--ring`):

```css
/* Sidebar */
--sidebar-background: 0 0% 100%;
--sidebar-foreground: 0 0% 0%;
--sidebar-primary: 140 42% 23%;
--sidebar-primary-foreground: 0 0% 98%;
--sidebar-accent: 25 30% 93%;
--sidebar-accent-foreground: 0 0% 0%;
--sidebar-border: 25 20% 88%;
--sidebar-ring: 140 42% 23%;
```

Aggiungere anche le corrispondenti variabili nel blocco `.dark`.

#### File: `tailwind.config.ts`

Aggiungere le mappature colore sidebar nella sezione `colors`:

```typescript
sidebar: {
  DEFAULT: "hsl(var(--sidebar-background))",
  foreground: "hsl(var(--sidebar-foreground))",
  primary: "hsl(var(--sidebar-primary))",
  "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
  accent: "hsl(var(--sidebar-accent))",
  "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
  border: "hsl(var(--sidebar-border))",
  ring: "hsl(var(--sidebar-ring))",
},
```

### Risultato
La sidebar mobile avra uno sfondo bianco solido e opaco, con testo nero leggibile, e non mostrera piu il contenuto sottostante.

