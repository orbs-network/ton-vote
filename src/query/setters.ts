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
  getClientV2,
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
} from "store";
import { delay, getTxFee, Logger, validateAddress } from "utils";
import { CreateDaoArgs, CreateMetadataArgs, UpdateMetadataArgs } from "./types";
import { useTonAddress } from "@tonconnect/ui-react";
import { analytics } from "analytics";
import { Proposal, ProposalStatus } from "types";
import { useAppNavigation } from "router/navigation";
import { contract } from "contract";
import retry from "async-retry";
import { Webapp } from "WebApp";

export const useCreateDaoQuery = () => {
  const getSender = useGetSender();
  const registryState = useRegistryStateQuery().data;
  const showErrorToast = useErrorToast();
  const appNavigation = useAppNavigation();
  const { addDao } = useNewDataStore();

  return useMutation(
    async (args: CreateDaoArgs) => {
      const sender = getSender();
      const clientV2 = await getClientV2();

      let getPromise = () => {
        if (args.dev && !IS_DEV) {
          const txFee = createDaoProdFee + createDaoDevFee;
          analytics.createSpaceRequest(args.ownerAddress, args.proposalOwner);
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
        analytics.createSpaceFailed(error.message);
      },
      onSuccess: (address, args) => {
        appNavigation.daoPage.root(address);
        addDao(address);
        analytics.createSpaceSuccess();
        showSuccessToast(`Space created successfully`);
        args.onSuccess();
      },
    }
  );
};

export const useCreateMetadataQuery = () => {
  const getSender = useGetSender();
  const errorToast = useErrorToast();

  return useMutation(
    async (args: CreateMetadataArgs) => {
      const { metadata } = args;
      const sender = getSender();
      const clientV2 = await getClientV2();
      analytics.createSpaceMetadataRequest(metadata);
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
        analytics.createSpaceMetadataFailed(error.message);
      },
      onSuccess: (address, args) => {
        analytics.createSpaceMetadataSuccess(address);
        args.onSuccess?.(address);
        showSuccessToast(`Space metadata created successfully`);
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

  return useMutation(
    async (args: CreateProposalArgs) => {
      const allowed = isOwner || isProposalPublisher;

      const { metadata } = args;
      const sender = getSender();
      if (!allowed) {
        throw new Error("You are not allowed to create a proposal");
      }
      analytics.createProposalRequest(metadata as ProposalMetadata);
      const address = await newProposal(
        sender,
        await getClientV2(),
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
        analytics.createProposalFailed(error.message);
      },
      onSuccess: (address, args) => {
        analytics.createProposalSuccess(address);
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
      const clientV2 = await getClientV2();
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

      const clientV2 = await getClientV2();
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

export const useSetDaoMetadataQuery = () => {
  const getSender = useGetSender();
  const { setDaoUpdateMillis } = useSyncStore();
  const refetchDaos = useDaosQuery().refetch;
  const { daoAddress } = useAppParams();

  const refetchUpdatedDao = useDaoQuery(daoAddress).refetch;

  const errorToast = useErrorToast();

  return useMutation(
    async (args: UpdateMetadataArgs) => {
      const { daoAddress, metadataAddress } = args;

      const sender = getSender();
      const clientV2 = await getClientV2();
      analytics.updateSpaceRequest(daoAddress);

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
      setDaoUpdateMillis(args.daoAddress);
      await refetchUpdatedDao();
      return address;
    },
    {
      onError: (error: Error, args) => {
        errorToast(error);
        analytics.updateProposalFailed(error.message);
      },
      onSuccess: (value, args) => {
        showSuccessToast("Space Metadata updated");
        refetchDaos();
        analytics.updateSpaceSuccess(args.daoAddress);
        args.onSuccess?.(value);
      },
    }
  );
};

export const useVote = () => {
  const getSender = useGetSender();
  const { proposalAddress } = useAppParams();
  const store = useVotePersistedStore();
  const { data: proposal } = useProposalQuery(proposalAddress);
  const queryClient = useQueryClient();
  const successCallback = useVoteSuccessCallback(proposalAddress);

  const errorToast = useErrorToast();
  const { setIsVoting } = useVoteStore();

  return useMutation(
    async (_vote: string) => {
      if (!proposal) {
        throw new Error("Proposal not found");
      }
      setIsVoting(true);
      const sender = getSender();
      const client = await getClientV2();
      analytics.voteRequest(proposalAddress, _vote);
      await proposalSendMessage(
        sender,
        client,
        TX_FEES.VOTE_FEE.toString(),
        proposalAddress,
        _vote
      );

      await delay(2000);
      return successCallback(proposal);
    },
    {
      onSuccess: (values, _vote) => {
        analytics.voteSuccess();
        showSuccessToast(`Voted ${_vote} successfully`);
        Webapp.hapticFeedback()
        if (!values) {
          throw new Error(
            `You voted ${_vote} successfully, but we failed to update results, [support](${TELEGRAM_SUPPORT_GROUP})`
          );
        }

        const { proposalResults, vote, maxLt } = values;

        queryClient.setQueryData(
          [QueryKeys.PROPOSAL, proposalAddress],
          (prev?: any) => {
            const votes = _.filter(
              prev?.votes,
              (v) => v.address !== vote.address
            );
            return {
              ...prev,
              proposalResult: proposalResults,
              votes: [vote, ...votes],
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
      onError: (error: Error) => {
        errorToast(error, 8_000);
        analytics.voteError(error.message);
      },
    }
  );
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
      const client = await getClientV2();

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

export const useVoteSuccessCallback = (proposalAddress: string) => {
  const walletAddress = useTonAddress();

  return async (proposal: Proposal) => {
    const promise = async (bail: any, attempt: number) => {
      Logger(`getting proposal results after vote, attempt ${attempt} `);
      if (!proposal.metadata || !walletAddress) return;

      try {
        const result = await contract.getProposalResultsAfterVote({
          proposalAddress,
          walletAddress,
          proposal,
        });

        if (!result || _.isEmpty(result)) {
          throw new Error("Empty results");
        }

        return result;
      } catch (error) {
        Logger(error);
        throw new Error("Failed to get results");
      }
    };

    return retry(promise, { retries: 5, minTimeout: 2000 });
  };
};
