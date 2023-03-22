import { styled } from "@mui/material";
import { Button, Container, Img, Input, UploadInput } from "components";
import { useInputValidation } from "hooks";
import React, { useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { InputInterface } from "types";
import { FormData, useCreatDaoStore } from "./store";

interface CreateDaoInput extends InputInterface {
  name: keyof FormData
}

const inputs: CreateDaoInput[] = [
  {
    label: "About",
    type: "text",
    name: "about",
    required: true,
  },
  {
    label: "Name",
    type: "text",
    name: "name",
    required: true,
  },
  {
    label: "Github",
    type: "url",
    name: "github",
    required: true,
  },
  {
    label: "Twitter",
    type: "url",
    name: "twitter",
    required: true,
  },
  {
    label: "Website",
    type: "url",
    name: "website",
    required: true,
  },
  {
    label: "Terms",
    type: "url",
    name: "terms",
    required: true,
  },
];

function Main() {
  const {formData, setFormData, setAvatar} = useCreatDaoStore();
  const { validate, errors, clearError } = useInputValidation(inputs);

  return (
    <StyledContainer title="Create Dao">
      <StyledFlexColumn gap={30}>
        <StyledUpload onChange={setAvatar} />
        {inputs.map((input) => {
          const name = input.name;

          return (
            <Input
              onFocus={() => clearError(name)}
              key={name}
              error={errors[name]}
              title={input.label}
              value={formData[name]}
              onChange={(value) => setFormData(name, value)}
            />
          );
        })}

        <Button onClick={() => validate<FormData>(formData)}>Submit</Button>
      </StyledFlexColumn>
    </StyledContainer>
  );
}

const StyledUpload = styled(UploadInput)({
   width:'100%',
    height: 200
});


export default Main;

const StyledContainer = styled(Container)({});
