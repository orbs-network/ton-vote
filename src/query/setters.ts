import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDaoDevFee,
  createDaoProdFee,
  IS_DEV,
  QueryKeys,
  releaseMode,
  TELEGRAM_SUPPORT_GROUP,
  TX_FEES,
} from "config";
import _ from "lodash";
import {
  calcProposalResult,
  createNewDaoOnProdAndDev,
  daoSetOwner,
  daoSetProposalOwner,
  metdataExists,
  newDao,
  newMetdata,
  newProposal,
  ProposalMetadata,
  proposalSendMessage,
  ReleaseMode,
  setMetadata,
  updateProposal,
} from "ton-vote-contracts-sdk";
import {
  useAppParams,
  useGetProposalStatusCallback,
  useGetSender,
  useRole,
} from "hooks/hooks";
import { showSuccessToast, useErrorToast } from "toasts";
import {
  useDaoQuery,
  useDaosQuery,
  useDaoStateQuery,
  useProposalQuery,
  useRegistryStateQuery,
} from "./getters";
import {
  useNewDataStore,
  useSyncStore,
  useVotePersistedStore,
  useVoteStore,
  useVotingPowerPersistedStore,
} from "store";
import {
  getTxFee,
  isSameAddress,
  isSameVoteChoice,
  Logger,
  normalizeTonAddress,
  parseVotes,
  validateAddress,
} from "utils";
import { CreateDaoArgs, CreateMetadataArgs, UpdateMetadataArgs } from "./types";
import { useTonAddress } from "@tonconnect/ui-react";
import { useAnalytics } from "analytics";
import { Proposal, ProposalStatus, RawVotes, VotingPower } from "types";
import { useAppNavigation } from "router/navigation";
import { getConfiguredClientV2 } from "rpc";

export const useCreateDaoQuery = () => {
  const getSender = useGetSender();
  const registryState = useRegistryStateQuery().data;
  const showErrorToast = useErrorToast();
  const appNavigation = useAppNavigation();
  const { addDao } = useNewDataStore();

  const analytics = useAnalytics();

  return useMutation(
    async (args: CreateDaoArgs) => {
      const sender = getSender();
      const clientV2 = await getConfiguredClientV2();

      let getPromise = () => {
        
        if (args.dev && !IS_DEV) {
          const txFee = createDaoProdFee + createDaoDevFee;

          return createNewDaoOnProdAndDev(
            sender,
            clientV2,
            txFee.toString(),
            args.metadataAddress,
            args.ownerAddress,
            args.proposalOwner,
            createDaoProdFee.toString(),
            createDaoDevFee.toString(),
            ReleaseMode.PRODUCTION,
            ReleaseMode.DEVELOPMENT
          );
        }
        return newDao(
          sender,
          clientV2,
          releaseMode,
          getTxFee(
            Number(registryState?.deployAndInitDaoFee),
            TX_FEES.CREATE_DAO
          ),
          args.metadataAddress,
          args.ownerAddress,
          args.proposalOwner
        );
      };

      const address = await getPromise();

      if (typeof address !== "string") {
        throw new Error(
          `Failed to create dao, contact [support](${TELEGRAM_SUPPORT_GROUP})`
        );
      }

      return address;
    },
    {
      onError: (error: Error, args) => {
        showErrorToast(error);
        analytics.createSpaceFailed(args.metadataAddress, error.message);
      },
      onSuccess: (address, args) => {
        appNavigation.daoPage.root(address);
        addDao(address);
        analytics.createSpaceSuccess(args.metadataAddress, address);
        showSuccessToast(`Space created successfully`);
        args.onSuccess();
      },
    }
  );
};

