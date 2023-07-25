import { Button, Markdown, TitleContainer } from "components";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";
import React from "react";
import { StyledFlexColumn } from "styles";
import { useAirdropStore } from "../store";
import { SubmitButtonContainer } from "./SubmitButton";

function GettingsStarted() {
  const translations = useCreateDaoTranslations();
  const { nextStep } = useAirdropStore();
  return (
    <TitleContainer title="Getting started">
      <StyledFlexColumn gap={30}>
        <StyledFlexColumn alignItems="flex-start" gap={15}>
          {translations.gettingStartedBody.split("/n").map((it, index) => {
            return <Markdown key={index}>{it}</Markdown>;
          }) || ""}
        </StyledFlexColumn>

        <SubmitButtonContainer>
          <Button onClick={nextStep}>Start</Button>
        </SubmitButtonContainer>
      </StyledFlexColumn>
    </TitleContainer>
  );
}

export default GettingsStarted;
