import { GOOGLE_ANALYTICS_KEY } from "config";
import ReactGA from "react-ga4";

const init = () => {
  ReactGA.initialize(GOOGLE_ANALYTICS_KEY);
  ReactGA.send(window.location.pathname);
};

const sendEvent = (label: string, action: string) => {
  if (!ReactGA.isInitialized) {
    console.error("GA is Not initialized");
    return;
  }
  ReactGA.event({
    label,
    action,
    category: "Main page",
  });
};
const verifyButtonClick = () => {
  sendEvent("Verify", "Clicked on verify button");
};

const walletSelectedClick = (wallet: string) => {
  sendEvent("Wallet select", `selected wallet: ${wallet}`);
};

const voteClick = (value: string) => {
  sendEvent("Vote", `Voting ${value}`);
};

const endpointSettingsClick = () => {
  sendEvent("Endpoint settings", `endpoint settings click`);
};

const selectCustomEndpointClick = (clientV2: string, clientV4: string) => {
  sendEvent(
    "Select endpoint",
    `selected enspoints, clientV2: ${clientV2}, clientV4: ${clientV4}`
  );
};

const selectDefaultEndpointsClick = () => {
  sendEvent("Select endpoint", `selected enspoints, default clients`);
};

const txConfirmed = () => {
  sendEvent("Transaction", `transaction confirmed`);
};

const txCompleted = () => {
  sendEvent("Transaction", `transaction completed`);
};

const txFailed = (error: string) => {
  sendEvent("Transaction", `transaction failed, error: ${error}`);
};

export default {
  GA: {
    init,
    verifyButtonClick,
    walletSelectedClick,
    voteClick,
    endpointSettingsClick,
    selectCustomEndpointClick,
    selectDefaultEndpointsClick,
    txConfirmed,
    txCompleted,
    txFailed,
  },
};
