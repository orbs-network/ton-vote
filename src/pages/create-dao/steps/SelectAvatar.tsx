import { styled } from "@mui/material";
import { Box } from "@mui/system";
import { Button, Container, Img, UploadInput } from "components";
import React from "react";
import { StyledFlexRow } from "styles";
import { useCreatDaoStore } from "../store";
import { StyledNextStepButton } from "../styles";
import { Step } from "./Step";

export function SelectAvatar() {
  const { avatar, setAvatar, setStep } = useCreatDaoStore();
  return (
    <Container title="Upload avatar">
      <StyledContent>
        {avatar ? (
          <StyledAvatar>
            <StyledImg src={URL.createObjectURL(avatar)} />
            <Button onClick={() => setAvatar(undefined)}>Change</Button>
          </StyledAvatar>
        ) : (
          <StyledUpload onChange={setAvatar} />
        )}
      </StyledContent>
      <StyledNextStepButton onClick={() => setStep(1)}>Next</StyledNextStepButton>
    </Container>
  );
}

const StyledContent = styled(Box)({
    height: 200
});

const StyledUpload = styled(UploadInput)({
  width: "100%",
  height: 200,
});

const StyledAvatar = styled(StyledFlexRow)({
    justifyContent:'flex-start'
});

const StyledImg = styled(Img)({
  width: 140,
  height: 140,
  borderRadius: "50%",
  overflow: "hidden",
  background: "rgba(211, 211, 211, 0.6)",
});
