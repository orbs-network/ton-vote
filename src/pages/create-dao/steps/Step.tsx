import { styled } from '@mui/material';
import { Container } from 'components';
import React, { ReactNode } from 'react'
import { StyledFlexColumn } from 'styles';

interface Props{
    children: ReactNode;
}

export function Step({ children }: Props) {
  return (
    <Container title='Upload avatar'>
      <StyledStep>{children}</StyledStep>
    </Container>
  );
}


const StyledStep = styled(StyledFlexColumn)({
    flex: 1
})