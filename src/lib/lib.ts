import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "config";
import _ from "lodash";
import { useProposalPersistedStore } from "pages/proposal/store";
import { useEnpointsStore } from "store";
import { Address } from "ton-core";
import * as TonVoteSDK from "ton-vote-sdk";
import { getClientV2, getClientV4, getProposalInfo } from "ton-vote-sdk";
import { Dao, ProposalState } from "types";
import { Logger, parseVotes } from "utils";
import { api } from "./api";

export const getContractState = async (
  proposalAddress: string,
  state?: ProposalState,
  latestMaxLtAfterTx?: string
): Promise<ProposalState | null> => {
  const { clientV2Endpoint, clientV4Endpoint, apiKey } =
    useEnpointsStore.getState();
  const clientV2 = await getClientV2(clientV2Endpoint, apiKey);
  const clientV4 = await getClientV4(clientV4Endpoint);

  const proposalMetadata =
    state?.proposalMetadata ||
    (await getProposalInfo(clientV2, clientV4, proposalAddress));

  let _transactions = state?.transactions || [];
  let _maxLt = state?.maxLt;

  if (latestMaxLtAfterTx) {
    // filter transaction until specific maxLt
    const { allTxns } = await TonVoteSDK.getTransactions(
      clientV2,
      Address.parse(proposalAddress)
    );
    _transactions = TonVoteSDK.filterTxByTimestamp(allTxns, latestMaxLtAfterTx);
    _maxLt = latestMaxLtAfterTx;
  } else {
    const { allTxns: newTransactions, maxLt } =
      await TonVoteSDK.getTransactions(
        clientV2,
        Address.parse(proposalAddress),
        state?.maxLt
      );

    // if no more new transactions, return the current state
    if (_.size(newTransactions) === 0 && state) {
      return {
        ...state,
        maxLt,
      };
    }

    _maxLt = maxLt;
    _transactions.unshift(...newTransactions);
  }

  const votingPower = await TonVoteSDK.getVotingPower(
    clientV4,
    proposalMetadata,
    _transactions,
    state?.votingPower
  );

  const results = TonVoteSDK.getCurrentResults(
    _transactions,
    votingPower,
    proposalMetadata
  );
  const votes = TonVoteSDK.getAllVotes(_transactions, proposalMetadata);

  return {
    votingPower,
    results,
    votes: parseVotes(votes, votingPower),
    maxLt: _maxLt,
    proposalMetadata,
  };
};

export const getProposalState = async (
  proposalAddress: string,
  isCustomEndpoint: boolean,
  state?: ProposalState,
  signal?: AbortSignal
): Promise<ProposalState | null> => {
  const proposalPersistStore = useProposalPersistedStore.getState();
  const latestMaxLtAfterTx =
    proposalPersistStore.getLatestMaxLtAfterTx(proposalAddress);

  const contractState = () =>
    getContractState(proposalAddress, state, latestMaxLtAfterTx);
  const serverState = () => {
    try {
      return api.getState(proposalAddress, signal);
    } catch (error) {
      return contractState();
    }
  };

  if (isCustomEndpoint) {
    return contractState();
  }

  if (!(await api.validateServerLastUpdate())) {
    Logger(`server is outdated, fetching from contract`);
    return contractState();
  }

  if (!latestMaxLtAfterTx) {
    return serverState();
  }

  const serverMaxLt = await api.getMaxLt(signal);

  if (Number(serverMaxLt) < Number(latestMaxLtAfterTx)) {
    Logger(`server latestMaxLtAfterTx is outdated, fetching from contract`);
    return contractState();
  }
  proposalPersistStore.setLatestMaxLtAfterTx(proposalAddress, undefined);
  return serverState();
};

export const getDaos = async (nextPage?: number, signal?: AbortSignal) => {
  try {
    Logger("getting daos from api");
    return api.getDaos(nextPage, signal);
  } catch (error) {
    // get daos from contract
    Logger("server error, getting daos from contract");
    const client = await getClientV2();
    const { daoAddresses, endDaoId } = await TonVoteSDK.getDaos(
      client,
      nextPage,
      10
    );
    const daos: Dao[] = await Promise.all(
      daoAddresses.map(async (address) => {
        return {
          address,
          daoMetadata: await TonVoteSDK.getDaoMetadata(client, address),
          roles: await TonVoteSDK.getDaoRoles(client, address),
        };
      })
    );

    return {
      daos,
      nextId: endDaoId,
    };
  }
};

export const getDao = async (
  queryClient: QueryClient,
  daoAddress: string,
  signal?: AbortSignal
) => {
  type DaosQueryType = {
    pageParams: Array<number | undefined>;
    pages: Array<{ daos: Dao[]; nextId: number }>;
  };

  console.log(daoAddress);

  // return Dao from cache if exist
  const daosQuery = queryClient.getQueryData([QueryKeys.DAOS]) as DaosQueryType;

  const daos = _.flatten(daosQuery?.pages.map((it) => it.daos));
  const cachedDao = _.find(daos, (it) => it.address === daoAddress);
  if (cachedDao) {
    Logger("getting dao from cache");
    return cachedDao;
  }

  // return Dao from api if exist
  try {
    Logger("getting dao from api");
    const daoFromApi = await api.getDao(daoAddress, signal);
    if (daoFromApi) return daoFromApi;

    throw new Error("dao not found");
  } catch (error) {
    // return Dao from contract
    Logger(
      `Dao not found in server \n getting dao from contract \n address: ${daoAddress}`
    );

    const client = await getClientV2();
    const daoFromContract = {
      address: daoAddress,
      roles: await TonVoteSDK.getDaoRoles(client, daoAddress),
      daoMetadata: await TonVoteSDK.getDaoMetadata(client, daoAddress),
    };
    return daoFromContract;
  }
};
