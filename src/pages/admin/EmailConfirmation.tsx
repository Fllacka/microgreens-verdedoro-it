import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";

const EmailConfirmation = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Controlla la tua email</CardTitle>
          <CardDescription className="text-base">
            Ti abbiamo inviato un'email di conferma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Per completare la registrazione, clicca sul link di conferma che ti abbiamo inviato.
            </p>
            <p>
              Se non trovi l'email, controlla la cartella spam o posta indesiderata.
            </p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="font-medium text-foreground mb-2">Prossimi passi:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-left">
              <li>Apri la tua casella email</li>
              <li>Cerca l'email da Verde d'Oro</li>
              <li>Clicca sul link di conferma</li>
              <li>Torna qui per accedere</li>
            </ol>
          </div>

          <Button variant="outline" className="w-full" asChild>
            <Link to="/admin/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna al login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
