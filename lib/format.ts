export function formatTime(iso: string) {
  return new Date(iso).toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toGCalStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildGoogleCalendarUrl(title: string, reminderAtLocal: string, details?: string) {
  const start = new Date(reminderAtLocal);
  const end = new Date(start.getTime() + 30 * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toGCalStamp(start)}/${toGCalStamp(end)}`,
    details: details || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
