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

    // Build products HTML for business email
    const productsHtml = prodotti.length > 0
      ? `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: linear-gradient(135deg, #2d5016, #4a7c23);">
              <th style="padding: 12px 15px; text-align: left; color: white; font-weight: 600;">Prodotto</th>
              <th style="padding: 12px 15px; text-align: right; color: white; font-weight: 600;">Quantità</th>
            </tr>
          </thead>
          <tbody>
            ${prodotti.map((p, i) => `
              <tr style="background: ${i % 2 === 0 ? '#f9faf8' : '#ffffff'};">
                <td style="padding: 12px 15px; border-bottom: 1px solid #e8ebe5;">${p.name}</td>
                <td style="padding: 12px 15px; text-align: right; border-bottom: 1px solid #e8ebe5; font-weight: 500;">${p.quantity}g</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
      : '<p style="color: #666; font-style: italic;">Nessun prodotto selezionato</p>';

    // Beautiful business email template
    const businessEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">🌱 Verde d'Oro</h1>
                    <p style="color: #d4af37; margin: 8px 0 0 0; font-size: 14px; letter-spacing: 2px;">MICROGREENS PREMIUM</p>
                  </td>
                </tr>
                
                <!-- Alert Banner -->
                <tr>
                  <td style="background: linear-gradient(90deg, #d4af37, #f5d76e); padding: 15px 40px; text-align: center;">
                    <p style="color: #2d5016; margin: 0; font-weight: 600; font-size: 16px;">📩 Nuova Richiesta di Preventivo</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    
                    <!-- Customer Info Card -->
                    <div style="background: linear-gradient(135deg, #f9faf8, #f0f4ed); border-radius: 10px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #4a7c23;">
                      <h2 style="color: #2d5016; margin: 0 0 20px 0; font-size: 18px;">👤 Dati del Cliente</h2>
                      <table style="width: 100%;">
                        <tr>
                          <td style="padding: 8px 0; color: #666; width: 120px;">Nome:</td>
                          <td style="padding: 8px 0; color: #333; font-weight: 500;">${nome} ${cognome}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666;">Email:</td>
                          <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #4a7c23; text-decoration: none;">${email}</a></td>
                        </tr>
                        ${telefono ? `
                        <tr>
                          <td style="padding: 8px 0; color: #666;">Telefono:</td>
                          <td style="padding: 8px 0;"><a href="tel:${telefono}" style="color: #4a7c23; text-decoration: none;">${telefono}</a></td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 8px 0; color: #666;">Indirizzo:</td>
                          <td style="padding: 8px 0; color: #333;">${indirizzo}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Products Section -->
                    <h2 style="color: #2d5016; margin: 0 0 15px 0; font-size: 18px;">🥗 Prodotti Richiesti</h2>
                    ${productsHtml}
                    
                    <!-- Message Section -->
                    <h2 style="color: #2d5016; margin: 30px 0 15px 0; font-size: 18px;">💬 Messaggio</h2>
                    <div style="background: #f9faf8; border-radius: 10px; padding: 20px; border: 1px solid #e8ebe5;">
                      <p style="margin: 0; color: #444; line-height: 1.6; white-space: pre-wrap;">${messaggio}</p>
                    </div>
                    
                    <!-- Action Button -->
                    <div style="text-align: center; margin-top: 35px;">
                      <a href="mailto:${email}?subject=Preventivo%20Verde%20d'Oro%20-%20${encodeURIComponent(nome)}%20${encodeURIComponent(cognome)}" 
                         style="display: inline-block; background: linear-gradient(135deg, #d4af37, #c9a227); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(212,175,55,0.3);">
                        Rispondi al Cliente →
                      </a>
                    </div>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #2d5016; padding: 25px; text-align: center;">
                    <p style="color: #a8c090; margin: 0; font-size: 12px;">Richiesta ricevuta il ${new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Beautiful customer confirmation email template
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%); padding: 50px 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 1px;">🌱 Verde d'Oro</h1>
                    <p style="color: #d4af37; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 3px;">MICROGREENS PREMIUM</p>
                  </td>
                </tr>
                
                <!-- Success Banner -->
                <tr>
                  <td style="background: linear-gradient(90deg, #4a7c23, #5d9a2e); padding: 20px 40px; text-align: center;">
                    <p style="color: #ffffff; margin: 0; font-weight: 600; font-size: 18px;">✓ Richiesta Ricevuta con Successo!</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    
                    <h2 style="color: #2d5016; margin: 0 0 20px 0; font-size: 24px;">Ciao ${nome}! 👋</h2>
                    
                    <p style="color: #555; line-height: 1.7; font-size: 16px; margin: 0 0 25px 0;">
                      Grazie per aver scelto <strong style="color: #2d5016;">Verde d'Oro</strong>! Abbiamo ricevuto la tua richiesta di preventivo e il nostro team la sta già esaminando.
                    </p>
                    
                    <!-- Timeline -->
                    <div style="background: linear-gradient(135deg, #f9faf8, #f0f4ed); border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 4px solid #d4af37;">
                      <h3 style="color: #2d5016; margin: 0 0 15px 0; font-size: 16px;">⏱️ Cosa succede ora?</h3>
                      <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 2;">
                        <li>Il nostro team analizzerà la tua richiesta</li>
                        <li>Riceverai un preventivo personalizzato <strong>entro 24 ore</strong></li>
                        <li>Ti contatteremo all'email o telefono che hai fornito</li>
                      </ul>
                    </div>
                    
                    <!-- Order Summary -->
                    <h3 style="color: #2d5016; margin: 30px 0 15px 0; font-size: 18px;">📋 Riepilogo della tua richiesta</h3>
                    
                    ${prodotti.length > 0 ? `
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                      <thead>
                        <tr style="background: #f0f4ed;">
                          <th style="padding: 12px 15px; text-align: left; color: #2d5016; font-weight: 600; border-bottom: 2px solid #d4af37;">Prodotto</th>
                          <th style="padding: 12px 15px; text-align: right; color: #2d5016; font-weight: 600; border-bottom: 2px solid #d4af37;">Quantità</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${prodotti.map((p, i) => `
                          <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f9faf8'};">
                            <td style="padding: 12px 15px; border-bottom: 1px solid #e8ebe5; color: #333;">${p.name}</td>
                            <td style="padding: 12px 15px; text-align: right; border-bottom: 1px solid #e8ebe5; color: #4a7c23; font-weight: 600;">${p.quantity}g</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                    ` : ''}
                    
                    <div style="background: #f9faf8; border-radius: 10px; padding: 20px; border: 1px solid #e8ebe5; margin-top: 20px;">
                      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: 600;">Il tuo messaggio:</p>
                      <p style="margin: 0; color: #444; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${messaggio}</p>
                    </div>
                    
                    <!-- Contact CTA -->
                    <div style="background: linear-gradient(135deg, #2d5016, #4a7c23); border-radius: 10px; padding: 25px; margin-top: 30px; text-align: center;">
                      <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 16px;">Hai domande urgenti?</p>
                      <a href="https://wa.me/393330000000" 
                         style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 30px; font-weight: 600; font-size: 14px;">
                        💬 Scrivici su WhatsApp
                      </a>
                    </div>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #f9faf8; padding: 30px; text-align: center; border-top: 1px solid #e8ebe5;">
                    <p style="color: #2d5016; margin: 0 0 5px 0; font-weight: 600;">Verde d'Oro - Microgreens Premium</p>
                    <p style="color: #888; margin: 0; font-size: 12px;">Via delle Microgreens, 42 - 42121 Reggio Emilia (RE)</p>
                    <p style="color: #888; margin: 10px 0 0 0; font-size: 11px;">© ${new Date().getFullYear()} Verde d'Oro. Tutti i diritti riservati.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send email to business (this always works)
    console.log("Sending email to business...");
    const businessEmail = await resend.emails.send({
      from: "Verde d'Oro <onboarding@resend.dev>",
      to: ["verdedoro.microgreens@gmail.com"],
      subject: `🌱 Nuova richiesta preventivo da ${nome} ${cognome}`,
      html: businessEmailHtml,
    });
    console.log("Business email sent:", businessEmail);

    // Try to send confirmation email to customer
    // Note: This will only work with a verified domain in Resend
    let customerEmailResult = null;
    try {
      console.log("Attempting to send confirmation to customer...");
      customerEmailResult = await resend.emails.send({
        from: "Verde d'Oro <onboarding@resend.dev>",
        to: [email],
        subject: "✓ Abbiamo ricevuto la tua richiesta - Verde d'Oro",
        html: customerEmailHtml,
      });
      console.log("Customer email sent:", customerEmailResult);
    } catch (customerError: any) {
      // Log but don't fail - business email is the critical one
      console.log("Customer email could not be sent (domain not verified):", customerError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        businessEmail, 
        customerEmail: customerEmailResult,
        note: customerEmailResult ? "Both emails sent" : "Business email sent. Customer email requires verified domain."
      }),
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
