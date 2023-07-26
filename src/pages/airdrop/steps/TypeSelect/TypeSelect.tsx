import styled from "@emotion/styled";
import { FormikInputsForm, TitleContainer, Button } from "components";
import _ from "lodash";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { validateAddress, validateFormik } from "utils";
import { useAirdropFormik, useOnAssetTypeSelected } from "../../hooks";
import { useForm, useFormSchema } from "./form";
import { SubmitButtonContainer } from "../SubmitButton";
import { AirdropForm } from "../../store";
import { FormikProps } from "formik";
import { StyledListTitleContainer } from "pages/airdrop/styles";
import { Metadata } from "pages/airdrop/Components";
import { useReadJettonWalletMedata, useReadNftCollectionMetadata } from "query/getters";
export const TypeSelect = () => {
  const { mutate } = useOnAssetTypeSelected();
  const schema = useFormSchema();
  const formik = useAirdropFormik(mutate, schema);
  const form = useForm(formik.values);

  const onSubmit = () => {
    validateFormik(formik);
    formik.submitForm();
  };

  return (
    <TitleContainer title="Choose airdrop type" subtitle="Some text">
      <StyledForm>
        <FormikInputsForm<AirdropForm> form={form} formik={formik}>
          <ShowSelectedAsset formik={formik} />
          <SubmitButtonContainer>
            <Button onClick={onSubmit}>Next</Button>
          </SubmitButtonContainer>
        </FormikInputsForm>
      </StyledForm>
    </TitleContainer>
  );
};

const ShowSelectedAsset = ({
  formik,
}: {
  formik: FormikProps<AirdropForm>;
}) => {
  const { values } = formik;

  if (
    !values.jettonAddress &&
    !values.nftCollection &&
    !validateAddress(values.jettonAddress) &&
    !validateAddress(values.nftCollection)
  )
    return null;

  return values.assetType === "jetton" ? (
    <JettonMetadata address={values.jettonAddress} />
  ) : (
    <NFTMetadata address={values.nftCollection} />
  );
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

const NFTMetadata = ({ address }: { address?: string }) => {
  const { data, isLoading } = useReadNftCollectionMetadata(address);
  if (!address || !validateAddress(address)) return null;

  return (
    <StyledAssetDisplay title="NFT Collection">
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
