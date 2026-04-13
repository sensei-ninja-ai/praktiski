// api/generate-rapport.js
// @vercel/node - maxDuration: 60
// Kjøres via Supabase webhook eller manuelt trigger
// Flow: hent kartlegging fra Supabase → generer rapport med Claude → send approval email til Krisfred

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const APPROVAL_BASE_URL = process.env.APPROVAL_BASE_URL || 'https://praktiski.no';
const KRISFRED_EMAIL = 'krisfred95@gmail.com';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { kartlegging_id, secret } = req.body;

  // Enkel secret-sjekk for å unngå misbruk
  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!kartlegging_id) return res.status(400).json({ error: 'kartlegging_id required' });

  try {
    // 1. Hent kartlegging fra Supabase
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/kartlegginger?id=eq.${kartlegging_id}&select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    const rows = await dbRes.json();
    if (!rows?.length) return res.status(404).json({ error: 'Kartlegging ikke funnet' });

    const k = rows[0];
    // metadata lagres i notat-kolonnen som JSON-streng
    let metadata = {};
    try { metadata = typeof k.notat === 'string' ? JSON.parse(k.notat) : (k.notat || {}); } catch(e) { metadata = {}; }

    // 2. Generer rapport med Claude
    const rapport = await genererRapport(k, metadata);

    // 3. Lagre rapport i Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/kartlegginger?id=eq.${kartlegging_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notat: rapport, status: 'rapport_klar' })
    });

    // 4. Send approval email til Krisfred
    await sendApprovalEmail(k, rapport, kartlegging_id);

    return res.status(200).json({ success: true, message: 'Rapport generert og sendt til godkjenning' });

  } catch (err) {
    console.error('Rapport-generering feil:', err);
    return res.status(500).json({ error: err.message });
  }
}

