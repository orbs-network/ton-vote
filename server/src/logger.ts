function format(msg?: string): string {
  return `${new Date().toISOString()} ${msg}`;
}

export function log(msg?: string) {
  console.log(format(msg));
}

export function error(msg?: string) {
  console.error('[ERROR]', format(msg));
}
