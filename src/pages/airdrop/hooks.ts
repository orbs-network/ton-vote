import { useMutation, useQuery } from "@tanstack/react-query";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useFormik } from "formik";
import { useDebouncedCallback, useFormatNumber } from "hooks/hooks";
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";
import _, { rest } from "lodash";
import {
  useDaosQuery,
  useGetAllProposalsCallback,
  useGetClientsCallback,
  useReadJettonWalletMedataCallback,
  useReadNftItemMetadataCallback,
} from "query/getters";
import { useEffect, useMemo } from "react";
import { showSuccessToast, useErrorToast } from "toasts";
import { toNano } from "ton-core";
import {
  chooseRandomVoters,
  transferJettons,
  transferNft,
} from "ton-vote-contracts-sdk";
import { AnyObjectSchema } from "yup";
import {
  useAirdropStore,
  AirdropForm,
  useAirdropStoreCopy,
  AirdropStore,
  AirdropStoreValues,
} from "./store";
import { AirdropStoreKeys, Steps, VoterSelectionMethod } from "./types";

export const useDisplayWalletIndex = () => {
  const res = useAirdropStore().currentWalletIndex || 0;
  return res + 1;
};

export const useSelectedDaosProposals = () => {
  const { dataUpdatedAt, data } = useDaosQuery();

  const { daos } = useAirdropStore();

  const daoAddress = daos?.[0];

  return useMemo(() => {
    return _.find(data, { daoAddress })?.daoProposals || [];
  }, [dataUpdatedAt, daoAddress]);
};

export const useAirdropVotersQuery = () => {
  const getVotes = useGetAirdropVotes();
  const { proposals } = useAirdropStore();

  const _proposals = proposals || [];

  return useQuery(["useAirdropVotersQuery", ..._proposals], async () => {
    const votes = await getVotes();
    return _.keys(votes);
  });
};

export const useGetAirdropVotes = () => {
  const getProposals = useGetAllProposalsCallback();
  const { proposals } = useAirdropStore();

  return async () => {
    const result = await getProposals(proposals);

    let votes = {};
    result.forEach((proposal) => {
      votes = {
        ...votes,
        ...proposal?.rawVotes,
      };
    });

    return votes;
  };
};

export const useVotersSelectSubmit = () => {
  const errorToast = useErrorToast();
  const {
    setValues,
    nextStep,
    manuallySelectedVoters = [],
    proposals,
  } = useAirdropStore();
  const getVotes = useGetAirdropVotes();
  const getClients = useGetClientsCallback();
  const t = useAirdropTranslations();

  return useMutation(
    async (args: { formData: AirdropForm; voters: string[] }) => {
      if (_.isEmpty(proposals)) {
        throw new Error("Select at least one proposal");
      }

      if (args.formData.selectionMethod === VoterSelectionMethod.MANUALLY) {
        if (_.isEmpty(manuallySelectedVoters)) {
          throw new Error("Select at least one voter manually");
        }
        return manuallySelectedVoters;
      }

      const votes = await getVotes();

      if (args.formData.selectionMethod === VoterSelectionMethod.ALL) {
        return _.keys(votes);
      }
      const clientV4 = (await getClients()).clientV4;

      if (!votes) {
        throw new Error("Something went wrong");
      }

      const randomVotersAmount = args.formData.votersAmount || 0;

      if (!_.isEmpty(args.voters)) {
        return args.voters;
      }

      if (_.size(votes) < randomVotersAmount) {
        throw new Error(
          t.errors.maxVotersAmount(_.size(votes).toLocaleString())
        );
      }

      const result = await chooseRandomVoters(
        clientV4,
        votes,
        randomVotersAmount
      );

      if (_.size(result) === 0) {
        throw new Error("Something went wrong");
      }
      return result;
    },
    {
      onSuccess: (voters, args) => {
        setValues({
          voters,
        });
        nextStep();
      },
      onError: (error) => {
        errorToast(error);
      },
    }
  );
};

export const useAmountPerWallet = () => {
  const { jettonsAmount, assetType, voters } = useAirdropStore();

  const amountPerWallet = useMemo(() => {
    const amount = jettonsAmount || 0;

    return assetType === "jetton" ? Math.floor(amount / _.size(voters)) : 1;
  }, [jettonsAmount, _.size(voters), assetType]);

  const amountPerWalletUI = useFormatNumber(amountPerWallet);

  return { amountPerWallet, amountPerWalletUI };
};

export const useAmount = () => {
  const { jettonsAmount, assetType, voters } = useAirdropStore();

  const amount = useMemo(() => {
    return assetType === "jetton" ? jettonsAmount : _.size(voters);
  }, [jettonsAmount, _.size(voters), assetType]);

  const amountUI = useFormatNumber(amount);

  return { amount, amountUI };
};

export const useNextVoter = () => {
  const { currentWalletIndex, voters } = useAirdropStore();
  return !voters ? undefined : voters[currentWalletIndex || 0];
};

export const useTransferJetton = () => {
  const { amountPerWallet } = useAmountPerWallet();
  const { jettonAddress } = useAirdropStore();
  const errorToast = useErrorToast();
  const [tonconnect] = useTonConnectUI();
  const onSuccess = useOnTransferSuccess();
  const nextVoter = useNextVoter();
  const getClients = useGetClientsCallback();

  return useMutation(
    async () => {
      if (!jettonAddress) {
        throw new Error("No jetton address found");
      }
      const clientV2 = (await getClients()).clientV2;
      if (!nextVoter) {
        throw new Error("No next voter found");
      }
      return transferJettons(
        clientV2,
        tonconnect,
        toNano(amountPerWallet),
        jettonAddress,
        nextVoter
      );
    },
    {
      onSuccess: async (args) => {
        showSuccessToast(`Successfully transfered jetton`);
        onSuccess();
      },
      onError: (error) => {
        errorToast(error);
      },
    }
  );
};

