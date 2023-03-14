import { CircularProgress, styled } from "@mui/material";
import React, { useEffect } from "react";
import { useIntersectionObserver } from "react-intersection-observer-hook";
import { Button } from "./Button";

function LoadMore({
  fetchNextPage,
  loadMoreOnScroll,
  isFetchingNextPage,
  hide,
}: {
  fetchNextPage: () => void;
  loadMoreOnScroll: boolean;
  isFetchingNextPage: boolean;
  hide: boolean;
}) {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;

  useEffect(() => {
    if (isVisible) {
      fetchNextPage();
    }
  }, [isVisible]);


  if (hide) {
    return null
  }
    if (isFetchingNextPage) {
      return <StyledSpinner />;
    }

  if (loadMoreOnScroll) {
    return <div ref={ref}></div>;
  }
  return <Button onClick={fetchNextPage}>Load more</Button>;
}

export { LoadMore };

const StyledSpinner = styled(CircularProgress)({});
