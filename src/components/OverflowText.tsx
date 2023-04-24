import { styled, Typography } from "@mui/material";
import _ from "lodash";
import React from "react";
import { StyledFlexRow, textOverflow } from "styles";
import { AppTooltip } from "./Tooltip";

export function OverflowText({
  value = "",
  limit,
  className = "",
}: {
  value?: string;
  limit: number;
  className?: string;
}) {
  const charsLength = _.size(value);
  if (charsLength > limit) {
    return (
      <StyledTooltip text={value}>
        <Typography  className={className}>
          {value}
        </Typography>
      </StyledTooltip>
    );
  }
  return (
    <Typography  className={className}>
      {value}
    </Typography>
  );
}

const StyledTooltip = styled(AppTooltip)({
  width: "100%",
  display: "flex",
  justifyContent: "flex-start",
  p: {
    ...textOverflow,
  },
});

