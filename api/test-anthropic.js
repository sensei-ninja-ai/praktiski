module.exports = async (req, res) => {
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return res.json({error: 'no key'});
    
    // Bruk native fetch (Node 18+) direkte
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Si bare: OK' }]
      })
    });
    const data = await response.json();
    res.json({ ok: response.ok, status: response.status, data });
  } catch(e) {
    res.json({ error: e.message });
  }
};
