import { ABOUT_CHARS_LIMIT, TITLE_LIMIT } from "consts";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";
import { DaoMetadataForm, DaoRolesForm, InputArgs } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";

export const useDaoMetadataInputs = (): InputArgs<DaoMetadataForm>[] => {
  const translations = useCreateDaoTranslations();

  return [
    {
      label: translations.daoName,
      type: "text",
      name: "name_en",
      tooltip: translations.tooltips.daoName,
      required: true,
      limit: TITLE_LIMIT,
    },
    {
      label: translations.daoAbout,
      type: "textarea",
      name: "about_en",
      rows: 6,
      tooltip: translations.tooltips.daoAbout,
      required: true,
      isMarkdown: true,
      limit: ABOUT_CHARS_LIMIT,
    },
    {
      label: translations.logoURL,
      type: "image",
      name: "avatar",
      tooltip: translations.tooltips.logoURL,
      required: true,
    },
    {
      label: translations.tonDns,
      type: "text",
      name: "dns",
      tooltip: translations.tooltips.tonDNS,
    },
    {
      label: translations.jetton,
      type: "address",
      name: "jetton",
      tooltip: translations.tooltips.jetton,
    },
    {
      label: translations.nft,
      type: "address",
      name: "nft",
      tooltip: translations.tooltips.nft,
    },
    {
      label: translations.website,
      type: "url",
      name: "website",
    },
    {
      label: translations.telegramGroup,
      type: "url",
      name: "telegram",
    },
    {
      label: translations.github,
      type: "url",
      name: "github",
    },
  ];
};

export const useDaoRolesInputs = (EndAdornment?: any): InputArgs<DaoRolesForm>[] => {
  const translations = useCreateDaoTranslations();

  return [
    {
      label: translations.ownerAddress,
      type: "address",
      name: "ownerAddress",
      EndAdornment,
      required: true,
      tooltip: translations.tooltips.owner,
    },
    {
      label: translations.publisherAddress,
      type: "address",
      name: "proposalOwner",
      EndAdornment,
      required: true,
      tooltip: translations.tooltips.proposalPublisher,
    },
  ];
};

export const useDaoMetadataSchema = () => {
  const createDaoTranslations = useCreateDaoTranslations();
  const commonTranslations = useCommonTranslations();

  return Yup.object().shape({
    name_en: Yup.string().test(
      "",
      commonTranslations.isRequired(createDaoTranslations.daoName),
      (value, context) => {
        if (!context.parent.name_en) {
          return false;
        }
        return true;
      }
    ),
    about_en: Yup.string().test(
      "",
      commonTranslations.isRequired(createDaoTranslations.daoAbout),
      (value, context) => {
        if (!context.parent.about_en) {
          return false;
        }
        return true;
      }
    ),
    avatar: Yup.string()
      .url(commonTranslations.isInvalid(createDaoTranslations.logoURL))
      .required(commonTranslations.isRequired(createDaoTranslations.logoURL))
      .test("", createDaoTranslations.errors.logoURL1, (value) => {
        return value.startsWith("https://");
      })
      .test("", createDaoTranslations.errors.logoURL2, (value) => {
        return value.endsWith(".png");
      }),

    dns: Yup.string().test("", createDaoTranslations.errors.tonDNS, (value) => {
      return !value ? true : value?.endsWith(".ton") && value?.length > 4;
    }),

    github: Yup.string().test(
      "",
      commonTranslations.isInvalid(createDaoTranslations.github),
      (value) => {
        return value ? value.includes("github") : true;
      }
    ),
    telegram: Yup.string().test(
      "",
      createDaoTranslations.errors.telegram,
      (value) => {
        return !value ? true : value.startsWith("https://t.me");
      }
    ),
    website: Yup.string().url(
      commonTranslations.isInvalid(createDaoTranslations.website)
    ),
    jetton: Yup.string().test(
      "address",
      commonTranslations.isInvalid(createDaoTranslations.jetton),
      validateAddress
    ),
    nft: Yup.string().test(
      "address",
      commonTranslations.isInvalid(createDaoTranslations.nft),
      validateAddress
    ),
  });
};

export const useDaoRolesSchema = () => {
  const createDaotranslations = useCreateDaoTranslations();
  const commonTranstaions = useCommonTranslations();
  return Yup.object().shape({
    ownerAddress: Yup.string()
      .test(
        "address",
        commonTranstaions.isInvalid(createDaotranslations.ownerAddress),
        validateAddress
      )
      .required(
        commonTranstaions.isRequired(createDaotranslations.ownerAddress)
      ),
    proposalOwner: Yup.string()
      .test(
        "address",
        commonTranstaions.isInvalid(createDaotranslations.publisherAddress),
        validateAddress
      )
      .required(
        commonTranstaions.isRequired(createDaotranslations.publisherAddress)
      ),
  });
};
