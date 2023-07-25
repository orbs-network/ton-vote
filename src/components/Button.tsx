import { CircularProgress, Fade, styled } from "@mui/material";
import { Box } from "@mui/system";
import { MOBILE_WIDTH } from "consts";
import { ReactNode } from "react";
import { StyledFlexRow } from "styles";

type Variant = "transparent" | "text";
interface Props {
  children: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  onClick?: (e: any) => void;
  variant?: Variant;
  id?: string;
}

function Button({
  children,
  disabled = false,
  isLoading,
  className = "",
  onClick,
  variant,
  id,
}: Props) {
  const content = (
    <>
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
    </>
  );

  const args = {
    id,
    onClick,
    disabled: disabled || !!isLoading,
    className: `${className} button`,
  };

  if (variant === "text") {
    return <StyledTextButton {...args}>{content}</StyledTextButton>;
  }

  if (variant === "transparent") {
    return (
      <StyledTransparentButton {...args}>{content}</StyledTransparentButton>
    );
  }

  return <StyledBtn {...args}>{content}</StyledBtn>;
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

const StyledBaseButton = styled("button")<{
  disabled: boolean;
}>(({ theme, disabled }) => {
  return {
    padding: "0px 16px",
    opacity: disabled ? 0.7 : 1,
    pointerEvents: disabled ? "none" : "all",
    cursor: "pointer",
    position: "relative",
    transition: "0.3s all",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: theme.typography.fontFamily,
    "*, p": {
      fontSize: "inherit",
      fontWeight: "inherit",
      fontFamily: "inherit",
    },
  };
});

const StyledTransparentButton = styled(StyledBaseButton)(({ theme }) => {
  return {
    height: 44,
    borderRadius: 40,
    background: "transparent",
    border: `1px solid ${theme.palette.primary.main}`,
    "*, p": {
      color: theme.palette.primary.main,
    },

    [`@media (min-width: ${MOBILE_WIDTH}px)`]: {
      "&:hover": {
        background: "#00A6FF",
        "*, p": {
          color: "white",
        },
      },
    },
  };
});

const StyledTextButton = styled(StyledBaseButton)(({ theme }) => ({
  background: "transparent",
  border: "unset",
  padding: 0,
  borderBottom: "2px solid transparent",
  "*, p": {
    color: theme.palette.primary.main,
  },
  [`@media (min-width: ${MOBILE_WIDTH}px)`]: {
    "&:hover": {
      borderBottom: `2px solid ${theme.palette.primary.main}`,
    },
  },
}));

const StyledBtn = styled(StyledBaseButton)<{
  variant?: Variant;
}>(({ theme }) => {
  return {
    height: 44,
    borderRadius: 40,
    background: theme.palette.primary.main,
    border: "1px solid transparent",
    "*, p": {
      color: "white",
    },
    [`@media (min-width: ${MOBILE_WIDTH}px)`]: {
      "&:hover": {
        background: "#00A6FF",
        "*, p": {
          color: "white",
        },
      },
    },
  };
});
