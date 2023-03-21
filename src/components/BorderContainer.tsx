import { Box, styled } from '@mui/material';
import React, { forwardRef, ReactNode } from 'react'

interface Props {
  children: ReactNode;
  className?: string
}

export const BorderContainer = forwardRef(
  ({ children, className }: Props, ref: any) => {
    return (
      <StyledContainer className={className} ref={ref}>
        {children}
      </StyledContainer>
    );
  }
);



export const StyledContainer = styled(Box)(({ theme }) => ({
  border: `1px solid rgba(211, 211, 211, 0.5)`,
  borderRadius: 15,
  padding: 20,
  transition: "0.2s all",
  "&:hover": {
    border: `1px solid ${theme.palette.primary.main}`,
  }
}));