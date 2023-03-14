import { Fade, styled } from "@mui/material";
import React, { ReactNode } from "react";
import { StyledFlexColumn } from "styles";
import { Back } from "./Back";

function Page({
  children,
  className = "",
  back,
}: {
  children: ReactNode;
  className?: string;
  back?: string;
}) {
  return (
    <Fade in={true}>
      <StyledContainer className={className}>
        <Back to={back} />
        {children}
      </StyledContainer>
    </Fade>
  );
}

export { Page };

const StyledContainer = styled(StyledFlexColumn)({
  flex: 1,
  display: "flex",
  position: "relative",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: 0,
});
