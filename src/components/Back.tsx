import { styled, Typography } from "@mui/material";
import { routes } from "consts";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useLocation, useNavigate, useNavigation } from "react-router-dom";
import { StyledFlexRow } from "styles";

function Back({ to }: { to?: string }) {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const { t } = useTranslation();

  const onClick = () => {
    if (to) {
      navigate(to);
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(routes.spaces, { replace: true }); // the current entry in the history stack will be replaced with the new one with { replace: true }
    }
  };

  if (pathname === routes.spaces) return null;
  return (
    <StyledContainer onClick={onClick}>
      <HiOutlineArrowLeft />
      <Typography>{t("back")}</Typography>
    </StyledContainer>
  );
}

export { Back };

const StyledContainer = styled(StyledFlexRow)({
  justifyContent: "flex-start",
  cursor: "pointer",
  width: "fit-content",
  borderBottom: "1px solid transparent",
  transition: "0.2s all",
  p: {
    color: "black",
  },
  svg: {
    color: "black",
  },
  ":hover": {
    borderBottom: "1px solid black",
  },
});
