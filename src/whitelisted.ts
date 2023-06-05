import { IS_DEV } from "config";

export const WHITELISTED_DAOS: string[] = []
export const WHITELISTED_PROPOSALS: string[] = IS_DEV ? [] :  [
  "EQDMRWSwRZ4cZYHr4izVRVKY0H4CpTnAW867QTn3BdqddiR5",
  "EQD0b665oQ8R3OpEjKToOrqQ9a9B52UnlY-VDKk73pCccvLr",
  "EQCVy5bEWLQZrh5PYb1uP3FSO7xt4Kobyn4T9pGy2c5-i-GS",
];