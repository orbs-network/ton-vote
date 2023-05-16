import { styled } from '@mui/material'
import { MOBILE_WIDTH } from 'consts';
import React from 'react'
import { StyledContainer } from 'styles';

export function SideMenu({
  children,
  title,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <StyledSideMenu className={className} title={title}>
      {children}
    </StyledSideMenu>
  );
}


const StyledSideMenu = styled(StyledContainer)({
  top: 90,
  width: 350,
  position: "sticky",
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    position: "unset",
    width: '100%',
  },
});