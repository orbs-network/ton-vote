import { ABOUT_CHARS_LIMIT, TITLE_LIMIT } from "consts";
import { FormikProps } from "formik";
import _ from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { VotingPowerStrategy } from "ton-vote-contracts-sdk";
import { InputInterface } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";
import { CreateProposalForm } from "./types";

export const FormSchema = Yup.object().shape({
  description_en: Yup.string().test(
    "",
    `About must be less than or equal to ${ABOUT_CHARS_LIMIT} characters`,
    (value, context) => {
      return _.size(value) <= ABOUT_CHARS_LIMIT;
    }
  ),
  title_en: Yup.string()
    .required("Title is Required")
    .test(
      "",
      `Title must be less than or equal to ${TITLE_LIMIT} characters`,
      (value) => {
        return _.size(value) <= TITLE_LIMIT;
      }
    ),
  jetton: Yup.string()
    .test("", "Invalid jetton address", (value, context) => {
      return context.parent.votingPowerStrategy ===
        VotingPowerStrategy.JettonBalance
        ? validateAddress(value)
        : true;
    })
    .test("", "Jetton address requird", (value, context) => {
      return context.parent.votingPowerStrategy ===
        VotingPowerStrategy.JettonBalance
        ? !!value
        : true;
    }),
  nft: Yup.string()
    .test("", "Invalid NFT address", (value, context) => {
      return context.parent.votingPowerStrategy ===
        VotingPowerStrategy.NftCcollection
        ? validateAddress(value)
        : true;
    })
    .test("", "NFT requird", (value, context) => {
      return context.parent.votingPowerStrategy ===
        VotingPowerStrategy.NftCcollection
        ? !!value
        : true;
    }),
  proposalStartTime: Yup.number()
    .required("Proposal start time is required")
    .test(
      "error",
      "Proposal start time must be greater than current time",
      (value = 0) => {
        return value > moment().valueOf();
      }
    ),
  proposalEndTime: Yup.number()
    .required("Proposal end time is required")
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
      "Snapshot time can be up to 14 days before specified start time",
      (value = 0) => {
        return value >= moment().subtract("14", "days").valueOf();
      }
    )
    .test(
      "error3",
      "Snaphot time must be smaller than current time",
      (value = 0) => {
        return value <= moment().valueOf();
      }
    )
    .required("Proposal snapshot time is required"),
});

export const useInputs = (formik: FormikProps<CreateProposalForm>) => {
  const { t } = useTranslation();
  const firstSection: InputInterface[] = [
    {
      label: t("title"),
      type: "text",
      name: "title_en",
      required: true,
      limit: TITLE_LIMIT,
    },
    {
      label: t("description"),
      type: "textarea",
      name: "description_en",
      rows: 9,
      tooltip: t("createProposalDescriptionTooltip") as string,
      limit: ABOUT_CHARS_LIMIT,
      isMarkdown: true,
    },
  ];

  const secondSection: InputInterface[] = [
    {
      label: "Select Voting Strategy",
      type: "select",
      name: "votingPowerStrategy",
      options: [
        {
          key: "Ton Balance",
          value: 0,
        },
        {
          key: "Jetton Balance",
          value: 1,
          input: {
            label: "Jetton Address",
            type: "address",
            name: "jetton",
            required:
              formik.values.votingPowerStrategy ===
              VotingPowerStrategy.JettonBalance,
          },
        },
        {
          key: "NFT Collection",
          value: 2,
          input: {
            label: "NFT Address",
            type: "address",
            name: "nft",
            required:
              formik.values.votingPowerStrategy ===
              VotingPowerStrategy.NftCcollection,
          },
        },
      ],
    },
    {
      label: "Voting choices",
      type: "list",
      name: "votingChoices",
      disabled: true,
    },
  ];

  const thirdSection: InputInterface[] = [
    {
      label: "Snapshot time",
      type: "date",
      name: "proposalSnapshotTime",
      required: true,
      tooltip: "Snapshot time can be up to 14 days before specified start time",
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
  ];

  return {
    firstSection,
    secondSection,
    thirdSection,
  };
};