export const useCreateMetadataQuery = () => {
  const getSender = useGetSender();
  const errorToast = useErrorToast();
  const analytics = useAnalytics();

  return useMutation(
    async (args: CreateMetadataArgs) => {
      const { metadata } = args;
      const sender = getSender();
      const clientV2 = await getConfiguredClientV2();

      const address = await newMetdata(
        sender,
        clientV2,
        TX_FEES.CREATE_METADATA.toString(),
        metadata
      );

      if (typeof address !== "string") {
        throw new Error(
          `Failed to create space metadata. \n contact [support](${TELEGRAM_SUPPORT_GROUP})`
        );
      }

      return address;
    },
    {
      onError: (error: Error, args) => {
        errorToast(error);
        analytics.createSpaceMetadataFailed(error.message, args.metadata);
      },
      onSuccess: (address, args) => {
        analytics.createSpaceMetadataSucess(address, args.metadata);
        args.onSuccess(address);
      },
    }
  );
};

interface CreateProposalArgs {
  metadata: Partial<ProposalMetadata>;
  onSuccess: (value: string) => void;
}

export const useCreateProposalQuery = () => {
  const { daoAddress } = useAppParams();

  const dao = useDaoQuery(daoAddress).data;
  const getSender = useGetSender();
  const daoState = useDaoStateQuery(dao?.daoAddress).data;
  const { isOwner, isProposalPublisher } = useRole(dao?.daoRoles);
  const showErrorToast = useErrorToast();
  const analytics = useAnalytics();

  return useMutation(
    async (args: CreateProposalArgs) => {
      const allowed = isOwner || isProposalPublisher;

      const { metadata } = args;
      const sender = getSender();
      if (!allowed) {
        throw new Error("You are not allowed to create a proposal");
      }
      const address = await newProposal(
        sender,
        await getConfiguredClientV2(),
        getTxFee(Number(daoState?.fwdMsgFee), TX_FEES.FORWARD_MSG),
        dao?.daoAddress!,
        metadata as ProposalMetadata
      );

      if (typeof address !== "string") {
        throw new Error(
          `Failed to create proposal. \n contact [support](${TELEGRAM_SUPPORT_GROUP})`
        );
      }

      return address;
    },
    {
      onError: (error: Error, args) => {
        showErrorToast(error);
        analytics.createProposalFailed(
          args.metadata as ProposalMetadata,
          error.message
        );
      },
      onSuccess: (address, args) => {
        analytics.createProposalSuccess(
          args.metadata as ProposalMetadata,
          address
        );
        showSuccessToast("Proposal created successfully");
        args.onSuccess(address);
      },
    }
  );
};

export const useSetDaoOwnerQuery = () => {
  const getSender = useGetSender();
  const errorToast = useErrorToast();
  const { setDaoUpdateMillis } = useSyncStore();
  const { daoAddress } = useAppParams();

  const refetch = useDaoQuery(daoAddress).refetch;

  return useMutation(
    async ({
      newOwner,
    }: {
      newOwner?: string;
      onError: (value: string) => void;
    }) => {
      if (!newOwner) {
        throw new Error("Owner address is required");
      }
      if (!validateAddress(newOwner)) {
        throw new Error("Invalid owner address");
      }
      const clientV2 = await getConfiguredClientV2();
      await daoSetOwner(
        getSender(),
        clientV2,
        daoAddress,
        TX_FEES.BASE.toString(),
        newOwner
      );
      setDaoUpdateMillis(daoAddress);
      return refetch();
    },
    {
      onError: (error, args) => {
        errorToast(error);
        args.onError("Failed to set new owner");
      },
    }
  );
};

export const useSetDaoPublisherQuery = () => {
  const getSender = useGetSender();
  const { setDaoUpdateMillis } = useSyncStore();
  const { daoAddress } = useAppParams();
  const { refetch: refetchDao } = useDaoQuery(daoAddress);

  const errorToast = useErrorToast();

  return useMutation(
    async ({
      newOwner,
    }: {
      newOwner?: string;
      onError: (value: string) => void;
    }) => {
      if (!newOwner) {
        throw new Error("Proposal owner address is required");
      }
      if (!validateAddress(newOwner)) {
        throw new Error("Invalid proposal owner address");
      }

      const clientV2 = await getConfiguredClientV2();
      await daoSetProposalOwner(
        getSender(),
        clientV2,
        TX_FEES.BASE.toString(),
        daoAddress,
        newOwner
      );
      setDaoUpdateMillis(daoAddress);
      return refetchDao();
    },
    {
      onError: (error: Error, args) => {
        args.onError(error.message);
        errorToast(error);
      },
    }
  );
};

