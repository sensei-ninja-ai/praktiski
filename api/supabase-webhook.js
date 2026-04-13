// api/supabase-webhook.js
// Supabase Database Webhook → trigger rapport-generering
// Sett opp i Supabase: Database → Webhooks → ny webhook på INSERT i kartlegginger
// URL: https://praktiski.no/api/supabase-webhook
// HTTP Method: POST
// Headers: x-webhook-secret: praktiski_webhook_2026

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verifiser webhook secret fra Supabase header
  const webhookSecret = req.headers['x-webhook-secret'];
  if (webhookSecret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { record, type } = req.body;

  // Kun på INSERT av ny kartlegging
  if (type !== 'INSERT' || !record?.id) {
    return res.status(200).json({ skipped: true });
  }

  // Ikke trigger hvis allerede har rapport
  if (record.status === 'rapport_sendt') {
    return res.status(200).json({ skipped: 'already sent' });
  }

  console.log('Ny kartlegging mottatt:', record.id, record.bedrift);

  // Kall generate-rapport asynkront (ikke vent på svar)
  const baseUrl = process.env.APPROVAL_BASE_URL || 'https://praktiski.no';
  fetch(`${baseUrl}/api/generate-rapport`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kartlegging_id: record.id,
      secret: process.env.WEBHOOK_SECRET
    })
  }).catch(err => console.error('generate-rapport feil:', err));

  return res.status(200).json({ ok: true, message: `Rapport-generering startet for ID ${record.id}` });
}
