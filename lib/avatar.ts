export function getAvatarUrl(name: string, size = 128): string {
  const trimmed = name.trim() || 'User'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmed)}&size=${size}`
}
