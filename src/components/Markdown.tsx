import { Box, styled } from "@mui/material";
import {  useRef } from "react";
import { marked } from "marked";

export const Markdown = ({
  children = "",
  className,
}: {
  children?: string;
  className?: string;
}) => {

  const ref = useRef<HTMLDivElement>();

  return (
    <StyledMarkdown
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: marked.parse(children) }}
    />
  );
};

export const StyledMarkdown = styled(Box)(({ theme }) => ({
  img: {
    maxWidth: "100%",
    marginTop: 10,
  },

  "*": {
    wordBreak: "break-word",
    color: theme.palette.text.primary,
    margin: 0,
    marginBottom: 15,
    "&:last-child": {
      marginBottom: 0,
    },
  },
  iframe: {
    width: "100%",
    maxHeight: 350,
    height: "30vw",
    minHeight: 200,
  },
  video: {
    width: "100%",
    maxHeight: 350,
    height: "30vw",
    minHeight: 200,
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


