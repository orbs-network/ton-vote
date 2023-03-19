import { styled, Typography } from "@mui/material";
import { Button, Input } from "components";
import _ from "lodash";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { urlPatternValidation } from "utils";
import { useCreateProposal, useCreateProposalStore } from "./store";

export function Description() {
  const value = useCreateProposalStore((store) => store.description);
  const onChange = useCreateProposalStore((store) => store.setDescription);

  return (
    <StyledContainer>
      <StyledHeader justifyContent="flex-start">
        <Typography>Description (optional)</Typography>
      </StyledHeader>
      <Input value={value} onChange={onChange} multiline={true} rows={6} />
    </StyledContainer>
  );
}

export function Title() {
  const value = useCreateProposalStore((store) => store.title);
  const error = useCreateProposalStore((store) => store.errors["title"]);
  const setError = useCreateProposalStore((store) => store.setErrors);
  const onChange = useCreateProposalStore((store) => store.setTitle);

  return (
    <StyledContainer>
      <StyledHeader justifyContent="flex-start">
        <Typography>Title</Typography>
      </StyledHeader>
      <Input
        onFocus={() => setError({ title: false })}
        error={error ? "Title required" : undefined}
        value={value}
        onChange={onChange}
      />
    </StyledContainer>
  );
}

export function DiscussionUrl() {
  const value = useCreateProposalStore((store) => store.discussion);
  const error = useCreateProposalStore((store) => store.errors["discussion"]);
  const setError = useCreateProposalStore((store) => store.setErrors);

  const onChange = useCreateProposalStore((store) => store.setDiscussion);

  return (
    <StyledContainer>
      <StyledHeader justifyContent="flex-start">
        <Typography>Discussion (optional)</Typography>
      </StyledHeader>
      <Input
        placeholder="https://forum.balancer.fi/proposals"
        onFocus={() => setError({ discussion: false })}
        error={error ? "Invalid URL" : undefined}
        value={value}
        onChange={onChange}
      />
    </StyledContainer>
  );
}

const StyledContainer = styled(StyledFlexColumn)({
  gap: 5,
});

const validateInputs = (title: string, discussion: string) => {
  const titleErr = !title;
  const discussionErr = discussion ? !urlPatternValidation(discussion) : false;
  return { title: titleErr, discussion: discussionErr };
};

export const SubmitButton = () => {
  const { title, description, discussion, setErrors } =
    useCreateProposalStore();

    const { mutate: create, isLoading } = useCreateProposal();

  const onSubmit = () => {
    const errors = validateInputs(title, discussion);
    setErrors(errors);
    const hasErrors = _.find(_.mapValues(errors), (it) => !!it);
    if (hasErrors) return;
    create({ title, description, discussion });
  };

  return (
    <StyledSubmit isLoading={isLoading} onClick={onSubmit}>
      Submit
    </StyledSubmit>
  );
};

const StyledSubmit = styled(Button)({
  minWidth: 250,
});

const StyledHeader = styled(StyledFlexRow)({
  p: {
    fontSize: 14,
  },
});
