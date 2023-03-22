import {
  ChromeExtensionWalletProvider,
  delay,
} from "@ton-defi.org/ton-connection";
import { TonConnect } from "@tonconnect/sdk";
import { TX_FEE } from "config";
import { useConnectionStore } from "connection";
import {
  getVotingPower,
  getCurrentResults,
  getAllVotes,
  getTransactions as getTXs,
  filterTxByTimestamp,
} from "contracts-api/logic";
import * as mock from "mock";
import { isMobile } from "react-device-detect";
import { useAppPersistedStore } from "store";
import { Cell, toNano, Transaction } from "ton";
import {
  ProposalInfo,
  VotingPower,
  RawVotes,
  ProposalState,
  DaoMetadata,
  DaoRoles,
  GetDaos,
  GetDaoProposals,
  ProposalResults,
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
  return mock.getProposals();
};

const getDaoProposalInfo = async (
  contractAddress: string
): Promise<ProposalInfo> => {
  await delay(1000);
  return {} as ProposalInfo;
};

export const getState = async (
  proposalAddress: string,
  proposalInfo: ProposalInfo,
  prevState: ProposalState | null
): Promise<ProposalState | null> => {
  let _transactions = prevState?.transactions || [];
  let _maxLt = prevState?.maxLt;


  const latestMaxLtAfterTx =
    useAppPersistedStore.getState().getLatestMaxLtAfterTx(proposalAddress) ||
    "0";

  if (latestMaxLtAfterTx) {
    const { allTxns } = await getTransactions(proposalAddress);
    _transactions = filterTxByTimestamp(allTxns, latestMaxLtAfterTx);
  } else {
    const { allTxns, maxLt } = await getTransactions(
      proposalAddress,
      prevState?.maxLt
    );
    _maxLt = maxLt;
    _transactions.unshift(...allTxns);
  console.log({ _transactions });

  }

  if (_transactions.length === 0) {
    return prevState;
  }
  const votingPower = await getVotingPower(
    proposalInfo,
    _transactions,
    prevState?.votingPower
  );

  const results = getCurrentResults(_transactions, votingPower, proposalInfo);
  const rawVotes = getAllVotes(_transactions, proposalInfo) as RawVotes;
  return {
    votingPower,
    results,
    votes: parseVotes(rawVotes, votingPower),
    maxLt: _maxLt,
  };
};

const getTransactions = async (
  contractAddress: string,
  toLt?: string
): Promise<{ allTxns: Transaction[]; maxLt?: string }> => {
  return getTXs(contractAddress, toLt);
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

const getDapProposalMetadata = (proposalAddress: string) => {
  return mock.getProposalMetadata(proposalAddress);
};

export const contract = {
  getDaos,
  getDaoMetadata,
  getDaoProposals,
  getDaoProposalInfo,
  getState,
  getTransactions,
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
