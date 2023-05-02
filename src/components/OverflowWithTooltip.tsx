import { Box, styled, Typography } from "@mui/material";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { AppTooltip } from "./Tooltip";
import TextOverflow from "react-text-overflow";
import { TooltipPlacement } from "types";

export function OverflowWithTooltip({
  text = "",
  className = "",
  placement,
}: {
  text?: string;
  className?: string;
  placement?: TooltipPlacement;
}) {
  const textRef = useRef<any>();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (textRef && textRef.current) {
      if (
        textRef.current.clientWidth > textRef.current.parentElement.clientWidth
      ) {
        setShow(true);
      }
    }
  }, []);

  return (
    <>
      <StyledPlaceholder ref={textRef}>
        <Typography className={className}>{text}</Typography>
      </StyledPlaceholder>
      <StyledTooltip placement={placement} text={show ? text : undefined}>
        <Typography className={className}>
          <TextOverflow text={text} />
        </Typography>
      </StyledTooltip>
    </>
  );
}

const StyledPlaceholder = styled(Box)({
  whiteSpace: "nowrap",
  position: "fixed",
  visibility: "hidden",
});

const StyledTooltip = styled(AppTooltip)({
  width: "100%",
  display: "flex",
  justifyContent: "flex-start",
});
