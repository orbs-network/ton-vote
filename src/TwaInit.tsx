import twa from '@twa-dev/sdk'
import { useTheme } from "@mui/material";
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

    const hasTwaHash = new URLSearchParams(window.location.hash.slice(1)).get('tgWebAppPlatform') !== null
    setIsTwa(hasTwaHash)
  }, [])

  return null
}