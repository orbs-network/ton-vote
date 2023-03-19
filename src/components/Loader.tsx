import { Box, Fade, styled } from "@mui/material";
import React, { ReactNode } from "react";
import { StyledSkeletonLoader } from "styles";
import { FadeElement } from "./FadeElement";

interface Props {
  isLoading: boolean;
  className?: string;
  component: ReactNode;
}

function Loader({ component, isLoading, className = "" }: Props) {
  if (isLoading) {
    return (
      <Fade in={true}>
        <StyledSkeletonLoader className={className} />
      </Fade>
    );
  }
  return <FadeElement show={!isLoading}>{component}</FadeElement>;
}

export { Loader };

