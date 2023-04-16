import { CircularProgress, styled } from "@mui/material";
import _ from "lodash";
import React, { useEffect } from "react";
import { useIntersectionObserver } from "react-intersection-observer-hook";
import { StyledFlexRow } from "styles";
import { Button } from "./Button";

function LoadMore({
  limit,
  showMore,
  totalItems,
  amountToShow,
}: {
  limit: number;
  totalItems: number;
  showMore: () => void;
  amountToShow: number;
}) {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;


  useEffect(() => {
    if (isVisible) {
      showMore();
    }
  }, [isVisible]);

  if (amountToShow >= totalItems) {
    return null;
  }

  if (amountToShow !== limit) {
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
  minWidth: 170,
});

const StyledContainer = styled(StyledFlexRow)({
  marginTop: 50,
  marginBottom: 50,
});

