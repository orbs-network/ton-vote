import {
  getAllVotes,
  getCurrentResults,
  getVotingPower,
} from "contracts-api/logic";
import { ProposalInfo, RawVotes, Transaction, Vote, VotingPower } from "types";
import { parseVotes } from "utils";

export const useSpaceId = () => {
  return useParams().spaceId as string;
};

export const useProposalId = () => {
  return useParams().proposalId;
};

export const useCurrentRoute = () => {
  const location = useLocation();
  const route = matchRoutes(flatRoutes, location);

  return route ? route[0].route.path : undefined;
};

export const useGetContractState = () => {
  const { clientV4 } = useConnectionStore();
  return async (
    proposalInfo: ProposalInfo,
    transactions: Transaction[],
    prevVotingPower?: VotingPower
  ) => {
    const votingPower = await getVotingPower(
      clientV4,
      proposalInfo,
      transactions,
      prevVotingPower || {}
    );

    const proposalResults = getCurrentResults(
      transactions,
      votingPower,
      proposalInfo
    );
    const rawVotes = getAllVotes(transactions, proposalInfo) as RawVotes;
    return {
      votingPower,
      proposalResults,
      votes: parseVotes(rawVotes, votingPower),
    };
  };
};

import { useState, useLayoutEffect } from "react";
import { matchRoutes, useLocation, useParams } from "react-router-dom";
import { flatRoutes } from "consts";
import { useConnectionStore } from "connection";

export const useWindowResize = () => {
  const [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
};
