import { useMutation } from "@tanstack/react-query";
import { useTonAddress } from "@tonconnect/ui-react";
import { releaseMode, TX_FEES } from "config";
import { useGetSender } from "hooks/hooks";
import _ from "lodash";
import { showSuccessToast, useErrorToast } from "toasts";
import {
  getClientV2,
  newRegistry,
  ReleaseMode,
  setDeployAndInitDaoFee,
  setFwdMsgFee,
  setNewDaoFwdMsgFee,
  setRegistryAdmin,
} from "ton-vote-contracts-sdk";
import { validateAddress } from "utils";
import { useRegistryStateQuery } from "./getters";

const useRegistryAdminPromise = () => {
  const { refetch, data } = useRegistryStateQuery();
  const address = useTonAddress();

  return async <T>(method: () => T) => {
    const state = data || (await refetch()).data;
    if (state?.admin !== address) {
      throw new Error("You are not the registry admin");
    }
    return method();
  };
};

const useSetDaoFwdMsgFee = () => {
  const errorToast = useErrorToast();

  const registryAdminPromise = useRegistryAdminPromise();

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
      const promise = async () => {
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

      return registryAdminPromise(promise);
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

const useSetFwdFeeForNewDaos = () => {
  const getSender = useGetSender();
  const errorToast = useErrorToast();
  const registryAdminPromise = useRegistryAdminPromise();

  return useMutation(
    async (fee: string) => {
      const promise = async () => {
        const sender = getSender();
        const clientV2 = await getClientV2();

        return setNewDaoFwdMsgFee(
          sender,
          clientV2,
          releaseMode,
          TX_FEES.BASE.toString(),
          fee
        );
      };
      return registryAdminPromise(promise);
    },
    {
      onError: (error: Error) => {
        errorToast(error);
      },
      onSuccess: () => {
        showSuccessToast(
          "Forward Message Fee for new DAOs has been set successfully"
        );
      },
    }
  );
};

const useSetRegistryAdmin = () => {
  const getSender = useGetSender();
  const errorToast = useErrorToast();
  const registryAdminPromise = useRegistryAdminPromise();

  const { refetch } = useRegistryStateQuery();

  return useMutation(
    async ({
      newRegistryAdmin,
    }: {
      newRegistryAdmin?: string;
      onError: (newRegistryAdmin: string) => void;
    }) => {
      const promise = async () => {
        if (!newRegistryAdmin || !validateAddress(newRegistryAdmin)) {
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
      return registryAdminPromise(promise);
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

const useSetCreateDaoFee = () => {
  const getSender = useGetSender();
  const errorToast = useErrorToast();
  const registryAdminPromise = useRegistryAdminPromise();

  return useMutation(
    async ({ value }: { value: number; onError: (value: string) => void }) => {
      const promise = async () => {
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
      };

      return registryAdminPromise(promise);
    },
    {
      onSuccess: () => {
        showSuccessToast("Create DAO Fee has been set successfully");
      },
      onError: (error: Error, args) => {
        args.onError(error.message);
        errorToast(error);
      },
    }
  );
};

const useCreateNewRegistry = () => {
  const getSender = useGetSender();
  const address = useTonAddress();
  const showErrorToast = useErrorToast();
  const registryAdminPromise = useRegistryAdminPromise();

  return useMutation(
    async (releaseMode: number) => {
      const promise = async () => {
        if (!Object.keys(ReleaseMode).includes(releaseMode.toString())) {
          throw new Error("Invalid release mode");
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

      return registryAdminPromise(promise);
    },
    {
      onError: (error) => showErrorToast(error),
    }
  );
};

export const registryAdminSetters = {
  useSetDaoFwdMsgFee,
  useSetFwdFeeForNewDaos,
  useSetRegistryAdmin,
  useSetCreateDaoFee,
  useCreateNewRegistry,
};
