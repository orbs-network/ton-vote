import { Button, TitleContainer } from "components";
import { useAirdropFormik, useVotersSelectSubmit } from "pages/airdrop/hooks";
import React from "react";
import { StyledFlexColumn } from "styles";
import { validateFormik } from "utils";
import { SubmitButtonContainer } from "../SubmitButton";
import { useFormSchema } from "./form";
import { SelectDao } from "./SelectDao";
import { SelectMethod } from "./SelectMethod";
import { SelectProposals } from "./SelectProposals";

export function VotersSelect() {
  const { mutate, isLoading } = useVotersSelectSubmit();

  const schema = useFormSchema();

  const formik = useAirdropFormik(mutate, schema);

  const onSubmit = () => {
    validateFormik(formik);
    formik.submitForm();
  };

  return (
    <TitleContainer title="Voters Select">
      <StyledFlexColumn gap={20}>
        <SelectDao />
        <SelectProposals />
        <SelectMethod formik={formik} />
      </StyledFlexColumn>
      <SubmitButtonContainer>
        <Button isLoading={isLoading} onClick={onSubmit}>
          Next
        </Button>
      </SubmitButtonContainer>
    </TitleContainer>
  );
}
