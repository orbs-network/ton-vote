import {
  useIsConnectionRestored,
  useTonAddress,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import TWA from "@twa-dev/sdk";
import { MainButton } from "@twa-dev/sdk/react";
import { Back } from "components";
import { useAppNavigation } from "router/navigation";
import { Dao } from "types";
import { parseLanguage } from "utils";

const isEnabled =
  !!TWA.initData || !!new URLSearchParams(window.location.search).get("webapp");

const hapticFeedback = (
  type?: "light" | "medium" | "heavy" | "rigid" | "soft"
) => {
  if (isEnabled) {
    TWA.HapticFeedback.impactOccurred(type || "medium");
  }
};

const mainButton = TWA.MainButton;

const isExpanded = () => TWA.isExpanded;

const expand = () => TWA.expand();

const enableClosingConfirmation = () => TWA.enableClosingConfirmation();
const init = () => {
  // enableClosingConfirmation();
  expand();
  TWA.ready();
};

const onDaoSelect = (dao: Dao) => {
  TWA.sendData(
    JSON.stringify({
      name: parseLanguage(dao.daoMetadata.metadataArgs.name),
      address: dao.daoAddress,
      groupId: new URLSearchParams(window.location.search).get("groupId"),
    })
  );
};



const BackBtn = ({ onClick }: { onClick?: () => void }) => {
  if (!Webapp.isEnabled) return null;

  return <Back back={onClick} />;
};

const getRedirectUrl = () => {
  const paramKeys = {
    dao: '_dao_',
    proposal: '_proposal_',
    separator: '-_-',
  };
  let daoAddress: string | null = null;
  let proposalAddress: string | null = null;
  const webAppParams = new URLSearchParams(window.location.search).get("tgWebAppStartParam")
  webAppParams?.split(paramKeys.separator).forEach((param) => {
    if (param.includes(paramKeys.dao)) {
      daoAddress = param.split(paramKeys.dao)[1];
    } else if (param.includes(paramKeys.proposal)) {
      proposalAddress = param.split(paramKeys.proposal)[1];
    }
  });

  let redirectUrl: string | null = null;

  if (daoAddress) {
    redirectUrl = `/dao/${daoAddress}`;
    if (proposalAddress) {
      redirectUrl += `/proposal/${proposalAddress}`;
    }
  }

  console.log('redirectUrl', redirectUrl)

  return redirectUrl;
}


export const Webapp = {
  hapticFeedback,
  isExpanded,
  isEnabled,
  expand,
  enableClosingConfirmation,
  isDarkMode: TWA.colorScheme === "dark",
  init,
  onDaoSelect,
  mainButton,
  viewPortHeight: TWA.viewportHeight,
  BackBtn,
  redirectUrl: getRedirectUrl()
};

export const WebappConnectWalletButton = () => {
  const address = useTonAddress();
  const [tonConnect] = useTonConnectUI();
  const values = useTonWallet();

  if (address) return null;
  return (
    <MainButton
      text={"Connect wallet"}
      onClick={() => tonConnect.connectWallet()}
    />
  );
};

export function WebappButton({
  onClick,
  text,
  progress,
  disabled,
}: {
  onClick: () => void;
  text?: string;
  progress?: boolean;
  disabled?: boolean;
}) {
  const address = useTonAddress();
  const connectionRestored = useIsConnectionRestored();

  if (!address || !connectionRestored) return null;

  return (
    <MainButton
      disabled={disabled}
      text={text || ""}
      onClick={onClick}
      progress={progress}
    />
  );
}
