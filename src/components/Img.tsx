import { Box, Fade, styled } from "@mui/material";
import React, { useState } from "react";
import { StyledSkeletonLoader } from "styles";

function Img({ src, className = "" }: { src?: string; className?: string }) {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <StyledContainer className={className}>
      <Fade in={!isLoading}>
        <StyledImg src={src} onLoad={() => setIsLoading(false)} />
      </Fade>
      <Fade in={isLoading}>
        <StyledLoader />
      </Fade>
    </StyledContainer>
  );
}

export default Img;

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
  overflow:'hidden'
});
