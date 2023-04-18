import * as React from "react";
import Tooltip from "@mui/material/Tooltip";
import { styled, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { StyledFlexRow } from "styles";
export function AppTooltip({
  children,
  className = "",
  text,
  placement = "bottom",
  info,
}: {
  info?: boolean;
  children?: React.ReactNode;
  text: React.ReactNode;
  className?: string;
  placement?:
    | "bottom"
    | "left"
    | "right"
    | "top"
    | "bottom-end"
    | "bottom-start"
    | "left-end"
    | "left-start"
    | "right-end"
    | "right-start"
    | "top-end"
    | "top-start";
}) {
  return (
    <StyledTooltip
      arrow={true}
      placement={placement}
      title={<StyledTitle>{text}</StyledTitle>}
    >
      {!info ? (
        <Box className={`tooltip-children ${className}`}>{children}</Box>
      ) : (
        <StyledFlexRow style={{ width: "unset" }}>
          <AiOutlineInfoCircle />{" "}
        </StyledFlexRow>
      )}
    </StyledTooltip>
  );
}

const StyledTitle = styled(Typography)({
  fontSize: 14,
  fontWeight: 600,
  color: "rgb(114, 138, 150)",
});

const StyledTooltip = styled(Tooltip)({});
