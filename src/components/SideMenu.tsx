import { styled } from '@mui/material'
import React from 'react'
import { Container } from './Container'

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
    <StyledContainer className={className} title={title}>
      {children}
    </StyledContainer>
  );
}


const StyledContainer = styled(Container)({
    top:100,
    width: 350,
    position:'sticky',
})