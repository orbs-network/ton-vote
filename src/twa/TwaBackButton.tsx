import { BackButton } from "@twa-dev/sdk/react";
import { useBack } from "hooks/hooks";

export function TwaBackButton({ to, func }: { to?: string; func?: () => void }) {
  const { onClick } = useBack({ to, func })

  return <BackButton onClick={onClick} />

}