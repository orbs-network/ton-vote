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
    marginBottom: 5,
    "&:last-child": {
      marginBottom: 0,
    },
  },
  p: {
    fontSize: 16,
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
  a: {
    color: theme.palette.primary.main,
  }
}));
