import { useMobile } from "hooks/hooks";
import React, { CSSProperties, ReactNode } from "react";
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
      style = {},
    }: {
      children?: ReactNode;
      className?: string;
      onClick?: () => void;
      hover?: boolean;
      style?: CSSProperties;
    },
    ref: any
  ) => {
    const isMobile = useMobile()
    return !isMobile && hover ? (
      <StyledHoverContainer
        onClick={onClick}
        style={style}
        className={`${className} container`}
        ref={ref}
      >
        {children}
      </StyledHoverContainer>
    ) : (
      <StyledContainer
        style={style}
        onClick={onClick}
        className={`${className} container`}
        ref={ref}
      >
        {children}
      </StyledContainer>
    );
  }
);


