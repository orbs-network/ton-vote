import { useMutation } from "@tanstack/react-query";
import { releaseMode, TX_FEES } from "config";
import _, { overArgs } from "lodash";
import {
  daoSetOwner,
  daoSetProposalOwner,
  getClientV2,
  newDao,
  newMetdata,
  newProposal,
  newRegistry,
  ProposalMetadata,
  proposalSendMessage,
  ReleaseMode,
  setDeployAndInitDaoFee,
  setFwdMsgFee,
  setMetadata,
  setRegistryAdmin,
  updateProposal,
} from "ton-vote-contracts-sdk";
import { useGetSender, useProposalAddress, useRole } from "hooks";
import { showSuccessToast, useErrorToast } from "toasts";
import {
  useDaoFromQueryParam,
  useDaosQuery,
  useDaoStateQuery,
  useGetClients,
  useRegistryStateQuery,
} from "./getters";
import { useProposalPersistedStore, useSyncStore, useVoteStore } from "store";
import { getTxFee, validateAddress } from "utils";
import {
  CreateDaoArgs,
  CreateMetadataArgs,
  UpdateMetadataArgs,
  UpdateProposalArgs,
} from "./types";
import { useTonAddress } from "@tonconnect/ui-react";
import { analytics } from "analytics";
import { useProposalPageQuery } from "pages/proposal/hooks";

export const useCreateNewRegistry = () => {
  const getSender = useGetSender();
  const address = useTonAddress();
  const showErrorToast = useErrorToast();
  const registryState = useRegistryStateQuery().data;

  return useMutation(
    async (releaseMode: number) => {
      if (!Object.keys(ReleaseMode).includes(releaseMode.toString())) {
        throw new Error("Invalid release mode");
      }
      if (!registryState?.admin || address !== registryState.admin) {
        throw new Error("You are not the registry admin");
      }
      const clientV2 = await getClientV2();
      const sender = getSender();
      return newRegistry(
        sender,
        clientV2,
        releaseMode,
        TX_FEES.BASE.toString(),
        address!
      );
    },
    {
      onError: (error) => showErrorToast(error),
    }
  );
};

export const useSetCreateDaoFee = () => {
  const getSender = useGetSender();
  const errorToast = useErrorToast();
  const address = useTonAddress();
  const registryState = useRegistryStateQuery().data;
  const refetch = useDaoStateQuery().refetch;

  return useMutation(
    async ({ value }: { value: number; onError: (value: string) => void }) => {
      if (address !== registryState?.admin) {
        throw new Error("You are not the registry admin");
      }
      if (!_.isNumber(value) || value < 0) {
        throw new Error("Fee must be zero or positive");
      }
      const client = await getClientV2();
      return setDeployAndInitDaoFee(
        getSender(),
        client,
        releaseMode,
        TX_FEES.BASE.toString(),
        value.toString()
      );
    },
    {
      onSuccess: () => refetch(),
      onError: (error: Error, args) => {
        args.onError(error.message);
        errorToast(error);
      },
    }
  );
};

export const useSetDaoFwdMsgFee = () => {
  const registryState = useRegistryStateQuery().data;
  const address = useTonAddress();
  const errorToast = useErrorToast();

  const getSender = useGetSender();
  return useMutation(
    async ({
      daoIds,
      amount,
    }: {
      daoIds: number[];
      amount?: number;
      onError: (error: string) => void;
      onSuccess?: () => void;
    }) => {
      if (registryState?.admin !== address) {
        throw new Error("You are not the registry admin");
      }

      if (!_.isNumber(amount)) {
        throw new Error("Forward Message Fee is required");
      }
      if (amount < 0) {
        throw new Error("Forward Message Fee must be at least 0");
      }
      const client = await getClientV2();
      return setFwdMsgFee(
        getSender(),
        client,
        releaseMode,
        TX_FEES.BASE.toString(),
        daoIds.map((it) => it.toString()),
        amount.toString()
      );
    },
    {
      onError: (error: Error, args) => {
        args.onError(error.message);
        errorToast(error);
      },
      onSuccess: (_, args) => args.onSuccess?.(),
    }
  );
};

export const useSetRegistryAdmin = () => {
  const getSender = useGetSender();
  const errorToast = useErrorToast();

  const { refetch, data: registryState } = useRegistryStateQuery();
  const address = useTonAddress();

  return useMutation(
    async ({
      newRegistryAdmin,
    }: {
      newRegistryAdmin?: string;
      onError: (newRegistryAdmin: string) => void;
    }) => {
      if (address !== registryState?.admin) {
        throw new Error("You are not the registry admin");
      }
      if (!newRegistryAdmin) {
        throw new Error("Registry admin is required");
      }
      if (!validateAddress(newRegistryAdmin)) {
        throw new Error("Invalid register admin address");
      }
      const client = await getClientV2();

      return setRegistryAdmin(
        getSender(),
        client,
        releaseMode,
        TX_FEES.BASE.toString(),
        newRegistryAdmin
      );
    },
    {
      onSuccess: (_, args) => {
        refetch();
      },
      onError: (error: Error, args) => {
        args.onError(error.message);
        errorToast(error);
      },
    }
  );
};

