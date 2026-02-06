
# Piano di Correzione: Integrazione Sistema Ottimizzazione Immagini

## Problema Principale
L'ottimizzazione funziona correttamente a livello di Edge Function e database, ma le pagine frontend non utilizzano le versioni ottimizzate perché:
1. Cercano il campo `optimized_urls` invece del campo corretto `optimized_versions`
2. Il MediaSelector per l'Hero nella Homepage non passa `context="hero"`

## Stato Attuale Database
L'immagine Broccoli e stata ottimizzata con successo:
```
broccoli_microgreens.png
├── Originale: 5.5 MB (2107×1543)
├── Blurhash: LKD^9|^l,J%L_MohXRNG=O%Mxtov ✓
└── optimized_versions:
    └── productCard: 800×800 WebP (1.2 MB)
```

---

## File da Correggere

### 1. Homepage CMS - Aggiungere context="hero"
**File:** `src/pages/admin/Homepage.tsx`

Tutte le MediaSelector devono passare il context appropriato:
- Hero: `context="hero"`
- What Are Microgreens: `context="sectionImage"`
- Custom Microgreens: `context="sectionImage"`
- Blog: `context="articleCard"`

### 2. Index.tsx - Correggere Query e Interfaccia
**File:** `src/pages/Index.tsx`

Cambiamenti:
- Rinominare `optimized_urls` → `optimized_versions` nell'interfaccia MediaItem
- Correggere la query per selezionare `optimized_versions`
- Aggiornare il productMediaMap per usare `optimized_versions`
- Passare `optimizedUrl` al rendering dell'Hero

### 3. ProductDetail.tsx - Correggere Query
**File:** `src/pages/ProductDetail.tsx`

Cambiamenti:
- Correggere la join query per selezionare `optimized_versions` invece di `optimized_urls`
- Usare la versione ottimizzata nel rendering

### 4. ProductCard.tsx - Usare Versione Ottimizzata
**File:** `src/components/ProductCard.tsx`

Verificare che passi correttamente `optimizedUrl` al componente OptimizedImage/SmartImage

---

## Dettagli Implementazione

### 1. Homepage.tsx - MediaSelector con Context

```typescript
// Hero
<MediaSelector
  value={sections.hero.content.background_image_id}
  onChange={(id, url, optimizedUrl) => {
    updateSectionContent("hero", "background_image_id", id);
    updateSectionContent("hero", "background_image_optimized_url", optimizedUrl);
  }}
  context="hero"
  altText={sections.hero.content.background_image_alt || ""}
  onAltTextChange={(alt) => updateSectionContent("hero", "background_image_alt", alt)}
/>

// What Are Microgreens
<MediaSelector
  value={sections.what_are_microgreens.content.image_id}
  onChange={(id, url, optimizedUrl) => {
    updateSectionContent("what_are_microgreens", "image_id", id);
    updateSectionContent("what_are_microgreens", "image_optimized_url", optimizedUrl);
  }}
  context="sectionImage"
/>

// Custom Microgreens
<MediaSelector
  value={sections.custom_microgreens.content.image_id}
  onChange={(id, url, optimizedUrl) => {
    updateSectionContent("custom_microgreens", "image_id", id);
    updateSectionContent("custom_microgreens", "image_optimized_url", optimizedUrl);
  }}
  context="sectionImage"
/>
```

### 2. Index.tsx - Query Corretta

```typescript
// Interfaccia corretta
interface MediaItem {
  id: string;
  file_path: string;
  optimized_versions?: Record<string, any> | null;  // NUOVO CAMPO
}

// Query corretta per media
const { data: media } = await supabase
  .from("media")
  .select("id, file_path, optimized_versions")  // Campo corretto
  .in("id", imageIds);

// Uso nel productMediaMap
media.forEach(m => {
  map[m.id] = {
    file_path: m.file_path,
    optimized_versions: m.optimized_versions
  };
});

// Rendering Hero con versione ottimizzata
const getHeroImage = () => {
  const imageId = heroContent.background_image_id;
  if (imageId && mediaMap[imageId]) {
    // Prima cerca versione ottimizzata
    const optimizedUrl = mediaMap[imageId].optimized_versions?.hero?.url;
    return optimizedUrl || mediaMap[imageId].file_path;
  }
  return heroImage;
};
```

### 3. ProductDetail.tsx - Query Corretta

```typescript
// Query con campo corretto
const { data: productData } = await supabase
  .from("products")
  .select(`
    *,
    media:media!products_image_id_fkey (
      file_path,
      optimized_versions,  // Campo corretto
      blurhash,
      width,
      height
    )
  `)
  .eq("slug", slug)
  .eq("published", true)
  .maybeSingle();

// Rendering con versione ottimizzata
<OptimizedImage
  src={product.media?.optimized_versions?.productDetail?.url || product.media?.file_path || "/placeholder.svg"}
  alt={product.image_alt || product.name}
  blurhash={product.media?.blurhash}
  width={product.media?.width}
  height={product.media?.height}
  priority={true}
  context="productDetail"
/>
```

---

## Ordine di Implementazione

1. **Homepage.tsx** - Aggiungere context a tutte le MediaSelector
2. **Index.tsx** - Correggere interfaccia e query per usare `optimized_versions`
3. **ProductDetail.tsx** - Correggere query per usare `optimized_versions`
4. **Verificare ProductCard.tsx** - Assicurarsi che usi correttamente i dati

---

## Test Richiesti

1. **Homepage Hero**: Selezionare immagine → verificare che venga generata versione `hero` (1920px)
2. **Prodotto Broccoli**: Verificare che la pagina prodotto mostri la versione ottimizzata (800×800 WebP)
3. **Console Network**: Verificare che vengano caricate le immagini da `/optimized/` invece di `/uploads/`

---

## Risultato Atteso

| Elemento | Prima | Dopo |
|----------|-------|------|
| Hero Homepage | 5+ MB (originale) | ~150 KB (1920px WebP) |
| Product Card | 5+ MB (originale) | ~45 KB (800×800 WebP) |
| Product Detail | 5+ MB (originale) | ~100 KB (1200×1200 WebP) |
| BlurHash | Non usato | Placeholder istantaneo |
