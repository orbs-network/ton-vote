import { styled } from "@mui/material";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
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
  className = "",
  infiniteScroll = false,
}: {
  limit: number;
  totalItems: number;
  showMore: () => void;
  amountToShow: number;
  className?: string;
  infiniteScroll?: boolean;
}) {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;
  const t = useCommonTranslations();
  useEffect(() => {
    if (isVisible) {
      showMore();
    }
  }, [isVisible]);

  if (amountToShow >= totalItems) {
    return null;
  }

  if (infiniteScroll || amountToShow !== limit) {
    return <div ref={ref}></div>;
  }
  return (
    <StyledContainer className={className}>
      <StyledButton onClick={showMore}>{t.loadMore}</StyledButton>
    </StyledContainer>
  );
}

export { LoadMore };

const StyledButton = styled(Button)({
  width: "100%",
});

const StyledContainer = styled(StyledFlexRow)({
});
