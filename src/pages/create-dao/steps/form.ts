import { useConnection } from "ConnectionProvider";
import { useMemo } from "react";
import { InputInterface } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";

export const createDaoMetadataInputs: InputInterface[] = [
  {
    label: "Name",
    type: "text",
    name: "name",
    tooltip: "Your Forum’s name",
    required: true,
  },
  {
    label: "About",
    type: "textarea",
    name: "about",
    rows: 5,
    tooltip: "What is your project about?",
    required: true,
  },
  {
    label: "Avatar",
    type: "image",
    name: "avatar",
    tooltip: "Your project’s logo, 512*512 Pixel PNG image URL",
    required: true,
  },
  // {
  //   label: "Jetton Address",
  //   type: "address",
  //   name: "jetton",
  //   tooltip: "Your project’s Jetton smart contract on TON",
  // },
  // {
  //   label: "NFT Collection Address",
  //   type: "address",
  //   name: "nft",
  // },
  {
    label: "TON DNS",
    type: "text",
    name: "dns",
    required: true,
    tooltip:
      "Enter your project’s DNS domain or follow the instructions on [https://dns.ton.org/](https://dns.ton.org/)",
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
  // {
  //   label: "Hide Dao",
  //   type: "checkbox",
  //   name: "hide",
  // },
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
  name: Yup.string().required("Name is Required"),
  avatar: Yup.string().url("invalid Avatar URL").required('Avatar is Required'),
  dns: Yup.string().required("TON DNS is Required"),
  about: Yup.string().required("About is Required"),
});

export const SetRolesFormSchema = Yup.object().shape({
  ownerAddress: Yup.string()
    .test("address", "Invalid owner address", validateAddress)
    .required("Owner address Required"),
  proposalOwner: Yup.string()
    .test("address", "Invalid proposal owner address", validateAddress)
    .required("Proposal owner address Required"),
});
