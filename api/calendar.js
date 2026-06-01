export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await fetch(process.env.PIPEDREAM_CALENDAR_URL);
    const data = await response.json();

    const now = new Date();

    const events = (data.items || [])
      .filter(e => {
        // skip all-day working location / office events
        if (e.eventType === 'workingLocation') return false;
        if (e.start?.date && !e.start?.dateTime) return false;
        const start = new Date(e.start?.dateTime || e.start?.date);
        return start >= now;
      })
      .map(e => {
        const start = new Date(e.start.dateTime);
        const end = new Date(e.end.dateTime);
        const duration = Math.round((end - start) / 60000);

        // detect platform from description/location
        const text = ((e.description || '') + (e.location || '')).toLowerCase();
        let platform = '';
        if (e.conferenceData || text.includes('meet.google') || (e.description || '').includes('meet.google')) platform = 'Google Meet';
        else if (text.includes('zoom')) platform = 'Zoom';
        else if (text.includes('webex')) platform = 'Webex';
        else if (text.includes('teams')) platform = 'Teams';
        else if (e.location) platform = e.location.split(',')[0];

        return {
          title: e.summary,
          date: start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/New_York' }),
          time: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', hour12: true }),
          duration: duration + ' min',
          platform,
        };
      })
      .slice(0, 8);

    res.status(200).json({ events, count: events.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
