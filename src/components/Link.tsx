import { Link as MuiLink, styled, Typography, useTheme } from "@mui/material";
import React, { HTMLAttributeAnchorTarget, ReactNode } from "react";


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
    <StyledLink className={className} href={href} target={target}>
      {children}
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
  color:'inherit',
  fontSize: 'inherit',

});
