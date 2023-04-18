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
  return (
    <StyledLink className={className} href={href} target={target}>
      {children}
    </StyledLink>
  );
}


const StyledLink = styled("a")({
  gap: 5,
  textDecoration: "unset",
  alignItems: "center",
  color:'inherit',
  fontSize: 'inherit',
});
