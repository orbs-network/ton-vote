import React from "react";
import { About } from "./About";
import { Deadline } from "./Deadline";
import { Metadata } from "./Metadata";
import { Results } from "./Results";
import { Vote } from "./Vote";
import { Votes } from "./Votes";

export const VlidatorProposal = () => {
  return <></>;
};

export const DesktopLeft = () => {
  return (
    <>
      <About />
      <Vote />
      <Votes />
    </>
  );
};

export const DesktopRight = () => {
  return (
    <>
      <Deadline />
      <Metadata />
      <Results />
    </>
  );
};

export const Mobile = () => {
  return (
    <>
      <Deadline />
      <About />
      <Vote />
      <Results />
      <Metadata />
      <Votes />
    </>
  );
};


