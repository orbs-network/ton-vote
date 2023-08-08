import { Box, styled } from "@mui/material";
import React, { ReactNode } from "react";
import { isMobile } from "react-device-detect";
import {
  StyledContainer, StyledHoverContainer,
} from "styles";

export const Container = React.forwardRef(
  (
    {
      children,
      className = "",
      onClick,
      hover = false,
    }: {
      children?: ReactNode;
      className?: string;
      onClick?: () => void;
      hover?: boolean;
    },
    ref: any
  ) => {
    return !isMobile && hover ? (
      <StyledHoverContainer
        onClick={onClick}
        className={`${className} container`}
        ref={ref}
      >
        {children}
      </StyledHoverContainer>
    ) : (
      <StyledContainer
        onClick={onClick}
        className={`${className} container`}
        ref={ref}
      >
        {children}
      </StyledContainer>
    );
  }
);


