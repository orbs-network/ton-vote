import { styled, Typography } from "@mui/material";
import React from "react";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useLocation, useMatch, useMatches, useNavigate } from "react-router-dom";
import { routes } from "router";
import { StyledFlexRow } from "styles";

function Back() {
  const navigate = useNavigate();
    const pathname = useLocation().pathname;

    
  const onClick = () => {
   if (window.history.state && window.history.state.idx > 0) {
     navigate(-1);
   } else {
     navigate(routes.spaces, { replace: true }); // the current entry in the history stack will be replaced with the new one with { replace: true }
   }
  }

  if (pathname === routes.spaces) return null
    return (
      <StyledContainer onClick={onClick}>
        <HiOutlineArrowLeft />
        <Typography>Back</Typography>
      </StyledContainer>
    );
}

export { Back };

const StyledContainer = styled(StyledFlexRow)({
    justifyContent:'flex-start',
    marginBottom: 20,
    cursor:'pointer',
});
