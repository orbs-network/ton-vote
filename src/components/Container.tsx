import { Box, styled } from "@mui/material";
import React, { ReactNode } from "react";
import {
  StyledContainer,
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
    return (
      <StyledContainer
        onClick={onClick}
        className={className}
        ref={ref}
        hover={hover ? 1 : 0}
      >
        {children}
      </StyledContainer>
    );
  }
);


