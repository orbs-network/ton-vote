import { Fade, styled } from "@mui/material";
import { useConnection } from "ConnectionProvider";
import React, { ReactNode } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Back } from "./Back";

function Page({
  children,
  className = "",
  back,
  headerComponent,
  hideBack = false,
}: {
  children: ReactNode;
  className?: string;
  back?: string;
  headerComponent?: ReactNode;
  hideBack?: boolean;
  isProtected?: boolean;
}) {


  return (
    <StyledContainer className={className}>
      {!hideBack && (
        <StyledTop justifyContent="space-between">
          <Back to={back} />
          {headerComponent}
        </StyledTop>
      )}
      {children}
    </StyledContainer>
  );
}

export { Page };

const StyledTop = styled(StyledFlexRow)({
  marginBottom: 15,
});

const StyledContainer = styled(StyledFlexColumn)({
  flex: 1,
  display: "flex",
  position: "relative",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: 0,
});
