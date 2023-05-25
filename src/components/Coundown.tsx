import { Typography, styled, useTheme } from "@mui/material";
import React, { useState } from "react";
import Counter from "react-countdown";

import FlipNumbers from "react-flip-numbers";
import { StyledFlexColumn, StyledFlexRow } from "styles";

const addZero = (num: number) => {
  return num.toString().length < 2 ? `0${num}` : `${num}`;
};

export function Countdown({ date }: { date?: number }) {
  const renderer = (value: any) => {
    return (
      <StyledContainer justifyContent='space-between'>
        <Flipper title="Days" value={addZero(value.days)} />
        <Flipper title="Hours" value={addZero(value.hours)} />
        <Flipper title="Minutes" value={addZero(value.minutes)} />
        <Flipper title="Seconds" value={addZero(value.seconds)} />
      </StyledContainer>
    );
  };

  if (!date) return null;

  return (
    <StyledCountdown>
      <Counter overtime={true} date={date} renderer={renderer} />
    </StyledCountdown>
  );
}

const StyledContainer = styled(StyledFlexRow)(({ theme }) => ({
  span: {
    background: `${theme.palette.background.paper}!important`,
    color: theme.palette.mode === 'light' ? theme.palette.text.primary : `white!important`,
  },
}));


const Flipper = ({ value, title }: { value: string; title: string }) => {
  const theme = useTheme();
  return (
    <StyledSection>
      <Typography className="title">{title}</Typography>
      <FlipNumbers
        height={15}
        width={15}
        color={theme.palette.primary.main}
        background="white"
        play={true}
        perspective={100}
        numbers={value}
      />
    </StyledSection>
  );
};

const StyledSection = styled(StyledFlexColumn)({
  width:'unset',

  ".title": {
    textTransform: "uppercase",
    fontSize: 12,
    fontWeight: 600
  },
});

const StyledCountdown = styled(StyledFlexRow)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.primary.main,
}));
