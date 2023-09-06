import TWA from "@twa-dev/sdk";
import { Dao } from "types";

const hapticFeedback = (
  type?: "light" | "medium" | "heavy" | "rigid" | "soft"
) => TWA.HapticFeedback.impactOccurred(type || "medium");

const isEnabled = !!TWA.initData;

const isExpanded = () => TWA.isExpanded;

const expand = () => TWA.expand();

const enableClosingConfirmation = () => TWA.enableClosingConfirmation();
const init = () => {
  enableClosingConfirmation();
  expand();
  TWA.ready();
};

const onDaoSelect = (dao: Dao) => {
  TWA.sendData(JSON.stringify({ action:'select_dao', data: dao }));
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
};