export const useCreateDaoQuery = () => {
  const getSender = useGetSender();
  const registryState = useRegistryStateQuery().data;
  const showErrorToast = useErrorToast();

  return useMutation(
    async (args: CreateDaoArgs) => {
      const sender = getSender();
      const clientV2 = await getClientV2();

      const address = await newDao(
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

      if (typeof address !== "string") {
        throw new Error("Failed to create Dao");
      }

      return address;
    },
    {
      onError: (error: Error, args) => {
        showErrorToast(error);
        analytics.createSpaceFailed(args.metadataAddress, error.message);
      },
      onSuccess: (address, args) => {
        args.onSuccess(address);
        analytics.createSpaceSuccess(args.metadataAddress, address);
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
      // const isMetadataExist = await metdataExists(clientV2, metadata);

      const address = await newMetdata(
        sender,
        clientV2,
        TX_FEES.CREATE_METADATA.toString(),
        metadata
      );

      if (typeof address !== "string") {
        throw new Error("Failed to create Space metadata");
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
  const dao = useDaoFromQueryParam().data;
  const getSender = useGetSender();
  const daoState = useDaoStateQuery(dao?.daoAddress).data;
  const { isOwner, isProposalPublisher } = useRole(dao?.daoRoles);
  const showErrorToast = useErrorToast();

  const allowed = isOwner || isProposalPublisher;

  return useMutation(
    async (args: CreateProposalArgs) => {
      const { metadata } = args;
      const sender = getSender();
      if (!allowed) {
        throw new Error("you are not allowed to create a proposal");
      }
      const clientV2 = await getClientV2();
      let address;
      address = await newProposal(
        sender,
        clientV2,
        getTxFee(Number(daoState?.fwdMsgFee), TX_FEES.FORWARD_MSG),
        dao?.daoAddress!,
        metadata as ProposalMetadata
      );

      if (typeof address !== "string") {
        throw new Error("Failed to create Proposal");
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
        args.onSuccess(address);
      },
    }
  );
};

export const useSetDaoOwnerQuery = () => {
  const getSender = useGetSender();
  const errorToast = useErrorToast();
  const { setDaoUpdateMillis } = useSyncStore();

  return useMutation(
    async ({
      newOwner,
      daoAddress,
    }: {
      newOwner?: string;
      daoAddress: string;
      onError: (value: string) => void;
      onSuccess: () => void;
    }) => {
      if (!newOwner) {
        throw new Error("Owner address is required");
      }
      if (!validateAddress(newOwner)) {
        throw new Error("Invalid owner address");
      }
      const clientV2 = await getClientV2();
      return daoSetOwner(
        getSender(),
        clientV2,
        daoAddress,
        TX_FEES.BASE.toString(),
        newOwner
      );
    },
    {
      onError: (error) => errorToast(error),
      onSuccess: (_, args) => {
        args.onSuccess();
        setDaoUpdateMillis(args.daoAddress);
      },
    }
  );
};

export const useSetDaoPublisherQuery = () => {
  const getSender = useGetSender();
  const { setDaoUpdateMillis } = useSyncStore();

  const errorToast = useErrorToast();

  return useMutation(
    async ({
      newOwner,
      daoAddress,
    }: {
      newOwner?: string;
      daoAddress: string;
      onError: (value: string) => void;
      onSuccess: () => void;
    }) => {
      if (!newOwner) {
        throw new Error("Proposal owner address is required");
      }
      if (!validateAddress(newOwner)) {
        throw new Error("Invalid proposal owner address");
      }

      const clientV2 = await getClientV2();
      return daoSetProposalOwner(
        getSender(),
        clientV2,
        TX_FEES.BASE.toString(),
        daoAddress,
        newOwner
      );
    },
    {
      onError: (error: Error, args) => {
        args.onError(error.message);
        errorToast(error);
      },
      onSuccess: (_, args) => {
        args.onSuccess();
        setDaoUpdateMillis(args.daoAddress);
      },
    }
  );
};

export const useUpdateDaoMetadataQuery = () => {
  const getSender = useGetSender();
  const { setDaoUpdateMillis } = useSyncStore();
  const refetchDaos = useDaosQuery().refetch;
  const refetchUpdatedDao = useDaoFromQueryParam().refetch;

  const errorToast = useErrorToast();

  return useMutation(
    async (args: UpdateMetadataArgs) => {
      const { metadata, daoAddress } = args;

      const sender = getSender();
      const clientV2 = await getClientV2();

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
  const { refetch } = useProposalPageQuery(true);
  const { setLatestMaxLtAfterTx } = useProposalPersistedStore();
  const proposalAddress = useProposalAddress();
  const errorToast = useErrorToast();
  const { setIsVoting } = useVoteStore();

  return useMutation(
    async (vote: string) => {
      setIsVoting(true);
      const sender = getSender();
      const client = await getClientV2();

      await proposalSendMessage(
        sender,
        client,
        TX_FEES.VOTE_FEE.toString(),
        proposalAddress,
        vote
      );

      const { data } = await refetch();

      setLatestMaxLtAfterTx(proposalAddress, data?.maxLt);
    },
    {
      onSuccess: (_, vote) => {
        analytics.voteSuccess(proposalAddress, vote);
      },
      onSettled: () => {
        setIsVoting(false);
      },
      onError: (error: Error, vote) => {
        errorToast(error);
        analytics.voteError(proposalAddress, vote, error.message);
      },
    }
  );
};

export const useUpdateProposalMutation = () => {
  const getSender = useGetSender();
  const errorToast = useErrorToast();

  return useMutation(
    async (args: UpdateProposalArgs) => {
      const sender = getSender();
      const client = await getClientV2();

      await updateProposal(
        sender,
        client,
        TX_FEES.FORWARD_MSG.toString(),
        args.daoAddress,
        args.proposalAddr,
        args.title,
        args.description
      );
    },
    {
      onSuccess: () => {
        showSuccessToast("Proposal updated");
      },
      onError: (error: Error, vote) => {
        console.log(error);
        
        errorToast(error);
      },
    }
  );
};
