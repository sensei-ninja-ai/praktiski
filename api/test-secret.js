module.exports = (req, res) => {
  const { secret } = req.body || {};
  const envSecret = process.env.WEBHOOK_SECRET;
  res.json({
    received_secret: secret,
    env_secret: envSecret ? envSecret.substring(0,8)+'...' : 'IKKE SATT',
    match: secret === envSecret,
    body_type: typeof req.body,
    body: req.body
  });
};
