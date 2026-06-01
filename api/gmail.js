export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await fetch(process.env.PIPEDREAM_GMAIL_URL);
    const data = await response.json();

    // Filter out noise (Pipedream welcome, Vercel alerts, etc.)
    const threads = (data.threads || []).filter(t => {
      const from = (t.from || '').toLowerCase();
      const subject = (t.subject || '').toLowerCase();
      return !from.includes('pipedream') &&
             !from.includes('vercel') &&
             !subject.includes('confirm your email') &&
             !subject.includes('verify your email');
    });

    res.status(200).json({
      threads,
      unreadCount: threads.filter(t => t.unread).length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
