import twa from '@twa-dev/sdk'
import { TwaButtonType } from 'store'

type HideMainButtonArgs = {
  clickHandler: () => void
  setType: (twaButtonType?: TwaButtonType | undefined) => void
}

export function hideMainButton({ clickHandler, setType }: HideMainButtonArgs): void {
  twa.MainButton.offClick(clickHandler)
  twa.MainButton.hide()
  setType(undefined)
}

type ShowMainButtonArgs = {
  clickHandler: () => void
  text: string
  type: TwaButtonType
  setType: (twaButtonType?: TwaButtonType | undefined) => void
}

export function showMainButton({ clickHandler, text, type, setType }: ShowMainButtonArgs): void {
  twa.MainButton.onClick(clickHandler)
  twa.MainButton.setParams({
    text,
    is_visible: true,
  })
  setType(type)
}