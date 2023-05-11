import { styled } from "@mui/material";
import { Button, ConnectButton, FormikInputsForm } from "components";
import { FormikProps, useFormik } from "formik";
import _ from "lodash";
import { useDaoMetadataSchema } from "forms/dao-form";
import { useMetadataForm } from "./form";
import { DaoMetadataForm } from "types";
import { StyledFlexRow } from "styles";
import { useConnection } from "ConnectionProvider";
import { useDaoFromQueryParam } from "query/getters";
import { useUpdateDaoMetadataQuery } from "query/setters";
import { useDaoAddressFromQueryParam } from "hooks";
import { getInitialValues, prepareMetadata } from "./utils";

export function MetadataForm() {
  const Schema = useDaoMetadataSchema();
  const updateDaoForm = useMetadataForm();
  const { data, refetch } = useDaoFromQueryParam();
  const daoAddress = useDaoAddressFromQueryParam();
  const { mutate: updateMetadata, isLoading } = useUpdateDaoMetadataQuery();

  const formik = useFormik<DaoMetadataForm>({
    initialValues: getInitialValues(data?.daoMetadata),
    validationSchema: Schema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (values) => {
      updateMetadata({
        metadata: prepareMetadata(values),
        daoAddress,
        onSuccess: refetch,
      });
    },
  });

  return (
    <FormikInputsForm<DaoMetadataForm> form={updateDaoForm} formik={formik}>
      <SubmitButton isLoading={isLoading} formik={formik} />
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
  const connectedAddress = useConnection().address;

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
});
