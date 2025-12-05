import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import heroImage from "@/assets/microgreens-varieties.jpg";
import chefImage from "@/assets/chef-custom-microgreens.jpg";

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
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero-transparent" />
        <div className="relative z-10 text-center text-white">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            Microgreens su Misura
          </h1>
        </div>
      </section>

      {/* Content Block 1 */}
      <section className="section-padding bg-background">
        <div className="container-width">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div 
                className="h-96 rounded-2xl bg-cover bg-center shadow-soft"
                style={{ backgroundImage: `url(${chefImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-verde/10 rounded-2xl" />
              </div>
            </div>
            <div>
              <p className="font-body text-xl text-muted-foreground leading-relaxed">
                La nostra selezione standard di microgreens rappresenta solo l'inizio delle possibilità. Oltre alle varietà che coltiviamo regolarmente, offriamo un servizio di coltivazione su misura pensato per chef, ristoranti e appassionati di cucina che cercano ingredienti unici e specifici. Che si tratti di una varietà particolare per un piatto signature, di un blend esclusivo per il vostro menu, o di micro ortaggi rari difficili da reperire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Block 2 - Varieties */}
      <section className="section-padding bg-gradient-subtle">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
              Varietà Disponibili su Ordinazione
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Il nostro catalogo completo comprende oltre 50 varietà di microgreens coltivabili su richiesta, suddivise per famiglie botaniche: erbe aromatiche, legumi speciali, brassicaceae rare, cereali antichi e fiori commestibili. Consultate l'elenco completo delle varietà disponibili su ordinazione e, nel caso la vostra ricerca specifica non fosse presente, contattateci lo stesso - faremo il possibile per trovarla.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {varieties.map((category, index) => (
              <Card key={index} className="h-full hover-lift border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-display font-semibold text-white bg-gradient-verde px-4 py-3 rounded-lg text-center shadow-soft">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-verde-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="font-body text-sm text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-verde text-white">
        <div className="container-width text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Inizia il Tuo Progetto su Misura
          </h2>
          <p className="font-body text-lg mb-8 leading-relaxed max-w-2xl mx-auto text-white/90">
            Raccontaci la varietà che cerchi e trasformiamo insieme la tua idea in microgreens unici.
          </p>
          <Button variant="oro" size="lg" className="px-8 py-4 text-lg" asChild>
            <Link to="/contatti">
              <Mail className="w-5 h-5 mr-2" />
              Richiedi la Tua Varietà di Microgreens
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default MicrogreensCustom;