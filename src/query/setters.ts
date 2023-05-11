import { useMutation } from "@tanstack/react-query";
import { releaseMode, TX_FEES } from "config";
import _ from "lodash";
import {
  daoSetOwner,
  daoSetProposalOwner,
  getClientV2,
  MetadataArgs,
  metdataExists,
  newDao,
  newMetdata,
  newProposal,
  newRegistry,
  ProposalMetadata,
  setCreateDaoFee,
  setFwdMsgFee,
  setMetadata,
  setRegistryAdmin,
} from "ton-vote-contracts-sdk";
import {
  useDaoAddressFromQueryParam,
  useGetSender,
  useParseError,
} from "hooks";
import { useConnection } from "ConnectionProvider";
import { showErrorToast, showPromiseToast } from "toasts";
import {
  useDaoFromQueryParam,
  useDaosQuery,
  useGetCreateDaoFeeQuery,
  useGetDaoFwdMsgFeeQuery,
  useGetRegistryAdminQuery,
} from "./getters";
import { useSyncStore, useTxReminderPopup } from "store";
import { getTxFee, isOwner, Logger, validateAddress } from "utils";
import { CreateDaoArgs, CreateMetadataArgs, UpdateMetadataArgs } from "./types";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";


export const useCreateNewRegistry = () => {
  const getSender = useGetSender();
  const address = useConnection().address;
  const handleError = useError();

  return useMutation(
    async () => {
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
      onError: (error) => handleError(error),
    }
  );
};

export const useSetCreateDaoFee = () => {
  const getSender = useGetSender();
  const handleError = useError();

  const connectedAddress = useConnection().address;
  const registryAdmin = useGetRegistryAdminQuery().data;
  return useMutation(
    async ({
      value,
    }: {
      value: number;
      onError: (value: string) => void;
      onSuccess: () => void;
    }) => {
      if (connectedAddress !== registryAdmin) {
        throw new Error("You are not the registry admin");
      }
      if (!value) {
        throw new Error("Create Dao fee is required");
      }
      const client = await getClientV2();
      const promise = setCreateDaoFee(
        getSender(),
        client,
        releaseMode,
        TX_FEES.BASE.toString(),
        value.toString()
      );

      showPromiseToast({
        promise,
        loading: "Setting create DAO fee...",
        success: "Create DAO fee set",
        error: "Failed to set create DAO fee",
      });

      return promise;
    },
    {
      onSuccess: (_, args) => args.onSuccess(),
      onError: (error, args) => {
        handleError(error, args.onError);
      },
    }
  );
};

export const useSetDaoFwdMsgFee = () => {
  const registryAdmin = useGetRegistryAdminQuery().data;
  const connectedAddress = useConnection().address;
  const handleError = useError();

  const getSender = useGetSender();
  return useMutation(
    async ({
      daoIds,
      amount,
    }: {
      daoIds: number[];
      amount?: number;
      onError: (error: string) => void;
      onSuccess: () => void;
    }) => {
      if (registryAdmin !== connectedAddress) {
        throw new Error("You are not the registry admin");
      }

      if (!_.isNumber(amount)) {
        throw new Error("Forward Message Fee is required");
      }
      if (amount < 0) {
        throw new Error("Forward Message Fee must be at least 0");
      }
      const client = await getClientV2();
      const promise = setFwdMsgFee(
        getSender(),
        client,
        releaseMode,
        TX_FEES.BASE.toString(),
        daoIds.map((it) => it.toString()),
        amount.toString()
      );

      showPromiseToast({
        promise,
        loading: "Setting create Proposal fee...",
        success: "Create Proposal fee set",
        error: "Failed to set create Proposal fee",
      });

      return promise;
    },
    {
      onSuccess: (_, args) => args.onSuccess(),
      onError: (error, args) => {
        handleError(error, args.onError);
      },
    }
  );
};

export const useSetRegistryAdmin = () => {
  const getSender = useGetSender();
  const handleError = useError();

  return useMutation(
    async ({
      value,
    }: {
      value?: string;
      onError: (value: string) => void;
      onSuccess: () => void;
    }) => {
      const client = await getClientV2();
      if (!value) {
        throw new Error("Registry admin is required");
      }
      return setRegistryAdmin(
        getSender(),
        client,
        releaseMode,
        TX_FEES.BASE.toString(),
        value
      );
    },
    {
      onSuccess: (_, args) => args.onSuccess(),
      onError: (error, args) => handleError(error, args.onError),
    }
  );
};

export const useCreateDaoQuery = () => {
  const getSender = useGetSender();
  const createDaoFee = useGetCreateDaoFeeQuery().data;
  const handleError = useError();

  const toggleTxReminder = useTxReminderPopup().setOpen;

  return useMutation(
    async (args: CreateDaoArgs) => {
      const sender = getSender();
      const clientV2 = await getClientV2();

      const promise = newDao(
        sender,
        clientV2,
        releaseMode,
        getTxFee(Number(createDaoFee), TX_FEES.CREATE_DAO),
        args.metadataAddress,
        args.ownerAddress,
        args.proposalOwner
      );

      showPromiseToast({
        promise,
        loading: "Transaction pending",
        success: "Dao created!",
      });
      toggleTxReminder(true);
      const address = await promise;

      if (typeof address === "string") {
        args.onSuccess(address);
      } else {
        throw new Error("Something went wrong");
      }
    },
    {
      onSettled: () => toggleTxReminder(false),
      onError: (error) => handleError(error),
    }
  );
};

