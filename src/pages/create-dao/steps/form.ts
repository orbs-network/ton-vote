import { useConnection } from "ConnectionProvider";
import { useMemo } from "react";
import { Address } from "ton-core";
import { InputInterface } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";

export const createDaoMetadataInputs: InputInterface[] = [
  {
    label: "Name",
    type: "text",
    name: "name",
    tooltip: "Name of the DAO",
    required: true,
  },

  {
    label: "Jetton Address",
    type: "address",
    name: "jetton",
  },
  {
    label: "NFT",
    type: "address",
    name: "nft",
  },
  {
    label: "TON DNS",
    type: "text",
    name: "tonDns",
  },
  {
    label: "About",
    type: "textarea",
    name: "about",
    rows: 5,
  },
  {
    label: "Avatar",
    type: "text",
    name: "avatar",
  },
  {
    label: "Github",
    type: "url",
    name: "github",
  },
  {
    label: "Telegram",
    type: "url",
    name: "telegram",
  },
  {
    label: "Website",
    type: "url",
    name: "website",
  },

  {
    label: "Terms",
    type: "url",
    name: "terms",
  },
  {
    label: "Hide Dao",
    type: "checkbox",
    name: "hide",
  },
];

export const useRolesInputs = (): InputInterface[] => {
  const address = useConnection().address;

  return useMemo(() => {
    return [
      {
        label: "Owner",
        type: "address",
        name: "ownerAddress",
        defaultValue: address,
        required: true,
      },
      {
        label: "Proposal Owner",
        type: "address",
        name: "proposalOwner",
        defaultValue: address,
        required: true,
      },
    ];
  }, [address]);
};



export const DaoMetadataFormSchema = Yup.object().shape({
  avatar: Yup.string().url("invalid URL"),
  name: Yup.string().required("Required"),
  github: Yup.string().url("invalid URL").required("Required"),
  website: Yup.string().url("invalid URL").required("Required"),
  telegram: Yup.string().url("invalid URL").required("Required"),
  about: Yup.string().required("Required"),
  terms: Yup.string().url("invalid URL").required("Required"),
  jetton: Yup.string().test("address", "Invalid address", validateAddress),
});

export const SetRolesFormSchema = Yup.object().shape({
  ownerAddress: Yup.string()
    .test("address", "Invalid address", validateAddress)
    .required("Required"),
  proposalOwner: Yup.string()
    .test("address", "Invalid address", validateAddress)
    .required("Required"),
});
