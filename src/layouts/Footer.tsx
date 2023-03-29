import { styled, Typography } from '@mui/material'
import React from 'react'
import { StyledFlexColumn, StyledFlexRow } from 'styles'
import OrbsLogo from 'assets/orbs.svg'
import HearLogo from "assets/heart.svg";
import { Github } from 'components';

export function Footer() {
  return (
    <StyledContainer>
      <StyledWithLove>
        <Typography>Contributed with</Typography>
        <img src={HearLogo} />
        <Typography>by</Typography>
        <a href="https://www.orbs.com/" target="_blank">
          <Typography>Orbs</Typography> <img src={OrbsLogo} />
        </a>
      </StyledWithLove>
      <Github />
    </StyledContainer>
  );
}


const StyledContainer = styled(StyledFlexColumn)(({ theme }) => ({
    marginTop:'auto',
    height: 100,
  a: {
    textDecoration: "unset",
    color: theme.palette.primary.main,
    display:'flex',
    alignItems:'center',
    gap: 5
  },
  "*": {
    fontWeight: 500,
    fontSize: 14,
  },
  img: {
    width: 12,
  },
}));

const StyledWithLove = styled(StyledFlexRow)({
   gap:4
})