import { useMutation } from "@tanstack/react-query";
import { releaseMode, TX_FEES } from "config";
import _ from "lodash";
import {
  daoSetOwner,
  daoSetProposalOwner,
  getClientV2,
  metdataExists,
  newDao,
  newMetdata,
  newProposal,
  newRegistry,
  ProposalMetadata,
  ReleaseMode,
  setCreateDaoFee,
  setFwdMsgFee,
  setMetadata,
  setRegistryAdmin,
} from "ton-vote-contracts-sdk";
import { useDaoAddressFromQueryParam, useGetSender } from "hooks";
import { useConnection } from "ConnectionProvider";
import { showErrorToast, usePromiseToast } from "toasts";
import {
  useDaoFromQueryParam,
  useDaosQuery,
  useGetCreateDaoFeeQuery,
  useGetDaoFwdMsgFeeQuery,
  useGetRegistryAdminQuery,
} from "./getters";
import { useSyncStore } from "store";
import { getTxFee, isOwner, validateAddress } from "utils";
import { CreateDaoArgs, CreateMetadataArgs, UpdateMetadataArgs } from "./types";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";

export const useCreateNewRegistry = () => {
  const getSender = useGetSender();
  const address = useConnection().address;
  const promiseToast = usePromiseToast();
  const registryAdmin = useGetRegistryAdminQuery().data;

  return useMutation(async (releaseMode: number) => {
    const getPromise = async () => {
      if (!Object.keys(ReleaseMode).includes(releaseMode.toString())) {
        throw new Error("Invalid release mode");
      }
      if (!registryAdmin || address !== registryAdmin) {
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
    };

    const promise = getPromise();

    promiseToast({
      promise,
      loading: "Creating new registry...",
      success: "New registry created",
    });
  });
};

export const useSetCreateDaoFee = () => {
  const getSender = useGetSender();
  const promiseToast = usePromiseToast();
  const connectedAddress = useConnection().address;
  const registryAdmin = useGetRegistryAdminQuery().data;
  const refetch = useGetCreateDaoFeeQuery().refetch;

  return useMutation(
    async ({ value }: { value: number; onError: (value: string) => void }) => {
      const getPromise = async () => {
        if (connectedAddress !== registryAdmin) {
          throw new Error("You are not the registry admin");
        }
        if (!_.isNumber(value) || value < 0) {
          throw new Error("Fee must be zero or positive");
        }
        const client = await getClientV2();
        return setCreateDaoFee(
          getSender(),
          client,
          releaseMode,
          TX_FEES.BASE.toString(),
          value.toString()
        );
      };

      const promise = getPromise();

      promiseToast({
        promise,
        loading: "Setting create DAO fee...",
        success: "Create DAO fee set",
        error: "Failed to set create DAO fee",
      });

      return promise;
    },
    {
      onSuccess: () => refetch(),
      onError: (error: Error, args) => args.onError(error.message),
    }
  );
};

export const useSetDaoFwdMsgFee = () => {
  const registryAdmin = useGetRegistryAdminQuery().data;
  const connectedAddress = useConnection().address;
  const promiseToast = usePromiseToast();

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
      const getPromise = async () => {
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
        return setFwdMsgFee(
          getSender(),
          client,
          releaseMode,
          TX_FEES.BASE.toString(),
          daoIds.map((it) => it.toString()),
          amount.toString()
        );
      };

      const promise = getPromise();

      promiseToast({
        promise,
        loading: "Setting create Proposal fee...",
        success: "Create Proposal fee set",
        error: "Failed to set create Proposal fee",
      });

      return promise;
    },
    {
      onError: (error: Error, args) => args.onError(error.message),
      onSuccess: (_, args) => args.onSuccess?.(),
    }
  );
};

