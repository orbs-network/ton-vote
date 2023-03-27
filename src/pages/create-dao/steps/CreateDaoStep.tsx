import { styled, Typography } from "@mui/material";
import { Button, Container, FadeElement, Img } from "components";
import moment from "moment";
import { StyledFlexColumn } from "styles";
import { InputInterface } from "types";
import { useCreatDaoStore, useCreateDao, useInputs } from "../store";
import { StyledStep, StyledSubmitButton } from "../styles";

export function CreateDaoStep() {
  const { mutate: createDao, isLoading } = useCreateDao();
  const { prevStep, formData } = useCreatDaoStore();
  const data = formData as any as FormData;

  const inputs = useInputs();
  return (
    <FadeElement show={true}>
      <StyledContainer
        title="Create Dao"
        headerChildren={<StyledEdit onClick={prevStep}>Edit</StyledEdit>}
      >
        <StyledStep>
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
          <StyledSubmitButton isLoading={isLoading} onClick={createDao}>
            Create Dao
          </StyledSubmitButton>
        </StyledStep>
      </StyledContainer>
    </FadeElement>
  );
}
const StyledContainer = styled(Container)({});

const StyledInputs = styled(StyledFlexColumn)({
  gap:20
})

const InputPreview = ({
  input,
  value,
}: {
  input: InputInterface;
  value: any;
}) => {
  const { type } = input;

  const getValue = () => {
    if (!value) return null;
    if (type === "date") {
      return <Typography>{moment(value).format("DD/MM/YY HH:mm")}</Typography>;
    }
    if (type === "upload") {
      return <StyledImg src={URL.createObjectURL(value)} />;
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

const StyledImg = styled(Img)({
  width: 150,
  height: 150,
  borderRadius: "50%",
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
  height:'unset',
  "*": {
    fontSize: 14,
  },
});