import { Box, Fade, styled, Typography } from "@mui/material";
import {
  Button,
  ConnectButton,
  Container,
  LoadingContainer,
  MapInput,
  Markdown,
  Page,
  SideMenu,
  TitleContainer,
} from "components";
import { FormikProps, useFormik } from "formik";
import { useCurrentRoute, useDaoAddress, useDebouncedCallback } from "hooks";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { FormData, FormSchema, useInputs } from "./form";
import { useCreateProposal, useCreateProposalStore } from "./store";
import { useConnection } from "ConnectionProvider";
import _ from "lodash";
import { useEffect, useMemo } from "react";
import { useDaoQuery } from "query/queries";
import { appNavigation } from "router";
import { validateFormik } from "utils";
import { ZERO_ADDRESS } from "consts";

function Content() {
  const { mutate: createProposal, isLoading } = useCreateProposal();

  const daoAddress = useDaoAddress();
  const { data: dao } = useDaoQuery(daoAddress);
  const { formData, setFormData, preview } = useCreateProposalStore();

  const initialNFT = formData.nft || dao?.daoMetadata?.nft || "";
  const initialJetton = formData.jetton || dao?.daoMetadata?.jetton || "";

  const formik = useFormik<FormData>({
    initialValues: {
      proposalStartTime: formData.proposalStartTime,
      proposalEndTime: formData.proposalEndTime,
      proposalSnapshotTime: formData.proposalSnapshotTime,
      description: formData.description,
      title: formData.title,
      jetton: initialJetton === ZERO_ADDRESS ? "" : initialJetton,
      nft: initialNFT === ZERO_ADDRESS ? "" : initialNFT,
      votingPowerStrategy: formData.votingPowerStrategy || 0,
      votingChoices: formData.votingChoices || [],
    },
    validationSchema: FormSchema,
    onSubmit: (formValues) =>
      createProposal({ formValues, daoAddr: daoAddress }),
    validateOnChange: false,
    validateOnBlur: true,
  });


console.log(formData);

  const saveForm = useDebouncedCallback(() => {
    setFormData(formik.values);
  });

  useEffect(() => {
    saveForm();
  }, [formik.values]);

  return (
    <Fade in={true}>
      <StyledContainer alignItems="flex-start">
        <StyledLeft>
          {preview ? (
            <Preview formik={formik} />
          ) : (
            <CreateForm formik={formik} />
          )}
        </StyledLeft>
        <CreateProposalMenu
          isLoading={isLoading}
          onSubmit={() => {
            formik.submitForm();
            validateFormik(formik);
          }}
        />
      </StyledContainer>
    </Fade>
  );
}

const StyledLeft = styled(Box)({
  flex: 1,
});

const StyledContainer = styled(StyledFlexRow)({
  flex: 1,
  ".date-input": {
    ".MuiFormControl-root": {
      maxWidth: 350,
      width: "100%",
    },
  },
});

export const CreateProposal = () => {
  const daoAddress = useDaoAddress();

  const isLoading = useDaoQuery(daoAddress).isLoading;
  if (isLoading) {
    return (
      <Page back={appNavigation.daoPage.root(daoAddress)}>
        <StyledFlexRow alignItems="flex-start">
          <LoadingContainer loaderAmount={5} />
          <StyledLoadingMenu />
        </StyledFlexRow>
      </Page>
    );
  }
  return (
    <Page back={appNavigation.daoPage.root(daoAddress)}>
      <Content />
    </Page>
  );
};

const StyledLoadingMenu = styled(LoadingContainer)({
  width: 300,
});

const Preview = ({ formik }: { formik?: FormikProps<FormData> }) => {
  return (
    <StyledPreview>
      <Typography variant="h2" className="title">
        {formik?.values.title || "Untitled"}
      </Typography>
      <Markdown>{formik?.values.description}</Markdown>
    </StyledPreview>
  );
};

const StyledPreview = styled(Container)({
  width: "100%",
  ".title": {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 20,
  },
});

function CreateForm({ formik }: { formik: FormikProps<FormData> }) {
  const inputs = useInputs(formik);

  return (
    <StyledFlexColumn gap={15}>
      <StyledDescription>
        <StyledFlexColumn gap={20}>
          {inputs.map((input, index) => {
            if (index > 1) return null;
            return (
              <MapInput<FormData>
                key={input.name}
                input={input}
                formik={formik}
              />
            );
          })}
        </StyledFlexColumn>
      </StyledDescription>
      <TitleContainer title="Voting">
        <StyledFlexColumn gap={15}>
          {inputs.map((input, index) => {
            if (index !== 2 && index !== 3) return null;
            return (
              <MapInput<FormData>
                key={input.name}
                input={input}
                formik={formik}
              />
            );
          })}
        </StyledFlexColumn>
      </TitleContainer>
      <TitleContainer title="Voting period">
        <StyledVotingPeriod>
          {inputs.map((input, index) => {
            if (index < 4) return null;
            return (
              <StyledVotingPeriodInput key={input.name}>
                <MapInput<FormData> input={input} formik={formik} />
              </StyledVotingPeriodInput>
            );
          })}
        </StyledVotingPeriod>
      </TitleContainer>
    </StyledFlexColumn>
  );
}

const StyledVotingPeriod = styled(StyledFlexRow)({
  flexWrap:'wrap',
  justifyContent:'flex-start',
  gap:20
})

const StyledVotingPeriodInput = styled(Box)({
  width:'calc(50% - 10px)',
})

const StyledDescription = styled(Container)({
  width:'100%'
});

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
          <StyledButton disabled={isLoading} onClick={() => setPreview(false)}>
            Edit
          </StyledButton>
        ) : (
          <StyledButton disabled={isLoading} onClick={() => setPreview(true)}>
            Preview
          </StyledButton>
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
