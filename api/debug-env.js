module.exports = (req, res) => {
  res.json({
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET ? process.env.WEBHOOK_SECRET.substring(0,5)+'...' : 'IKKE SATT',
    NODE_ENV: process.env.NODE_ENV,
    keys: Object.keys(process.env).filter(k=>!k.startsWith('npm')).slice(0,10)
  });
};