export const useUpdateDaoMetadataQuery = () => {
  const getSender = useGetSender();
  const { setDaoUpdateMillis } = useSyncStore();
  const refetchDaos = useDaosQuery().refetch;
  const { daoAddress } = useAppParams();

  const refetchUpdatedDao = useDaoQuery(daoAddress).refetch;

  const errorToast = useErrorToast();
  const analytics = useAnalytics();

  return useMutation(
    async (args: UpdateMetadataArgs) => {
      const { metadata, daoAddress } = args;

      const sender = getSender();
      const clientV2 = await getConfiguredClientV2();

      const metadataAddress = await newMetdata(
        sender,
        clientV2,
        TX_FEES.CREATE_METADATA.toString(),
        metadata
      );

      if (typeof metadataAddress !== "string") {
        throw new Error("Failed to update metadata");
      }

      const address = await setMetadata(
        sender,
        clientV2,
        TX_FEES.SET_METADATA.toString(),
        daoAddress,
        metadataAddress
      );

      if (typeof address !== "string") {
        throw new Error("Failed to update metadata");
      }
      return address;
    },
    {
      onError: (error: Error, args) => {
        errorToast(error);
        analytics.updateDaoMetatdaFailed(
          args.metadata,
          args.daoAddress,
          error.message
        );
      },
      onSuccess: (_, args) => {
        showSuccessToast("Metadata updated");
        setDaoUpdateMillis(args.daoAddress);
        refetchDaos();
        refetchUpdatedDao();
        analytics.updateDaoMetadataSuccess(args.metadata, args.daoAddress);
      },
    }
  );
};

export const useVote = () => {
  const getSender = useGetSender();
  const { proposalAddress } = useAppParams();
  const store = useVotePersistedStore();
  const votingPowerStore = useVotingPowerPersistedStore();
  const { data: proposal } = useProposalQuery(proposalAddress);
  const queryClient = useQueryClient();
  const walletAddress = useTonAddress();

  const errorToast = useErrorToast();
  const { setIsVoting } = useVoteStore();
  const analytics = useAnalytics();

  return useMutation(
    async (_vote: string) => {
      if (!proposal) {
        throw new Error("Proposal not found");
      }
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      const currentWalletVote = _.find(proposal.votes, (vote) =>
        isSameAddress(vote.address, walletAddress)
      );
      if (isSameVoteChoice(currentWalletVote?.vote, _vote)) {
        throw new Error(`You already voted ${_vote}`);
      }
      setIsVoting(true);
      const sender = getSender();
      const client = await getConfiguredClientV2();

      await proposalSendMessage(
        sender,
        client,
        TX_FEES.VOTE_FEE.toString(),
        proposalAddress,
        _vote
      );

      return getManualVoteSuccessValues({
        proposal,
        proposalAddress,
        walletAddress,
        vote: _vote,
        cachedVotingPower: votingPowerStore.getVotingPower(
          proposalAddress,
          normalizeTonAddress(walletAddress)
        ),
      });
    },
    {
      onSuccess: (values, _vote) => {
        analytics.voteSuccess(proposalAddress, _vote);
        showSuccessToast(`Voted ${_vote} successfully`);
        if (!values) {
          throw new Error(
            `You voted ${_vote} successfully, but we failed to update results, [support](${TELEGRAM_SUPPORT_GROUP})`
          );
        }

        const { proposalResults, vote, maxLt, rawVotes, votingPower } = values;

        queryClient.setQueryData(
          [QueryKeys.PROPOSAL, proposalAddress],
          (prev?: any) => {
            const votes = _.filter(
              prev?.votes,
              (v) => !isSameAddress(v.address, vote.address)
            );
            return {
              ...prev,
              proposalResult: proposalResults,
              votes: [vote, ...votes],
              rawVotes,
              votingPower,
            };
          }
        );

        Logger(
          `vote success manually updating proposal query, and setting local storage`
        );
        Logger(maxLt, "maxLt");
        Logger(vote, "walletVote");
        Logger(proposalResults, "results");
        // we save this data in local storage, and display it untill the server is up to date
        return store.setValues(proposalAddress, maxLt, vote, proposalResults);
      },
      onSettled: () => {
        setIsVoting(false);
      },
      onError: (error: Error, vote) => {
        errorToast(error, 8_000);
        analytics.voteError(proposalAddress, vote, error.message);
      },
    }
  );
};

