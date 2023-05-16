import { styled, Typography } from "@mui/material";
import { routes } from "consts";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useLocation, useNavigate, useNavigation } from "react-router-dom";
import { StyledFlexRow } from "styles";
import { Button } from "./Button";

function Back({ to, func }: { to?: string; func?: () => void }) {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
const t = useCommonTranslations()
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
  return (
    <StyledContainer onClick={onClick} variant="transparent">
      <StyledFlexRow gap={5}>
        <HiOutlineArrowLeft />
        <Typography>{t.back}</Typography>
      </StyledFlexRow>
    </StyledContainer>
  );
}

export { Back };

const StyledContainer = styled(Button)({
  padding:'8px 14px',
  height:'auto',
  p: {
    fontSize: 14,
  },
});
