export function capitalize(str: string) {
  if (str.length === 0) {
    return '';
  }
  return str[0].toUpperCase() + str.slice(1);
}

export function escapeHtml(unsafe: string): string {
  return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
