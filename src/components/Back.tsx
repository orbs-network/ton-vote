import { styled, Typography } from "@mui/material";
import { routes } from "consts";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { StyledFlexRow } from "styles";

function Back({ to }: { to?: string }) {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

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
      <Typography>Back</Typography>
    </StyledContainer>
  );
}

export { Back };

const StyledContainer = styled(StyledFlexRow)({
  justifyContent: "flex-start",
  marginBottom: 20,
  cursor: "pointer",
  width: "fit-content",
});
