import { ABOUT_URL, TELETGRAM_URL, WHITEPAPER_URL } from 'consts';
import {Socials} from './Socials';
import React from 'react'

export function AppSocials({ className }: { className?: string }) {
  return (
    <Socials
      className={className}
      telegram={TELETGRAM_URL}
      whitepaper={WHITEPAPER_URL}
      about={ABOUT_URL}
    />
  );
}

