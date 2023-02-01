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
  children: string;
  target?: HTMLAttributeAnchorTarget;
  className?: string;
}) {
  const theme = useTheme();
  return (
    <StyledLink className={className} href={href} target={target}>
      <Typography style={{}}>{children}</Typography>
      <BiLinkExternal style={{ color: theme.palette.text.primary, minWidth:16,
      minHeight:16 }} />
    </StyledLink>
  );
}



const StyledLink = styled('a')({
  display: "flex",
  alignItems: "center",
  gap: 5,
  textDecoration: "unset",

});
