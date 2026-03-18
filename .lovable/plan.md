

## Piano: Creare ImageCropper con react-easy-crop

### Cosa fare

1. **Installare** `react-easy-crop` come dipendenza
2. **Creare** `src/components/ImageCropper.tsx` con il componente di ritaglio immagini

Il componente usa `react-easy-crop` dentro un Dialog shadcn, con slider per lo zoom e un canvas per generare il blob ritagliato. Il JSX fornito nel messaggio è stato troncato, quindi lo ricostruirò basandomi sulla struttura logica del codice (props, stato, funzioni) che è completa.

### Dettagli tecnici

- Il componente accetta `image` (URL/base64), `aspectRatio`, `onCropComplete` (callback con Blob), `onCancel`
- Usa `Dialog` aperto con `onOpenChange` collegato a `onCancel`
- Area cropper con altezza fissa (~400px) dentro il dialog
- Slider shadcn per controllare lo zoom (1-3)
- Bottone "Conferma" che esegue il crop via canvas e restituisce un Blob JPEG al 90%
- Dipendenze già presenti: `Dialog`, `Slider`, `Button` da shadcn

