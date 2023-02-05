// create an array of numbers, from 0 to range
export function range(length: number) {
  return [...Array(length).keys()];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorString(e: any) {
  return (e && e.stack) || '' + e;
}

export function timeout<T>(ms: number, promise: Promise<T>): Promise<T> {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject('Timed out in ' + ms + 'ms.'), ms)),
  ]);
}

export function toNumber(val: number | string) {
  if (typeof val == 'string') {
    return parseInt(val);
  } else return val;
}

function byte(value: number, byteIdx: number) {
  const shift = byteIdx * 8;
  return ((value & (0xff << shift)) >> shift) & 0xff;
}

export function getIpFromHex(ipStr: string): string {
  const ipBytes = Number(ipStr);
  return byte(ipBytes, 3) + '.' + byte(ipBytes, 2) + '.' + byte(ipBytes, 1) + '.' + byte(ipBytes, 0);
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// returns UTC clock time in seconds (similar to unix timestamp / Ethereum block time / RefTime)
export function getCurrentClockTime() {
  return Math.round(new Date().getTime() / 1000);
}

export const day = 24 * 60 * 60;

export const year = day * 365;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JsonResponse = any;

export type DailyStatsData = { day: string; count: number }[];

export class DailyStats {
  private data: DailyStatsData = [];
  constructor(private daysToRemember = 7) {}
  add(num: number) {
    const day = this.today();
    if (this.data.length > 0 && this.data[this.data.length - 1].day == day) {
      this.data[this.data.length - 1].count += num;
    } else {
      this.data.push({ day, count: num });
    }
    if (this.data.length > this.daysToRemember) {
      this.data.splice(0, this.data.length - this.daysToRemember);
    }
  }
  today(): string {
    return new Date().toISOString().substr(0, 10);
  }
  getStats() {
    return this.data;
  }
}

export function normalizeAddress(address: string): string {
  if (!address) return address;
  if (address.startsWith('0x')) return address.substr(2).toLowerCase();
  return address.toLowerCase();
}
