import _ from "lodash";
import { useAirdropStore } from "pages/airdrop/store";
import { ReactNode, useContext, useState } from "react";
import { createContext } from "react";
import { VotersSelectState } from "./form";

interface ContextProps extends VotersSelectState {
  setDao: (dao: string) => void;
  selectProposal: (proposal: string) => void;
  selectAllProposals: (proposals: string[]) => void;
  selectVoterManually: (voter: string) => void;
  reset: () => void;
}

const Context = createContext({} as ContextProps);

export const VotersSelectContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const store = useAirdropStore();
  const [state, setState] = useState<VotersSelectState>({
    daos: store.daos || [],
    proposals: store.proposals || [],
    selectionMethod: store.selectionMethod,
    votersAmount: store.votersAmount,
    manuallySelectedVoters: store.manuallySelectedVoters || [],
  });

  const reset = () => {
    setState({
      daos: store.daos || [],
      proposals: store.proposals || [],
      selectionMethod: store.selectionMethod,
      votersAmount: store.votersAmount,
      manuallySelectedVoters: store.manuallySelectedVoters || [],
    });
  };

  const setDao = (dao: string) => {
    setState((state) => ({
      ...state,
      daos: state.daos?.includes(dao) ? _.without(state.daos, dao) : [dao],
      proposals: [],
      manuallySelectedVoters: [],
      votersAmount: 0,
    }));
  };

  const selectVoterManually = (voter: string) => {
    setState((state) => ({
      ...state,
      manuallySelectedVoters: state.manuallySelectedVoters?.includes(voter)
        ? _.without(state.manuallySelectedVoters, voter)
        : [...state.manuallySelectedVoters!, voter],
    }));
  };

  const selectProposal = (proposal: string) => {
    setState((state) => ({
      ...state,
      manuallySelectedVoters: [],
      votersAmount: undefined,
      proposals: state.proposals?.includes(proposal)
        ? _.without(state.proposals, proposal)
        : [...state.proposals!, proposal],
    }));
  };

  const selectAllProposals = (proposals: string[]) => {
    setState((state) => ({
      ...state,
      proposals: proposals,
    }));
  };

  return (
    <Context.Provider
      value={{
        daos: state.daos || [],
        proposals: state.proposals || [],
        selectionMethod: state.selectionMethod,
        votersAmount: state.votersAmount,
        manuallySelectedVoters: state.manuallySelectedVoters || [],
        setDao,
        selectProposal,
        selectAllProposals,
        selectVoterManually,
        reset,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useVotersSelectContext = () => {
  return useContext(Context);
};
