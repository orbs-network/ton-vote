import { CircularProgress, Fade, styled } from "@mui/material";
import { Box } from "@mui/system";
import { MOBILE_WIDTH } from "consts";
import { ReactNode } from "react";
import { StyledFlexRow } from "styles";

type Variant = "transparent";
interface Props {
  children: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  onClick?: (e: any) => void;
  variant?: Variant;
}

function Button({
  children,
  disabled = false,
  isLoading,
  className = "",
  onClick,
  variant,
}: Props) {
  return (
    <StyledContainer
      onClick={onClick}
      disabled={disabled || !!isLoading}
      className={`${className} button`}
      variant={variant}
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

const StyledContainer = styled("button")<{
  disabled: boolean;
  variant?: Variant;
}>(({ theme, disabled, variant }) => ({
  width: "fit-content",
  height: 44,
  borderRadius: 40,
  opacity: disabled ? 0.7 : 1,
  pointerEvents: disabled ? "none" : "all",
  background:
    variant === "transparent" ? "transparent" : theme.palette.primary.main,
  border:
    variant === "transparent"
      ? `1px solid ${theme.palette.primary.main}`
      : "1px solid transparent",
  cursor: "pointer",
  position: "relative",
  padding: "0px 16px",
  transition: "0.3s all",
  "*, p": {
    color: variant === "transparent" ? theme.palette.primary.main : "white",
    fontSize: 16,
    fontWeight: 700,
    fontFamily: theme.typography.fontFamily,
  },

  [`@media (min-width: ${MOBILE_WIDTH}px)`]: {
    "&:hover": {
      border:
        variant === "transparent"
          ? "1px solid transparent"
          : `1px solid ${theme.palette.primary.main}`,
      background:
        variant === "transparent" ? theme.palette.primary.main : "transparent",
      "*": {
        color: variant === "transparent" ? "white" : theme.palette.primary.main,
      },
    },
  },
}));
