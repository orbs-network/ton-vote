import { useCommonTranslations } from 'i18n/hooks/useCommonTranslations';
import React, { useState } from 'react'
import { Button } from './Button';
import { WalletSelect } from './WalletSelect';



export function ConnectButton({ text, className = "" }: { text?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const t = useCommonTranslations()
  return (
    <>
      <Button className={className} onClick={() => setOpen(true)}>
        {text || t.connectWallet}
      </Button>
      <WalletSelect open={open} close={() => setOpen(false)} />
    </>
  );
}

