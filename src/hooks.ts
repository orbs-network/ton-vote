import { USER_VOTE_LOCAL_STORAGE, voteOptions } from "config";
import { useGetAddressVotingPower } from "queries/queries";
import { useContractAddressQuery, useStateData } from "queries/queries";
import { useWalletAddress } from "store";
import { Vote } from "types";
import { unshiftWalletVote } from "utils";

export const useLocalStorageWalletVote = () => {
  const walletAddress = useWalletAddress();
  const contractAddress = useContractAddressQuery().data;

  const localStorageKey = `${USER_VOTE_LOCAL_STORAGE}_${walletAddress}_${contractAddress}`;

  const getVote = () => {
    const value = localStorage.getItem(localStorageKey);
    const voteFromLocalStorage: Vote | undefined = value
      ? JSON.parse(value)
      : undefined;
    return voteFromLocalStorage;
  };

  const setVote = (vote: Vote) => {
    localStorage.setItem(localStorageKey, JSON.stringify(vote));
  };
  const deleteVote = () => {
    localStorage.removeItem(localStorageKey);
  };

  return {
    getVote,
    setVote,
    deleteVote,
  };
};

export const useAddWalletVoteManually = () => {
  const walletAddress = useWalletAddress();
  const { mutateAsync: getVotingPower } = useGetAddressVotingPower();
  const { getData, setData } = useStateData();
  const { setVote } = useLocalStorageWalletVote();

  return async (value: string) => {
    const votingPower = await getVotingPower({ address: walletAddress! });
    const name = voteOptions.find((it) => it.value === value)?.name;
    if (!name) return;
    const vote = {
      address: walletAddress!,
      vote: name,
      timestamp: 0,
      votingPower: votingPower || '',
    };

    setVote(vote);

    const data = getData();
    if (!data) return;
    const votes = unshiftWalletVote(data?.votes || [], walletAddress!, vote);

    data.votes = votes;
    setData(data);

    return vote;
  };
};