// ===== RAPPORT-GENERATOR =====
async function genererRapport(k, metadata) {

  const procs = metadata.prosesser || [];
  const totalTimer = procs.reduce((s, p) => s + Number(p.timer || 0), 0);
  const topProcs = [...procs]
    .sort((a, b) => (Number(b.frustrasjon) * Number(b.timer)) - (Number(a.frustrasjon) * Number(a.timer)))
    .slice(0, 5);

  const timepris = 500; // standard NOK/t
  const ukesbesparelse = Math.round(totalTimer * 0.5);
  const arsbesparelse = ukesbesparelse * timepris * 47;

  const prompt = `Du er en senior KI-konsulent hos Praktisk Intelligens. Du skal skrive en komplett, profesjonell KI-kartleggingsrapport for bedriften nedenfor.

## Om bedriften
- **Bedrift:** ${k.bedrift || 'Ukjent'}
- **Kontakt:** ${k.navn || 'Ukjent'} (${k.stilling || k.rolle || 'Daglig leder'})
- **Bransje:** ${k.bransje || 'Ikke oppgitt'}
- **Ansatte:** ${k.antall_ansatte || 'Ikke oppgitt'}
- **Omsetning:** ${k.omsetning || 'Ikke oppgitt'}
- **Systemer i bruk:** ${k.systemer || 'Ikke oppgitt'}
- **Har prøvd KI:** ${metadata.provd_ki || 'Nei'}${metadata.ki_erfaring ? ` — ${metadata.ki_erfaring}` : ''}

## Kartlagte prosesser (${procs.length} stk)
${procs.map(p => `- **${p.prosess_custom || p.prosess}**: ${p.timer}t/uke, frustrasjon ${p.frustrasjon}/5, frekvens: ${p.frekvens || 'ikke oppgitt'}
  Verktøy i dag: ${p.verktoy || 'ingen'}
  Notater: ${p.notater || 'ingen'}`).join('\n')}

## Smertepunkter
${k.smertepunkter || metadata.storste_frustrasjon || 'Ikke oppgitt'}

## Mål
- 3 mnd: ${metadata.maal_3mnd || 'ikke oppgitt'}
- 6 mnd: ${metadata.maal_6mnd || 'ikke oppgitt'}
- 12 mnd: ${metadata.maal_12mnd || 'ikke oppgitt'}

## Økonomi
- Budsjett: ${k.budsjett || 'ikke oppgitt'}
- Total admin-tid per uke: ${totalTimer} timer
- Anbefalt pakke: ${k.anbefalt_pakke || 'ikke valgt'}

---

Skriv en komplett KI-kartleggingsrapport i HTML. Rapporten skal:

1. Være skrevet til bedriftseier/daglig leder direkte (du-form, profesjonell men varm tone)
2. Overbevise dem om at KI er relevant for AKKURAT DERES bedrift med konkrete tall og eksempler
3. Gi en klar handlingsplan de kan starte på mandag
4. Posisjonere Praktisk Intelligens som den naturlige partneren

## Rapportstruktur (obligatorisk):

### 1. Forside
Profesjonell forside med bedriftsnavn, KI-modenhetsscore (beregn 0-100 basert på data), dato

### 2. Sammendrag (Executive Summary)
Maks 5-6 linjer. De 3 viktigste funnene. Hva betyr dette for bedriften.

### 3. Digital modenhet
Vurder systemene de bruker. Score per kategori (regnskap, prosjektstyring, kundeoppfølging, markedsføring, KI-erfaring). Konkret vurdering av hvert system.

### 4. Prosessanalyse
Gå gjennom ALLE kartlagte prosesser grundig. For hver prosess:
- Nåværende situasjon
- KI-potensial (HØY/MEDIUM/LAV med begrunnelse)
- Konkret forslag: hvilken KI-løsning, hvordan implementere, estimert effekt
- Tidsbesparelse estimat

### 5. ROI-beregning
Konkrete tall:
- Nåværende kostnad (admin-timer × estimert timepris)
- Estimert besparelse med KI (timer og kroner per uke og år)
- Break-even for investering

### 6. Hva koster det å IKKE gjøre noe?
Kalkuler og beskriv konkret: tapt tid, tapt konkurranseevne, hvor langt bak konkurrentene de er om 12-24 måneder hvis de ikke handler nå.

### 7. Konkurrentperspektiv
Kort: hva gjør lignende bedrifter i samme bransje med KI nå? Hva risikerer de å gå glipp av?

### 8. Anbefalte tiltak
Topp 5 KI-muligheter (alltid 5 stk, rangert etter):
- Enkel å implementere
- Høy ROI
- Passer bransjen

For hvert tiltak: konkret beskrivelse, verktøy/teknologi, estimert implementeringstid, estimert effekt.

### 9. Handlingsplan
Konkret plan:
- **Uke 1:** Hva gjøres første uke
- **Uke 2-4:** Neste steg
- **Måned 2-3:** Videre utvikling

### 10. Om Praktisk Intelligens
Kort presentasjon av Praktisk Intelligens. Hva vi tilbyr:
- Engangsimplementering av KI-løsninger (skreddersydd pakke)
- MRR for hosting, vedlikehold og support
- Kurs og opplæring for ansatte
CTA: Book gratis 20-minutters gjennomgang

---

## HTML-krav:
- Bruk inline CSS. Fargepalett: mørk navy (#1a2332), gull (#f0a500), hvit tekst
- A4-format egnet for PDF (800px bredde, page-break-inside: avoid på seksjoner)
- Profesjonelt design med tydelig hierarki
- Ikke bruk markdown — kun HTML
- Inkluder Praktisk Intelligens logo/brand i header og footer
- Rapporten skal ha NØYAKTIG den lengden som trengs for å dekke alt grundig — ikke kutt corners

Skriv BARE HTML-koden, ingen forklaring.`;

  // Bruk OpenRouter (Claude via proxy) — unngår direkte Anthropic-konto
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://praktiski.no',
      'X-Title': 'Praktisk Intelligens Rapport'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-opus-4',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`OpenRouter feil: ${JSON.stringify(data)}`);
  return data.choices[0].message.content;
}

