import { Box, styled } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Container,
  FadeElement,
  Input,
  useNotification,
} from "components";
import { contract } from "data-service";
import { Formik } from "formik";
import { StyledFlexColumn } from "styles";
import { InputInterface } from "types";
import * as Yup from "yup";

export const FormSchema = Yup.object().shape({
  title: Yup.string().required("Required"),
  discussion: Yup.string().url("invalid URL"),
});

const inputs: InputInterface[] = [
  {
    label: "Title",
    type: "text",
    name: "title",
  },
  {
    label: "Description (optional)",
    type: "textarea",
    name: "description",
  },
  {
    label: "Discussion (optional)",
    type: "url",
    name: "discussion",
  },
];

interface FormData {
  title: string;
  description: string;
  discussion: string;
}

const initialValues: FormData = {
  title: "",
  description: "",
  discussion: "",
};

export const useCreateProposal = () => {
  const { showNotification } = useNotification();
  return useMutation(
    async (args: any) => {
      return contract.createProposal(
        args.title,
        args.description,
        args.discussion
      );
    },
    {
      onSuccess: () => {
        showNotification({ variant: "success", message: "Proposal created" });
      },
    }
  );
};

function CreateProposal() {
  const { mutate: create, isLoading } = useCreateProposal();

  return (
    <StyledContainer title="Create Proposal">
      <FadeElement>
        <Formik<FormData>
          initialValues={initialValues}
          validationSchema={FormSchema}
          onSubmit={(values) => {}}
          validateOnChange={false}
          validateOnBlur={true}
        >
          {(formik) => {
            return (
              <StyledFlexColumn gap={30}>
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
                      rows={input.type === "textarea" ? 4 : 1}
                    />
                  );
                })}
                <StyledSubmit isLoading={isLoading} onClick={formik.submitForm}>
                  Submit
                </StyledSubmit>
              </StyledFlexColumn>
            );
          }}
        </Formik>
      </FadeElement>
    </StyledContainer>
  );
}

export { CreateProposal };

const StyledSubmit = styled(Button)({
  minWidth: 250,
});

const StyledContainer = styled(Container)({
  flex: 1,
});
