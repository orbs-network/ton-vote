import * as React from "react";
import Tooltip from "@mui/material/Tooltip";
import { styled, Typography } from "@mui/material";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { StyledFlexRow } from "styles";
import { Markdown } from "./Markdown";
import { TooltipPlacement } from "types";
export function AppTooltip({
  children,
  className = "",
  text = "",
  placement = "bottom",
  info,
  markdown = "",
}: {
  info?: boolean;
  children?: React.ReactNode;
  text?: React.ReactNode;
  className?: string;
  markdown?: string;
  placement?: TooltipPlacement;
}) {
  const [open, setOpen] = React.useState(false)
  if (!text && !markdown) {
    return <>{children}</>;
  }
  return (
    <StyledTooltip
      arrow={true}
      placement={placement}
      onClick={() => setOpen(true)}
      title={
        markdown ? (
          <StyledMarkdown>{markdown}</StyledMarkdown>
        ) : (
          <StyledTitle>{text}</StyledTitle>
        )
      }
    >
      {!info ? (
        <div
          className={`tooltip-children ${className}`}
          style={{ display: "flex", alignItems: "center" }}
        >
          {children}
        </div>
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
});

const StyledMarkdown = styled(Markdown)({
  "p": {
    fontSize: 14,
    fontWeight: 600,
  },
  a: {
    
  }
});

const StyledTooltip = styled(Tooltip)({
  "& .MuiTooltip-tooltip": {
   
  },
});
