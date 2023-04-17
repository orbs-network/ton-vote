import { Link as MuiLink, styled, Typography, useTheme } from "@mui/material";
import React, { HTMLAttributeAnchorTarget, ReactNode } from "react";
import {BiLinkExternal} from 'react-icons/bi'
import { textOverflow } from "styles";

export function Link({
  children,
  href,
  target = "_blank",
  className = "",
}: {
  href: string;
  children: ReactNode;
  target?: HTMLAttributeAnchorTarget;
  className?: string;
}) {
  const theme = useTheme();
  return (
    <StyledLink  className={className} href={href} target={target}>
      <Typography style={{...textOverflow}}>{children}</Typography>
      <BiLinkExternal
        style={{
          color: theme.palette.text.primary,
          minWidth: 16,
          minHeight: 16,
        }}
      />
    </StyledLink>
  );
}


const StyledLink = styled("a")({
  width: "100%",
  gap: 5,
  textDecoration: "unset",
  display: "flex",
  alignItems: "center",
  fontWeight: 600,
  justifyContent:'center',
  "*": {
    fontWeight: 'inherit',
  },
});
