import { routes } from "consts";
import { useAppParams, useCurrentRoute, useDevFeaturesMode, useRole } from "hooks/hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import { useDaoQuery } from "query/getters";
import { useMemo } from "react";
import { appNavigation } from "router/navigation";

const options = [
  { name: "website", title: "Project website" },
  { name: "telegram", title: "Telegram group" },
  { name: "github", title: "GitHub" },
];
export const useSocials = () => {
  const { daoAddress } = useAppParams();

  const { data, dataUpdatedAt } = useDaoQuery(daoAddress);

  return useMemo(() => {
    return options
      .map((option) => {
        const metadata = data?.daoMetadata?.metadataArgs as any;
        if (!metadata) return null;
        const value = metadata[option.name];
        if (!value) return null;
        return {
          title: option.title,
          value,
        };
      })
      .filter(Boolean);
  }, [dataUpdatedAt]);
};


export const useNavigationLinks = () => {
  const showDev = useDevFeaturesMode();
  const { daoAddress } = useAppParams();
  const translations = useDaoPageTranslations();
  const { data, isLoading } = useDaoQuery(daoAddress);
  const { isOwner, isProposalPublisher } = useRole(data?.daoRoles);
  const route = useCurrentRoute();
  

  return useMemo(
    () => {
        if(isLoading) return []
        return [
          {
            title: translations.proposals,
            path: appNavigation.daoPage.root(daoAddress),
            selected: route === routes.space,
            route: routes.space,
            hide: false,
          },
          {
            title: translations.about,
            path: appNavigation.daoPage.about(daoAddress),
            selected: route === routes.spaceAbout,
            route: routes.spaceAbout,
            hide: false,
          },
          {
            title: translations.newProposal,
            path: appNavigation.daoPage.create(daoAddress),
            selected: route === routes.createProposal,
            hide: !isOwner && !isProposalPublisher,
            route: routes.createProposal,
          },
          {
            title: translations.settings,
            path: appNavigation.daoPage.settings(daoAddress),
            selected: route === routes.spaceSettings,
            route: routes.spaceSettings,
            hide: !showDev || !isOwner,
          },
        ];
    },
    [translations, showDev, isOwner, isProposalPublisher, route, isLoading]
  );

};


