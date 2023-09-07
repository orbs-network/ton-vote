import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import TWA from "@twa-dev/sdk";
import { MainButton } from "@twa-dev/sdk/react";
import { useMemo } from "react";
import { Dao } from "types";
import { create } from "zustand";

const hapticFeedback = (
  type?: "light" | "medium" | "heavy" | "rigid" | "soft"
) => TWA.HapticFeedback.impactOccurred(type || "medium");

const mainButton = TWA.MainButton;

const isEnabled = !!TWA.initData || !!new URLSearchParams(window.location.search).get("webapp")

const isExpanded = () => TWA.isExpanded;

const expand = () => TWA.expand();

const enableClosingConfirmation = () => TWA.enableClosingConfirmation();
const init = () => {
  enableClosingConfirmation();
  expand();
  TWA.ready();
};

const onDaoSelect = (dao: Dao) => {
  TWA.sendData(JSON.stringify({ action: "select_dao", data: dao }));
};

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
};


const WebappConnectWalletButton = () => {
  const address = useTonAddress();
  const [tonConnect] = useTonConnectUI();

  if (address) return null
    return (
      <MainButton
        text={"Connect wallet"}
        onClick={() => tonConnect.connectWallet()}
      />
    );
}

interface StoreValues {
  text?: string;
  progress?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface Store extends StoreValues {
  text?: string;
  progress?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  setValues: (values: StoreValues) => void;
  reset: () => void;
}

export const useWebappButtonStore = create<Store>((set, get) => ({
  setValues: (values: StoreValues) => set({ ...values }),
  reset: () => set({ text: undefined, progress: undefined, disabled: undefined }),
}));

export function WebappButton() {
  const address = useTonAddress();
  const [tonConnect] = useTonConnectUI();

  const {onClick, progress, text, disabled} = useWebappButtonStore();
  const _onClick = () => {
    if (!address) {
      tonConnect.connectWallet();
    } else {
      onClick?.();
    }
  };

  const _text = useMemo(() => {
    if (!address) {
      return "Connect wallet";
    }
    return text;
  }, [text, address]);

  const _progress = useMemo(() => {
    if (!address) {
      return false;
    }
    return progress;
  }, [progress, address]);

  const _disabled = useMemo(() => {
    if (!address) {
      return false;
    }
    return disabled;
  }, [disabled, address]);

  return (
    <MainButton
      disabled={_disabled}
      text={_text || ''}
      onClick={_onClick}
      progress={_progress}
    />
  );
}
