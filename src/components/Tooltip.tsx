import * as React from "react";
import Tooltip from "@mui/material/Tooltip";
import { styled, Typography } from "@mui/material";
import { Box } from "@mui/system";
export function AppTooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: React.ReactNode;
}) {
  return (
    <StyledTooltip
      arrow={true}
      followCursor={true}
      title={<StyledTitle>{text}</StyledTitle>}
    >
      <Box className="tooltip-children">
        {children}
      </Box>
    </StyledTooltip>
  );
}


const StyledTitle = styled(Box)({
  fontSize: 14,
  fontWeight: 600,
  color: "rgb(114, 138, 150)",
  "*": {
    fontSize: 14,
    fontWeight: 600,
    color: "rgb(114, 138, 150)",
  },
});


const StyledTooltip = styled(Tooltip)({
 
});