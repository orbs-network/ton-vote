import { styled, Typography } from "@mui/material";
import { Button, Container, Img, MapInput } from "components";
import { StyledFlexColumn, StyledFlexRow, StyledOneLine } from "styles";
import { Form, useFormikContext } from "formik";
import { FormData, useInputs } from "./store";
import { StyledSubmitButton } from "./styles";

const EndAdornment = ({ onClick }: { onClick: () => void }) => {
  return (
    <StyledEndAdornment onClick={onClick}>
      <Typography>Conneted wallet</Typography>
    </StyledEndAdornment>
  );
};

const StyledEndAdornment = styled(Button)({
 padding:'10px 10px',
 height:'unset',
  "p": {
    fontSize: 12,
    display: "inline-block",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
});

export function Main({ isLoading }: { isLoading: boolean }) {
  const formik = useFormikContext<FormData>();
  const inputs = useInputs();

  return (
    <StyledContainer title="Create Dao">
      <Form>
        <StyledFlexColumn gap={30}>
          {inputs.map((input) => {
            return (
              <MapInput<FormData>
                key={input.name}
                input={input}
                formik={formik}
                EndAdornment={EndAdornment}
              />
            );
          })}

          <StyledSubmitButton isLoading={isLoading} onClick={formik.submitForm}>
            Submit
          </StyledSubmitButton>
        </StyledFlexColumn>
      </Form>
    </StyledContainer>
  );
}




const StyledImg = styled(Img)({
  width: 200,
  height: 200,
});

const StyledContainer = styled(Container)({});
