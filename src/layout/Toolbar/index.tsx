import { useMobile } from 'hooks/hooks'
import React from 'react'
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';

export const Toolbar = () => {
    const isMobile = useMobile()
  return isMobile ? <Mobile /> : <Desktop />;
}

