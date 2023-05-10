import { Box, styled } from "@mui/material";
import React, { ReactNode } from "react";
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
    return hover ? (
      <StyledHoverContainer
        onClick={onClick}
        className={className}
        ref={ref}
      >
        {children}
      </StyledHoverContainer>
    ) : (
      <StyledContainer
        onClick={onClick}
        className={className}
        ref={ref}
      >
        {children}
      </StyledContainer>
    );
  }
);


