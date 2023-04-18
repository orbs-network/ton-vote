import { FormikProps } from "formik";
import moment from "moment";
import { InputInterface } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";

export interface FormData {
  proposalStartTime?: number;
  proposalEndTime?: number;
  proposalSnapshotTime?: number;
  description: string;
  title: string;
  jetton: string;
  nft: string;
}

export const FormSchema = Yup.object().shape({
  title: Yup.string().required("Required"),
  jetton: Yup.string().test("test", "Invalid address", validateAddress),
  nft: Yup.string().test("test", "Invalid address", validateAddress),
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
        return value >= moment().subtract("14", "days").valueOf();
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
      required: true,
    },
    {
      label: "Description",
      type: "textarea",
      name: "description",
      rows: 5,
    },
    {
      label: "Jetton Address",
      type: "address",
      name: "jetton",
    },
    {
      label: "NFT Address",
      type: "address",
      name: "nft",
    },
    {
      label: "Start time",
      type: "date",
      name: "proposalStartTime",
      required: true,
    },
    {
      label: "End time",
      type: "date",
      name: "proposalEndTime",
      required: true,
    },
    {
      label: "Snapshot time",
      type: "date",
      name: "proposalSnapshotTime",
      required: true,
    },
  ];
};
