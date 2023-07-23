import { Button, TitleContainer } from "components";
import { StyledFlexColumn } from "styles";
import { useAirdropStore } from "store";
import _ from "lodash";
import { SubmitButtonContainer } from "../SubmitButton";
import { errorToast } from "toasts";
import { SelectDaos } from "./SelectDaos";
import { SelectProposals } from "./SelectProposals";

function SelectVoters() {
  return (
    <StyledFlexColumn gap={30}>
      <SelectDaos />
      <SelectProposals />
      <Submit />
    </StyledFlexColumn>
  );
}

const Submit = () => {
  const { proposals, nextStep } = useAirdropStore();

  const onSubmit = () => {
    if (_.isEmpty(proposals)) {
      errorToast("Select at least one proposal");
    } else {
      nextStep();
    }
  };

  return (
    <SubmitButtonContainer>
      <Button onClick={onSubmit}>Next</Button>
    </SubmitButtonContainer>
  );
};

export default SelectVoters;
