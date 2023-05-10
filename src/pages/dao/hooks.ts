import { useMutation } from "@tanstack/react-query";
import { ZERO_ADDRESS } from "consts";
import { useDaoAddressFromQueryParam, useGetSender } from "hooks";
import { useDaoQuery } from "query/queries";
import {
  daoSetOwner,
  daoSetProposalOwner,
  getClientV2,
  newMetdata,
  setMetadata,
} from "ton-vote-contracts-sdk";
import { DaoMetadataForm } from "types";

export const useDaoPage = () => {
  const daoAddress = useDaoAddressFromQueryParam();
  return useDaoQuery(daoAddress);
};

export const useUpdateDaoOwner = () => {
  const getSender = useGetSender();
  const daoAddress = useDaoAddressFromQueryParam();

  return useMutation(async (newOwner: string) => {
    const clientV2 = await getClientV2();
    return daoSetOwner(getSender(), clientV2, daoAddress, newOwner);
  });
};

export const useUpdateDaoPublisher = () => {
  const getSender = useGetSender();
  const daoAddress = useDaoAddressFromQueryParam();

  return useMutation(async (newProposalOwner: string) => {
    const sender = getSender();
    const clientV2 = await getClientV2();
    const res = await  daoSetProposalOwner(sender, clientV2, daoAddress, newProposalOwner);
    console.log({res});
    
  });
};

export const useUpdateDaoMetadata = () => {
  const getSender = useGetSender();
  const daoAddress = useDaoAddressFromQueryParam();

  return useMutation(async (metadata: DaoMetadataForm) => {
    const metadataArgs: DaoMetadataForm = {
      about: JSON.stringify({ en: metadata.about_en }),
      avatar: metadata.avatar || "",
      github: metadata.github || "",
      hide: metadata.hide,
      name: JSON.stringify({ en: metadata.name_en }),
      terms: "",
      telegram: metadata.telegram || "",
      website: metadata.website || "",
      jetton: metadata.jetton || ZERO_ADDRESS,
      nft: metadata.nft || ZERO_ADDRESS,
      dns: metadata.dns || "",
    };

    const sender = getSender();
    const clientV2 = await getClientV2();
    const metadataAddress = await newMetdata(sender, clientV2, metadataArgs);
    if (typeof metadataAddress === "string") {
      return setMetadata(sender, clientV2, daoAddress, metadataAddress);
    }
  });
};
