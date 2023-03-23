import { styled } from "@mui/material";
import { Button, Container, Img, Input, UploadInput } from "components";
import React, { useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { InputInterface } from "types";
import { Form, useFormik, useFormikContext } from "formik";
import * as Yup from "yup";
import { FormData } from "./store";
import { StyledDaoAvatar } from "pages/daos/styles";
import { Box } from "@mui/system";

const FormSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  github: Yup.string().url("invalid URL").required("Required"),
  website: Yup.string().url("invalid URL").required("Required"),
  twitter: Yup.string().url("invalid URL").required("Required"),
  about: Yup.string().url("invalid URL").required("Required"),
  terms: Yup.string().url("invalid URL").required("Required"),
});



const inputs: InputInterface[] = [
  {
    label: "About",
    type: "text",
    name: "about",
  },
  {
    label: "Name",
    type: "text",
    name: "name",
  },
  {
    label: "Github",
    type: "url",
    name: "github",
  },
  {
    label: "Twitter",
    type: "url",
    name: "twitter",
  },
  {
    label: "Website",
    type: "url",
    name: "website",
  },
  {
    label: "Terms",
    type: "url",
    name: "terms",
  },
];

function Main() {
  const [avatar, setAvatar] = useState<any>("");

  const formik = useFormikContext<FormData>();


  return (
    <StyledContainer title="Create Dao">
      <Form>
        <StyledFlexColumn gap={30}>
          <StyledFlexRow gap={70}>
            <StyledAvatar>
              {avatar && <StyledImg src={URL.createObjectURL(avatar)} />}
            </StyledAvatar>
            <StyledUpload onChange={setAvatar} />
          </StyledFlexRow>
          {inputs.map((input) => {
            const name = input.name as keyof FormData;
            return (
              <Input
                onFocus={() => formik.setFieldError(name, "")}
                key={name}
                error={formik.errors[name]}
                title={input.label}
                value={formik.values[name]}
                name={name}
                onChange={formik.handleChange}
              />
            );
          })}

          <Button isLoading={formik.isSubmitting} onClick={formik.submitForm}>
            Submit
          </Button>
        </StyledFlexColumn>
      </Form>
    </StyledContainer>
  );
}

const StyledUpload = styled(UploadInput)({
  flex:1,
  height: 200,
});

export default Main;

const StyledAvatar = styled(Box)({
  background: "rgba(211, 211, 211, 0.6)",
  width: 140,
  height: 140,
  borderRadius: "50%",
  overflow: "hidden",
});

const StyledImg = styled(Img)({
  width: '100%',
  height: '100%',
 
});

const StyledContainer = styled(Container)({});
