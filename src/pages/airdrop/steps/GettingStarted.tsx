import { Button, Markdown, TitleContainer } from "components";
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";
import React from "react";
import { StyledFlexColumn } from "styles";
import { useAirdropPersistStore } from "../store";
import { SubmitButtonContainer } from "./SubmitButton";

function GettingsStarted() {
  const translations = useAirdropTranslations();
  const { nextStep } = useAirdropPersistStore();
  return (
    <TitleContainer title="Getting started">
      <StyledFlexColumn gap={30}>
        <StyledFlexColumn alignItems="flex-start" gap={15}>
          {translations.gettingStartedBody.split("/n").map((it, index) => {
            return <Markdown key={index}>{it}</Markdown>;
          }) || ""}
        </StyledFlexColumn>

        <SubmitButtonContainer onClick={nextStep}>Start</SubmitButtonContainer>
      </StyledFlexColumn>
    </TitleContainer>
  );
}

export default GettingsStarted;
