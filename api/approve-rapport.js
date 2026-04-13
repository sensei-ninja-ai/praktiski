// api/approve-rapport.js
// Krisfred klikker "Godkjenn" → rapporten sendes til kunden

module.exports = async function handler(req, res) {
  const { id, secret } = req.query;

  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).send('<h1>Unauthorized</h1>');
  }
  if (!id) return res.status(400).send('<h1>Mangler id</h1>');

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  try {
    // 1. Hent kartlegging
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/kartlegginger?id=eq.${id}&select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    const rows = await dbRes.json();
    if (!rows?.length) return res.status(404).send('<h1>Kartlegging ikke funnet</h1>');

    const k = rows[0];

    if (!k.epost) {
      return res.status(400).send('<h1>Ingen e-post registrert for denne kunden</h1>');
    }

    if (!k.notat) {
      return res.status(400).send('<h1>Ingen rapport generert ennå</h1>');
    }

    // 2. Send rapport til kunden
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Praktisk Intelligens <onboarding@resend.dev>',
        to: [k.epost],
        subject: `Din KI-rapport er klar, ${k.navn?.split(' ')[0] || 'hei'}`,
        html: buildKundeEmail(k)
      })
    });

    const emailData = await emailRes.json();
    if (!emailRes.ok) throw new Error(`Resend feil: ${JSON.stringify(emailData)}`);

    // 3. Oppdater status i Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/kartlegginger?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'rapport_sendt', neste_steg: 'Rapport sendt ' + new Date().toLocaleDateString('nb-NO') })
    });

    // 4. Vis bekreftelse til Krisfred
    return res.status(200).send(`
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Rapport sendt</title></head>
<body style="font-family:-apple-system,sans-serif;background:#f5f5f5;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
<div style="background:#fff;border-radius:8px;padding:48px;max-width:480px;text-align:center;box-shadow:0 2px 20px rgba(0,0,0,.08)">
  <div style="font-size:3rem;margin-bottom:16px">✅</div>
  <h1 style="font-size:1.4rem;color:#1a2332;margin-bottom:8px">Rapport sendt!</h1>
  <p style="color:#888;font-size:.9rem;line-height:1.6;margin-bottom:24px">
    Rapporten er sendt til <strong style="color:#1a2332">${k.epost}</strong>.<br>
    Status oppdatert i Supabase.
  </p>
  <div style="background:#f9f9f7;border-radius:6px;padding:16px;font-size:.82rem;color:#666">
    Bedrift: ${k.bedrift || '—'}<br>
    Kontakt: ${k.navn || '—'}
  </div>
</div>
</body>
</html>`);

  } catch (err) {
    console.error('Approve feil:', err);
    return res.status(500).send(`<h1>Feil: ${err.message}</h1>`);
  }
}

function buildKundeEmail(k) {
  const firstName = k.navn?.split(' ')[0] || 'Hei';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f4f0;padding:24px;margin:0">
<div style="max-width:600px;margin:0 auto">

  <div style="background:#1a2332;border-radius:8px 8px 0 0;padding:32px;border-bottom:3px solid #f0a500">
    <div style="font-size:.65rem;letter-spacing:2px;text-transform:uppercase;color:rgba(240,165,0,.8);margin-bottom:8px">Praktisk Intelligens</div>
    <h1 style="color:#fff;font-size:1.5rem;margin:0;font-weight:700">Din KI-rapport er klar, ${firstName}</h1>
  </div>

  <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;box-shadow:0 4px 20px rgba(0,0,0,.08)">
    <p style="font-size:.95rem;color:#444;line-height:1.75;margin-bottom:24px">
      Takk for at du tok deg tid til kartleggingen. Vi har nå gått gjennom svarene dine og satt sammen en personlig KI-rapport for <strong>${k.bedrift || 'bedriften din'}</strong>.
    </p>

    <div style="background:#faf9f6;border-left:3px solid #f0a500;padding:20px 22px;border-radius:0 6px 6px 0;margin-bottom:28px">
      <div style="font-size:.72rem;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:10px;font-weight:600">Rapporten inneholder</div>
      <div style="font-size:.88rem;color:#444;line-height:1.9">
        📊 Analyse av dine prosesser og KI-potensial<br>
        💰 ROI-estimat — konkrete tall på besparelse<br>
        🎯 Topp 3 KI-tiltak tilpasset din bransje<br>
        📅 Handlingsplan for de neste 3 månedene<br>
        📦 Anbefalt pakke for implementering
      </div>
    </div>

    <p style="font-size:.85rem;color:#666;line-height:1.7;margin-bottom:28px">
      Rapporten er vedlagt denne e-posten. Ta gjerne kontakt om du har spørsmål eller ønsker å gå gjennom funnene sammen.
    </p>

    <div style="text-align:center;margin-bottom:28px">
      <a href="https://cal.com/praktiski/gjennomgang" style="display:inline-block;background:#f0a500;color:#1a2332;text-decoration:none;border-radius:6px;padding:16px 36px;font-size:.9rem;font-weight:700;letter-spacing:.3px">
        Book gratis gjennomgang (20 min) →
      </a>
    </div>

    <div style="border-top:1px solid #f0ece4;padding-top:20px">
      <p style="font-size:.82rem;color:#888;line-height:1.65;margin:0">
        Med vennlig hilsen<br>
        <strong style="color:#1a2332">Krisfred</strong><br>
        Praktisk Intelligens · praktiski.no
      </p>
    </div>
  </div>

  <p style="text-align:center;font-size:.7rem;color:#bbb;margin-top:20px;line-height:1.8">
    100% konfidensielt · Ingen forpliktelser<br>
    Du mottok denne e-posten fordi du gjennomførte en KI-kartlegging hos Praktisk Intelligens.
  </p>
</div>
</body>
</html>`;
}
