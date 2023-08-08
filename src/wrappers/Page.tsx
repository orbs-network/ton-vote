import { Fade, styled, Typography } from "@mui/material";
import { Back, ErrorContainer } from "components";
import { useCallback, useEffect } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { PageProps } from "types";
import twa from '@twa-dev/sdk'
import { useNavigate } from "react-router-dom";
import { useTwaStore } from "store";
import { useCurrentRoute } from "hooks/hooks";

function Page({
  children,
  className = "",
  back,
  headerComponent,
  hideBack = false,
  backFunc,
  title,
  error,
  errorText = 'Something went wrong',
}: PageProps) {

  const route = useCurrentRoute()
  const navigate = useNavigate()
  const { isTwa } = useTwaStore()

  const goBack = useCallback(() => {
    navigate(-1)
  }, [])

  useEffect(() => {
    if (route === '/') {
      twa.BackButton.hide()
      return
    }

    twa.BackButton.onClick(goBack)
    twa.BackButton.show()

    return () => {
      twa.BackButton.offClick(goBack)
      twa.BackButton.hide()
    }
  }, [route]);


  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
            {!hideBack && !isTwa && <Back func={backFunc} to={back} />}
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
  fontWeight: 700,
  fontSize: 22,
  paddingLeft: 0
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
