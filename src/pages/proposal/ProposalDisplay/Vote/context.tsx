import { useAppParams, useWalletVote } from "hooks/hooks";
import { mock } from "mock/mock";
import { useVote } from "query/setters";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { errorToast } from "toasts";
import { Webapp } from "WebApp";

interface VoteContextType {
  vote: string;
  setVote: (vote: string) => void;
  showConfirmation: boolean;
  setShowConfirmation: (showConfirmation: boolean) => void;
  submitVote: () => void;
  submitVoteLoading: boolean;
  onSelectVote: (vote: string) => void;
  lastVote?: string;
  lastVoteEqualsToCurrentVote: boolean;
  onShowConfirmation: () => void;
}

export const VoteContext = createContext<VoteContextType>(
  {} as VoteContextType
);
export const useVoteContext = () => useContext(VoteContext);


export const VoteContextProvider = ({ children }: { children: ReactNode }) => {
  const { proposalAddress } = useAppParams();
  const [vote, setVote] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { mutate, isLoading: submitVoteLoading } = useVote();
  const walletVote = useWalletVote(proposalAddress);
  const lastVote = walletVote?.vote as string;


  useEffect(() => {
    if (!vote) {
      setVote(walletVote?.vote as string);
    }
  }, [walletVote?.vote]);


  const submitVote = () => mutate(vote);

  const onSelectVote = useCallback(
    (_vote: string) => {
      setVote(_vote);
     Webapp.hapticFeedback();
    },
    [proposalAddress, lastVote]
  );

  const onShowConfirmation = () => {
    if (mock.isMockProposal(proposalAddress)) {
      errorToast("You can't vote on mock proposals");
      return false;
    }

    if (lastVote?.toLowerCase() === vote?.toLowerCase()) {
      errorToast(`You already voted ${vote}`);
      return false;
    }

    setShowConfirmation(true);
  };

  return (
    <VoteContext.Provider
      value={{
        onShowConfirmation,
        vote,
        setVote,
        setShowConfirmation,
        showConfirmation,
        submitVote,
        submitVoteLoading,
        onSelectVote,
        lastVote,
        lastVoteEqualsToCurrentVote: lastVote?.toLowerCase() === vote?.toLowerCase(),
      }}
    >
      {children}
    </VoteContext.Provider>
  );
};
