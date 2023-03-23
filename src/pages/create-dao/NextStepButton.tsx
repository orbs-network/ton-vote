import { styled } from "@mui/material";
import { Button } from "components";
import React, { ReactNode } from "react";

function NextStepButton({
  children,
}: {
  children: ReactNode;
}) {

  return <StyledButton>{children}</StyledButton>;
}

export { NextStepButton };

const StyledButton = styled(Button)({
  width: "100%",
  height: 40,
});
