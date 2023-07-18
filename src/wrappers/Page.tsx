import { Fade, styled, Typography } from "@mui/material";
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
  title,
}: PageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hideTop = !title && !headerComponent && hideBack;

  return (
    <StyledContainer className={className}>
      {!hideTop && (
        <StyledTop justifyContent="space-between">
          <StyledFlexRow style={{ width: "auto" }}>
            {!hideBack && <Back func={backFunc} to={back} />}
            <StyledTitle>{title}</StyledTitle>
          </StyledFlexRow>
          {headerComponent}
        </StyledTop>
      )}

      {children}
    </StyledContainer>
  );
}

export { Page };

const StyledTitle = styled(Typography)({
  fontWeight: 600,
  fontSize: 24,
});

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
