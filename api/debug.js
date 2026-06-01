export default async function handler(req, res) {
  res.status(200).json({
    calendar: process.env.PIPEDREAM_CALENDAR_URL ? 'set' : 'MISSING',
    gmail: process.env.PIPEDREAM_GMAIL_URL ? 'set' : 'MISSING',
    anthropic: process.env.ANTHROPIC_API_KEY ? 'set' : 'MISSING',
  });
}
