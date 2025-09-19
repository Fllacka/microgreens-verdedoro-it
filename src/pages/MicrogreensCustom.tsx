import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

const MicrogreensCustom = () => {
  const varieties = [
    {
      category: "Erbe aromatiche e officinali",
      items: [
        "Anice Angel / Anice Menta Turquoise",
        "Basilico Cannella Bronze / Greco / Rosso / Pompei / Thai / Verde Zena",
        "Cerfoglio Unicorn",
        "Finocchio Napo / Rosso Lupin"
      ]
    },
    {
      category: "Brassicaceae", 
      items: [
        "Cavolo Broccolo / Cappuccio / Nero di Toscana / Rapa Rosso Bacco / Romanesco / Verde Osiride",
        "Senape Bianca Yeti / Nera Hotdog / Rossa / Verde Snack",
        "Ravanello Bianco / Daikon / Nero / Red Rubin / Verde"
      ]
    },
    {
      category: "Legumi",
      items: [
        "Cece Magno",
        "Fagiolo Azuki Doraemon / Mungo Isidoro",
        "Fava Giunone",
        "Lenticchie Maranello / Verdi Siena"
      ]
    },
    {
      category: "Ortaggi a radice e bulbi",
      items: [
        "Carotta Peline",
        "Cipolla Pinga", 
        "Porro Cinese Pucca / Matteo",
        "Sedano Elfo"
      ]
    },
    {
      category: "Foglie e insalate",
      items: [
        "Acetosa a Vena Rossa Sidro",
        "Bieta Agata / Bull's Blood Granada / Coral / Gialla Mimosa / Rossa Confetti / Rossa Sunset",
        "Cavolo Riccio Nero / Verde / Rosso",
        "Indivia Scarola Bionda Cupido / A Cuore Pieno"
      ]
    },
    {
      category: "Cereali",
      items: [
        "Grano Incas / Saraceno Inai",
        "Quinoa Rio"
      ]
    },
    {
      category: "Semi Oleosi e Aromatici",
      items: [
        "Chia Helmet",
        "Lino Bruno",
        "Sesamo Neo Ardesia"
      ]
    },
    {
      category: "Piante Spontanee e fiori commestibili",
      items: [
        "Borragine Emerald",
        "Calendula Cheope", 
        "Malva Skin",
        "Nasturzio Ruby / Woodland"
      ]
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Microgreens su Misura
          </h1>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              La nostra selezione standard di microgreens rappresenta solo l'inizio delle possibilità. Oltre alle varietà che coltiviamo regolarmente, offriamo un servizio di coltivazione su misura pensato per chef, ristoranti e appassionati di cucina che cercano ingredienti unici e specifici. Che si tratti di una varietà particolare per un piatto signature, di un blend esclusivo per il vostro menu, o di micro ortaggi rari difficili da reperire.
            </p>
            <p>
              Il nostro catalogo completo comprende oltre 50 varietà di microgreens coltivabili su richiesta, suddivise per famiglie botaniche: erbe aromatiche, legumi speciali, brassicaceae rare, cereali antichi e fiori commestibili. Consultate l'elenco completo delle varietà disponibili su ordinazione e, nel caso la vostra ricerca specifica non fosse presente, contattateci lo stesso - faremo il possibile per trovarla.
            </p>
          </div>
        </div>

        {/* Varieties Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Varietà Disponibili su Ordinazione</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {varieties.map((category, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white bg-gradient-verde px-4 py-3 rounded-lg text-center">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Come Funziona il Nostro Servizio su Misura</h2>
          <div className="bg-card rounded-lg p-8 border">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Il processo è semplice e collaborativo: una volta ricevuta la vostra richiesta, il nostro team si attiva immediatamente per reperire i semi della varietà desiderata attraverso la nostra rete di fornitori specializzati. Vi comunichiamo quando i semi sono pronti e, da quel momento, pianifichiamo insieme i tempi di semina per garantire la disponibilità quando ne avete bisogno, rispettando sempre i nostri standard di qualità.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Inizia il Tuo Progetto su Misura</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Raccontaci la varietà che cerchi, le quantità necessarie e i tempi di consegna. Trasformiamo insieme la tua idea in microgreens unici, coltivati su misura per le tue esigenze.
          </p>
          <Button size="lg" className="bg-gradient-verde hover:bg-gradient-verde/90 text-white px-8 py-3">
            <Mail className="w-5 h-5 mr-2" />
            Richiedi la Tua Varietà di Microgreens
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default MicrogreensCustom;