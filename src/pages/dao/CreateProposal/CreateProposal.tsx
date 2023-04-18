import { Box, Fade, styled, Typography } from "@mui/material";
import {
  Button,
  ConnectButton,
  LoadingContainer,
  MapInput,
  SideMenu,
  TitleContainer,
} from "components";
import { FormikProps, useFormik } from "formik";
import { useDaoAddress } from "hooks";
import { StyledFlexColumn, StyledFlexRow, StyledMarkdown } from "styles";
import { FormData, FormSchema, useInputs } from "./form";
import { useCreateProposal, useCreateProposalStore } from "./store";
import ReactMarkdown from "react-markdown";
import { useConnection } from "ConnectionProvider";
import moment from "moment";
import _ from "lodash";
import { useEffect } from "react";
import { useDaoQuery } from "query/queries";

function Content() {
  const { mutate: createProposal, isLoading } = useCreateProposal();

  const daoAddress = useDaoAddress();
  const { data: dao } = useDaoQuery(daoAddress);
  const { formData, setFormData, preview } = useCreateProposalStore();

  const formik = useFormik<FormData>({
    initialValues: {
      proposalStartTime: formData.proposalStartTime,
      proposalEndTime: formData.proposalEndTime,
      proposalSnapshotTime: formData.proposalSnapshotTime,
      description: formData.description,
      title: formData.title,
      jetton: formData.jetton || dao?.daoMetadata?.jetton || "",
      nft: formData.nft || dao?.daoMetadata?.nft || "",
    },
    validationSchema: FormSchema,
    onSubmit: (formValues) =>
      createProposal({ formValues, daoAddr: daoAddress }),
    validateOnChange: false,
    validateOnBlur: true,
  });

  useEffect(() => {
    setFormData(formik.values);
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

const CreateProposal = () => {
  const daoAddress = useDaoAddress();

  const isLoading = useDaoQuery(daoAddress).isLoading;
  if (isLoading) {
    return (
      <StyledFlexRow alignItems="flex-start">
        <LoadingContainer loaderAmount={5} />
        <StyledLoadingMenu />
      </StyledFlexRow>
    );
  }
  return <Content />;
};

const StyledLoadingMenu = styled(LoadingContainer)({
  width: 300,
});

export { CreateProposal };

const formatTime = (millis?: number) =>
  moment(millis).format("DD/MM/YYYY HH:mm");

const Preview = ({ formik }: { formik?: FormikProps<FormData> }) => {
  return (
    <StyledPreview>
      <Typography variant="h2" className="title">
        {formik?.values.title}
      </Typography>
      <StyledMarkdown>
        <ReactMarkdown>{formik?.values.description || ""}</ReactMarkdown>
      </StyledMarkdown>
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
          <StyledButton isLoading={isLoading} onClick={onSubmit}>
            Continue
          </StyledButton>
        )}
      </StyledFlexColumn>
    </StyledMenu>
  );
}

const StyledMenu = styled(SideMenu)({
  width: 300,
});

const StyledConnect = styled(ConnectButton)({
  width: "100%",
});

const StyledButton = styled(Button)({
  width: "100%",
});

const StyledContainer = styled(TitleContainer)({
  paddingBottom: 40,
  flex: 1,
  ".date-input": {
    ".MuiFormControl-root": {
      maxWidth: 350,
      width: "100%",
    },
  },
});
