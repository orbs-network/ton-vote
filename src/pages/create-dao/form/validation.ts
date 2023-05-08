import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";
import { validateAddress } from "utils";
import * as Yup from "yup";

export const useDaoMetadataFormSchema = () => {
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

export const useSetRolesFormSchema = () => {
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
