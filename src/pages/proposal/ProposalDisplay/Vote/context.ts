import { useContext, createContext } from "react";

interface ContextValues {
  isLoading: boolean;
  vote?: string;
  lastVote?: string;
  onSubmit: () => void;
  confirmation: boolean;
  setConfirmation: (value: boolean) => void;
}

export const VoteContext = createContext({} as ContextValues);

export const useVoteContext = () => useContext(VoteContext);