const getNextMaxLt = (maxLt?: string) => {
  try {
    return (BigInt(maxLt || "0") + 1n).toString();
  } catch (error) {
    return maxLt || "1";
  }
};

const omitAddress = <T,>(values: { [key: string]: T } = {}, address: string) =>
  _.omitBy(values, (_value, key) => isSameAddress(key, address));

const getVotingPowerForWallet = (
  proposal: Proposal,
  walletAddress: string,
  cachedVotingPower?: string
) => {
  if (cachedVotingPower) return cachedVotingPower;

  return _.find(
    proposal.votingPower,
    (_votingPower, address) => isSameAddress(address, walletAddress)
  );
};

const getManualVoteSuccessValues = ({
  proposal,
  proposalAddress,
  walletAddress,
  vote,
  cachedVotingPower,
}: {
  proposal: Proposal;
  proposalAddress: string;
  walletAddress: string;
  vote: string;
  cachedVotingPower?: string;
}) => {
  if (!proposal.metadata || !walletAddress) {
    throw new Error("Failed to update vote locally");
  }

  const votingPower = getVotingPowerForWallet(
    proposal,
    walletAddress,
    cachedVotingPower
  );

  if (!votingPower) {
    throw new Error("Voting power not found");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const rawVote = {
    vote: vote.toLowerCase(),
    timestamp,
    hash: "",
  };
  const rawVotes: RawVotes = {
    ...omitAddress(proposal.rawVotes || {}, walletAddress),
    [walletAddress]: rawVote,
  };
  const votingPowerMap: VotingPower = {
    ...omitAddress(proposal.votingPower || {}, walletAddress),
    [walletAddress]: votingPower,
  };
  const proposalResults = calcProposalResult(
    rawVotes,
    votingPowerMap,
    proposal.metadata.votingSystem
  );
  const parsedVote = parseVotes({ [walletAddress]: rawVote }, votingPowerMap);

  Logger(`vote success locally updated proposal ${proposalAddress}`);

  return {
    proposalResults,
    maxLt: getNextMaxLt(proposal.maxLt),
    rawVotes,
    votingPower: votingPowerMap,
    vote: parsedVote[0],
  };
};

export const useUpdateProposalMutation = () => {
  const getSender = useGetSender();
  const errorToast = useErrorToast();
  const { setProposalUpdateMillis } = useSyncStore();
  const { proposalAddress, daoAddress } = useAppParams();

  const getProposalStatus = useGetProposalStatusCallback();

  const { refetch } = useProposalQuery(proposalAddress);
  const { proposalPage } = useAppNavigation();

  return useMutation(
    async (metadata: ProposalMetadata) => {
      const proposalQuery = await refetch();
      const { proposalStatus } = getProposalStatus(
        proposalQuery.data?.metadata!
      );

      if (proposalStatus !== ProposalStatus.NOT_STARTED) {
        throw new Error(
          "Proposal is already started, you cant edit it anymore"
        );
      }

      const sender = getSender();
      const client = await getConfiguredClientV2();

      await updateProposal(
        sender,
        client,
        TX_FEES.FORWARD_MSG.toString(),
        daoAddress,
        proposalAddress,
        metadata
      );
    },
    {
      onSuccess: () => {
        showSuccessToast("Proposal updated");
        setProposalUpdateMillis(proposalAddress);
        proposalPage.root(daoAddress, proposalAddress);
      },
      onError: (error: Error) => {
        errorToast(error);
      },
    }
  );
};
