import { Box, styled } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import {
  Button,
  Container,
  FadeElement,
  getInput,
  useNotification,
} from "components";
import { contract } from "data-service";
import { Formik } from "formik";
import { useDaoAddress } from "hooks";
import { StyledFlexColumn } from "styles";
import { ProposalMetadata } from "ton-vote-npm";
import { InputInterface } from "types";
import * as Yup from "yup";

export const FormSchema = Yup.object().shape({
  proposalStartTime: Yup.string().required("Required"),
  proposalEndTime: Yup.string().required("Required"),
  proposalSnapshotTime: Yup.string().required("Required"),
});

const inputs: InputInterface[] = [
  {
    label: "Start time",
    type: "date",
    name: "proposalStartTime",
  },
  {
    label: "End time",
    type: "date",
    name: "proposalEndTime",
  },
  {
    label: "Snapshot time",
    type: "date",
    name: "proposalSnapshotTime",
  },
];

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
            console.log(formik.values);

            return (
              <StyledFlexColumn gap={30}>
                {inputs.map((input) => {
                  const InputComponent = getInput(input.type);

                  const name = input.name as keyof FormData;
                  return (
                    <InputComponent
                      onFocus={() => formik.setFieldError(name, "")}
                      key={name}
                      error={formik.errors[name]}
                      title={input.label}
                      value={formik.values[name] || ""}
                      name={name}
                      onChange={(value) => formik.setFieldValue(name, value)}
                      rows={input.type === "textarea" ? 4 : 1}
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

const StyledDatePicker = styled(StyledFlexColumn)({});

export { CreateProposal };

const StyledSubmit = styled(Button)({
  minWidth: 250,
});

const StyledContainer = styled(Container)({
  flex: 1,
});
