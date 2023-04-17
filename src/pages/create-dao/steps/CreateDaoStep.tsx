import { Box, styled, Typography } from "@mui/material";
import { Button, Container, FadeElement, Header, Img, Link, TitleContainer } from "components";
import moment from "moment";
import { StyledFlexColumn } from "styles";
import { InputInterface } from "types";
import { useInputs } from "./form";
import { FormData, useCreatDaoStore, useCreateDao } from "../store";
import { Submit } from "./Submit";
import { getTonScanContractUrl } from "utils";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

export function CreateDaoStep() {
  const { mutate: createDao, isLoading } = useCreateDao();

  const { prevStep, formData } = useCreatDaoStore();
  const data = formData as any as FormData;

  const inputs = useInputs();
  return (
    <FadeElement show={true}>
      <StyledContainer
        title="Create Dao"
        headerComponent={<StyledEdit onClick={prevStep}>Edit</StyledEdit>}
      >
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
            <Button isLoading={isLoading} onClick={() => createDao()}>
              Create Dao
            </Button>
          </Submit>
        </StyledFlexColumn>
      </StyledContainer>
    </FadeElement>
  );
}
const StyledContainer = styled(TitleContainer)({});

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
  console.log(input);

  const getValue = () => {
    if (input.type === "url") {
      return <Link href={value}>{value}</Link>;
    }
    if (input.type === "address") {
      return <Link href={getTonScanContractUrl(value)}>{value}</Link>;
    }
    if (input.type === "image") {
      return (
        <StyledImgContainer>
          <StyledImg src={value} />{" "}
        </StyledImgContainer>
      );
    }
    if (input.type === "checkbox") {
      return <Typography>{value ? "Yes" : "No"}</Typography>;
    }
    if(input.type=== 'textarea') {
      return (
        <StyledMd>
          <ReactMarkdown>{value || ""}</ReactMarkdown>
        </StyledMd>
      );
    }
    return <Typography>{value}</Typography>;
  };

  return (
    <StyledInputPreview>
      <Typography className="label">{input.label}</Typography>
      {getValue()}
    </StyledInputPreview>
  );
};

const StyledMd = styled(Box)({
  p:{
    margin: 0
  }
})

const StyledImgContainer = styled(Box)({
  width: 50,
  height: 50,
  borderRadius: "50%",
  background: "lightgray",
  overflow:'hidden'
});

const StyledImg = styled(Img)({

});

const StyledInputPreview = styled(StyledFlexColumn)({
  alignItems: "flex-start",
  gap: 5,
  ".label": {
    fontSize: 14,
    fontWeight: 600,
  },
});

const StyledEdit = styled(Button)({
  padding: "5px 15px",
  height: "unset",
  "*": {
    fontSize: 14,
  },
});
