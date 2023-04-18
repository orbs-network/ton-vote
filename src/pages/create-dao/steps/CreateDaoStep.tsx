import { Box, styled, Typography } from "@mui/material";
import {
  AppTooltip,
  Button,
  Container,
  FadeElement,
  Header,
  Img,
  Link,
  TitleContainer,
} from "components";
import moment from "moment";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { InputInterface } from "types";
import { useInputs } from "./form";
import { FormData, useCreatDaoStore, useCreateDao } from "../store";
import { Submit } from "./Submit";
import { getTonScanContractUrl, makeElipsisAddress } from "utils";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { StyledProposalOwner } from "pages/dao/ProposalsList/styles";

export function CreateDaoStep() {
  const { mutate: createDao, isLoading } = useCreateDao();

  const { prevStep, formData } = useCreatDaoStore();
  const data = formData as any as FormData;

  const inputs = useInputs();
  return (
    <FadeElement show={true}>
      <StyledContainer>
        <StyledFlexColumn>
          <StyledInputs>
            {inputs.map((input) => {
              const name = input.name as keyof FormData;

              return (
                <InputPreview
                  key={input.name}
                  input={input}
                  value={data[name]}
                />
              );
            })}
          </StyledInputs>
          <Submit>
            <StyledFlexRow gap={20}>
              <Button onClick={prevStep}>Edit</Button>
              <Button isLoading={isLoading} onClick={() => createDao()}>
                Create Dao
              </Button>
            </StyledFlexRow>
          </Submit>
        </StyledFlexColumn>
      </StyledContainer>
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
