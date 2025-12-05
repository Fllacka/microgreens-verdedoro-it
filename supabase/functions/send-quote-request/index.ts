import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteRequestData {
  nome: string;
  cognome: string;
  email: string;
  telefono?: string;
  indirizzo: string;
  messaggio: string;
  prodotti: Array<{ name: string; quantity: number }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: QuoteRequestData = await req.json();
    console.log("Received quote request:", JSON.stringify(data));

    const { nome, cognome, email, telefono, indirizzo, messaggio, prodotti } = data;

    // Build products HTML
    const productsHtml = prodotti.length > 0
      ? `
        <h3 style="color: #2d5016; margin-top: 20px;">Prodotti Selezionati:</h3>
        <ul style="background: #f9faf8; padding: 15px 30px; border-radius: 8px;">
          ${prodotti.map(p => `<li><strong>${p.name}</strong> - ${p.quantity}g</li>`).join('')}
        </ul>
      `
      : '';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2d5016, #4a7c23); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Verde d'Oro</h1>
          <p style="color: #d4af37; margin: 5px 0 0 0;">Microgreens Premium</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #2d5016;">Nuova Richiesta di Preventivo</h2>
          
          <div style="background: #f9faf8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${nome} ${cognome}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${telefono ? `<p><strong>Telefono:</strong> ${telefono}</p>` : ''}
            <p><strong>Indirizzo:</strong> ${indirizzo}</p>
          </div>
          
          <h3 style="color: #2d5016;">Messaggio:</h3>
          <div style="background: #f9faf8; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${messaggio}</div>
          
          ${productsHtml}
        </div>
        
        <div style="background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>Questa email è stata inviata dal modulo di contatto di Verde d'Oro.</p>
        </div>
      </div>
    `;

    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2d5016, #4a7c23); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Verde d'Oro</h1>
          <p style="color: #d4af37; margin: 5px 0 0 0;">Microgreens Premium</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #2d5016;">Grazie per la tua richiesta, ${nome}!</h2>
          
          <p>Abbiamo ricevuto la tua richiesta di preventivo e ti risponderemo entro 24 ore.</p>
          
          <h3 style="color: #2d5016;">Riepilogo della tua richiesta:</h3>
          
          <div style="background: #f9faf8; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${messaggio}</div>
          
          ${productsHtml}
          
          <p style="margin-top: 20px;">Per qualsiasi domanda urgente, puoi contattarci su WhatsApp.</p>
        </div>
        
        <div style="background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>Verde d'Oro - Microgreens Premium di Reggio Emilia</p>
        </div>
      </div>
    `;

    // Send email to business
    console.log("Sending email to business...");
    const businessEmail = await resend.emails.send({
      from: "Verde d'Oro <onboarding@resend.dev>",
      to: ["verdedoro.microgreens@gmail.com"],
      subject: `Nuova richiesta preventivo da ${nome} ${cognome}`,
      html: emailHtml,
    });
    console.log("Business email sent:", businessEmail);

    // Send confirmation email to customer
    console.log("Sending confirmation to customer...");
    const customerEmail = await resend.emails.send({
      from: "Verde d'Oro <onboarding@resend.dev>",
      to: [email],
      subject: "Abbiamo ricevuto la tua richiesta - Verde d'Oro",
      html: confirmationHtml,
    });
    console.log("Customer email sent:", customerEmail);

    return new Response(
      JSON.stringify({ success: true, businessEmail, customerEmail }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-quote-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
