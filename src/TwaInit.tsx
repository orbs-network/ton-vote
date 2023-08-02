import twa from '@twa-dev/sdk'
import { useTheme } from "@mui/material";

export function TwaInit() {
  const theme = useTheme()

  twa.ready();
  twa.MainButton.setParams({
    color: theme.palette.primary.main,
  })
  twa.expand()

  return null
}