import { Box, styled } from "@mui/material";
import React, { forwardRef } from "react";
import ReactMarkdown from "react-markdown";

 export const Markdown = React.forwardRef(
   (
     { children = "", className }: { children?: string; className?: string },
     ref: any
   ) => (
     <StyledMarkdown
       className={className}
       ref={ref}
     >
       <ReactMarkdown linkTarget="_blank">{children}</ReactMarkdown>
     </StyledMarkdown>
   )
 );




export const StyledMarkdown = styled(Box)(({ theme }) => ({
  img: {
    maxWidth: "100%",
    marginTop: 10,
  },
  "*": {
    margin: 0,
    marginBottom: 15,
    "&:last-child": {
      marginBottom: 0,
    },
  },
  p: {
    fontSize: 16,
  },
  h1: {
    fontSize: 20,
    lineHeight: "24px",
  },
  h2: {
    fontSize: 18,
    lineHeight: "22px",
  },
  h3: {
    fontSize: 16,
  },
  h4: {
    fontSize: 16,
  },
  a: {
    color: theme.palette.primary.main,
  },
}));
