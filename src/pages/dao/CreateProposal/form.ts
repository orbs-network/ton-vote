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
  proposalStartTime: Yup.number().required("Required"),
  proposalEndTime: Yup.number().required("Required"),
  proposalSnapshotTime: Yup.number().required("Required"),
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
      min: moment().subtract('14', 'days').valueOf(),
    },
  ];
};
