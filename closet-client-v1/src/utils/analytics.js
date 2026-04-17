export function trackEvent(eventName, metadata = {}) {
  const payload = {
    eventName,
    metadata,
    timestamp: new Date().toISOString()
  };
  try {
    const raw = localStorage.getItem('closetAnalyticsEvents');
    const events = raw ? JSON.parse(raw) : [];
    const next = [payload, ...events].slice(0, 200);
    localStorage.setItem('closetAnalyticsEvents', JSON.stringify(next));
  } catch (error) {
    console.error('Failed to track event', error);
  }
}
