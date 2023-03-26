import { InputInterface } from "types";
import * as Yup from "yup";

export const FormSchema = Yup.object().shape({
  proposalStartTime: Yup.string().required("Required"),
  proposalEndTime: Yup.string().required("Required"),
  proposalSnapshotTime: Yup.string().required("Required"),
});

export const inputs: InputInterface[] = [
  {
    label: "Start time",
    type: "date",
    name: "proposalStartTime",
  },
  {
    label: "End time",
    type: "date",
    name: "proposalEndTime",
  },
  {
    label: "Snapshot time",
    type: "date",
    name: "proposalSnapshotTime",
  },
];
