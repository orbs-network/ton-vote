import { CircularProgress, Fade, styled } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { ReactNode } from "react";
import { StyledFlexRow } from "styles";

interface Props {
  children: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  onClick?: (e: any) => void;
}

function Button({
  children,
  disabled = false,
  isLoading,
  className = "",
  onClick,
}: Props) {
  return (
    <StyledContainer
      onClick={onClick}
      disabled={disabled || !!isLoading}
      className={`${className} button`}
    >
      <Fade in={isLoading}>
        <StyledLoader>
          <CircularProgress
            className="loader"
            style={{ width: 30, height: 30 }}
          />
        </StyledLoader>
      </Fade>
      <Fade in={!isLoading}>
        <StyledChildren className="children">{children}</StyledChildren>
      </Fade>
    </StyledContainer>
  );
}

export { Button };

const StyledLoader = styled(Box)({
  position: "absolute",
  left: "50%",
  top: "55%",
  transform: "translate(-50%, -50%)",
});

const StyledChildren = styled(StyledFlexRow)({
  gap: 5,
});

const StyledContainer = styled("button")<{ disabled: boolean }>(
  ({ theme, disabled }) => ({
    width: "fit-content",
    height: 44,
    borderRadius: 40,
    opacity: disabled ? 0.7 : 1,
    pointerEvents: disabled ? "none" : "all",
    background: theme.palette.primary.main,
    border: "unset",
    cursor: "pointer",
    position: "relative",
    padding: '0px 16px',
    transition:'0.3s all',
    "*": {
      color: "white",
      fontSize: 16,
      fontWeight: 700,
      fontFamily: theme.typography.fontFamily,
    },
  })
);
