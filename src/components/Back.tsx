import { Box, styled, Typography } from "@mui/material";
import { isTwaApp, routes } from "consts";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { StyledFlexRow } from "styles";
import { BackButton } from "@twa-dev/sdk/react";

function Back({ to, func }: { to?: string; func?: () => void }) {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const t = useCommonTranslations();
  const onClick = () => {
    if (func) {
      func();
    } else if (to) {
      navigate(to);
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(routes.spaces, { replace: true }); // the current entry in the history stack will be replaced with the new one with { replace: true }
    }
  };

  if (pathname === routes.spaces) return null;

  if (isTwaApp) {
    return <BackButton onClick={onClick} />;
  }
  return (
    <StyledContainer onClick={onClick}>
      <StyledFlexRow gap={5}>
        <HiOutlineArrowLeft />
        <Typography>{t.back}</Typography>
      </StyledFlexRow>
    </StyledContainer>
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
    color: "white!important",
  },
  p: {
    fontSize: 13,
    fontWeight: 600,
  },
});
