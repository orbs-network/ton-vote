import { Box, styled } from "@mui/material";
import { useEffect, useRef } from "react";
import { marked } from "marked";

const linkTarget = "_blank";
const linkRel = "noopener noreferrer";

const markdownRenderer = new marked.Renderer();
const defaultRenderer = new marked.Renderer();

markdownRenderer.link = (href, title, text) => {
  return defaultRenderer
    .link(href, title, text)
    .replace("<a ", `<a target="${linkTarget}" rel="${linkRel}" `);
};

export const Markdown = ({
  children = "",
  className,
}: {
  children?: string;
  className?: string;
}) => {

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const links = ref.current?.querySelectorAll("a[href]");

    links?.forEach((link) => {
      link.setAttribute("target", linkTarget);
      link.setAttribute("rel", linkRel);
    });
  }, [children]);

  return (
    <StyledMarkdown
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{
        __html: marked.parse(children, { renderer: markdownRenderer }),
      }}
    />
  );
};

export const StyledMarkdown = styled(Box)(({ theme }) => {
  const textColor =
    theme.palette.mode === "light" ? "black" : theme.palette.text.primary;

  return {
    color: textColor,
    img: {
      maxWidth: "100%",
      marginTop: 10,
    },

    "*": {
      wordBreak: "break-word",
      color: textColor,
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
    "p, li": {
      fontSize: 16,
      color: textColor,
    },
    "strong, em": {
      color: textColor,
    },
    h1: {
      color: textColor,
      fontSize: 20,
      lineHeight: "24px",
    },
    h2: {
      color: textColor,
      fontSize: 18,
      lineHeight: "22px",
    },
    h3: {
      color: textColor,
      fontSize: 16,
    },
    h4: {
      color: textColor,
      fontSize: 16,
    },
    a: {
      color: theme.palette.primary.main,
    },
  };
});
