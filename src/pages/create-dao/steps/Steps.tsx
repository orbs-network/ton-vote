import { Box, styled } from "@mui/material";
import { useEffect } from "react";
import { useCreatDaoStore } from "../store";
import { CreateDaoStep } from "./CreateDaoStep";
import { CreateMetadataStep } from "./CreateMetadataStep";

const steps = [<CreateMetadataStep />, <CreateDaoStep />];

function Steps() {
  const { step } = useCreatDaoStore();

  useEffect(() => {
   window.scrollTo(0,0)
  }, [step]);
  

  return <StyledContainer>{steps[step]}</StyledContainer>;
}

const StyledContainer = styled(Box)({
  flex: 1,
});

export { Steps };
