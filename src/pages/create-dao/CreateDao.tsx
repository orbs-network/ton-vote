import { styled } from "@mui/material";
import { Button, Container, Page } from "components";
import { routes } from "consts";
import { Formik } from "formik";
import { StyledFlexRow } from "styles";
import {Main} from "./Main";
import { FormData, FormSchema, useCreatDaoStore, useCreateDao } from "./store";
import { Box } from "@mui/system";



const initialValues = {
  name: "test",
  twitter: "https://reactdatepicker.com/",
  website: "https://reactdatepicker.com/",
  github: "https://reactdatepicker.com/",
  about: "https://reactdatepicker.com/",
  terms: "https://reactdatepicker.com/",
  ownerAddress: "",
  proposalOwner: "",
};



export function CreateDao() {
  const { mutate, isLoading, data } = useCreateDao();
 

  return (
    <Page back={routes.spaces}>
      <Formik<FormData>
        initialValues={initialValues}
        validationSchema={FormSchema}
        onSubmit={(values) => mutate({ values })}
        validateOnChange={false}
        validateOnBlur={true}
      >
        <StyledContainer>
          {/* <SideMenu /> */}
          <Main isLoading={isLoading} />
        </StyledContainer>
      </Formik>
    </Page>
  );
}


const StyledContainer = styled(StyledFlexRow)({
  gap: 20,
  alignItems: "flex-start",
  width: "100%",
});

const StyledStep = styled(Container)({
  flex: 1,
});
