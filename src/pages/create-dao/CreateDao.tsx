import { Box, styled } from "@mui/material";
import { Page } from "components";
import { CreateDaoMenu } from "./CreateDaoMenu";
import { routes } from "consts";
import { StyledFlexRow } from "styles";
import { useSteps } from "./steps";
import { useCreatDaoStore } from "./store";

const SelectedStep = () => {
  const steps = useSteps()
  const step = useCreatDaoStore((store) => store.step);
  const Component = steps[step].component;
  return (
    <StyledStep>
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

const StyledStep  =styled(Box)({
  flex:1
})
const StyledContainer = styled(StyledFlexRow)({
  gap: 20,
  alignItems: "flex-start",
  width: "100%",
});

