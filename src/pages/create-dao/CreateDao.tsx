import { Box, styled } from "@mui/material";
import { Page } from "components";
import { routes } from "consts";
import { StyledFlexRow } from "styles";
import { CreateDaoMenu } from "./SideMenu";
import { steps } from "./steps";
import { useCreatDaoStore } from "./store";

const SelectedStep = () => {
  const step = useCreatDaoStore(store => store.step);
  const Component = steps[step].component;
  return (
    <StyledStep>
      <Component />
    </StyledStep>
  );
};

export function CreateDao() {
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

const StyledStep = styled(Box)({
  flex: 1,
});


