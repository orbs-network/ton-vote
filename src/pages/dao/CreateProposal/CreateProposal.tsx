import { Box, Fade, styled, Typography } from "@mui/material";
import {
  Button,
  ConnectButton,
  Container,
  InputsForm,
  LoadingContainer,
  Markdown,
  Page,
  SideMenu,
  TitleContainer,
} from "components";
import { FormikProps, useFormik } from "formik";
import { useDaoAddress, useDebouncedCallback } from "hooks";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { FormSchema, useInputs } from "./form";
import { useCreateProposal, useCreateProposalStore } from "./store";
import { useConnection } from "ConnectionProvider";
import _ from "lodash";
import { useEffect } from "react";
import { useDaoQuery } from "query/queries";
import { appNavigation } from "router";
import { parseLanguage, validateFormik } from "utils";
import { ZERO_ADDRESS } from "consts";
import { CreateProposalForm } from "./types";
import { useTranslation } from "react-i18next";

const initialChoices = [
  { key: crypto.randomUUID(), value: "Yes" },
  { key: crypto.randomUUID(), value: "No" },
  { key: crypto.randomUUID(), value: "Abstain" },
];

function Form() {
  const { mutate: createProposal, isLoading } = useCreateProposal();

  const daoAddress = useDaoAddress();
  const { data: dao } = useDaoQuery(daoAddress);
  const { formData, setFormData, preview } = useCreateProposalStore();

  const initialNFT = formData.nft || dao?.daoMetadata?.nft || "";
  const initialJetton = formData.jetton || dao?.daoMetadata?.jetton || "";
  

  const formik = useFormik<CreateProposalForm>({
    initialValues: {
      proposalStartTime: formData.proposalStartTime,
      proposalEndTime: formData.proposalEndTime,
      proposalSnapshotTime: formData.proposalSnapshotTime,
      jetton: initialJetton === ZERO_ADDRESS ? "" : initialJetton,
      nft: initialNFT === ZERO_ADDRESS ? "" : initialNFT,
      votingPowerStrategy: formData.votingPowerStrategy || 0,
      votingChoices: formData.votingChoices || initialChoices,
      description_en: formData.description_en,
      description_ru: formData.description_ru,
      votingSystemType: formData.votingSystemType || 0,
      title_en: formData.title_en,
    },
    validationSchema: FormSchema,
    onSubmit: (formValues) =>
      createProposal({ formValues, daoAddr: daoAddress }),
    validateOnChange: false,
    validateOnBlur: true,
  });

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
  const { preview, setPreview } = useCreateProposalStore();


  const backFunc = preview ? () => setPreview(false) : undefined;

  return (
    <Page back={appNavigation.daoPage.root(daoAddress)} backFunc={backFunc}>
      {isLoading ? (
        <StyledFlexRow alignItems="flex-start">
          <LoadingContainer loaderAmount={5} />
          <StyledLoadingMenu />
        </StyledFlexRow>
      ) : (
        <Form />
      )}
    </Page>
  );
};

const StyledLoadingMenu = styled(LoadingContainer)({
  width: 300,
});

const Preview = ({ formik }: { formik?: FormikProps<CreateProposalForm> }) => {
  return (
    <StyledPreview>
      <Typography variant="h2" className="title">
        {parseLanguage(formik?.values.title_en) || "Untitled"}
      </Typography>
      <Markdown>{parseLanguage(formik?.values.description_en)}</Markdown>
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

function CreateForm({ formik }: { formik: FormikProps<CreateProposalForm> }) {
  const { firstSection, secondSection, thirdSection } = useInputs(formik);
  const { t } = useTranslation();

  return (
    <StyledFlexColumn gap={15}>
      <StyledDescription>
        <StyledFlexColumn gap={20}>
          <InputsForm formik={formik} inputs={firstSection} />
        </StyledFlexColumn>
      </StyledDescription>
      <TitleContainer title={t("votingConfigurations")}>
        <StyledFlexColumn gap={20}>
          <InputsForm formik={formik} inputs={secondSection} />
        </StyledFlexColumn>
      </TitleContainer>
      <TitleContainer title="Voting period">
        <StyledVotingPeriod>
          <InputsForm formik={formik} inputs={thirdSection} />
        </StyledVotingPeriod>
      </TitleContainer>
    </StyledFlexColumn>
  );
}

const StyledVotingPeriod = styled(StyledFlexRow)({
  flexWrap: "wrap",
  justifyContent: "flex-start",
  gap: 20,
  ".form-input": {
    width: "calc(50% - 10px)",
  },
});

const StyledDescription = styled(Container)({
  width: "100%",
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
