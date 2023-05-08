import { useConnection } from "ConnectionProvider";
import { ABOUT_CHARS_LIMIT, TITLE_LIMIT } from "consts";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";
import { useMemo } from "react";
import { FormArgs } from "types";


export const useInputs = (editMode?: boolean) => {
  const address = useConnection().address;

  const translations = useCreateDaoTranslations();

  const createMetadataForm: FormArgs[] = useMemo(() => {
    return [
      {
        title: editMode
          ? translations.editSpaceMetadata
          : translations.enterSpaceMetadata,
        subTitle: translations.formInfo,
        warning: editMode ? translations.editWarning : undefined,
        inputs: [
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
        ],
      },
    ];
  }, [editMode, translations]);

  const setRolesForm: FormArgs[] = useMemo(() => {
    return [
      {
        title: editMode ? translations.editStage : translations.createSpace,
        subTitle: translations.formInfo,
        inputs: [
          {
            label: translations.ownerAddress,
            type: "address",
            name: "ownerAddress",
            defaultValueClick: address,
            required: true,
            tooltip: translations.tooltips.owner,
          },
          {
            label: translations.publisherAddress,
            type: "address",
            name: "proposalOwner",
            defaultValueClick: address,
            required: true,
            tooltip: translations.tooltips.proposalPublisher,
          },
        ],
      },
    ];
  }, [address, translations]);

  return { createMetadataForm, setRolesForm };
};