import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import {
  FormikInputsForm,
  TitleContainer,
  AddressDisplay,
  Img,
  Popup,
  Button,
} from "components";
import { useFormik } from "formik";
import _ from "lodash";
import { useState } from "react";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { validateFormik } from "utils";
import { AirdropForm, useForm, useFormSchema } from "./form";
import {
  useAirdrop,
  useAirdropAssetMetadata,
  useGetAirdropWallets,
} from "./hooks";
import { StyledButton } from "./styles";

export const Form = () => {
  const { mutate, isLoading } = useGetAirdropWallets();
  const { updateAirdrop, wallets, amount, assetAddress } = useAirdrop();

  const schema = useFormSchema();

  const formik = useFormik<AirdropForm>({
    initialValues: {
      walletsAmount: _.size(wallets) || undefined,
      assetAmount: amount || undefined,
      address: assetAddress,
    },
    validationSchema: schema,
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: (values: AirdropForm) => {
      mutate(values.walletsAmount || 0);
      updateAirdrop("address", values.address);
      updateAirdrop("amount", values.assetAmount);
    },
  });
  const form = useForm(formik.values);

  const onSubmit = () => {
    validateFormik(formik);
    formik.submitForm();
  };

  return (
    <StyledForm>
      <FormikInputsForm<AirdropForm> form={form} formik={formik}>
        <StyledAction>
          <StyledButton isLoading={isLoading} onClick={onSubmit}>
            Start
          </StyledButton>
        </StyledAction>
      </FormikInputsForm>
    </StyledForm>
  );
};

const StyledForm = styled(StyledFlexColumn)({
  ".formik-form": {
    border: "unset",
    padding: "unset",
    width: "100%",
    ".title-container-children": {
      padding: 0,
    },
  },
});

const FormDisplay = () => {
  return (
    <StyledFormDisplay>
      <AssetMetadata />
      <TotalWallets />
      <AirdropAmount />
      <AmountPerWallet />
      <ResetButton />
    </StyledFormDisplay>
  );
};

const AmountPerWallet = () => {
  const { amountPerWalletUI } = useAirdrop();
  const { data: metadata, isLoading } = useAirdropAssetMetadata();

  if (isLoading) {
    return <StyledSkeletonLoader style={{ width: "70%" }} />;
  }

  return (
    <Typography>
      Each wallet will receive {amountPerWalletUI}
      {` ${metadata?.metadata?.symbol}`}
    </Typography>
  );
};

const AirdropAmount = () => {
  const { amountUI } = useAirdrop();

  const { data: metadata, isLoading } = useAirdropAssetMetadata();

  if (isLoading) {
    return <StyledSkeletonLoader style={{ width: "70%" }} />;
  }

  return (
    <Typography>{`${amountUI} ${metadata?.metadata?.symbol} will be airdropped`}</Typography>
  );
};

const TotalWallets = () => {
  const { wallets, walletsCountUI } = useAirdrop();
  const { isLoading } = useAirdropAssetMetadata();

  if (isLoading) {
    return <StyledSkeletonLoader style={{ width: "70%" }} />;
  }
  return <Typography>{walletsCountUI} wallets selected</Typography>;
};

const SyledImageLoader = styled(StyledSkeletonLoader)({
  width: "100%",
  height: "100%",
});

const AssetMetadata = () => {
  const { assetAddress } = useAirdrop();
  const { data: metadata, isLoading } = useAirdropAssetMetadata();

  return (
    <StyledMetadata>
      <StyledAssetImgContainer>
        {isLoading ? (
          <SyledImageLoader />
        ) : (
          <StyledAssetImg src={metadata?.metadata?.image} />
        )}
      </StyledAssetImgContainer>

      <StyledFlexColumn style={{ flex: 1, alignItems: "flex-start" }}>
        {isLoading ? (
          <>
            <StyledSkeletonLoader style={{ width: "50%" }} />
            <StyledSkeletonLoader style={{ width: "70%" }} />
          </>
        ) : (
          <>
            <Typography>{`${metadata?.metadata?.name} (${metadata?.metadata?.symbol})`}</Typography>
            <AddressDisplay
              customUrl={metadata?.metadata?.external_url}
              address={assetAddress}
              padding={10}
            />
          </>
        )}
      </StyledFlexColumn>
    </StyledMetadata>
  );
};

const ResetButton = () => {
  const { reset } = useAirdrop();
  const [open, setOpen] = useState(false);
  return (
    <StyledFlexRow>
      <StyledButton onClick={() => setOpen(true)}>New Airdrop</StyledButton>
      <StyledPopup
        open={open}
        onClose={() => setOpen(false)}
        title="Submit new airdrop"
      >
        <StyledFlexColumn alignItems="flex-start" gap={20}>
          <Typography>Proceeding will delete the current airdrop</Typography>
          <StyledFlexRow>
            <StyledPopupButton onClick={() => setOpen(false)}>
              No
            </StyledPopupButton>
            <StyledPopupButton onClick={reset}>Yes</StyledPopupButton>
          </StyledFlexRow>
        </StyledFlexColumn>
      </StyledPopup>
    </StyledFlexRow>
  );
};

const StyledPopupButton = styled(Button)({
  width: "50%",
});

const StyledPopup = styled(Popup)({
  maxWidth: 400,
});

const StyledMetadata = styled(StyledFlexRow)({
  justifyContent: "flex-start",
  gap: 20,
});

const StyledAssetImgContainer = styled(Box)({
  borderRadius: "50%",
  width: 100,
  height: 100,
  overflow: "hidden",
});
const StyledAssetImg = styled(Img)({
  width: "100%",
  height: "100%",
});

const StyledFormDisplay = styled(StyledFlexColumn)({
  alignItems: "flex-start",
});

export const Details = () => {
  const { airdropExist } = useAirdrop();
  return (
    <TitleContainer title="Airdrop details">
      <Form />
    </TitleContainer>
  );
};

const StyledAction = styled(StyledFlexRow)({
  marginTop:40
});
