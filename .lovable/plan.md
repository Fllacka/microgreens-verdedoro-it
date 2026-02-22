

## Rendere il CMS usabile da mobile

### Problema
Dalla screenshot si vede che su mobile la sidebar del CMS si sovrappone al contenuto della dashboard, rendendo l'interfaccia inutilizzabile. I menu della sidebar e il contenuto della pagina si mostrano contemporaneamente senza separazione.

### Soluzioni

#### 1. Auto-chiusura della sidebar su navigazione mobile
Quando l'utente tocca un link nella sidebar su mobile, la Sheet deve chiudersi automaticamente. Attualmente la sidebar resta aperta dopo la navigazione, coprendo il contenuto.

- Aggiungere accesso a `setOpenMobile` e `isMobile` nel componente `AdminSidebar`
- Wrappare ogni `Link` con un click handler che chiama `setOpenMobile(false)` quando `isMobile` e vero
- Applicare anche al bottone "Esci"

#### 2. Migliorare il bottone toggle nell'header mobile
L'icona nell'header deve adattarsi al contesto mobile: su mobile mostrare sempre l'icona hamburger (menu) anziche PanelLeft/PanelLeftClose che ha senso solo per il collapse desktop.

#### 3. Tabelle responsive per Products/Blog
Le tabelle admin (Prodotti, Blog) traboccano su schermi piccoli. Aggiungere `overflow-x-auto` al container della tabella e nascondere colonne secondarie (slug, category) su mobile.

#### 4. Header della pagina Products responsive
Il layout "titolo a sinistra, bottone a destra" (`flex justify-between`) puo rompersi su schermi stretti. Renderlo stack su mobile con `flex-col sm:flex-row gap-2`.

---

### Dettagli tecnici

#### File: `src/components/admin/AdminLayout.tsx`

**AdminSidebar** - Aggiungere auto-close su navigazione mobile:
- Importare `useSidebar` per accedere a `setOpenMobile` e `isMobile`
- Creare un handler `handleMobileNav` che chiama `setOpenMobile(false)` 
- Applicarlo come `onClick` su tutti i `Link` e sul bottone "Esci"

```typescript
const { state, isMobile, setOpenMobile } = useSidebar();

const handleMobileNav = () => {
  if (isMobile) setOpenMobile(false);
};

// Su ogni Link:
<Link to={item.url} onClick={handleMobileNav}>
```

**AdminHeader** - Icona adattiva:
- Su mobile, mostrare `Menu` (hamburger) invece di `PanelLeft`/`PanelLeftClose`
- Usare `isMobile` dal contesto sidebar per decidere quale icona mostrare

#### File: `src/pages/admin/Products.tsx`

- Header sezione: `flex flex-col sm:flex-row gap-3` per impilare titolo e bottone su mobile
- Container tabella: `overflow-x-auto` per scroll orizzontale
- Colonne Slug e Category: nascondere con `hidden md:table-cell`

#### File: `src/pages/admin/Dashboard.tsx`

- Ridurre dimensione titolo su mobile: `text-2xl md:text-3xl`

### Sequenza
1. Aggiornare `AdminLayout.tsx` (sidebar auto-close + header icon)
2. Aggiornare `Products.tsx` (tabella responsive)
3. Aggiornare `Dashboard.tsx` (titolo responsive)
