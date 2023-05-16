import { Box, Fade, styled } from "@mui/material";
import React, { ReactNode } from "react";
import { StyledSkeletonLoader } from "styles";
import { FadeElement } from "./FadeElement";

interface Props {
  isLoading: boolean;
  className?: string;
  component: ReactNode;
  loader?: ReactNode;
}

function Loader({ component, isLoading, className = "", loader }: Props) {
  if (isLoading) {
    return loader ? (
      <>{loader}</>
    ) : (
      <Fade in={true}>
        <StyledSkeletonLoader className={className} />
      </Fade>
    );
  }
  return <>{component}</>;
}

export { Loader };
