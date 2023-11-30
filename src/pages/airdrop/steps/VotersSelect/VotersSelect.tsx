import { TitleContainer } from "components";
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";
import { useAirdropFormik, useVotersSelectSubmit } from "pages/airdrop/hooks";
import { AirdropForm, useAirdropStore } from "pages/airdrop/store";
import React, { useState } from "react";
import { StyledFlexColumn } from "styles";
import { validateFormik } from "utils";
import { SubmitButtonContainer } from "../SubmitButton";
import { useFormSchema } from "./form";
import { SelectDao } from "./SelectDao";
import { SelectMethod } from "./SelectMethod";
import { SelectProposals } from "./SelectProposals";

export function VotersSelect() {
  const { mutate, isLoading } = useVotersSelectSubmit();
  const t = useAirdropTranslations();
  const store = useAirdropStore();
  const [votersAmount] = useState(store.votersAmount);

  const schema = useFormSchema();

  const submit = (formData: AirdropForm) => {
    mutate({
      formData,
      voters: votersAmount !== formData.votersAmount ? [] : store.voters || [],
    });
  };

  const formik = useAirdropFormik(submit, schema);

  const onSubmit = () => {
    validateFormik(formik);
    formik.submitForm();
  };

  return (
    <TitleContainer
      subtitle={t.subtitles.generateDstWallets}
      title={t.titles.generateDstWallets}
    >
      <StyledFlexColumn gap={20}>
        <SelectDao />
        <SelectProposals />
        <SelectMethod formik={formik} />
      </StyledFlexColumn>
      <SubmitButtonContainer isLoading={isLoading} onClick={onSubmit}>
        Next
      </SubmitButtonContainer>
    </TitleContainer>
  );
}
