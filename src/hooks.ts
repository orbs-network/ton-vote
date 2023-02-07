import { voteOptions } from "config";
import { useVoteStore, useWalletStore } from "store";
import { Vote } from "types";

export const useWalletVote = () => {
  const { setVote } = useVoteStore();

  return (votes: Vote[], walletAddress = useWalletStore.getState().address) => {
    if (!walletAddress) return votes;
    let vote = votes.find((it) => it.address === walletAddress);

    if (!vote) return votes;
    const index = votes.findIndex((it) => it.address === walletAddress);
    votes.unshift(vote);
    votes.splice(index, 1);
    const value = voteOptions.find((it) => it.name === vote?.vote)?.value;
    setVote(value);

    return votes;
  };
};
