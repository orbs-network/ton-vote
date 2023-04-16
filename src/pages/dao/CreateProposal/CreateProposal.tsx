import { Box, Fade, styled, Typography } from "@mui/material";
import {
  Button,
  ConnectButton,
  Container,
  MapInput,
  SideMenu,
} from "components";
import { FormikProps, useFormik } from "formik";
import { useDaoAddress } from "hooks";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { FormData, FormSchema, useInputs } from "./form";
import { useCreateProposal, useCreateProposalStore } from "./store";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useConnection } from "ConnectionProvider";
import moment from "moment";
import _ from "lodash";


function CreateProposal() {
  const { mutate: createProposal, isLoading } = useCreateProposal();

  const daoAddress = useDaoAddress();
  const { formData, setFormData, preview } = useCreateProposalStore();

  const formik = useFormik<FormData>({
    initialValues: {
      proposalStartTime: formData.proposalStartTime,
      proposalEndTime: formData.proposalEndTime,
      proposalSnapshotTime: formData.proposalSnapshotTime,
      description: formData.description,
      title: formData.title,
    },
    validationSchema: FormSchema,
    onSubmit: (formValues) =>
      createProposal({ formValues, daoAddr: daoAddress }),
    validateOnChange: false,
    validateOnBlur: true,
  });

  useEffect(() => {
    const event = () => {
      setFormData(formik.values);
    };
    window.addEventListener("beforeunload", event);
    return () => {
       setFormData(formik.values);
      window.removeEventListener("beforeunload", event);
    };
  }, [formik.values]);


  return (
    <Fade in={true}>
      <StyledFlexRow alignItems="flex-start">
        <StyledContainer title="Create Proposal">
          {preview ? (
            <Preview formik={formik} />
          ) : (
            <CreateForm formik={formik} />
          )}
        </StyledContainer>
        <CreateProposalMenu
          isLoading={isLoading}
          onSubmit={formik.submitForm}
        />
      </StyledFlexRow>
    </Fade>
  );
}

export { CreateProposal };

const formatTime = (millis?: number) =>
  moment(millis).format("DD/MM/YYYY HH:mm");

const Preview = ({ formik }: { formik?: FormikProps<FormData> }) => {
  return (
    <StyledPreview>
      <Typography variant="h2" className="title">
        {formik?.values.title}
      </Typography>
      <ReactMarkdown>{formik?.values.description || ""}</ReactMarkdown>
      <Typography>
        Start: {formatTime(formik?.values.proposalStartTime)}
      </Typography>
      <Typography>End: {formatTime(formik?.values.proposalEndTime)}</Typography>
      <Typography>
        Snapshot: {formatTime(formik?.values.proposalSnapshotTime)}
      </Typography>
    </StyledPreview>
  );
};

const StyledPreview = styled(Box)({
  ".title": {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 20,
  },
  img: {
    maxWidth: "100%",
    marginTop: 10,
  },
});

function CreateForm({ formik }: { formik: FormikProps<FormData> }) {
  const inputs = useInputs(formik);

  return (
    <StyledFlexColumn gap={30}>
      {inputs.map((input) => {
        return (
          <MapInput<FormData> key={input.name} input={input} formik={formik} />
        );
      })}
    </StyledFlexColumn>
  );
}

function CreateProposalMenu({
  onSubmit,
  isLoading,
}: {
  onSubmit?: () => void;
  isLoading: boolean;
}) {
  const { preview, setPreview } = useCreateProposalStore();
  const address = useConnection().address;
  return (
    <StyledMenu>
      <StyledFlexColumn>
        {preview ? (
          <StyledButton onClick={() => setPreview(false)}>Edit</StyledButton>
        ) : (
          <StyledButton onClick={() => setPreview(true)}>Preview</StyledButton>
        )}
        {!address ? (
          <StyledConnect />
        ) : (
          <StyledButton
            disabled={preview}
            isLoading={isLoading}
            onClick={onSubmit}
          >
            Continue
          </StyledButton>
        )}
      </StyledFlexColumn>
    </StyledMenu>
  );
}

const StyledMenu = styled(SideMenu)({});

const StyledConnect = styled(ConnectButton)({
  width: "100%",
});

const StyledButton = styled(Button)({
  width: "100%",
});

const StyledContainer = styled(Container)({
  paddingBottom: 40,
  flex: 1,
  ".date-input": {
    ".MuiFormControl-root": {
      maxWidth: 350,
      width: "100%",
    },
  },
});
