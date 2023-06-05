import { styled, Typography } from '@mui/material'
import { StyledFlexColumn, StyledFlexRow } from 'styles'
import OrbsLogo from 'assets/orbs.svg'
import HearLogo from "assets/heart.svg";
import { AppSocials } from 'components';

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
      <StyledFlexRow gap={0}>
        <StyledSocials />
      </StyledFlexRow>
    </StyledContainer>
  );
}

const StyledSocials = styled(AppSocials)(({ theme }) => ({
  width: "auto",
  svg: {
    color: theme.palette.mode === 'light' && theme.palette.primary.main,
  },
}));


const StyledContainer = styled(StyledFlexColumn)(({ theme }) => ({
    marginTop:100,
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