import { CircularProgress, styled } from "@mui/material";
import React, { useEffect } from "react";
import { useIntersectionObserver } from "react-intersection-observer-hook";
import { StyledFlexRow } from "styles";
import { Button } from "./Button";

function LoadMore({
  showMore,
  loadMoreOnScroll,
  isFetchingNextPage,
  hide,
}: {
  showMore: () => void;
  loadMoreOnScroll: boolean;
  isFetchingNextPage: boolean;
  hide: boolean;
}) {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;

  useEffect(() => {
    if (isVisible) {
      showMore();
    }
  }, [isVisible]);

  if (hide) {
    return null;
  }
  if (isFetchingNextPage) {
    return (
      <StyledContainer>
        <StyledSpinner style={{width:45, height:45}} />
      </StyledContainer>
    );
  }

  if (loadMoreOnScroll) {
    return <div ref={ref}></div>;
  }
  return (
    <StyledContainer>
      <StyledButton onClick={showMore}>Load more</StyledButton>
    </StyledContainer>
  );
}

export { LoadMore };

const StyledButton = styled(Button)({
  minWidth: 170
});

const StyledContainer = styled(StyledFlexRow)({
  marginTop: 50,
  marginBottom: 50,
})

const StyledSpinner = styled(CircularProgress)({

});
