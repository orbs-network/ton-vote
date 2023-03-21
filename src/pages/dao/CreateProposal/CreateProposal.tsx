import { Box, styled } from "@mui/material";
import { Button, Container, FadeElement, Page } from "components";
import { StyledFlexColumn } from "styles";
import { Description, DiscussionUrl, SubmitButton, Title } from "./Components";


function CreateProposal() {
  return (
    <StyledContainer title="Create Proposal">
      <FadeElement>
        <StyledFlexColumn gap={30}>
          <Title />
          <Description />
          <DiscussionUrl />
         <SubmitButton />
        </StyledFlexColumn>
      </FadeElement>
    </StyledContainer>
  );
}

export { CreateProposal };

const StyledSubmit = styled(Button)({
minWidth: 250
})


const StyledContainer = styled(Container)({
  flex: 1,
});