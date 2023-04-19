import { Box, styled } from "@mui/material";
import React from "react";
import ReactMarkdown from "react-markdown";

export function Markdown({
  children = "",
  className = "",
}: {
  children?: string;
  className?: string;
}) {
  return (
    <StyledMarkdown className={className}>
      <ReactMarkdown linkTarget="_blank">
        {children}
      </ReactMarkdown>
    </StyledMarkdown>
  );
}



export const StyledMarkdown = styled(Box)({
  img: {
    maxWidth: "100%",
    marginTop: 10,
  },
  "*": {
    margin: 0,
    marginBottom: 5,
    "&:last-child": {
      marginBottom: 0,
    },
  },
  p: {
    fontSize: 16
  },
  h2: {
    fontSize: 20,
  },
  h3: {
    fontSize: 19,
  },
  h4: {
    fontSize: 17,
  },
});