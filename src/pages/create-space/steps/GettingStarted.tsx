import { Typography } from '@mui/material';
import React from 'react'
import { NextStepButton } from '../NextStepButton';
import { useCreateSpaceStore } from '../store';
import Step from './Step';

function GettingStarted() {

  return (
    <Step title="Getting Started">
      <NextStepButton>Get started</NextStepButton>
    </Step>
  );
}

export default GettingStarted