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
      label: "Name",
      type: "text",
      name: "name_en",
      tooltip: t("spaceNameTooltip") as string,
      required: true,
      limit: TITLE_LIMIT,
    },
    {
      label: "About",
      type: "textarea",
      name: "about_en",
      rows: 6,
      tooltip: t("projectAboutTooltip") as string,
      required: true,
      isMarkdown: true,
      limit: ABOUT_CHARS_LIMIT,
    },
    {
      label: "Avatar",
      type: "image",
      name: "avatar",
      tooltip: t("spaceAvatarTootlip") as string,
      required: true,
    },
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
  ];


   const setRolesInputs: InputInterface[] =  [
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

   return { createMetadataInputs, setRolesInputs };

};



export const DaoMetadataFormSchema = Yup.object().shape({
  name: Yup.string().test("", "Name is Required", (value, context) => {
    if (!context.parent.name_en) {
      return false;
    }
    return true;
  }),
  avatar: Yup.string().url("invalid Avatar URL").required("Avatar is Required"),

  dns: Yup.string()
    .required("TON DNS is Required")
    .test("", "Invalid TON DNS", (value) => {
      return value?.endsWith(".ton") && value?.length > 4;
    }),
  about: Yup.string().test("", "About is Required", (value, context) => {
    if (!context.parent.about_en) {
      return false;
    }
    return true;
  }),
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
