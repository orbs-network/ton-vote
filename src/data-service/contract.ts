import {
  ChromeExtensionWalletProvider,
  delay,
} from "@ton-defi.org/ton-connection";
import { TonConnect } from "@tonconnect/sdk";
import { TX_FEE } from "config";
import { useConnectionStore } from "connection";
import {
  getEndTime,
  getSnapshotTime,
  getStartTime,
} from "contracts-api/getters";
import {
  getVotingPower,
  getCurrentResults,
  getAllVotes,
  getTransactions as getTXs,
  filterTxByTimestamp,
} from "contracts-api/logic";
import * as mock from "mock";
import { isMobile } from "react-device-detect";
import { Cell, toNano, Transaction } from "ton";
import {
  ProposalInfo,
  VotingPower,
  RawVotes,
  DaoProposal,
  ProposalState,
  DaoMetadata,
  DaoRoles,
  GetDaos,
  GetDaoProposals,
} from "types";
import { Logger, parseVotes } from "utils";

const getDaos = async (): Promise<GetDaos> => {
  Logger("getDaos from contract");

  await delay(1000);
  return mock.getDaos();
};

const getDaoMetadata = async (daoAddress: string): Promise<DaoMetadata> => {
  Logger("getDAO from contract");

  return mock.createDaoMetadata(daoAddress);
};

const getDaoRoles = async (daoAddress: string): Promise<DaoRoles> => {
  Logger("getDapRoles from contract");

  return mock.getDaoRoles(daoAddress);
};

const getDaoProposals = async (
  daoAddress: string
): Promise<GetDaoProposals> => {
  Logger("getDaoProposals from contract");

  await delay(1000);
  return mock.getProposals(daoAddress);
};

const getDaoProposalInfo = async (
  contractAddress: string
): Promise<ProposalInfo> => {
  await delay(1000);
  return {
    startTime: await getStartTime(contractAddress),
    endTime: await getEndTime(contractAddress),
    snapshot: await getSnapshotTime(contractAddress),
  };
};

export const getState = async (
  proposalInfo: ProposalInfo,
  transactions: Transaction[],
  prevVotingPower: VotingPower = {}
) => {
  const votingPower = await getVotingPower(
    proposalInfo,
    transactions,
    prevVotingPower
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

const getTransactions = async (
  contractAddress: string,
  toLt?: string
): Promise<{ allTxns: Transaction[]; maxLt?: string }> => {
  return getTXs(contractAddress, toLt);
};

const getStateUntilMaxLt = async (
  contractAddress: string,
  maxLt?: string,
  proposalInfo?: ProposalInfo
): Promise<ProposalState> => {
  const _transactions = (await getTransactions(contractAddress)).allTxns;
  const _proposalInfo =
    proposalInfo || (await getDaoProposalInfo(contractAddress));
  const filteredTransactions = filterTxByTimestamp(_transactions, maxLt);

  const contractState = await contract.getState(
    _proposalInfo!,
    filteredTransactions
  );

  return contractState;
};

const createProposal = async (
  title: string,
  description: string,
  discussion: string
) => {
  console.log({ title, description, discussion });
};

export const sendTransaction = async (
  contractAddress: string,
  message: string,
  onSuccess: () => void
) => {
  const { connectorTC, connection } = useConnectionStore.getState();

  const cell = new Cell();
  // new CommentMessage(message).writeTo(cell);

  if (connectorTC.connected) {
    handleMobileLink(connectorTC);

    await connectorTC.sendTransaction({
      validUntil: Date.now() + 5 * 60 * 1000,
      messages: [
        {
          address: contractAddress,
          amount: toNano(TX_FEE).toString(),
          stateInit: undefined,
          payload: cell ? cell.toBoc().toString("base64") : undefined,
        },
      ],
    });
    onSuccess();
  } else {
    const isExtension =
      (connection as any)._provider instanceof ChromeExtensionWalletProvider;

    if (isMobile || isExtension) {
      // await connection?.requestTransaction({
      //   to: Address.parse(contractAddress),
      //   value: toNano(TX_FEE),
      //   message: cell,
      // });
      onSuccess();
    } else {
      // return connection?.requestTransaction(
      //   {
      //     to: Address.parse(contractAddress),
      //     value: toNano(TX_FEE),
      //     message: cell,
      //   },
      //   onSuccess
      // );
    }
  }
};


const getDapProposalMetadata = (daoAddress: string, proposalAddress: string) => {
    return mock.getProposalMetadata(daoAddress, proposalAddress);
}

export const contract = {
  getDaos,
  getDaoMetadata,
  getDaoProposals,
  getDaoProposalInfo,
  getState,
  getTransactions,
  getStateUntilMaxLt,
  createProposal,
  sendTransaction,
  getDaoRoles,
  getDapProposalMetadata,
};

const handleMobileLink = (connectorTC?: TonConnect) => {
  if (!isMobile) return;
  const Tonkeeper = connectorTC?.wallet?.device.appName;

  switch (Tonkeeper) {
    case "Tonkeeper":
      (window as any).location = "https://app.tonkeeper.com";
      break;

    default:
      break;
  }
};
