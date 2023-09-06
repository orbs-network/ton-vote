import TWA from "@twa-dev/sdk";

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
  TWA.ready()
};

export const Webapp = {
  hapticFeedback,
  isExpanded,
  isEnabled,
  expand,
  enableClosingConfirmation,
  isDarkMode: TWA.colorScheme === "dark",
  init,
};
