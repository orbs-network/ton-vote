import { styled, Typography } from "@mui/material";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import OrbsLogo from "assets/orbs.svg";
import { AppSocials } from "components";

export function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <StyledContainer $compact={compact}>
      <StyledWithLove>
        <a
          href="https://www.orbs.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: "14px",
          }}
        >
          <Typography fontSize={"15px"} fontWeight={500}>
            Powered by Orbs
          </Typography>
          <img src={OrbsLogo} style={{ width: 20 }} />
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
    color: theme.palette.mode === "light" && theme.palette.primary.main,
  },
}));


const StyledContainer = styled(StyledFlexColumn, {
  shouldForwardProp: (prop) => prop !== "$compact",
})<{ $compact: boolean }>(({ theme, $compact }) => ({
  marginTop: $compact ? 100 : 100,
  height: $compact ? 64 : 100,
  paddingBottom: 40,
  a: {
    textDecoration: "unset",
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
}));

const StyledWithLove = styled(StyledFlexRow)({
  gap: 4,
});
