import { Box, styled, Typography } from "@mui/material";
import { routes } from "consts";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useEffect } from "react";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { StyledFlexRow } from "styles";
import twa from '@twa-dev/sdk'
import { BackButton } from "@twa-dev/sdk/react";
import { useBack } from "hooks/hooks";

function Back({ to, func }: { to?: string; func?: () => void }) {

  const { onClick } = useBack({ to, func });
  const t = useCommonTranslations()
  const pathname = useLocation().pathname;

  if (pathname === routes.spaces) return null;
  return (
    <>
      <StyledContainer onClick={onClick}>
        <StyledFlexRow gap={5}>
          <HiOutlineArrowLeft />
          <Typography>{t.back}</Typography>
        </StyledFlexRow>
      </StyledContainer>
    </>
  );
}

export { Back };

const StyledContainer = styled(Box)({
  cursor: "pointer",
  padding: "6px 12px",
  height: "auto",
  background: "#0088CC",
  borderRadius: 20,
  "*": {
    color: 'white!important'
  },
  p: {
    fontSize: 13,
    fontWeight: 600,

  },
});
