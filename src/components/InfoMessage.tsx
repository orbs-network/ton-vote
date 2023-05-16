import { Box, styled } from "@mui/material";
import React from "react";

import { Markdown } from "./Markdown";

export function InfoMessage({ message }: { message: string }) {
  const value = `${message}` as any;
  return (
    <StyledContainer>
      <Markdown>{value}</Markdown>
    </StyledContainer>
  );
}

const StyledContainer = styled(Box)({
  padding: 15,
  borderRadius: 10,
   border: "1px solid rgba(0,0,0,0.3)",
   "p": {
    fontSize: 16,
    fontWeight:600
   }
})
