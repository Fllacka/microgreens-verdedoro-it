import { Helmet } from "react-helmet";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { generateBreadcrumbSchema } from "@/lib/seo";

const SITE_URL = "https://microgreens.verdedoro.it";

const PrivacyPolicy = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Privacy Policy", url: "/privacy-policy" },
  ]);

  return (
    <Layout>
      <Helmet>
        <title>Privacy Policy | Verde D'Oro Microgreens</title>
        <meta
          name="description"
          content="Informativa sulla privacy di Verde D'Oro Microgreens. Scopri come trattiamo i tuoi dati personali in conformità al GDPR (Reg. UE 2016/679)."
        />
        <link rel="canonical" href={`${SITE_URL}/privacy-policy`} />
        <meta name="robots" content="noindex, follow" />
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <div className="bg-muted/30 py-4 border-b border-border/50">
        <div className="container mx-auto px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-sm text-muted-foreground/70">
              Ultimo aggiornamento: marzo 2026
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              1. Titolare del Trattamento
            </h2>
            <p>
              Il titolare del trattamento dei dati personali è <strong>Verde D'Oro Microgreens</strong>, con sede a Reggio Emilia (RE), Emilia-Romagna, Italia.
            </p>
            <p>
              Per qualsiasi informazione relativa al trattamento dei dati personali, è possibile contattarci all'indirizzo email:{" "}
              <a href="mailto:microgreens.verdedoro@gmail.com" className="text-primary hover:underline">
                microgreens.verdedoro@gmail.com
              </a>
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              2. Base Giuridica e Normativa di Riferimento
            </h2>
            <p>
              La presente informativa è resa ai sensi del Regolamento (UE) 2016/679 (GDPR) e del D.Lgs. 196/2003 (Codice in materia di protezione dei dati personali), come modificato dal D.Lgs. 101/2018.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              3. Dati Personali Raccolti
            </h2>
            <p>
              Durante la navigazione e l'utilizzo del sito, potremmo raccogliere le seguenti categorie di dati personali:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, sistema operativo, pagine visitate, orario di accesso e altre informazioni tecniche raccolte automaticamente durante la navigazione.</li>
              <li><strong>Dati forniti volontariamente:</strong> nome, cognome, indirizzo email, numero di telefono, indirizzo di consegna e qualsiasi altra informazione fornita tramite i moduli di contatto o richiesta preventivo presenti sul sito.</li>
              <li><strong>Dati relativi agli ordini:</strong> informazioni necessarie per l'evasione degli ordini, inclusi dati di fatturazione e spedizione.</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              4. Finalità del Trattamento
            </h2>
            <p>I dati personali sono trattati per le seguenti finalità:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Evasione delle richieste:</strong> rispondere alle richieste di informazioni, preventivi e contatto inviate tramite il sito (base giuridica: esecuzione di misure precontrattuali — Art. 6.1.b GDPR).</li>
              <li><strong>Gestione degli ordini:</strong> elaborazione, spedizione e gestione degli ordini di microgreens (base giuridica: esecuzione del contratto — Art. 6.1.b GDPR).</li>
              <li><strong>Obblighi di legge:</strong> adempimento di obblighi fiscali, contabili e normativi (base giuridica: obbligo legale — Art. 6.1.c GDPR).</li>
              <li><strong>Miglioramento del servizio:</strong> analisi statistica anonima per migliorare l'esperienza di navigazione (base giuridica: legittimo interesse — Art. 6.1.f GDPR).</li>
              <li><strong>Comunicazioni commerciali:</strong> invio di newsletter e comunicazioni promozionali, solo previo consenso esplicito (base giuridica: consenso — Art. 6.1.a GDPR).</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              5. Cookie e Tecnologie di Tracciamento
            </h2>
            <p>
              Il sito utilizza cookie tecnici necessari al funzionamento e alla navigazione. Eventuali cookie analitici o di profilazione di terze parti vengono installati solo previo consenso dell'utente.
            </p>
            <p>
              Per maggiori informazioni sui cookie utilizzati, è possibile consultare la nostra Cookie Policy o gestire le preferenze tramite il banner cookie presente sul sito.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              6. Condivisione dei Dati con Terze Parti
            </h2>
            <p>
              I dati personali potranno essere comunicati a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Fornitori di servizi tecnici:</strong> hosting, servizi cloud e piattaforme di gestione del sito web, che agiscono in qualità di responsabili del trattamento.</li>
              <li><strong>Corrieri e servizi di spedizione:</strong> per la consegna dei prodotti ordinati.</li>
              <li><strong>Consulenti e professionisti:</strong> commercialisti, legali e altri professionisti per l'adempimento di obblighi normativi.</li>
              <li><strong>Autorità competenti:</strong> quando richiesto dalla legge.</li>
            </ul>
            <p>
              I dati non saranno mai venduti a terzi né trasferiti al di fuori dello Spazio Economico Europeo senza adeguate garanzie di protezione.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              7. Periodo di Conservazione
            </h2>
            <p>
              I dati personali saranno conservati per il tempo strettamente necessario al raggiungimento delle finalità per cui sono stati raccolti e, in ogni caso, entro i limiti previsti dalla normativa vigente:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dati contrattuali:</strong> per la durata del rapporto e per i successivi 10 anni per obblighi fiscali.</li>
              <li><strong>Dati di contatto:</strong> fino a 24 mesi dall'ultima interazione, salvo diversa indicazione.</li>
              <li><strong>Dati di navigazione:</strong> per un massimo di 90 giorni.</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              8. Diritti dell'Interessato
            </h2>
            <p>
              Ai sensi degli articoli 15-22 del GDPR, l'utente ha il diritto di:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Accesso:</strong> ottenere conferma del trattamento e accedere ai propri dati.</li>
              <li><strong>Rettifica:</strong> richiedere la correzione di dati inesatti o incompleti.</li>
              <li><strong>Cancellazione:</strong> richiedere la cancellazione dei dati ("diritto all'oblio").</li>
              <li><strong>Limitazione:</strong> richiedere la limitazione del trattamento.</li>
              <li><strong>Portabilità:</strong> ricevere i propri dati in formato strutturato e leggibile.</li>
              <li><strong>Opposizione:</strong> opporsi al trattamento basato su legittimo interesse.</li>
              <li><strong>Revoca del consenso:</strong> revocare il consenso in qualsiasi momento.</li>
            </ul>
            <p>
              Per esercitare i propri diritti, è possibile inviare una richiesta a{" "}
              <a href="mailto:microgreens.verdedoro@gmail.com" className="text-primary hover:underline">
                microgreens.verdedoro@gmail.com
              </a>.
            </p>
            <p>
              L'utente ha inoltre il diritto di proporre reclamo all'Autorità Garante per la Protezione dei Dati Personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.garanteprivacy.it</a>).
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              9. Sicurezza dei Dati
            </h2>
            <p>
              Adottiamo misure tecniche e organizzative adeguate per proteggere i dati personali da accessi non autorizzati, perdita, distruzione o alterazione, in conformità con quanto previsto dal GDPR.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              10. Modifiche alla Privacy Policy
            </h2>
            <p>
              Ci riserviamo il diritto di aggiornare la presente informativa in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento. Si consiglia di consultare periodicamente questa pagina.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
