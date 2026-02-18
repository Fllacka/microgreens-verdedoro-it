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
  prodotti: Array<{ name: string; quantity: number; price?: number }>;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

const buildProductsTable = (
  prodotti: QuoteRequestData['prodotti'],
  hasAnyPrices: boolean,
  totalPrice: number,
  variant: 'business' | 'customer'
) => {
  if (prodotti.length === 0) {
    return '<p style="color:#888;font-style:italic;">Nessun prodotto selezionato</p>';
  }

  const headerBg = variant === 'business' ? '#2d5016' : '#f0f4ed';
  const headerColor = variant === 'business' ? '#ffffff' : '#2d5016';

  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #e5e7e3;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:${headerBg};">
          <th style="padding:14px 16px;text-align:left;color:${headerColor};font-weight:600;font-size:14px;">Prodotto</th>
          <th style="padding:14px 16px;text-align:right;color:${headerColor};font-weight:600;font-size:14px;">Quantità</th>
          ${hasAnyPrices ? `<th style="padding:14px 16px;text-align:right;color:${headerColor};font-weight:600;font-size:14px;">Prezzo</th>` : ''}
        </tr>
      </thead>
      <tbody>
        ${prodotti.map((p, i) => `
          <tr style="background:${i % 2 === 0 ? '#ffffff' : '#fafbf9'};">
            <td style="padding:12px 16px;border-top:1px solid #eef0ec;color:#333;font-size:14px;">${p.name}</td>
            <td style="padding:12px 16px;text-align:right;border-top:1px solid #eef0ec;color:#555;font-weight:500;font-size:14px;">${p.quantity}g</td>
            ${hasAnyPrices ? `<td style="padding:12px 16px;text-align:right;border-top:1px solid #eef0ec;color:#2d5016;font-weight:600;font-size:14px;">${p.price ? formatPrice(p.price) : '–'}</td>` : ''}
          </tr>
        `).join('')}
        ${hasAnyPrices ? `
        <tr style="background:#f0f4ed;">
          <td colspan="2" style="padding:14px 16px;text-align:right;font-weight:600;color:#333;font-size:14px;">Totale Stimato:</td>
          <td style="padding:14px 16px;text-align:right;font-weight:700;color:#2d5016;font-size:16px;">${formatPrice(totalPrice)}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>
  `;
};

const buildBusinessEmail = (data: QuoteRequestData, productsHtml: string) => {
  const { nome, cognome, email, telefono, indirizzo, messaggio } = data;
  const dateStr = new Date().toLocaleDateString('it-IT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f0f2ee;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

  <!-- Header -->
  <tr><td style="background:#2d5016;padding:32px 40px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:0.5px;">Verde d'Oro</h1>
    <p style="color:#d4af37;margin:6px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Microgreens Premium</p>
  </td></tr>

  <!-- Alert -->
  <tr><td style="background:#d4af37;padding:12px 40px;text-align:center;">
    <p style="color:#2d5016;margin:0;font-weight:600;font-size:15px;">📩 Nuova Richiesta di Preventivo</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:32px 40px;">

    <!-- Customer card -->
    <table style="width:100%;background:#fafbf9;border-radius:8px;border:1px solid #e5e7e3;margin-bottom:28px;" cellpadding="0" cellspacing="0">
      <tr><td style="padding:20px 24px;">
        <h2 style="color:#2d5016;margin:0 0 16px;font-size:15px;font-weight:600;">Dati del Cliente</h2>
        <table style="width:100%;">
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;width:100px;">Nome</td>
            <td style="padding:6px 0;color:#333;font-size:14px;font-weight:500;">${nome} ${cognome}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;">Email</td>
            <td style="padding:6px 0;"><a href="mailto:${email}" style="color:#2d5016;text-decoration:none;font-size:14px;">${email}</a></td>
          </tr>
          ${telefono ? `<tr>
            <td style="padding:6px 0;color:#888;font-size:13px;">Telefono</td>
            <td style="padding:6px 0;"><a href="tel:${telefono}" style="color:#2d5016;text-decoration:none;font-size:14px;">${telefono}</a></td>
          </tr>` : ''}
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;">Indirizzo</td>
            <td style="padding:6px 0;color:#333;font-size:14px;">${indirizzo}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- Products -->
    <h2 style="color:#2d5016;margin:0 0 8px;font-size:15px;font-weight:600;">Prodotti Richiesti</h2>
    ${productsHtml}

    <!-- Message -->
    <h2 style="color:#2d5016;margin:28px 0 8px;font-size:15px;font-weight:600;">Messaggio</h2>
    <div style="background:#fafbf9;border-radius:8px;padding:16px 20px;border:1px solid #e5e7e3;">
      <p style="margin:0;color:#444;line-height:1.6;font-size:14px;white-space:pre-wrap;">${messaggio}</p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-top:32px;">
      <a href="mailto:${email}?subject=Preventivo%20Verde%20d'Oro%20-%20${encodeURIComponent(nome)}%20${encodeURIComponent(cognome)}"
         style="display:inline-block;background:#d4af37;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px;">
        Rispondi al Cliente →
      </a>
    </div>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f0f2ee;padding:20px 40px;text-align:center;border-top:1px solid #e5e7e3;">
    <p style="color:#999;margin:0;font-size:11px;">Richiesta ricevuta il ${dateStr}</p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
};

const buildCustomerEmail = (data: QuoteRequestData, productsHtml: string) => {
  const { nome, messaggio } = data;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f0f2ee;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

  <!-- Header -->
  <tr><td style="background:#2d5016;padding:40px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;letter-spacing:0.5px;">Verde d'Oro</h1>
    <p style="color:#d4af37;margin:8px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Microgreens Premium</p>
  </td></tr>

  <!-- Success -->
  <tr><td style="background:#4a7c23;padding:14px 40px;text-align:center;">
    <p style="color:#fff;margin:0;font-weight:600;font-size:16px;">✓ Richiesta Ricevuta con Successo!</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:36px 40px;">

    <h2 style="color:#2d5016;margin:0 0 16px;font-size:20px;">Ciao ${nome}!</h2>
    <p style="color:#555;line-height:1.7;font-size:15px;margin:0 0 24px;">
      Grazie per aver scelto <strong style="color:#2d5016;">Verde d'Oro</strong>! Abbiamo ricevuto la tua richiesta e il nostro team la sta già esaminando.
    </p>

    <!-- Timeline -->
    <table style="width:100%;background:#fafbf9;border-radius:8px;border:1px solid #e5e7e3;margin-bottom:28px;" cellpadding="0" cellspacing="0">
      <tr><td style="padding:24px;">
        <h3 style="color:#2d5016;margin:0 0 16px;font-size:15px;font-weight:600;">Cosa succede ora?</h3>
        <table style="width:100%;">
          <tr>
            <td style="width:32px;vertical-align:top;padding:4px 0;">
              <div style="width:24px;height:24px;border-radius:50%;background:#d4af37;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">1</div>
            </td>
            <td style="padding:4px 0 12px 12px;color:#555;font-size:14px;line-height:1.5;">Il nostro team analizzerà la tua richiesta</td>
          </tr>
          <tr>
            <td style="width:32px;vertical-align:top;padding:4px 0;">
              <div style="width:24px;height:24px;border-radius:50%;background:#d4af37;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">2</div>
            </td>
            <td style="padding:4px 0 12px 12px;color:#555;font-size:14px;line-height:1.5;">Riceverai un preventivo personalizzato <strong>entro 24 ore</strong></td>
          </tr>
          <tr>
            <td style="width:32px;vertical-align:top;padding:4px 0;">
              <div style="width:24px;height:24px;border-radius:50%;background:#d4af37;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">3</div>
            </td>
            <td style="padding:4px 0 0 12px;color:#555;font-size:14px;line-height:1.5;">Ti contatteremo all'email o telefono che hai fornito</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- Order Summary -->
    <h3 style="color:#2d5016;margin:0 0 8px;font-size:15px;font-weight:600;">Riepilogo della tua richiesta</h3>
    ${productsHtml}

    <div style="background:#fafbf9;border-radius:8px;padding:16px 20px;border:1px solid #e5e7e3;margin-top:16px;">
      <p style="margin:0 0 6px;color:#888;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Il tuo messaggio</p>
      <p style="margin:0;color:#444;line-height:1.6;font-size:14px;white-space:pre-wrap;">${messaggio}</p>
    </div>

    <!-- WhatsApp CTA -->
    <div style="background:#2d5016;border-radius:8px;padding:24px;margin-top:28px;text-align:center;">
      <p style="color:#fff;margin:0 0 12px;font-size:15px;">Hai domande urgenti?</p>
      <a href="https://wa.me/393202638648"
         style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:24px;font-weight:600;font-size:14px;">
        💬 Scrivici su WhatsApp
      </a>
    </div>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#fafbf9;padding:24px 40px;text-align:center;border-top:1px solid #e5e7e3;">
    <p style="color:#2d5016;margin:0 0 4px;font-weight:600;font-size:13px;">Verde d'Oro — Microgreens Premium</p>
    <p style="color:#999;margin:0;font-size:11px;">Reggio Emilia (RE)</p>
    <p style="color:#bbb;margin:8px 0 0;font-size:11px;">© ${year} Verde d'Oro. Tutti i diritti riservati.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: QuoteRequestData = await req.json();
    console.log("Received quote request:", JSON.stringify(data));

    const { nome, cognome, email, prodotti } = data;

    const hasAnyPrices = prodotti.some(p => p.price !== undefined && p.price > 0);
    const totalPrice = prodotti.reduce((sum, p) => sum + (p.price || 0), 0);

    const businessProductsHtml = buildProductsTable(prodotti, hasAnyPrices, totalPrice, 'business');
    const customerProductsHtml = buildProductsTable(prodotti, hasAnyPrices, totalPrice, 'customer');

    const businessEmailHtml = buildBusinessEmail(data, businessProductsHtml);
    const customerEmailHtml = buildCustomerEmail(data, customerProductsHtml);

    // Send email to business
    console.log("Sending email to business...");
    const businessEmail = await resend.emails.send({
      from: "Verde d'Oro <onboarding@resend.dev>",
      to: ["verdedoro.microgreens@gmail.com"],
      subject: `🌱 Nuova richiesta preventivo da ${nome} ${cognome}`,
      html: businessEmailHtml,
    });
    console.log("Business email sent:", businessEmail);

    // Try to send confirmation email to customer
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
      console.log("Customer email could not be sent (domain not verified):", customerError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        businessEmail,
        customerEmail: customerEmailResult,
        note: customerEmailResult ? "Both emails sent" : "Business email sent. Customer email requires verified domain.",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-quote-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
