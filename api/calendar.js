export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const url = process.env.PIPEDREAM_CALENDAR_URL;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); } catch(e) {
      return res.status(200).json({ error: 'JSON parse failed', raw: raw.substring(0, 300) });
    }

    const items = data.items || [];
    const now = new Date();
    const todayET = new Date(now.getTime() - (4 * 60 * 60 * 1000));
    todayET.setHours(0, 0, 0, 0);

    const allTitles = items.map(e => ({ summary: e.summary, type: e.eventType, hasDateTime: !!e.start?.dateTime, start: e.start?.dateTime || e.start?.date }));

    const events = items
      .filter(e => {
        if (e.eventType === 'workingLocation') return false;
        if (!e.start?.dateTime) return false;
        return new Date(e.start.dateTime) >= todayET;
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

    res.status(200).json({ events, count: events.length, debug: { total_items: items.length, today_et: todayET.toISOString(), all: allTitles } });
  } catch (err) {
    res.status(200).json({ error: err.name === 'AbortError' ? 'timeout' : err.message });
  }
}
