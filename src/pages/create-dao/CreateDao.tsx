import { Box, styled } from "@mui/material";
import { Page, TitleContainer } from "components";
import { CreateDaoMenu } from "./CreateDaoMenu";

import { routes } from "consts";
import { StyledFlexRow } from "styles";
import { steps } from "./steps";
import { useCreatDaoStore } from "./store";

const SelectedStep = () => {
  const step = useCreatDaoStore((store) => store.step);
  const Component = steps[step].component;
  return (
    <StyledStep title="Create dao">
      <Component />
    </StyledStep>
  );
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

const StyledStep = styled(TitleContainer)({
  flex: 1,
});
