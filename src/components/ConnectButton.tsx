import { styled, Typography } from "@mui/material";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import { isTwaApp } from "consts";
import { MainButton } from "@twa-dev/sdk/react";

import React from "react";
import { Button } from "./Button";
import { onConnect } from "utils";

export function ConnectButton({ className = "" }: { className?: string }) {


  return (
    <Button onClick={onConnect} className={className}>
      <Typography>Connect Wallet</Typography>
    </Button>
  );
}

