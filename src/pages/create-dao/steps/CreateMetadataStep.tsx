import { styled, Typography } from "@mui/material";
import { Button, Container, FadeElement, Header, MapInput, TitleContainer } from "components";
import { StyledFlexColumn } from "styles";
import { useFormik } from "formik";
import { FormData, useCreatDaoStore, useCreateDaoMetadata } from "../store";
import _ from "lodash";
import { FormSchema, useInputs } from "./form";
import { Submit } from "./Submit";

const EndAdornment = ({ onClick }: { onClick: () => void }) => {
  return (
    <StyledEndAdornment onClick={onClick}>
      <Typography>Conneted wallet</Typography>
    </StyledEndAdornment>
  );
};

const StyledEndAdornment = styled(Button)({
  padding: "5px 10px",
  height: "unset",
  p: {
    fontSize: 12,
    display: "inline-block",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
});

export function CreateMetadataStep() {
  const { mutate: createMetadata, isLoading } = useCreateDaoMetadata();
  const { formData, nextStep, metadataAddress } = useCreatDaoStore();

  const onSubmit = async (_formData: FormData) => {
    const valuesChanged = metadataAddress && !_.isEqual(_formData, formData);

    if (!metadataAddress || valuesChanged) {
      createMetadata(_formData);
    } else {
      nextStep();
    }
  };

  const formik = useFormik({
    initialValues: {
      name: formData.name,
      telegram: formData.telegram,
      website: formData.website,
      github: formData.github,
      about: formData.about,
      terms: formData.terms,
      ownerAddress: formData.ownerAddress,
      proposalOwner: formData.proposalOwner,
      avatar: formData.avatar,
      hide: formData.hide,
      jetton: formData.jetton,
      nft: formData.nft,
    },
    validationSchema: FormSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit,
  });

  const inputs = useInputs();

  return (
    <FadeElement show={true}>
      <StyledContainer title="Create Metadata">
      
        <StyledFlexColumn>
          <StyledInputs>
            {inputs.map((input) => {
              return (
                <MapInput<FormData>
                  key={input.name}
                  input={input}
                  formik={formik}
                  EndAdornment={EndAdornment}
                />
              );
            })}
          </StyledInputs>
          <Submit>
            <Button isLoading={isLoading} onClick={formik.submitForm}>
              Create metadata
            </Button>
          </Submit>
        </StyledFlexColumn>
      </StyledContainer>
    </FadeElement>
  );
}

const StyledInputs = styled(StyledFlexColumn)({
  alignItems: "flex-start",
  gap: 20,
});
const StyledContainer = styled(TitleContainer)({});
