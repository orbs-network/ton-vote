import { Fade, styled } from "@mui/material";
import { Back } from "components";
import { useEffect } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { PageProps } from "types";

function Page({
  children,
  className = "",
  back,
  headerComponent,
  hideBack = false,
  backFunc,
}: PageProps) {

  useEffect(() => {
    window.scrollTo(0,0)
  }, [])
  
  return (
    <StyledContainer className={className}>
      {!hideBack && (
        <StyledTop justifyContent="space-between">
          <Back func={backFunc} to={back} />
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
