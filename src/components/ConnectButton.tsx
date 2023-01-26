import React, { useState } from 'react'
import { Button } from './Button';
import { WalletSelect } from './WalletSelect';

function ConnectButton() {
    const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Connect wallet</Button>
      <WalletSelect open={open} close={() => setOpen(false)} />
    </>
  );
}

export default ConnectButton
