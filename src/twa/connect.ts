import { useTonConnectUI } from "@tonconnect/ui-react";
import { useCallback, useEffect } from "react";
import { useTwaStore, TwaButtonType } from "store";
import twa from '@twa-dev/sdk'

export function useTwaConnect() {

  const [tonConnectUI] = useTonConnectUI()
  const { setMainButton, hideMainButton, twaButtonType } = useTwaStore()

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
      })

      return
    }

    if (twaButtonType === TwaButtonType.Connect && twa.MainButton.isVisible) {
      return
    }

    setMainButton({
      clickHandler: twaConnectButtonHandler,
      text: 'Connect Wallet',
      twaButtonType: TwaButtonType.Connect,
    })

  }, [tonConnectUI.connected])
}