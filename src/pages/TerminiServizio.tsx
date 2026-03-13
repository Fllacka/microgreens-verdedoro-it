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

const TerminiServizio = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Termini di Servizio", url: "/termini-di-servizio" },
  ]);

  return (
    <Layout>
      <Helmet>
        <title>Termini di Servizio | Verde D'Oro Microgreens</title>
        <meta
          name="description"
          content="Termini e condizioni generali di vendita di Verde D'Oro Microgreens. Informazioni su ordini, spedizioni, resi e garanzie."
        />
        <link rel="canonical" href={`${SITE_URL}/termini-di-servizio`} />
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
                <BreadcrumbPage>Termini di Servizio</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            Termini di Servizio
          </h1>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-sm text-muted-foreground/70">
              Ultimo aggiornamento: marzo 2026
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              1. Disposizioni Generali
            </h2>
            <p>
              Le presenti Condizioni Generali di Vendita disciplinano l'acquisto di prodotti effettuato tramite il sito web <strong>microgreens.verdedoro.it</strong>, di proprietà di <strong>Verde D'Oro Microgreens</strong>, con sede a Reggio Emilia (RE), Emilia-Romagna, Italia.
            </p>
            <p>
              L'invio di un ordine implica l'accettazione integrale delle presenti condizioni. Si prega di leggere attentamente i termini prima di procedere con qualsiasi acquisto.
            </p>
            <p>
              Le presenti condizioni sono redatte in conformità al D.Lgs. 206/2005 (Codice del Consumo) e al D.Lgs. 70/2003 (Commercio Elettronico).
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              2. Prodotti
            </h2>
            <p>
              Verde D'Oro Microgreens offre microgreens freschi coltivati a Reggio Emilia. Le informazioni relative ai prodotti (descrizioni, immagini, proprietà nutritive) sono fornite nel modo più accurato possibile, tuttavia potrebbero presentare lievi variazioni dovute alla natura del prodotto fresco e biologico.
            </p>
            <p>
              Le immagini dei prodotti hanno scopo illustrativo e potrebbero non essere perfettamente rappresentative del prodotto consegnato, in quanto i microgreens sono prodotti naturali soggetti a variazioni stagionali.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              3. Ordini e Procedura d'Acquisto
            </h2>
            <p>
              Per effettuare un ordine, l'utente deve:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Selezionare i prodotti desiderati e la quantità.</li>
              <li>Compilare il modulo di richiesta con i dati necessari (nome, indirizzo di consegna, contatto).</li>
              <li>Inviare la richiesta tramite il modulo di contatto o richiesta preventivo presente sul sito.</li>
            </ul>
            <p>
              L'ordine si intende confermato solo dopo la nostra accettazione, che verrà comunicata via email. Ci riserviamo il diritto di rifiutare o annullare ordini in caso di indisponibilità del prodotto, errori nei prezzi o altre circostanze impreviste.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              4. Prezzi e Pagamento
            </h2>
            <p>
              I prezzi indicati sul sito sono espressi in Euro (€) e sono da intendersi IVA inclusa, ove applicabile. I costi di spedizione, ove previsti, sono indicati separatamente prima della conferma dell'ordine.
            </p>
            <p>
              Ci riserviamo il diritto di modificare i prezzi in qualsiasi momento, senza preavviso. Le modifiche non si applicano agli ordini già confermati.
            </p>
            <p>
              Le modalità di pagamento accettate verranno comunicate al momento della conferma dell'ordine.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              5. Spedizione e Consegna
            </h2>
            <p>
              Le spedizioni vengono effettuate nelle zone servite, con tempi e modalità che verranno comunicati al momento della conferma dell'ordine. Trattandosi di prodotti freschi deperibili, ci impegniamo a garantire consegne rapide per preservare la qualità del prodotto.
            </p>
            <p>
              I tempi di consegna indicati sono puramente indicativi e non costituiscono termine essenziale. Verde D'Oro Microgreens non è responsabile per ritardi dovuti a cause di forza maggiore o a disservizi del corriere.
            </p>
            <p>
              Al momento della consegna, il cliente è tenuto a verificare l'integrità dell'imballaggio e la conformità del prodotto. Eventuali anomalie devono essere segnalate tempestivamente.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              6. Diritto di Recesso
            </h2>
            <p>
              Ai sensi dell'art. 59, comma 1, lettera d) del D.Lgs. 206/2005 (Codice del Consumo), il diritto di recesso <strong>non si applica</strong> ai prodotti che rischiano di deteriorarsi o scadere rapidamente, quali i microgreens freschi.
            </p>
            <p>
              Per prodotti non deperibili eventualmente presenti nel catalogo, il consumatore ha diritto di recedere entro 14 giorni dalla ricezione, senza obbligo di motivazione, alle condizioni previste dalla legge.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              7. Garanzia e Reclami
            </h2>
            <p>
              Tutti i prodotti sono coltivati con cura e secondo le migliori pratiche agricole. In caso di difetti evidenti o non conformità del prodotto, il cliente può contattarci entro 24 ore dalla consegna all'indirizzo{" "}
              <a href="mailto:microgreens.verdedoro@gmail.com" className="text-primary hover:underline">
                microgreens.verdedoro@gmail.com
              </a>{" "}
              allegando documentazione fotografica. Valuteremo ogni segnalazione e, se il reclamo risulta fondato, provvederemo alla sostituzione del prodotto o al rimborso.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              8. Limitazione di Responsabilità
            </h2>
            <p>
              Verde D'Oro Microgreens non è responsabile per danni diretti o indiretti derivanti dall'uso improprio dei prodotti, da allergie o intolleranze non comunicate, o dalla mancata osservanza delle istruzioni di conservazione fornite.
            </p>
            <p>
              Il sito web è fornito "così com'è". Non garantiamo che il sito sia sempre disponibile, privo di errori o virus. Ci riserviamo il diritto di sospendere o interrompere il servizio in qualsiasi momento per manutenzione o aggiornamenti.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              9. Proprietà Intellettuale
            </h2>
            <p>
              Tutti i contenuti del sito (testi, immagini, loghi, grafica, marchi) sono di proprietà di Verde D'Oro Microgreens o dei rispettivi titolari e sono protetti dalle leggi sulla proprietà intellettuale. È vietata qualsiasi riproduzione, distribuzione o utilizzo non autorizzato.
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              10. Legge Applicabile e Foro Competente
            </h2>
            <p>
              Le presenti Condizioni Generali sono regolate dalla legge italiana. Per qualsiasi controversia relativa all'interpretazione, esecuzione o risoluzione delle presenti condizioni, sarà competente il Foro del luogo di residenza o domicilio del consumatore, ai sensi dell'art. 66-bis del Codice del Consumo.
            </p>
            <p>
              Il consumatore residente nell'Unione Europea può inoltre ricorrere alla piattaforma ODR (Online Dispute Resolution) della Commissione Europea, accessibile all'indirizzo:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
            </p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              11. Contatti
            </h2>
            <p>
              Per qualsiasi domanda o chiarimento relativo alle presenti condizioni, è possibile contattarci a:
            </p>
            <ul className="list-none pl-0 space-y-1">
              <li><strong>Verde D'Oro Microgreens</strong></li>
              <li>Reggio Emilia (RE), Emilia-Romagna, Italia</li>
              <li>
                Email:{" "}
                <a href="mailto:microgreens.verdedoro@gmail.com" className="text-primary hover:underline">
                  microgreens.verdedoro@gmail.com
                </a>
              </li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">
              12. Modifiche ai Termini
            </h2>
            <p>
              Ci riserviamo il diritto di modificare le presenti condizioni in qualsiasi momento. Le modifiche saranno efficaci dalla data di pubblicazione sul sito. L'uso continuato del sito dopo la pubblicazione delle modifiche costituisce accettazione delle nuove condizioni.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TerminiServizio;
