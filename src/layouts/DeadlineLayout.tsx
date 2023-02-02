import { styled } from '@mui/material';
import { Container, Countdown } from 'components';
import { DEADLINE } from 'config';
import React from 'react'

function DeadlineLayout() {
  return (
    <StyledContainer title="Vote end in">
      <Countdown date={DEADLINE} />
    </StyledContainer>
  );
}

export default DeadlineLayout;


const StyledContainer = styled(Container)({

});
