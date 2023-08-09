import { useTonConnectUI } from "@tonconnect/ui-react";
import { useCallback } from "react";
import { MainButton } from "@twa-dev/sdk/react";

export function TwaConnectButton() {

  const [tonConnectUI] = useTonConnectUI()

  const twaConnectButtonHandler = useCallback(() => {
    tonConnectUI.connectWallet();
  }, [tonConnectUI])


  if (tonConnectUI.connected) {
    return null
  }

  return (
    <MainButton onClick={twaConnectButtonHandler} text="Connect" />
  )
}