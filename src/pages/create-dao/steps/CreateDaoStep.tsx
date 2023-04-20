import { Box, styled, Typography } from "@mui/material";
import { AppTooltip, Button, Container, FadeElement, Img, Link, Markdown } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { InputInterface } from "types";
import { createDaoMetadataInputs, useRolesInputs } from "./form";
import {
  RolesForm,
  useCreatDaoStore,
  useCreateDao,
} from "../store";
import { Submit } from "./Submit";
import { getTonScanContractUrl, makeElipsisAddress } from "utils";
import { MetadataArgs } from "ton-vote-sdk";
import { Step } from "./Step";
import { useTranslation } from "react-i18next";

export function CreateDaoStep() {
  const { mutate: createDao, isLoading } = useCreateDao();
  const {t} = useTranslation()

  const { setStep, daoMetadataForm, rolesForm } = useCreatDaoStore();

  const rolesInputs = useRolesInputs();
  return (
    <Step title={t("createForum")}>
      <StyledFlexColumn>
        <StyledInputs>
          {rolesInputs.map((input) => {
            const name = input.name as keyof RolesForm;
            return (
              <InputPreview
                key={input.name}
                input={input}
                value={rolesForm[name]}
              />
            );
          })}
          {createDaoMetadataInputs.map((input) => {
            const name = input.name as keyof MetadataArgs;

            return (
              <InputPreview
                key={input.name}
                input={input}
                value={daoMetadataForm[name]}
              />
            );
          })}
        </StyledInputs>
        <Submit>
          <Button isLoading={isLoading} onClick={() => createDao()}>
            {t("createForum")}
          </Button>
        </Submit>
      </StyledFlexColumn>
    </Step>
  );
}

const StyledInputs = styled(StyledFlexColumn)({
  gap: 20,
});

const InputPreview = ({
  input,
  value,
}: {
  input: InputInterface;
  value: any;
}) => {
  const getValue = () => {
    if (input.type === "checkbox") {
      return <Typography>{value ? "Yes" : "No"}</Typography>;
    }
    if (!value) return null;
    if (input.type === "url") {
      return <StyledLink href={value}>{value}</StyledLink>;
    }
     if (input.type === "image") {
       return <StyledImage src={value} />
     }
    if (input.type === "address") {
      return (
        <AppTooltip text={value}>
          <StyledLink href={getTonScanContractUrl(value)}>
            {makeElipsisAddress(value, 7)}
          </StyledLink>
        </AppTooltip>
      );
    }

    if (input.type === "textarea") {
      return <StyledMd>{value}</StyledMd>;
    }
    return <Typography>{value}</Typography>;
  };

  const component = getValue();
  if (!component) return null;
  return (
    <StyledInputPreview>
      <Typography className="label">{`${input.label}:`}</Typography>
      {component}
    </StyledInputPreview>
  );
};

const StyledImage = styled(Img)({
  width:45,
  height:45,
  borderRadius:'50%',
  overflow:'hidden',
})

const StyledLink = styled(Link)({
  width: "auto",
});

const StyledMd = styled(Markdown)({
  width:'100%',
 
});

const StyledInputPreview = styled(StyledFlexRow)({
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 15,
  fontSize: 16,
  ".label": {
    fontWeight: 600,
    fontSize: "inherit",
  },
});
