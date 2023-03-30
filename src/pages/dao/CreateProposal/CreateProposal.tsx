import { Box, styled } from "@mui/material";
import { Button, Container, FadeElement, MapInput } from "components";
import { Formik } from "formik";
import { useDaoAddress } from "hooks";
import { useCreateProposal } from "query/mutations";
import { StyledFlexColumn } from "styles";
import { ProposalMetadata } from "ton-vote-npm";
import { FormSchema, inputs } from "./data";

interface FormData {
  proposalStartTime?: number;
  proposalEndTime?: number;
  proposalSnapshotTime?: number;
}

const initialValues: FormData = {
  proposalStartTime: undefined,
  proposalEndTime: undefined,
  proposalSnapshotTime: undefined,
};
function CreateProposal() {
  const { mutate: createProposal, isLoading } = useCreateProposal();
  const daoAddress = useDaoAddress();

  const onCreate = (values: FormData) => {
    const proposalMetadata: ProposalMetadata = {
      proposalStartTime: BigInt(values.proposalStartTime!),
      proposalEndTime: BigInt(values.proposalEndTime!),
      proposalSnapshotTime: BigInt(values.proposalSnapshotTime!),
      votingPowerStrategy: BigInt(1),
      proposalType: BigInt(1),
    };
    createProposal({ daoAddr: daoAddress, proposalMetadata });
  };

  return (
    <StyledContainer title="Create Proposal">
      <FadeElement>
        <Formik<FormData>
          initialValues={initialValues}
          validationSchema={FormSchema}
          onSubmit={(values) => onCreate(values)}
          validateOnChange={false}
          validateOnBlur={true}
        >
          {(formik) => {
            return (
              <StyledFlexColumn gap={30}>
                {inputs.map((input) => {
                  return (
                    <MapInput<FormData>
                      key={input.name}
                      input={input}
                      formik={formik}
                    />
                  );
                })}
                <StyledSubmit isLoading={isLoading} onClick={formik.submitForm}>
                  Submit
                </StyledSubmit>
              </StyledFlexColumn>
            );
          }}
        </Formik>
      </FadeElement>
    </StyledContainer>
  );
}

const StyledMapInput = styled(StyledFlexColumn)({});

export { CreateProposal };

const StyledSubmit = styled(Button)({
  minWidth: 250,
});

const StyledContainer = styled(Container)({
  flex: 1,
});
