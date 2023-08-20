import { styled } from "@mui/material";
import { Button, ConnectButton, FormikInputsForm } from "components";
import { FormikProps, useFormik } from "formik";
import _ from "lodash";
import { useDaoMetadataSchema } from "forms/dao-form";
import { useMetadataForm } from "./form";
import { DaoMetadataForm } from "types";
import { StyledFlexRow } from "styles";
import { useDaoQuery } from "query/getters";
import { useAppParams } from "hooks/hooks";
import { getInitialValues, prepareMetadata } from "./utils";
import { useTonAddress } from "@tonconnect/ui-react";
import { UpdateWizard } from "./UpdateWizard";
import { useState } from "react";

export function MetadataForm() {
  const Schema = useDaoMetadataSchema();
  const updateDaoForm = useMetadataForm();
  const { daoAddress } = useAppParams();

  const data = useDaoQuery(daoAddress).data;

  const [showWizard, setShowWizard] = useState(false);


  const formik = useFormik<DaoMetadataForm>({
    initialValues: getInitialValues(data?.daoMetadata.metadataArgs),
    validationSchema: Schema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (values) => {
      setShowWizard(true);
      // updateMetadata({
      //   metadata: prepareMetadata(values),
      //   daoAddress,
      // });
    },
  });

  return (
    <FormikInputsForm<DaoMetadataForm> form={updateDaoForm} formik={formik}>
      <UpdateWizard
        formData={formik.values}
        open={showWizard}
        onClose={() => setShowWizard(false)}
      />
      <SubmitButton isLoading={false} formik={formik} />
    </FormikInputsForm>
  );
}

const SubmitButton = ({
  isLoading,
  formik,
}: {
  isLoading: boolean;
  formik: FormikProps<DaoMetadataForm>;
}) => {
  const connectedAddress = useTonAddress();

  const hide = _.isEqual(formik.values, formik.initialValues);

  if (hide) return null;
  return (
    <StyledSubmit>
      {!connectedAddress ? (
        <ConnectButton />
      ) : (
        <Button isLoading={isLoading} onClick={formik.submitForm}>
          Update Metadata
        </Button>
      )}
    </StyledSubmit>
  );
};

const StyledSubmit = styled(StyledFlexRow)({
  marginTop: 40,
  button: {
    width: "100%",
  },
});
