import { styled } from "@mui/material";
import { LoadingContainer } from "components";
import { useMobile } from "hooks/hooks";
import { StyledDao } from "pages/daos/styles";
import { StyledFlexColumn, StyledFlexRow } from "styles";

export const PageFallback = () => {
  return (
    <StyledContainer>
      <LoadingContainer loaderAmount={5} />
    </StyledContainer>
  );
};

export const DaoPageFallback = () => {
  const mobile = useMobile();
  return (
    <StyledContainer>
      <StyledFlexRow gap={20}>
        {!mobile && <StyledLeft loaderAmount={5} />}
        <StyledRight loaderAmount={5} />
      </StyledFlexRow>
    </StyledContainer>
  );
};


export const DaosPageFallback = () => {
  return (
    <StyledContainer>
      <StyledDao>
        <StyledDaoLoader />
      </StyledDao>
    </StyledContainer>
  );
};


const StyledDaoLoader = styled(LoadingContainer)({
    width: '100%',
    height: '100%'
})

const StyledLeft = styled(LoadingContainer)({
  width: 300,
});

const StyledRight = styled(LoadingContainer)({
  flex: 1,
  width: "auto",
});

const StyledContainer = styled(StyledFlexColumn)({
  height: "100vh",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  paddingTop: 20
});
