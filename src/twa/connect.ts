import { useTonConnectUI } from "@tonconnect/ui-react";
import { useCallback, useEffect } from "react";
import { useTwaStore, TwaButtonType } from "store";
import { hideMainButton, showMainButton } from "./utils";
import twa from '@twa-dev/sdk'

export function useTwaConnect() {

  const [tonConnectUI] = useTonConnectUI()
  const { setTwaButtonType, twaButtonType } = useTwaStore()

  const twaConnectButtonHandler = useCallback(() => {
    tonConnectUI.connectWallet();
  }, [tonConnectUI])

  useEffect(() => {
    if (tonConnectUI.connected) {
      if (twaButtonType !== TwaButtonType.Connect || !twa.MainButton.isVisible) {
        return
      }

      hideMainButton({
        clickHandler: twaConnectButtonHandler,
        setType: setTwaButtonType,
      })

      return
    }

    if (twaButtonType === TwaButtonType.Connect && twa.MainButton.isVisible) {
      return
    }

    showMainButton({
      clickHandler: twaConnectButtonHandler,
      setType: setTwaButtonType,
      text: 'Connect Wallet',
      type: TwaButtonType.Connect,
    })

  }, [tonConnectUI.connected])
}