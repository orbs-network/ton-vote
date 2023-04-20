import * as React from "react";
import Tooltip from "@mui/material/Tooltip";
import { styled, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { StyledFlexRow } from "styles";
import { Markdown } from "./Markdown";
export function AppTooltip({
  children,
  className = "",
  text = '',
  placement = "bottom",
  info,
  markdown = "",
}: {
  info?: boolean;
  children?: React.ReactNode;
  text?: React.ReactNode;
  className?: string;
  markdown?: string;
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
      title={markdown ? <StyledMarkdown>{markdown}</StyledMarkdown> : <StyledTitle>{text}</StyledTitle>}
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

const StyledMarkdown = styled(Markdown)({
  "p": {
    fontSize: 14,
    fontWeight: 600,
    color: "rgb(114, 138, 150)",
  },
  a: {
    
  }
});

const StyledTooltip = styled(Tooltip)({
  "& .MuiTooltip-tooltip": {
    color:'black'
  }
});
