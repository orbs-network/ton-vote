import { styled } from "@mui/material";
import { Container, Page } from "components";
import { routes } from "consts";
import { Formik } from "formik";
import { StyledFlexRow } from "styles";
import Main from "./Main";

import * as Yup from "yup";
import { SideMenu } from "./SideMenu";
import { SelectAvatar } from "./steps/SelectAvatar";
import { FormData, useCreatDaoStore, useCreateDao } from "./store";
import { Box } from "@mui/system";

export const FormSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  github: Yup.string().url("invalid URL").required("Required"),
  website: Yup.string().url("invalid URL").required("Required"),
  twitter: Yup.string().url("invalid URL").required("Required"),
  about: Yup.string().url("invalid URL").required("Required"),
  terms: Yup.string().url("invalid URL").required("Required"),
});

const initialValues = {
  name: "test",
  twitter: "https://reactdatepicker.com/",
  website: "https://reactdatepicker.com/",
  github: "https://reactdatepicker.com/",
  about: "https://reactdatepicker.com/",
  terms: "https://reactdatepicker.com/",
};


const steps = [<SelectAvatar />]

export function CreateDao() {
  const {step, avatar} = useCreatDaoStore()
  const {mutate, error} = useCreateDao();

  console.log({ error });
  
  return (
    <Page back={routes.spaces}>
      <Formik<FormData>
        initialValues={initialValues}
        validationSchema={FormSchema}
        onSubmit={(values) => mutate({values, avatar})}
        validateOnChange={false}
        validateOnBlur={true}
      >
        <StyledContainer>
          {/* <SideMenu /> */}
          {/* <StyledSteps>{steps[step]}</StyledSteps> */}
          <Main />
        </StyledContainer>
      </Formik>
    </Page>
  );
}

const StyledSteps = styled(Box)({
  flex: 1
})

const StyledContainer = styled(StyledFlexRow)({
  gap: 20,
  alignItems: "flex-start",
  width:'100%'
});

const StyledStep = styled(Container)({
  flex: 1,
});
