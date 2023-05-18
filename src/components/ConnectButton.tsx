import { styled, Typography } from "@mui/material";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";

import React from "react";
import { Button } from "./Button";

export function ConnectButton({ className = "" }: { className?: string }) {
  const onConnect = () => {
    const container = document.getElementById("ton-connect-button");
    const btn = container?.querySelector("button");

    if (btn) {
      btn.click();
    }
  };

  return (
    <Button onClick={onConnect} className={className}>
      <Typography>Connect Wallet</Typography>
    </Button>
  );
}

