import { Box, styled, Typography } from "@mui/material";
import { routes } from "consts";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { StyledFlexRow } from "styles";
import { BackButton } from "@twa-dev/sdk/react";
import { Button } from "./Button";
import { Webapp } from "WebApp";

function Back({ back }: { back?: () => void }) {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const t = useCommonTranslations();
  const onClick = () => {
    if (back) {
      back();
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(routes.spaces, { replace: true }); // the current entry in the history stack will be replaced with the new one with { replace: true }
    }
  };

  if (pathname === routes.spaces) return null;

  if (Webapp.isEnabled) {
    return <BackButton onClick={onClick} />;
  }
  return (
    <StyledButton onClick={onClick}>
      <StyledFlexRow gap={5}>
        <HiOutlineArrowLeft />
        <Typography>{t.back}</Typography>
      </StyledFlexRow>
    </StyledButton>
  );
}

export { Back };

const StyledButton = styled(Button)({
  cursor: "pointer",
  padding: "6px 12px",
  height: "auto",
  borderRadius: 20,
  p: {
    fontSize: 13,
    fontWeight: 600,
  },
});