export const useSetRegistryAdmin = () => {
  const getSender = useGetSender();
  const promiseToast = usePromiseToast();
  const { refetch, data: admin } = useGetRegistryAdminQuery();
  const connectedAddress = useConnection().address;

  return useMutation(
    async ({
      newRegistryAdmin,
    }: {
      newRegistryAdmin?: string;
      onError: (newRegistryAdmin: string) => void;
    }) => {
      const getPromise = async () => {
        if (connectedAddress !== admin) {
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
      };

      const promise = getPromise();

      promiseToast({
        promise,
        loading: "Setting registry admin...",
        success: "Registry admin set",
        error: "Failed to set registry admin",
      });

      return promise;
    },
    {
      onSuccess: (_, args) => {
        refetch();
      },
      onError: (error: Error, args) => args.onError(error.message),
    }
  );
};

export const useCreateDaoQuery = () => {
  const getSender = useGetSender();
  const createDaoFee = useGetCreateDaoFeeQuery().data;
  const promiseToast = usePromiseToast();  

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

      promiseToast({
        promise,
        loading: "Transaction pending",
        success: "Dao created!",
        error: "Failed to create Dao",
        isSuccess: (address) => validateAddress(address),
      });
      return promise;
    },
    {
      onSuccess: (address, args) => {        
        if (typeof address === "string") {
          args.onSuccess(address);
        } else {
          showErrorToast("Failed to create Dao");
        }
      },
    }
  );
};

export const useCreateMetadataQuery = () => {
  const getSender = useGetSender();
  const translations = useCreateDaoTranslations();
  const promiseToast = usePromiseToast();

  return useMutation(
    async (args: CreateMetadataArgs) => {
      const { metadata } = args;
      const sender = getSender();

      const clientV2 = await getClientV2();
      const isMetadataExist = await metdataExists(clientV2, metadata);
      const getPromise = () => {
        return newMetdata(
          sender,
          clientV2,
          TX_FEES.CREATE_METADATA.toString(),
          metadata
        );
      };

      const promise = getPromise();

      if (!isMetadataExist) {
        promiseToast({
          promise,
          success: translations.spaceDetailsCreated,
          error: "Failed to create space details",
        });
      }

      return promise;
    },
    {
      onSuccess: (address, args) => {
        if (typeof address === "string") {
          args.onSuccess(address);
        } else {
          showErrorToast("Failed to create space details");
        }
      },
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
  const connectedWallet = useConnection().address;
  const createProposalFee = useGetDaoFwdMsgFeeQuery(daoAddress).data;
  const promiseToast = usePromiseToast();

  return useMutation(
    async (args: CreateProposalArgs) => {
      const { metadata, onSuccess } = args;

      const sender = getSender();
      const getPromise = async () => {
        if (!isOwner(connectedWallet, daoRoles)) {
          throw new Error("Only owner can create proposal");
        }
        const clientV2 = await getClientV2();
        return newProposal(
          sender,
          clientV2,
          getTxFee(Number(createProposalFee), TX_FEES.FORWARD_MSG),
          daoAddress,
          metadata as ProposalMetadata
        );
      };
      const promise = getPromise();

      promiseToast({
        promise,
        loading: "Creating Proposal",
        error: "Failed to create Proposal",
        success: "Proposal created",
      });

      return promise;
    },
    {
      onSuccess: (value, args) => {
        if (typeof value === "string") {
          return args.onSuccess(value);
        }
        showErrorToast("Something went wrong");
      },
    }
  );
};

export const useSetDaoOwnerQuery = () => {
  const getSender = useGetSender();
  const promiseToast = usePromiseToast();

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
      const getPromise = async () => {
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
      };
      const promise = getPromise();

      promiseToast({
        promise,
        loading: "Setting owner...",
        success: "Owner set!",
      });

      return promise;
    },
    {
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

  const promiseToast = usePromiseToast();

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
      const getPromise = async () => {
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
      };

      const promise = getPromise();

      promiseToast({
        promise,
        loading: "Setting proposal publisher...",
        success: "Proposal publisher set!",
      });
      return promise;
    },
    {
      onError: (error: Error, args) => args.onError(error.message),
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
  const refetch = useDaosQuery().refetch;
  const promiseToast = usePromiseToast();

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

      promiseToast({
        promise: metadataAddressPromise,
        loading: "Updating metadata...",
      });

      const metadataAddress = await metadataAddressPromise;

      if (typeof metadataAddress !== "string") {
        showErrorToast("Failed to update metadata");
        return;
      }

      const setMetadataPromise = setMetadata(
        sender,
        clientV2,
        TX_FEES.SET_METADATA.toString(),
        daoAddress,
        metadataAddress
      );

      promiseToast({
        promise: setMetadataPromise,
        loading: "Setting metadata...",
        success: "Metadata set!",
      });
      return setMetadataPromise;
    },
    {
      onSuccess: (_, args) => {
        args.onSuccess();
        setDaoUpdateMillis(args.daoAddress);
        refetch();
      },
    }
  );
};
