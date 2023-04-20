import { Typography } from '@mui/material';
import { Button, Markdown } from 'components'
import React from 'react'
import { useTranslation } from 'react-i18next';
import { StyledFlexColumn, StyledFlexRow } from 'styles'
import { useCreatDaoStore } from '../store';
import { Step } from './Step';
import { Submit } from './Submit'

export function GettingStartedStep() {
  const {t} = useTranslation()
      const { nextStep } = useCreatDaoStore();

  return (
    <Step title={t("getStarted")}>
      <StyledFlexColumn>
        <StyledFlexColumn alignItems="flex-start">
          {t("gettingStartedBody")
            .split("/n")
            .map((it, index) => {
              return <Markdown key={index}>{it}</Markdown>;
            }) || ""}
        </StyledFlexColumn>
        <Submit>
          <Button onClick={nextStep}>Get Started</Button>
        </Submit>
      </StyledFlexColumn>
    </Step>
  );
}

