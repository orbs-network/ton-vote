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
  useDaoRolesDisplayPersistedStore,
} from "store";
import {
  getTxFee,
  isSameAddress,
  isSameVoteChoice,
  Logger,
  normalizeTonAddress,
  validateAddress,
} from "utils";
import { CreateDaoArgs, CreateMetadataArgs, UpdateMetadataArgs } from "./types";
import { useTonAddress } from "@tonconnect/ui-react";
import { useAnalytics } from "analytics";
import { ProposalStatus } from "types";
import { useAppNavigation } from "router/navigation";
import { getActionResultWithClientV2Fallback } from "rpc";
import { getManualVoteSuccessValues } from "./manualVoteSuccessValues";

export const useCreateDaoQuery = () => {
  const getSender = useGetSender();
  const registryState = useRegistryStateQuery().data;
  const showErrorToast = useErrorToast();
  const appNavigation = useAppNavigation();
  const { addDao } = useNewDataStore();
  const setDisplayRoles = useDaoRolesDisplayPersistedStore(
    (state) => state.setRoles
  );

  const analytics = useAnalytics();

  return useMutation(
    async (args: CreateDaoArgs) => {
      const sender = getSender();

      const address = await getActionResultWithClientV2Fallback({
        request: (clientV2) => {
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
        },
        logPrefix: "Creating DAO",
        errorMessage: "Failed to create dao",
      });

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
        setDisplayRoles(address, {
          owner: args.ownerAddress,
          proposalOwner: args.proposalOwner,
        });
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

      const address = await getActionResultWithClientV2Fallback({
        request: (clientV2) =>
          newMetdata(
            sender,
            clientV2,
            TX_FEES.CREATE_METADATA.toString(),
            metadata
          ),
        logPrefix: "Creating metadata",
        errorMessage: "Failed to create space metadata",
      });

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
      const address = await getActionResultWithClientV2Fallback({
        request: (clientV2) =>
          newProposal(
            sender,
            clientV2,
            getTxFee(Number(daoState?.fwdMsgFee), TX_FEES.FORWARD_MSG),
            dao?.daoAddress!,
            metadata as ProposalMetadata
          ),
        logPrefix: "Creating proposal",
        errorMessage: "Failed to create proposal",
      });

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
  const setDisplayOwner = useDaoRolesDisplayPersistedStore(
    (state) => state.setOwner
  );
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
      await getActionResultWithClientV2Fallback({
        request: (clientV2) =>
          daoSetOwner(
            getSender(),
            clientV2,
            daoAddress,
            TX_FEES.BASE.toString(),
            newOwner
          ),
        logPrefix: "Setting DAO owner",
        errorMessage: "Failed to set new owner",
      });
      setDisplayOwner(daoAddress, newOwner);
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
  const setDisplayProposalOwner = useDaoRolesDisplayPersistedStore(
    (state) => state.setProposalOwner
  );
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

      await getActionResultWithClientV2Fallback({
        request: (clientV2) =>
          daoSetProposalOwner(
            getSender(),
            clientV2,
            TX_FEES.BASE.toString(),
            daoAddress,
            newOwner
          ),
        logPrefix: "Setting DAO proposal owner",
        errorMessage: "Failed to set proposal owner",
      });
      setDisplayProposalOwner(daoAddress, newOwner);
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

      const metadataAddress = await getActionResultWithClientV2Fallback({
        request: (clientV2) =>
          newMetdata(
            sender,
            clientV2,
            TX_FEES.CREATE_METADATA.toString(),
            metadata
          ),
        logPrefix: "Creating updated DAO metadata",
        errorMessage: "Failed to create updated metadata",
      });

      if (typeof metadataAddress !== "string") {
        throw new Error("Failed to update metadata");
      }

      const address = await getActionResultWithClientV2Fallback({
        request: (clientV2) =>
          setMetadata(
            sender,
            clientV2,
            TX_FEES.SET_METADATA.toString(),
            daoAddress,
            metadataAddress
          ),
        logPrefix: "Setting DAO metadata",
        errorMessage: "Failed to update metadata",
      });

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

      await getActionResultWithClientV2Fallback({
        request: (clientV2) =>
          proposalSendMessage(
            sender,
            clientV2,
            TX_FEES.VOTE_FEE.toString(),
            proposalAddress,
            _vote
          ),
        logPrefix: `Voting on proposal ${proposalAddress}`,
        errorMessage: "Failed to vote",
      });

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

export const useUpdateProposalMutation = (args?: { onSuccess?: () => void }) => {
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

      await getActionResultWithClientV2Fallback({
        request: (clientV2) =>
          updateProposal(
            sender,
            clientV2,
            TX_FEES.FORWARD_MSG.toString(),
            daoAddress,
            proposalAddress,
            metadata
          ),
        logPrefix: `Updating proposal ${proposalAddress}`,
        errorMessage: "Failed to update proposal",
      });
    },
    {
      onSuccess: () => {
        showSuccessToast("Proposal updated");
        setProposalUpdateMillis(proposalAddress);
        args?.onSuccess?.();
        proposalPage.root(daoAddress, proposalAddress);
      },
      onError: (error: Error) => {
        errorToast(error);
      },
    }
  );
};
