import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (per-instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// HTML escaping to prevent injection in emails
const escapeHtml = (str: string): string =>
  str.replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] || m)
  );

// Basic validation
function validateQuoteRequest(data: unknown): QuoteRequestData {
  if (!data || typeof data !== 'object') throw new Error('Invalid request body');
  const d = data as Record<string, unknown>;

  const nome = typeof d.nome === 'string' ? d.nome.trim() : '';
  const cognome = typeof d.cognome === 'string' ? d.cognome.trim() : '';
  const email = typeof d.email === 'string' ? d.email.trim() : '';
  const telefono = typeof d.telefono === 'string' ? d.telefono.trim() : undefined;
  const indirizzo = typeof d.indirizzo === 'string' ? d.indirizzo.trim() : '';
  const messaggio = typeof d.messaggio === 'string' ? d.messaggio.trim() : '';

  if (!nome || nome.length > 100) throw new Error('Invalid nome');
  if (!cognome || cognome.length > 100) throw new Error('Invalid cognome');
  if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
  if (telefono && telefono.length > 30) throw new Error('Invalid telefono');
  if (!indirizzo || indirizzo.length > 500) throw new Error('Invalid indirizzo');
  if (!messaggio || messaggio.length > 5000) throw new Error('Invalid messaggio');

  if (!Array.isArray(d.prodotti)) throw new Error('Invalid prodotti');
  if (d.prodotti.length > 50) throw new Error('Too many products');

  const prodotti = (d.prodotti as unknown[]).map((p: unknown) => {
    if (!p || typeof p !== 'object') throw new Error('Invalid product');
    const prod = p as Record<string, unknown>;
    const name = typeof prod.name === 'string' ? prod.name.trim() : '';
    const quantity = typeof prod.quantity === 'number' ? prod.quantity : 0;
    const price = typeof prod.price === 'number' ? prod.price : undefined;
    if (!name || name.length > 200) throw new Error('Invalid product name');
    if (quantity <= 0 || quantity > 100000) throw new Error('Invalid quantity');
    if (price !== undefined && (price < 0 || price > 100000)) throw new Error('Invalid price');
    return { name, quantity, price };
  });

  return { nome, cognome, email, telefono, indirizzo, messaggio, prodotti };
}

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
            <td style="padding:12px 16px;border-top:1px solid #eef0ec;color:#333;font-size:14px;">${escapeHtml(p.name)}</td>
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
            <td style="padding:6px 0;color:#333;font-size:14px;font-weight:500;">${escapeHtml(nome)} ${escapeHtml(cognome)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;">Email</td>
            <td style="padding:6px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#2d5016;text-decoration:none;font-size:14px;">${escapeHtml(email)}</a></td>
          </tr>
          ${telefono ? `<tr>
            <td style="padding:6px 0;color:#888;font-size:13px;">Telefono</td>
            <td style="padding:6px 0;"><a href="tel:${escapeHtml(telefono)}" style="color:#2d5016;text-decoration:none;font-size:14px;">${escapeHtml(telefono)}</a></td>
          </tr>` : ''}
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;">Indirizzo</td>
            <td style="padding:6px 0;color:#333;font-size:14px;">${escapeHtml(indirizzo)}</td>
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
      <p style="margin:0;color:#444;line-height:1.6;font-size:14px;white-space:pre-wrap;">${escapeHtml(messaggio)}</p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-top:32px;">
      <a href="mailto:${escapeHtml(email)}?subject=Preventivo%20Verde%20d'Oro%20-%20${encodeURIComponent(nome)}%20${encodeURIComponent(cognome)}"
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
  const logoUrl = 'https://xkwmkgdsfydhbjpytrbb.supabase.co/storage/v1/object/public/email-assets/logo.webp';


  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f5f0e8;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

  <!-- Header with Logo -->
  <tr><td style="background:linear-gradient(135deg, #356A35, #4A8B4A);padding:40px;text-align:center;">
    <img src="${logoUrl}" alt="Verde d'Oro" width="180" style="display:block;margin:0 auto 8px;" />
  </td></tr>

  <!-- Success Banner -->
  <tr><td style="background:#D4AF37;padding:14px 40px;text-align:center;">
    <p style="color:#ffffff;margin:0;font-weight:600;font-size:16px;">✓ Richiesta Ricevuta con Successo!</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:36px 40px;">

    <p style="color:#000;line-height:1.7;font-size:15px;margin:0 0 8px;">
      Ciao <strong>${escapeHtml(nome)}</strong>,
    </p>
    <p style="color:#333;line-height:1.7;font-size:15px;margin:0 0 8px;">
      Grazie per aver scelto <strong style="color:#356A35;">Verde D'Oro</strong>!
    </p>
    <p style="color:#333;line-height:1.7;font-size:15px;margin:0 0 28px;">
      Abbiamo ricevuto la tua richiesta e il nostro team la sta esaminando. Ti contatteremo al più presto via email o telefono per aggiornarti.
    </p>

    <!-- Hai ordinato dei microgreens? -->
    <h2 style="color:#356A35;margin:0 0 6px;font-size:18px;font-weight:700;">🌱 Hai ordinato dei microgreens?</h2>
    <p style="color:#333;font-size:15px;margin:0 0 20px;">Ecco come funziona:</p>

    <!-- 3 Steps -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;" cellpadding="0" cellspacing="0">
      <!-- Step 1: Conferma -->
      <tr>
        <td style="width:56px;vertical-align:top;padding:0 0 20px 0;">
          <div style="width:48px;height:48px;border-radius:50%;background:#356A35;display:inline-block;text-align:center;line-height:48px;font-size:22px;">✅</div>
        </td>
        <td style="vertical-align:top;padding:4px 0 20px 12px;">
          <p style="margin:0 0 4px;color:#356A35;font-weight:700;font-size:15px;">Conferma</p>
          <p style="margin:0;color:#555;font-size:14px;line-height:1.5;">Verifichiamo la disponibilità e ti contattiamo per confermare l'ordine</p>
        </td>
      </tr>
      <!-- Step 2: Coltivazione -->
      <tr>
        <td style="width:56px;vertical-align:top;padding:0 0 20px 0;">
          <div style="width:48px;height:48px;border-radius:50%;background:#356A35;display:inline-block;text-align:center;line-height:48px;font-size:22px;">🌱</div>
        </td>
        <td style="vertical-align:top;padding:4px 0 20px 12px;">
          <p style="margin:0 0 4px;color:#356A35;font-weight:700;font-size:15px;">Coltivazione</p>
          <p style="margin:0;color:#555;font-size:14px;line-height:1.5;">Avviamo la semina dei microgreens e ti comunichiamo i tempi di coltivazione in base alle varietà scelte</p>
        </td>
      </tr>
      <!-- Step 3: Consegna -->
      <tr>
        <td style="width:56px;vertical-align:top;padding:0 0 0 0;">
          <div style="width:48px;height:48px;border-radius:50%;background:#356A35;display:inline-block;text-align:center;line-height:48px;font-size:22px;">📦</div>
        </td>
        <td style="vertical-align:top;padding:4px 0 0 12px;">
          <p style="margin:0 0 4px;color:#356A35;font-weight:700;font-size:15px;">Consegna</p>
          <p style="margin:0;color:#555;font-size:14px;line-height:1.5;">Ricevi il prodotto fresco poche ore dopo la raccolta</p>
        </td>
      </tr>
    </table>

    <!-- Payment note -->
    <div style="background:#f5f0e8;border-radius:8px;padding:16px 20px;border-left:4px solid #D4AF37;margin-bottom:28px;">
      <p style="margin:0;color:#333;font-size:14px;line-height:1.5;">
        💰 <strong>Il pagamento avviene comodamente alla consegna.</strong>
      </p>
    </div>

    <!-- Order Summary -->
    <h3 style="color:#356A35;margin:0 0 8px;font-size:15px;font-weight:600;">Riepilogo della tua richiesta</h3>
    ${productsHtml}

    ${messaggio ? `
    <div style="background:#fafbf9;border-radius:8px;padding:16px 20px;border:1px solid #e5e7e3;margin-top:16px;">
      <p style="margin:0 0 6px;color:#888;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Il tuo messaggio</p>
      <p style="margin:0;color:#444;line-height:1.6;font-size:14px;white-space:pre-wrap;">${escapeHtml(messaggio)}</p>
    </div>
    ` : ''}

    <!-- WhatsApp CTA -->
    <div style="background:#f5f0e8;border-radius:8px;border:2px solid #356A35;padding:24px;margin-top:28px;text-align:center;">
      <p style="color:#333;margin:0 0 6px;font-size:15px;font-weight:700;">Hai domande nel frattempo?</p>
      <p style="color:#555;margin:0 0 16px;font-size:13px;">Scrivici su WhatsApp al +39 320 263 8648 — siamo sempre felici di aiutarti.</p>
      <a href="https://wa.me/393202638648"
         style="display:inline-block;background:#D4AF37;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:24px;font-weight:600;font-size:14px;">
        💬 Scrivici su WhatsApp
      </a>
    </div>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f5f0e8;padding:16px 40px;text-align:center;border-top:1px solid #e5e7e3;">
    <p style="color:#999;margin:0;font-size:11px;">© ${year} Verde d'Oro · Reggio Emilia (RE)</p>
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
    // Rate limiting by IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('cf-connecting-ip') || 'unknown';
    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate and sanitize input
    const rawData = await req.json();
    const data = validateQuoteRequest(rawData);

    console.log(`Quote request from ${data.email.split('@')[1]} with ${data.prodotti.length} products`);

    const { nome, cognome, email, prodotti } = data;

    const hasAnyPrices = prodotti.some(p => p.price !== undefined && p.price > 0);
    const totalPrice = prodotti.reduce((sum, p) => sum + (p.price || 0), 0);

    const businessProductsHtml = buildProductsTable(prodotti, hasAnyPrices, totalPrice, 'business');
    const customerProductsHtml = buildProductsTable(prodotti, hasAnyPrices, totalPrice, 'customer');

    const businessEmailHtml = buildBusinessEmail(data, businessProductsHtml);
    const customerEmailHtml = buildCustomerEmail(data, customerProductsHtml);

    // Send email to business
    const businessEmail = await resend.emails.send({
      from: "Verde d'Oro <noreply@microgreens.verdedoro.it>",
      to: ["microgreens.verdedoro@gmail.com"],
      subject: `🌱 Nuova richiesta preventivo da ${escapeHtml(nome)} ${escapeHtml(cognome)}`,
      html: businessEmailHtml,
    });

    // Try to send confirmation email to customer
    let customerEmailResult = null;
    try {
      customerEmailResult = await resend.emails.send({
        from: "Verde d'Oro <noreply@microgreens.verdedoro.it>",
        to: [email],
        subject: "Conferma richiesta - Verde D'Oro Microgreens",
        html: customerEmailHtml,
      });
    } catch (customerError: any) {
      console.log("Customer email could not be sent:", customerError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        note: customerEmailResult ? "Both emails sent" : "Business email sent. Customer email requires verified domain.",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-quote-request:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to process request." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
