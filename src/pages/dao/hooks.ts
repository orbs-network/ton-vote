import { routes } from "consts";
import {
  useAppParams,
  useAppQueryParams,
  useCurrentRoute,
  useDevFeatures,
  useProposalStatus,
  useRole,
} from "hooks/hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import { useProposalQuery, useDaoQuery } from "query/getters";
import { useMemo } from "react";
import { appNavigation } from "router/navigation";
import { ProposalStatus } from "types";
import { getTimeDiff } from "utils";

export const useHideProposal = (proposalAddress: string) => {
  const { query } = useAppQueryParams();

  const { data: proposal } = useProposalQuery(proposalAddress);
  const { data: dao } = useDaoQuery(proposal?.daoAddress || "");

  const { proposalStatus } = useProposalStatus(proposalAddress);
  const title = proposal?.metadata?.title.toLowerCase();
  const description = proposal?.metadata?.description.toLowerCase();

  const { isProposalPublisher, isOwner } = useRole(dao?.daoRoles);

  const filters = useMemo(
    () => [title, description, proposalAddress],
    [title, description, proposalAddress]
  );

  if (query.proposalState && query.proposalState !== proposalStatus) {
    return true;
  }

  if (
    query.search &&
    !filters.some((it) => {
      return it?.toLowerCase().includes(query.search!.toLowerCase());
    })
  ) {
    return true;
  }

  if (!proposal?.metadata?.hide) {
    return false;
  }

  if (!isProposalPublisher && !isOwner) {
    return true;
  }

  return false;
};

export const useProposalTimeline = (address?: string) => {
  const { data: proposal, dataUpdatedAt } = useProposalQuery(address || "");
  const translations = useDaoPageTranslations();
  const { proposalStatus } = useProposalStatus(address || "");

  return useMemo(() => {
    if (!proposalStatus || !proposal?.metadata) return null;
    if (proposalStatus === ProposalStatus.NOT_STARTED) {
      return translations.startIn(
        getTimeDiff(proposal.metadata.proposalStartTime)
      );
    }

    if (proposalStatus === ProposalStatus.CLOSED) {
      return translations.proposalEnded(
        getTimeDiff(proposal.metadata.proposalEndTime, true)
      );
    }

    return translations.endIn(getTimeDiff(proposal.metadata.proposalEndTime));
  }, [proposalStatus, dataUpdatedAt]);
};

export const useNavigationLinks = (daoAddress?: string) => {
  const showDev = useDevFeatures();
  const { daoAddress: _daoAddress } = useAppParams();
  const address = daoAddress || _daoAddress;

  const translations = useDaoPageTranslations();
  const { data, isLoading } = useDaoQuery(address);
  const { isOwner, isProposalPublisher } = useRole(data?.daoRoles);
  const route = useCurrentRoute();
  if (isLoading) {
    return null;
  }


  return [
    {
      title: translations.proposals,
      path: appNavigation.daoPage.root(address),
      selected: route === routes.space,
      route: routes.space,
      hide: false,
    },
    {
      title: translations.about,
      path: appNavigation.daoPage.about(address),
      selected: route === routes.spaceAbout,
      route: routes.spaceAbout,
      hide: false,
    },
    {
      title: translations.newProposal,
      path: appNavigation.daoPage.create(address),
      selected: route === routes.createProposal,
      hide: !isOwner && !isProposalPublisher,
      route: routes.createProposal,
    },
    {
      title: translations.settings,
      path: appNavigation.daoPage.settings(address),
      selected: route === routes.spaceSettings,
      route: routes.spaceSettings,
      hide: !showDev,
    },
  ];
};
