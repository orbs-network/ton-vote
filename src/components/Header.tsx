import { styled } from "@mui/material";
import React, { ReactNode } from "react";
import { StyledFlexRow, StyledTitle } from "styles";

interface Props {
  title: string;
  component?: ReactNode;
  className?: string;
}

export function Header({ title, component, className = '' }: Props) {
  return (
    <StyledHeader justifyContent="space-between" className={`header ${className}`}>
      <StyledTitle>{title}</StyledTitle>
      {component}
    </StyledHeader>
  );
}


const StyledHeader = styled(StyledFlexRow)({
    marginBottom:20,
    marginTop: 20,
    alignItems:'flex-start'
});
