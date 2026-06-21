export function unixToLocal(unixStr: string): string {
  try {
    const ms = Number(unixStr) * 1000;
    return new Date(ms).toLocaleString();
  } catch {
    return unixStr;
  }
}

export function unixToRelative(unixStr: string): string {
  const now = Math.floor(Date.now() / 1000);
  const target = Number(unixStr);
  const diff = target - now;

  if (diff <= 0) return "passed";

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function isDeadlinePassed(deadlineUnix: string): boolean {
  return Math.floor(Date.now() / 1000) >= Number(deadlineUnix);
}

export function deadlineCountdown(deadlineUnix: string): string {
  const now = Math.floor(Date.now() / 1000);
  const target = Number(deadlineUnix);
  const diff = target - now;

  if (diff <= 0) return "Deadline passed";

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function localDateToUnix(date: string, time: string): number {
  const dt = new Date(`${date}T${time}`);
  return Math.floor(dt.getTime() / 1000);
}
