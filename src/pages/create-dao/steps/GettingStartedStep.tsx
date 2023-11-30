import { Box, styled } from "@mui/material";
import { Button, Markdown, TitleContainer } from "components";
import { useCreateDaoTranslations } from "i18n/hooks/useCreateDaoTranslations";
import { StyledFlexColumn } from "styles";
import { useCreatDaoStore } from "../store";
import { Submit } from "./Submit";

export function GettingStartedStep() {
  const translations = useCreateDaoTranslations();
  const { nextStep } = useCreatDaoStore();

  return (
    <TitleContainer title={translations.gettingStarted}>
      <StyledContainer>
        <StyledFlexColumn alignItems="flex-start" gap={15}>
          {translations.gettingStartedBody.split("/n").map((it, index) => {
            return <Markdown key={index}>{it}</Markdown>;
          }) || ""}
        </StyledFlexColumn>
        <Submit onClick={nextStep} text={translations.start} />
      </StyledContainer>
    </TitleContainer>
  );
}

const StyledContainer = styled(Box)({
  a: {
    textDecoration: "unset",
  },
});
