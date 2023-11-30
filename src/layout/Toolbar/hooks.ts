import { TELEGRAM_SUPPORT_GROUP } from "config";
import { useDevFeaturesMode, useMobile, useRole } from "hooks/hooks";
import _ from "lodash";
import { useDaosQuery } from "query/getters";
import React, { useMemo } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FaFly } from "react-icons/fa";
import { useAppNavigation } from "router/navigation";

interface Action {
  title: string;
  icon: React.ComponentType;
  onClick: () => void;
  devFeature?: boolean;
}

export const useActions = (custom?: Action[] | Action) => {
  const navigation = useAppNavigation();
  const devFeatures = useDevFeaturesMode();
  const isMobile = useMobile();
  return useMemo(() => {
    let menu: Action[] = [
      {
        title: "Airdrop",
        icon: FaFly,
        onClick: navigation.airdrop,
        devFeature: true,
      },
      {
        title: "Create a new space for your DAO",
        icon: AiOutlinePlus,

        onClick: devFeatures
          ? navigation.createSpace.root
          : () => window.open(TELEGRAM_SUPPORT_GROUP, "_blank"),
      },
    ];
    if (custom) {
      if (Array.isArray(custom)) {
        menu = [...menu, ...custom];
      } else {
        menu = [...menu, custom];
      }
    }
    return _.filter(menu, (action) => {
      return !devFeatures && action.devFeature ? false : true;
    });
  }, [devFeatures, navigation, isMobile, custom]);
};

export const useWalletDaos = () => {
  const { data, dataUpdatedAt } = useDaosQuery();
  const { getRole } = useRole();

  return useMemo(() => {
    return _.compact(
      _.filter(data, (dao) => {
        const { isOwner, isProposalPublisher } = getRole(dao.daoRoles);
        return isOwner || isProposalPublisher;
      })
    );
  }, [dataUpdatedAt, getRole]);
};
