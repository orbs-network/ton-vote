import twa from '@twa-dev/sdk'
import { Alert, useTheme } from "@mui/material";
import { useTwaStore } from 'store';
import { useEffect } from 'react';

export function TwaInit() {
  const theme = useTheme()

  twa.ready();
  twa.MainButton.setParams({
    color: theme.palette.primary.main,
  })
  twa.expand()

  const { isTwa, setIsTwa } = useTwaStore()

  useEffect(() => {
    if (isTwa !== undefined) {
      return
    }

    // This was the method of detecting if the app is launched in Telegram suggested here: https://t.me/twa_dev/2163
    // but this method is not reliable because if you reload the page within the TWA the hash is lost.
    // A way a around this would be to store the hash in the local storage and check it on reload, but I think a version
    // check is more reliable because normal browsers are showing a version of 6.
    // const hasTwaHash = new URLSearchParams(window.location.hash.slice(1)).get('tgWebAppPlatform') !== null
    // setIsTwa(hasTwaHash)

    setIsTwa(twa.isVersionAtLeast('6.7'))

    return () => {
      setIsTwa(undefined)
    }

  }, [])

  return null
}