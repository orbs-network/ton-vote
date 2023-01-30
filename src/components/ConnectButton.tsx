import React, { useState } from 'react'
import { Button } from './Button';
import { WalletSelect } from './WalletSelect';



export function ConnectButton({ text, className = "" }: { text?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className={className} onClick={() => setOpen(true)}>
        {text || "Connect wallet"}
      </Button>
      <WalletSelect open={open} close={() => setOpen(false)} />
    </>
  );
}

