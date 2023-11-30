import { Typography } from "@mui/material";
import { useTonConnectUI } from "@tonconnect/ui-react";

import { Button } from "./Button";

export function ConnectButton({ className = "" }: { className?: string }) {
  const [tonConnect] = useTonConnectUI();

  return (
    <Button onClick={() => tonConnect.openModal()} className={className}>
      <Typography>Connect Wallet</Typography>
    </Button>
  );
}