export const useCreateMetadataQuery = () => {
  const getSender = useGetSender();
  const toggleTxReminder = useTxReminderPopup().setOpen;
  const translations = useCreateDaoTranslations();
  const handleError = useError();

  return useMutation(
    async (args: CreateMetadataArgs) => {
      const { onSuccess, metadata } = args;
      const sender = getSender();

      const clientV2 = await getClientV2();
      const isMetadataExist = await metdataExists(clientV2, metadata);
      const promise = newMetdata(
        sender,
        clientV2,
        TX_FEES.CREATE_METADATA.toString(),
        metadata
      );

      if (!isMetadataExist) {
        toggleTxReminder(true);
        showPromiseToast({
          promise,
          success: translations.spaceDetailsCreated,
        });
      }

      const address = await promise;
      if (typeof address === "string") {
        onSuccess(address);
      } else {
        throw new Error("Something went wrong");
      }
    },
    {
      onSettled: () => toggleTxReminder(false),
      onError: (error) => handleError(error),
    }
  );
};

interface CreateProposalArgs {
  metadata: Partial<ProposalMetadata>;
  onSuccess: (value: string) => void;
}

export const useCreateProposalQuery = () => {
  const daoAddress = useDaoAddressFromQueryParam();
  const daoRoles = useDaoFromQueryParam().data?.daoRoles;
  const getSender = useGetSender();
  const toggleTxReminder = useTxReminderPopup().setOpen;
  const connectedWallet = useConnection().address;
  const createProposalFee = useGetDaoFwdMsgFeeQuery(daoAddress).data;
  const handleError = useError();

  return useMutation(
    async (args: CreateProposalArgs) => {
      const { metadata, onSuccess } = args;
      if (!isOwner(connectedWallet, daoRoles)) {
        throw new Error("Only owner can create proposal");
      }

      const sender = getSender();
      const clientV2 = await getClientV2();
      console.log(getTxFee(Number(createProposalFee), TX_FEES.FORWARD_MSG));

      const promise = newProposal(
        sender,
        clientV2,
        getTxFee(Number(createProposalFee), TX_FEES.FORWARD_MSG),
        daoAddress,
        metadata as ProposalMetadata
      );
      toggleTxReminder(true);
      showPromiseToast({
        promise,
        loading: "Creating Proposal",
        success: "Proposal Created",
      });

      const proposalAddress = await promise;

      if (typeof proposalAddress === "string") {
        onSuccess(proposalAddress);
      } else {
        throw new Error("Something went wrong");
      }
    },
    {
      onSettled: () => toggleTxReminder(false),
      onError: (error) => handleError(error),
    }
  );
};

export const useSetDaoOwnerQuery = () => {
  const getSender = useGetSender();
  const handleError = useError();
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
      const promise = daoSetOwner(
        getSender(),
        clientV2,
        daoAddress,
        TX_FEES.BASE.toString(),
        newOwner
      );

      showPromiseToast({
        promise,
        loading: "Setting owner...",
        success: "Owner set!",
      });

      return promise;
    },
    {
      onError: (error, args) => {
        handleError(error, args.onError);
      },
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

  const handleError = useError();

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
      const promise = daoSetProposalOwner(
        getSender(),
        clientV2,
        TX_FEES.BASE.toString(),
        daoAddress,
        newOwner
      );
      showPromiseToast({
        promise,
        loading: "Setting proposal publisher...",
        success: "Proposal publisher set!",
      });
      return promise;
    },
    {
      onError: (error, args) => handleError(error, args.onError),
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
  const {refetch}  =useDaosQuery()

  const handleError = useError();
  return useMutation(
    async (args: UpdateMetadataArgs) => {
      const { metadata, daoAddress } = args;

      const sender = getSender();
      const clientV2 = await getClientV2();

      const metadataAddressPromise = newMetdata(
        sender,
        clientV2,
        TX_FEES.CREATE_METADATA.toString(),
        metadata
      );

      showPromiseToast({
        promise: metadataAddressPromise,
        loading: "Updating metadata...",
        success: "Metadata updated!",
      });

      const metadataAddress = await metadataAddressPromise;

      if (typeof metadataAddress === "string") {
        const setMetadataPromise = setMetadata(
          sender,
          clientV2,
          TX_FEES.SET_METADATA.toString(),
          daoAddress,
          metadataAddress
        );

        showPromiseToast({
          promise: setMetadataPromise,
          loading: "Setting metadata...",
          success: "Metadata set!",
        });
        return setMetadataPromise;
      }
    },
    {
      onSuccess: (_, args) => {
        args.onSuccess();
        setDaoUpdateMillis(args.daoAddress);
        refetch();
      },
      onError: (error) => handleError(error),
    }
  );
};

const useError = () => {
  const parsedError = useParseError();
  return (error: any, callback?: (value: string) => void) => {
    if (Error instanceof Error) {
      const message = parsedError(error);
      showErrorToast(message);
      callback?.(message);
      return message;
    }
  };
};
