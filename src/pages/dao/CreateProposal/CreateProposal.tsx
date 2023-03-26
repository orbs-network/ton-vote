import { Box, styled } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Container,
  FadeElement,
  MapInput,
  useNotification,
} from "components";
import { contract } from "data-service";
import { Formik, FormikProps } from "formik";
import { useDaoAddress } from "hooks";
import { StyledFlexColumn } from "styles";
import { ProposalMetadata } from "ton-vote-npm";
import { InputInterface } from "types";
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

export const useCreateProposal = () => {
  const { showNotification } = useNotification();
  const daoAddress = useDaoAddress();
  return useMutation(
    async (values: FormData) => {
      const args: ProposalMetadata = {
        proposalStartTime: BigInt(values.proposalStartTime!),
        proposalEndTime: BigInt(values.proposalEndTime!),
        proposalSnapshotTime: BigInt(values.proposalSnapshotTime!),
        votingPowerStrategy: BigInt(1),
        proposalType: BigInt(1),
      };
      return contract.createProposal(daoAddress, args);
    },
    {
      onSuccess: () => {
        showNotification({ variant: "success", message: "Proposal created" });
      },
    }
  );
};

function CreateProposal() {
  const { mutate: create, isLoading, error } = useCreateProposal();

  return (
    <StyledContainer title="Create Proposal">
      <FadeElement>
        <Formik<FormData>
          initialValues={initialValues}
          validationSchema={FormSchema}
          onSubmit={(values) => create(values)}
          validateOnChange={false}
          validateOnBlur={true}
        >
          {(formik) => {
            return (
              <StyledFlexColumn gap={30}>
                {inputs.map((input) => {
                  return (
                    <MapInput<FormData> key={input.name} input={input} formik={formik} />
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



const StyledDatePicker = styled(StyledFlexColumn)({});

export { CreateProposal };

const StyledSubmit = styled(Button)({
  minWidth: 250,
});

const StyledContainer = styled(Container)({
  flex: 1,
});
