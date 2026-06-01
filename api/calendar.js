export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(process.env.PIPEDREAM_CALENDAR_URL, { signal: controller.signal });
    clearTimeout(timeout);
    const data = await response.json();

    // Use start of today in ET (UTC-4) to avoid timezone filtering issues
    const now = new Date();
    const todayET = new Date(now.getTime() - (4 * 60 * 60 * 1000));
    todayET.setHours(0, 0, 0, 0);

    const events = (data.items || [])
      .filter(e => {
        if (e.eventType === 'workingLocation') return false;
        // Skip all-day events with no time component
        if (!e.start?.dateTime) return false;
        const start = new Date(e.start.dateTime);
        return start >= todayET;
      })
      .map(e => {
        const start = new Date(e.start.dateTime);
        const end = new Date(e.end.dateTime);
        const duration = Math.round((end - start) / 60000);
        const text = ((e.description || '') + (e.location || '')).toLowerCase();
        let platform = '';
        if (text.includes('meet.google') || text.includes('google meet')) platform = 'Google Meet';
        else if (text.includes('zoom')) platform = 'Zoom';
        else if (text.includes('webex')) platform = 'Webex';
        else if (text.includes('teams')) platform = 'Teams';
        else if (e.location) platform = e.location.split(',')[0].trim();

        return {
          title: e.summary,
          date: start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/New_York' }),
          time: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', hour12: true }),
          duration: duration + ' min',
          platform,
        };
      })
      .slice(0, 8);

    res.status(200).json({ events, count: events.length, debug_total: (data.items || []).length });
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    res.status(isTimeout ? 504 : 500).json({ error: isTimeout ? 'Calendar timed out' : err.message });
  }
}