// ===== APPROVAL EMAIL =====
async function sendApprovalEmail(k, rapport, kartleggingId) {
  const previewHtml = rapport.substring(0, 500) + '...';
  const approveUrl = `${APPROVAL_BASE_URL}/api/approve-rapport?id=${kartleggingId}&secret=${process.env.WEBHOOK_SECRET}`;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,sans-serif;background:#f5f5f5;padding:24px">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,.08)">
  
  <div style="background:#1a2332;padding:28px 32px;border-bottom:3px solid #f0a500">
    <div style="font-size:.7rem;letter-spacing:2px;text-transform:uppercase;color:#f0a500;margin-bottom:6px">Praktisk Intelligens</div>
    <h1 style="color:#fff;font-size:1.4rem;margin:0">Ny kartlegging klar for godkjenning</h1>
  </div>

  <div style="padding:32px">
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="padding:8px 0;font-size:.85rem;color:#888;width:140px">Bedrift</td><td style="font-size:.9rem;font-weight:600;color:#1a1a2e">${k.bedrift || '—'}</td></tr>
      <tr><td style="padding:8px 0;font-size:.85rem;color:#888">Kontakt</td><td style="font-size:.9rem;color:#1a1a2e">${k.navn || '—'}</td></tr>
      <tr><td style="padding:8px 0;font-size:.85rem;color:#888">E-post</td><td style="font-size:.9rem;color:#1a1a2e">${k.epost || '—'}</td></tr>
      <tr><td style="padding:8px 0;font-size:.85rem;color:#888">Bransje</td><td style="font-size:.9rem;color:#1a1a2e">${k.bransje || '—'}</td></tr>
      <tr><td style="padding:8px 0;font-size:.85rem;color:#888">Timer/uke</td><td style="font-size:.9rem;color:#1a1a2e">${k.timer_admin_uke || 0}t admin</td></tr>
      <tr><td style="padding:8px 0;font-size:.85rem;color:#888">ROI-estimat</td><td style="font-size:.9rem;font-weight:700;color:#f0a500">${k.roi_estimat ? k.roi_estimat.toLocaleString('nb-NO') + ' kr/år' : '—'}</td></tr>
      <tr><td style="padding:8px 0;font-size:.85rem;color:#888">Anbefalt pakke</td><td style="font-size:.9rem;color:#1a1a2e">${k.anbefalt_pakke || '—'}</td></tr>
    </table>

    <div style="background:#f9f9f7;border:1px solid #e8e4dc;border-radius:6px;padding:16px;margin-bottom:24px">
      <div style="font-size:.72rem;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:8px">Rapporten er generert og klar</div>
      <p style="font-size:.85rem;color:#555;line-height:1.6;margin:0">Klikk "Godkjenn og send" for å sende rapporten direkte til kundens e-post. Du kan også redigere rapporten i Supabase før du godkjenner.</p>
    </div>

    <div style="text-align:center">
      <a href="${approveUrl}" style="display:inline-block;background:#f0a500;color:#1a2332;text-decoration:none;border-radius:6px;padding:16px 40px;font-size:.95rem;font-weight:700;letter-spacing:.3px;margin-bottom:12px">
        ✅ Godkjenn og send rapport →
      </a>
      <br>
      <a href="${SUPABASE_URL}/project/qfbdwqqebnhdlwqsvgea/editor" style="font-size:.78rem;color:#888;text-decoration:none">
        Rediger i Supabase først
      </a>
    </div>
  </div>

  <div style="background:#f9f9f7;padding:16px 32px;text-align:center;font-size:.7rem;color:#aaa;border-top:1px solid #f0ece4">
    Praktisk Intelligens · Automatisk rapport-workflow · ${new Date().toLocaleDateString('nb-NO')}
  </div>
</div>
</body>
</html>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Praktisk Intelligens <onboarding@resend.dev>',
      to: [KRISFRED_EMAIL],
      subject: `📊 Ny kartlegging klar: ${k.bedrift || 'Ukjent bedrift'} — Godkjenn rapport`,
      html: emailHtml
    })
  });
}
