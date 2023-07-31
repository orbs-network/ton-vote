import styled from "@emotion/styled";
import { FormikInputsForm, TitleContainer } from "components";
import _ from "lodash";
import { StyledFlexColumn } from "styles";
import { validateAddress, validateFormik } from "utils";
import { useForm, useTypeSelectFormik } from "./form";
import { SubmitButtonContainer } from "../SubmitButton";
import { FormikProps } from "formik";
import { StyledListTitleContainer } from "pages/airdrop/styles";
import { Metadata } from "pages/airdrop/Components";
import { useReadJettonWalletMedata } from "query/getters";
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";
import { AssetSelectValues } from "pages/airdrop/store";

export const TypeSelect = () => {
  const formik = useTypeSelectFormik();
  const form = useForm(formik.values);
  const t = useAirdropTranslations();

  const onSubmit = () => {
    validateFormik(formik);
    formik.submitForm();
  };

  return (
    <TitleContainer title={t.titles.selectedAssetCategory}>
      <StyledForm>
        <FormikInputsForm<AssetSelectValues> form={form} formik={formik}>
          <ShowSelectedAsset formik={formik} />
          <SubmitButtonContainer onClick={onSubmit}>
            Next
          </SubmitButtonContainer>
        </FormikInputsForm>
      </StyledForm>
    </TitleContainer>
  );
};

const ShowSelectedAsset = ({
  formik,
}: {
  formik: FormikProps<AssetSelectValues>;
}) => {
  const { values } = formik;

  if (!values.jettonAddress && !validateAddress(values.jettonAddress))
    return null;

  return <JettonMetadata address={values.jettonAddress} />;
};

const JettonMetadata = ({ address }: { address?: string }) => {
  const { data, isLoading } = useReadJettonWalletMedata(address);

  if (!address || !validateAddress(address)) return null;

  return (
    <StyledAssetDisplay title="Selected jetton">
      <Metadata
        address={address}
        image={data?.metadata?.image}
        name={data?.metadata?.name}
        isLoading={isLoading}
        description={data?.metadata?.description}
      />
    </StyledAssetDisplay>
  );
};

const StyledAssetDisplay = styled(StyledListTitleContainer)({});

const StyledForm = styled(StyledFlexColumn)({
  ".select-box": {
    ".MuiInputBase-root": {
      width: "100%",
    },
    ".MuiSelect-select": {
      borderRadius: "10px!important",
      width: "100%",
    },
  },
  ".formik-form": {
    border: "unset",
    padding: "unset",
    width: "100%",
    boxShadow: "unset",
    ".title-container-children": {
      padding: 0,
    },
  },
});
