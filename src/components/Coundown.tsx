import { Typography, styled, useTheme } from "@mui/material";
import React, { useState } from "react";
import Counter from "react-countdown";

import FlipNumbers from "react-flip-numbers";
import { StyledFlexColumn, StyledFlexRow } from "styles";

const addZero = (num: number) => {
  return num.toString().length < 2 ? `0${num}` : `${num}`;
};

export function Countdown({ date }: { date: number }) {
  const [time, setTime] = useState(undefined);

  const renderer = (value: any) => {
    return (
      <>
        <Flipper title="Days" value={addZero(value.days)} />
        <Flipper title="Hours" value={addZero(value.hours)} />
        <Flipper title='Minutes' value={addZero(value.minutes)} />
        <Flipper title='Seconds' value={addZero(value.seconds)} />
      </>
    );
  };

  return (
    <StyledCountdown>
      <Counter date={date} renderer={renderer} />
    </StyledCountdown>
  );
}

const Flipper = ({ value, title }: { value: string; title: string }) => {
const theme = useTheme()
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
    ".title":{
      textTransform:'uppercase',
      fontSize: 12
    },
})

const StyledCountdown = styled(StyledFlexRow)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.primary.main,
}));
