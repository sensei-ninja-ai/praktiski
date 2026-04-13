export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const CHANNEL_ID = '1487899496724828181'; // #kartlegging-logg

  if (!BOT_TOKEN) {
    console.warn('DISCORD_BOT_TOKEN mangler');
    return res.status(200).json({ ok: false, reason: 'no token' });
  }

  const { bedrift, navn, epost, score, modenhet, bransje, ansatte, roi, pakke } = req.body || {};

  const message = [
    '🔔 **Ny kartlegging mottatt!**',
    '',
    `**Bedrift:** ${bedrift || '—'}`,
    `**Kontakt:** ${navn || '—'} — ${epost || '—'}`,
    `**KI-score:** ${score || '—'}/100 — ${modenhet || '—'}`,
    `**Bransje:** ${bransje || '—'}`,
    `**Ansatte:** ${ansatte || '—'}`,
    '',
    `**ROI-estimat:** ${roi ? Number(roi).toLocaleString('nb-NO') : '—'} kr/år`,
    `**Anbefalt pakke:** ${pakke || '—'}`,
    '',
    '👉 Dashboard: https://praktiski-ljq8rufsk-kristoffers-projects-a92ff6b5.vercel.app/dashboard.html'
  ].join('\n');

  try {
    const discordRes = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: message })
    });

    if (!discordRes.ok) {
      const err = await discordRes.text();
      console.warn('Discord feil:', discordRes.status, err);
      return res.status(200).json({ ok: false, status: discordRes.status });
    }
  } catch (e) {
    console.warn('Discord kall feilet:', e.message);
    return res.status(200).json({ ok: false, error: e.message });
  }

  res.status(200).json({ ok: true });
}
