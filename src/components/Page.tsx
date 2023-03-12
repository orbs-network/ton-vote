import { Fade, styled } from "@mui/material";
import React, { ReactNode, useEffect } from "react";
import { StyledFlexColumn } from "styles";

function Page({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {

    useEffect(() => {
      window.scrollTo(0,0)
    }, [])
    
  return (
    <Fade in={true}>
      <StyledContainer className={className}>{children}</StyledContainer>
    </Fade>
  );
}

export { Page };

const StyledContainer = styled(StyledFlexColumn)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  position: "relative",
});
