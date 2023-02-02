import { Typography, styled } from '@mui/material';
import React from 'react'
import Counter from "react-countdown";
import { StyledFlexRow } from 'styles';



const numWithPrefix = (num: number) => {
  return num.toString().length < 2 ? `0${num}` : num;
}
const renderer = (value: any) => {
  return (
    <StyledCountdown>
      {`${value.days} days ${value.hours} hours ${numWithPrefix(
        value.minutes
      )} minutes ${numWithPrefix(value.seconds)} seconds`}
    </StyledCountdown>
  );
};
export function Countdown({date}:{date: number}) {
  return <Counter date={date} renderer={renderer} />;
}

const StyledCountdown = styled(Typography)(({theme}) => ({
  fontSize: 14,
  fontWeight: 600,
  color: theme.palette.primary.main
}))