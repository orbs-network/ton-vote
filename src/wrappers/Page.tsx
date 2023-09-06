import { Fade, styled, Typography } from "@mui/material";
import { Back, ErrorContainer } from "components";
import { MOBILE_WIDTH } from "consts";
import { useEffect } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { PageProps } from "types";
import { Webapp } from "WebApp";

function Page({
  children,
  className = "",
  back,
  headerComponent,
  hideBack = false,
  backFunc,
  title,
  error,
  errorText = "Something went wrong",
}: PageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hideTop = !title && !headerComponent && hideBack;

  if (error) {
    return (
      <StyledContainer className={className}>
        <ErrorContainer text={errorText} />
      </StyledContainer>
    );
  }

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
      {Webapp.isEnabled && <StyledTWAShadow />}
    </StyledContainer>
  );
}

export { Page };

const StyledTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: 22,
  paddingLeft: 0,
});

const StyledTop = styled(StyledFlexRow)({
  marginBottom: Webapp.isEnabled ? 0 :  20,
});

const StyledContainer = styled(StyledFlexColumn)({
  flex: 1,
  display: "flex",
  position: "relative",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: 0,
  paddingBottom: 100,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    paddingBottom: 40,
  },
});

const StyledTWAShadow = styled("div")(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  height: 2,
  zIndex: 10,
  background:
    theme.palette.mode === "dark"
      ? "rgba(255,255,255, 0.2)"
      : "#e0e0e0",
}));
