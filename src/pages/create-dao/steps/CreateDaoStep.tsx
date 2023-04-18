import { Box, styled, Typography } from "@mui/material";
import { AppTooltip, Button, Container, FadeElement, Link } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { InputInterface } from "types";
import { createDaoMetadataInputs, useRolesInputs } from "./form";
import {
  DaoMetadataForm,
  RolesForm,
  useCreatDaoStore,
  useCreateDao,
} from "../store";
import { Submit } from "./Submit";
import { getTonScanContractUrl, makeElipsisAddress } from "utils";
import ReactMarkdown from "react-markdown";

export function CreateDaoStep() {
  const { mutate: createDao, isLoading } = useCreateDao();

  const { setStep, daoMetadataForm, rolesForm } = useCreatDaoStore();

  const rolesInputs = useRolesInputs();
  return (
    <FadeElement show={true}>
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
            const name = input.name as keyof DaoMetadataForm;

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
          <StyledFlexRow gap={20}>
            <Button onClick={() => setStep(1)}>Edit</Button>
            <Button isLoading={isLoading} onClick={() => createDao()}>
              Create Dao
            </Button>
          </StyledFlexRow>
        </Submit>
      </StyledFlexColumn>
    </FadeElement>
  );
}

const StyledContainer = styled(Container)({});

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
      return (
        <StyledMd>
          <ReactMarkdown>{value || ""}</ReactMarkdown>
        </StyledMd>
      );
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

const StyledLink = styled(Link)({
  width: "auto",
});

const StyledMd = styled(Box)({
  width:'100%',
  p: {
    margin: 0,
  },
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
