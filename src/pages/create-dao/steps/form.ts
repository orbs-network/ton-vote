import { useConnection } from "ConnectionProvider";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { InputInterface } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";

export const useCreateDaoMetadataInputs = (): InputInterface[] => {
  const { t } = useTranslation();
  return [
    {
      label: "Name",
      type: "text",
      name: "name",
      tooltip: t("spaceNameTooltip") as string,
      required: true,
    },
    {
      label: "About",
      type: "textarea",
      name: "about",
      rows: 5,
      tooltip: t("projectAboutTooltip") as string,
      required: true,
    },
    {
      label: "Avatar",
      type: "image",
      name: "avatar",
      tooltip: t("spaceAvatarTootlip") as string,
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
      tooltip: t("tonDnsTooltip") as string,
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
};

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
  avatar: Yup.string().url("invalid Avatar URL").required("Avatar is Required"),

  dns: Yup.string()
    .required("TON DNS is Required")
    .test("", "Invalid TON DNS", (value) => {
      return value?.endsWith(".ton") && value?.length > 4;
    }),
  about: Yup.string().required("About is Required"),
  github: Yup.string().test("", "Invalid Github URL", (value) => {
    return value ? value.includes("github") : true;
  }),
});

export const SetRolesFormSchema = Yup.object().shape({
  ownerAddress: Yup.string()
    .test("address", "Invalid owner address", validateAddress)
    .required("Owner address Required"),
  proposalOwner: Yup.string()
    .test("address", "Invalid proposal owner address", validateAddress)
    .required("Proposal owner address Required"),
});
