import { Box, Fade, styled } from "@mui/material";
import React, { useState } from "react";
import { StyledSkeletonLoader } from "styles";

export function Img({
  src,
  className = "",
}: {
  src?: string;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const showPlaceholder = error ? true : isLoading ? false : !src

  if (showPlaceholder) {
    return (
      <StyledContainer className={`${className} img`}>
        <StyledNoSrc />
      </StyledContainer>
    );
  }
  return (
    <StyledContainer className={`${className} img`}>
      <Fade in={!isLoading}>
        <StyledImg
          onError={() => setError(true)}
          src={src}
          onLoad={() => setIsLoading(false)}
        />
      </Fade>
      <Fade in={isLoading}>
        <StyledLoader />
      </Fade>
    </StyledContainer>
  );
}

const StyledNoSrc = styled(Box)({
  width: "100",
  height: "100%",
  background: "rgba(211, 211, 211, 0.6)",
});

const StyledImg = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  position: "absolute",
  left: 0,
  top: 0,
});

const StyledLoader = styled(StyledSkeletonLoader)({
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
});

const StyledContainer = styled(Box)({
  position: "relative",
  overflow: "hidden",
});
