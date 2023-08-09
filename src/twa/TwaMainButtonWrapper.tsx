import { useTonConnectUI } from "@tonconnect/ui-react";

type TwaProps = {
  children: React.ReactNode
}

export function TwaMainButtonWrapper({ children }: TwaProps) {
  const [tonConnectUI] = useTonConnectUI()

  if (!tonConnectUI.connected) {
    return null
  }

  return <>{children}</>
}