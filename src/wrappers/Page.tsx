import { styled } from "@mui/material";
import { Back } from "components";
import { useCurrentRoute } from "hooks/hooks";
import { useCallback, useEffect } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { PageProps } from "types";
import twa from '@twa-dev/sdk'
import { useNavigate } from "react-router-dom";
import { useTwaStore } from "store";

function Page({
  children,
  className = "",
  back,
  headerComponent,
  hideBack = false,
  backFunc,
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

  return (
    <StyledContainer className={className}>
      {!hideBack && (
        <StyledTop justifyContent="space-between">
          {!isTwa && <Back func={backFunc} to={back} />}
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