const useOnTransferSuccess = () => {
  const {
    incrementCurrentWalletIndex,
    nextStep,
    currentWalletIndex = 0,
    voters,
  } = useAirdropStore();

  return () => {
    incrementCurrentWalletIndex();
    if (currentWalletIndex + 1 >= _.size(voters)) {
      nextStep();
    }
  };
};

export const useTransferNFT = () => {
  const errorToast = useErrorToast();
  const [tonconnect] = useTonConnectUI();
  const onSuccessCallback = useOnTransferSuccess();
  const voter = useNextVoter();
  const getClients = useGetClientsCallback();
  const { setNFTItemsRecipients } = useAirdropStore();
  const getMetadata = useReadNftItemMetadataCallback();
  const connectedWallet = useTonAddress();

  return useMutation(
    async ({
      NFTItemAddress,
    }: {
      NFTItemAddress: string;
      onSuccess: () => void;
    }) => {
      if (!voter) {
        throw new Error("No next voter found");
      }
      const metadata = await getMetadata(NFTItemAddress);
      const isOwner = metadata?.nftItemOwner.toString() === connectedWallet;
      if (!isOwner) {
        throw new Error("You are not owner of this NFT");
      }
      const clientV2 = (await getClients()).clientV2;
      return transferNft(clientV2, tonconnect, NFTItemAddress, voter);
    },
    {
      onSuccess: (_, args) => {
        showSuccessToast(`Successfully transferred NFT`);
        onSuccessCallback();
        setNFTItemsRecipients(voter!, args.NFTItemAddress);
        args.onSuccess();
      },
      onError: (error) => {
        errorToast(error);
      },
    }
  );
};

export const useOnAssetTypeSelected = () => {
  const getMetadata = useReadJettonWalletMedataCallback();
  const showError = useErrorToast();
  const connectedWallet = useTonAddress();
  const { nextStep } = useAirdropStore();

  return useMutation(
    async (values: AirdropForm) => {
      if (values.assetType === "jetton") {
        if (!values.jettonAddress) {
          throw new Error("No jetton address found");
        }
        const metadata = await getMetadata(values.jettonAddress);
        if (metadata.ownerAddress.toString() !== connectedWallet) {
          throw new Error("You must be owner of this jetton wallet");
        }
        const haveBalance =
          metadata.jettonWalletBalance >=
          toNano(Math.floor(values.jettonsAmount || 0));

        if (!haveBalance) {
          throw new Error("You don't have enough jetton balance");
        }
      }
    },
    {
      onSuccess: () => {
        nextStep();
      },
      onError: (err) => {
        showError(err);
      },
    }
  );
};

export const useAirdropFormik = (
  onSubmit: (value: AirdropForm) => void,
  schema: AnyObjectSchema
) => {
  const {
    voters,
    jettonsAmount,
    jettonAddress,
    assetType,
    selectionMethod,
    nftCollection,
    manuallySelectedVoters,
    setValues,
    votersAmount,
  } = useAirdropStore();
  const formik = useFormik<AirdropForm>({
    enableReinitialize: true,
    initialValues: {
      [AirdropStoreKeys.votersAmount]: votersAmount || undefined,
      [AirdropStoreKeys.jettonsAmount]: jettonsAmount,
      [AirdropStoreKeys.jettonAddress]: jettonAddress,
      [AirdropStoreKeys.nftCollection]: nftCollection,
      [AirdropStoreKeys.assetType]: assetType,
      [AirdropStoreKeys.selectionMethod]: selectionMethod,
      [AirdropStoreKeys.manuallySelectedVoters]: manuallySelectedVoters || [],
    },
    validationSchema: schema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const saveForm = useDebouncedCallback(() => {
    setValues(formik.values);
  });

  useEffect(() => {
    saveForm();
  }, [formik.values]);

  return formik;
};

const getStoreValues = (store: AirdropStore): AirdropStoreValues => {
  const { step, ...rest } = AirdropStoreKeys;
  return _.reduce(
    _.map(_.keys(rest), (key) => {
      return { value: store[key as AirdropStoreKeys], key };
    }),
    (acc, { value, key }) => ({ ...acc, [key]: value }),
    {}
  );
};

export const useAirdropStarted = () => {
  const index = useAirdropStore().currentWalletIndex || 0;

  return index > 0;
};

export const useRevertAirdropChangesCallback = () => {
  const store = useAirdropStore();
  const storeCopy = useAirdropStoreCopy();

  return () => {
    store.setValues(storeCopy.values);
  };
};

export const useMakeAirdropStoreCopy = () => {
  const store = useAirdropStore();
  const storeCopy = useAirdropStoreCopy();

  return () => {
    storeCopy.setValues(getStoreValues(store));
  };
};

export const useStartNewAirdropCallback = () => {
  const store = useAirdropStore();
  const storeCopy = useAirdropStoreCopy();

  return () => {
    let values = { ...getStoreValues(store), currentWalletIndex: 0 };
    if (
      store.step === Steps.SELECT_VOTERS &&
      store.votersAmount !== storeCopy.values.votersAmount
    ) {
      values = { ...values, voters: [] };
    }

    store.setValues(values);
    storeCopy.setValues(values);
  };
};

export const useIsAirdropStateChanged = () => {
  const store = useAirdropStore();
  const storeCopy = useAirdropStoreCopy();
  const airdropStarted = useAirdropStarted();

  return () => {
    if (!airdropStarted) return;

    return !_.isEqual(
      JSON.stringify(getStoreValues(store)),
      JSON.stringify(storeCopy.values)
    );
  };
};
