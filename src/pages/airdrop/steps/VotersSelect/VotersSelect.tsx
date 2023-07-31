import { TitleContainer } from "components";
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";
import _ from "lodash";
import { useVotersSelectStore } from "pages/airdrop/store";
import { useEffect } from "react";
import { StyledFlexColumn } from "styles";
import { validateFormik } from "utils";
import { SubmitButtonContainer } from "../SubmitButton";
import { useVotersSelectFormik } from "./form";
import { useVotersSelectSubmit } from "./hooks";
import { SelectDao } from "./SelectDao";
import { SelectMethod } from "./SelectMethod";
import { SelectProposals } from "./SelectProposals";

export function VotersSelect() {
  const { mutate, isLoading } = useVotersSelectSubmit();
  const t = useAirdropTranslations();
  const store = useVotersSelectStore();

  const formik = useVotersSelectFormik(mutate, { votersAmount: store.votersAmount, selectionMethod: store.selectionMethod });

  // useEffect(() => {
  //   formik.resetForm();
  //   if (store.selectionMethod !== formik.values.selectionMethod) {
  //     formik.resetForm();
  //   }
  // }, [store]);

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
