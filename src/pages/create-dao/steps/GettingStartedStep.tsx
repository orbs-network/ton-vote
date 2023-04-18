import { Typography } from '@mui/material';
import { Button } from 'components'
import React from 'react'
import { StyledFlexColumn } from 'styles'
import { useCreatDaoStore } from '../store';
import { Submit } from './Submit'

export function GettingStartedStep() {
      const { nextStep } = useCreatDaoStore();

  return (
    <StyledFlexColumn>
      <Typography>
        Ton vote is a free, open-source platform for community governance.
        Create your own space now and start making decisions!
      </Typography>
      <Submit>
        <Button onClick={nextStep}>Get Started</Button>
      </Submit>
    </StyledFlexColumn>
  );
}

