import { BASE_ERROR_MESSAGE } from "config";
import moment from "moment";
import { Wallet } from "ton";
import { Vote } from "types";
export const makeElipsisAddress = (
  address: string,
  padding = 6
): string => {
  if (!address) return "";
  return `${address.substring(0, padding)}...${address.substring(address.length - padding)}`;
};


const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const fromUnixToString = (time: number, format = "MMM DD, YYYY h:mm a") => {
  return moment.unix(time).format(format);
};

export async function waitForSeqno(wallet: Wallet) {
  const seqnoBefore = await wallet.getSeqNo();

  return async () => {
    for (let attempt = 0; attempt < 20; attempt++) {
      await delay(3000);
      let seqnoAfter;

      try {
        seqnoAfter = await wallet.getSeqNo();
      } catch (error) {}

      if (seqnoAfter && seqnoAfter > seqnoBefore) return;
    }
    throw new Error(BASE_ERROR_MESSAGE);
  };
}


export const sortVotesByConnectedWallet = (votes: Vote[], walletAddress?: string) => {

  if (!walletAddress) {
    return votes;
  }
    const index = votes!.findIndex((it) => it.address === walletAddress);
  if (index < 0) return votes;

  const selectedItem = votes?.splice(index, 1)[0];
  votes?.unshift(selectedItem);
  return votes;
};