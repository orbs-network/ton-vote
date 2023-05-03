import { useConnection } from "ConnectionProvider";
import { ABOUT_CHARS_LIMIT, TITLE_LIMIT } from "consts";
import { useTranslation } from "react-i18next";
import { InputInterface } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";

export const useInputs = () => {
  const { t } = useTranslation();
  const address = useConnection().address;

  const createMetadataInputs: InputInterface[] = [
    {
      label: "DAO name",
      type: "text",
      name: "name_en",
      tooltip: t("spaceNameTooltip") as string,
      required: true,
      limit: TITLE_LIMIT,
    },
    {
      label: "About the DAO",
      type: "textarea",
      name: "about_en",
      rows: 6,
      tooltip: t("projectAboutTooltip") as string,
      required: true,
      isMarkdown: true,
      limit: ABOUT_CHARS_LIMIT,
    },
    {
      label: "Logo URL",
      type: "image",
      name: "avatar",
      tooltip: t("spaceAvatarTootlip") as string,
      required: true,
    },
    {
      label: "TON DNS name",
      type: "text",
      name: "dns",
      tooltip: t("tonDnsTooltip") as string,
    },
    {
      label: "Project website URL",
      type: "url",
      name: "website",
    },
    {
      label: "Project Telegram group",
      type: "url",
      name: "telegram",
    },
    {
      label: "Project GitHub URL",
      type: "url",
      name: "github",
    },
  ];

  const setRolesInputs: InputInterface[] = [
    {
      label: "Space owner",
      type: "address",
      name: "ownerAddress",
      defaultValue: address,
      required: true,
      tooltip:
        "The owner of the space, can change metadata and update admins. Can be a multi-sig contract.",
    },
    {
      label: "Proposal publisher",
      type: "address",
      name: "proposalOwner",
      defaultValue: address,
      required: true,
      tooltip:
        "The address that can publish new proposals for vote. Can be a multi-sig contract or a multi-owner contract.",
    },
  ];

  return { createMetadataInputs, setRolesInputs };
};

export const DaoMetadataFormSchema = Yup.object().shape({
  name: Yup.string().test("", "DAO Name is Required", (value, context) => {
    if (!context.parent.name_en) {
      return false;
    }
    return true;
  }),
  avatar: Yup.string()
    .url("invalid Logo URL")
    .required("Logo URL is Required")
    .test("", "Logo URL must be https", (value) => {
      return value.startsWith("https://");
    })
    .test("", "Logo URL must be png format", (value) => {
      return value.endsWith(".png");
    }),

  dns: Yup.string().test("", "TON DNS must end with .ton", (value) => {
    return !value ? true : value?.endsWith(".ton") && value?.length > 4;
  }),
  about: Yup.string().test(
    "",
    "About the DAO is Required",
    (value, context) => {
      if (!context.parent.about_en) {
        return false;
      }
      return true;
    }
  ),
  github: Yup.string().test("", "Invalid Github URL", (value) => {
    return value ? value.includes("github") : true;
  }),
  telegram: Yup.string().test(
    "",
    "Telegram group should start with https://t.me",
    (value) => {
      return !value ? true : value.startsWith("https://t.me");
    }
  ),
  website: Yup.string().url("invalid Website URL"),
});

export const SetRolesFormSchema = Yup.object().shape({
  ownerAddress: Yup.string()
    .test("address", "Invalid owner address", validateAddress)
    .required("Owner address Required"),
  proposalOwner: Yup.string()
    .test("address", "Invalid proposal owner address", validateAddress)
    .required("Proposal publisher address Required"),
});
