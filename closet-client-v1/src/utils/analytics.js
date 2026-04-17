const MAX_ANALYTICS_EVENTS = 200;

export function trackEvent(eventName, metadata = {}) {
  const payload = {
    eventName,
    metadata,
    timestamp: new Date().toISOString()
  };
  try {
    const raw = localStorage.getItem('closetAnalyticsEvents');
    const events = raw ? JSON.parse(raw) : [];
    const next = [payload, ...events].slice(0, MAX_ANALYTICS_EVENTS);
    localStorage.setItem('closetAnalyticsEvents', JSON.stringify(next));
  } catch (error) {
    console.error('Failed to track event', error);
  }
}
