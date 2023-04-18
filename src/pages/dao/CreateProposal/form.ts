import { FormikProps } from "formik";
import moment from "moment";
import { InputInterface } from "types";
import * as Yup from "yup";

export interface FormData {
  proposalStartTime?: number;
  proposalEndTime?: number;
  proposalSnapshotTime?: number;
  description: string;
  title: string;
}

export const FormSchema = Yup.object().shape({
  proposalStartTime: Yup.number()
    .required("Required")
    .test(
      "error",
      "Proposal start time must be greater than current time",
      (value = 0) => {
        return value > moment().valueOf();
      }
    ),
  proposalEndTime: Yup.number()
    .required("Required")
    .test(
      "error",
      "Proposal end time must be greater than proposal start time",
      (value = 0, context) => {
        return value > context.parent.proposalStartTime;
      }
    )
    .test(
      "error2",
      "Proposal end time must be greater than proposal start time",
      (value = 0, context) => {
        return value > context.parent.proposalStartTime;
      }
    ),
  proposalSnapshotTime: Yup.number()
    .test(
      "error",
      "Proposal snapshot time must be smaller than proposal start time",
      (value = 0, context) => {
        return value < context.parent.proposalStartTime!;
      }
    )
    .test(
      "error2",
      "Proposal snapshot time must be up to 14 days ago",
      (value = 0, context) => {
        return value >= moment().subtract('14', 'days').valueOf();
      }
    )
    .required("Required"),
});

export const useInputs = (formik: FormikProps<FormData>): InputInterface[] => {
  const { values } = formik;
  return [
    {
      label: "Title",
      type: "text",
      name: "title",
    },
    {
      label: "Description",
      type: "textarea",
      name: "description",
      rows: 5,
    },
    {
      label: "Start time",
      type: "date",
      name: "proposalStartTime",
      min: moment().valueOf(),
    },
    {
      label: "End time",
      type: "date",
      name: "proposalEndTime",
      min: values.proposalStartTime,
    },
    {
      label: "Snapshot time",
      type: "date",
      name: "proposalSnapshotTime",
      max: values.proposalStartTime,
      min: moment().subtract("14", "days").valueOf(),
    },
  ];
};
