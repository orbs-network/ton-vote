import { Box, styled, Typography } from '@mui/material';
import React, { ReactNode } from 'react'

function Container({
  children,
  className = "",
  title
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <StyledContainer className={className}>
      {title && <Title>{title}</Title>}
      {children}
    </StyledContainer>
  );
}


 const StyledContainer = styled(Box)({
   background: "white",
   border: "0.5px solid rgba(114, 138, 150, 0.24)",
   boxShadow: "rgb(114 138 150 / 8%) 0px 2px 16px",
   borderRadius: 20,
   padding: 20,
   width: "100%",
 });


 const Title = ({ children }: { children: string }) => {
   return <StyledTitle variant="h4">{children}</StyledTitle>;
 };

 const StyledTitle = styled(Typography)({
   marginBottom: 20,
   width: "100%",
   textAlign: "left",
 });


export  {Container}