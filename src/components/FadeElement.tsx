import { Fade } from "@mui/material";
import React, { ReactNode } from "react";

function FadeElement({
  show = true,
  children,
}: {
  show?: boolean;
  children: ReactNode;
}) {
  return (
    <Fade in={show}>
      <span style={{width:'100%'}}>{children}</span>
    </Fade>
  );
}

export { FadeElement };
