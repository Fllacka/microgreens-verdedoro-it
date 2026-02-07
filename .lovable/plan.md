

# Piano di Implementazione: FAQ e Prodotti in Evidenza per Blog Article

## Obiettivo
Allineare la pagina **Blog Article** con le funzionalità della pagina **Cosa sono i Microgreens**, aggiungendo:
- Sezione FAQ con gestione CMS drag-and-drop
- Sezione Prodotti in Evidenza
- Schema JSON-LD per FAQ

---

## Fase 1: Database Migration

Aggiungeremo 4 nuove colonne alla tabella `blog_posts`:

```sql
ALTER TABLE blog_posts
ADD COLUMN faq_title text DEFAULT 'Domande Frequenti',
ADD COLUMN faq_items jsonb DEFAULT '[]'::jsonb,
ADD COLUMN draft_faq_title text,
ADD COLUMN draft_faq_items jsonb;
```

---

## Fase 2: CMS - BlogEdit.tsx

### 2.1 Nuova Tab "FAQ"

Aggiungeremo una tab FAQ tra "Contenuto" e "SEO" con:

- Campo titolo sezione FAQ (Input text)
- Lista FAQ items con drag-and-drop (usando pattern esistente con GripVertical)
- Per ogni FAQ item:
  - Input per la domanda
  - RichTextEditor per la risposta
  - Pulsante elimina
- Pulsante "Aggiungi FAQ"

### 2.2 Stato FAQ

```typescript
interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const [faqTitle, setFaqTitle] = useState("Domande Frequenti");
const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
```

### 2.3 Logica Save/Publish

- **Save**: Salva in `draft_faq_title` e `draft_faq_items`
- **Publish**: Copia da draft a `faq_title` e `faq_items`

---

## Fase 3: Frontend - BlogArticle.tsx

### 3.1 Sezione FAQ

Posizionata dopo Content Blocks e prima di Related Articles:

```text
┌─────────────────────────────────────┐
│           Hero Section               │
├─────────────────────────────────────┤
│        Content Blocks                │
├─────────────────────────────────────┤
│          CTA Card                    │
├─────────────────────────────────────┤
│     FAQ Section (se presenti)        │  ← NUOVO
├─────────────────────────────────────┤
│   I microgreens più ricercati        │  ← NUOVO
├─────────────────────────────────────┤
│        Related Articles              │
└─────────────────────────────────────┘
```

### 3.2 Styling FAQ (identico a CosaSonoMicrogreens)

```jsx
<AccordionItem className="border-2 border-verde-primary/20 rounded-xl bg-gradient-to-r from-verde-primary/5 to-transparent">
  <AccordionTrigger className="text-primary data-[state=open]:text-verde-primary">
    {faq.question}
  </AccordionTrigger>
  <AccordionContent className="border-t border-verde-primary/10 pt-4">
    <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
  </AccordionContent>
</AccordionItem>
```

### 3.3 Sezione Prodotti in Evidenza

- Fetch configurazione da `homepage_sections` (sezione `featured_products`)
- Fetch prodotti popolari da tabella `products`
- Rendering con componente `ProductCard` esistente
- Grid 3 colonne desktop, 1 colonna mobile

---

## Fase 4: Preview - BlogPreview.tsx

Stesse modifiche di BlogArticle.tsx per coerenza nell'anteprima CMS.

---

## Fase 5: SEO - FAQ Schema

Aggiungeremo generazione automatica dello schema FAQPage:

```typescript
const generateFAQSchema = (faqItems: FAQItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer.replace(/<[^>]*>/g, '') // Strip HTML
    }
  }))
});
```

---

## File da Modificare

| File | Modifiche |
|------|-----------|
| `supabase/migrations/` | Nuova migration per colonne FAQ |
| `src/pages/admin/BlogEdit.tsx` | Tab FAQ, stato, logica save/publish |
| `src/pages/BlogArticle.tsx` | Sezione FAQ + Prodotti in evidenza + Schema |
| `src/pages/preview/BlogPreview.tsx` | Sezione FAQ + Prodotti in evidenza |

---

## Risultato Atteso

Dopo l'implementazione:

1. **CMS**: Nuova tab "FAQ" con gestione drag-and-drop
2. **Frontend**: Sezione FAQ con accordion verde + Prodotti popolari
3. **SEO**: Schema FAQPage automatico per Google Rich Results
4. **Preview**: Anteprima completa con FAQ e prodotti

