import { Box, styled } from "@mui/material";
import { Page, TitleContainer } from "components";
import { CreateDaoMenu } from "./CreateDaoMenu";

import { routes } from "consts";
import { StyledFlexRow } from "styles";
import { useSteps } from "./steps";
import { useCreatDaoStore } from "./store";
import { useTranslation } from "react-i18next";

const SelectedStep = () => {
  const steps = useSteps()
  const step = useCreatDaoStore((store) => store.step);
  const Component = steps[step].component;
  return <Component />;
};

export function CreateDaoPage() {
  return (
    <Page back={routes.spaces}>
      <StyledContainer>
        <CreateDaoMenu />
        <SelectedStep />
      </StyledContainer>
  </Page>
  );
}
const StyledContainer = styled(StyledFlexRow)({
  gap: 20,
  alignItems: "flex-start",
  width: "100%",
});

