import { ABOUT_URL, TELETGRAM_URL, WHITEPAPER_URL } from 'consts';
import {Socials} from './Socials';
import React from 'react'

export function AppSocials() {
  return (
    <Socials
      telegram={TELETGRAM_URL}
      whitepaper={WHITEPAPER_URL}
      about={ABOUT_URL}
    />
  );
}

