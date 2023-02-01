import React from 'react'
import Counter from "react-countdown";

export function Countdown({date}:{date: number}) {
  return <Counter date={date} />;
}

