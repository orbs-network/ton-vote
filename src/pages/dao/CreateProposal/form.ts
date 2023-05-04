import { ABOUT_CHARS_LIMIT, TITLE_LIMIT } from "consts";
import _ from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { VotingPowerStrategy } from "ton-vote-contracts-sdk";
import { validateAddress } from "utils";
import * as Yup from "yup";
import { FormArgs } from "types";
import { CreateProposalForm } from "./types";
import { useMemo } from "react";
export const useCreateProposalForm = (
  formData: CreateProposalForm
): FormArgs[] => {
  const { t } = useTranslation();

  const { proposalStartTime, proposalEndTime } = formData;

  return useMemo(() => {
    const start = moment(formData.proposalStartTime);
    const end = moment(formData.proposalEndTime);

    const diff = moment.duration(moment(end).diff(moment(start)));
    const days = diff.days();
    const hours = diff.hours();
    const duration = `${days} days ${hours ? `and ${hours} hours` : ""} `;

    return [
      {
        title: "Create Proposal",
        subTitle:
          "Enter all fields in English. Future versions will support adding translations in multiple languages.",
        inputs: [
          {
            label: t("title"),
            type: "text",
            name: "title_en",
            required: true,
            limit: TITLE_LIMIT,
            tooltip:
              "Title of the new proposal, normally 1 sentence. Example: Increase staking reward percentage",
          },
          {
            label: t("description"),
            type: "textarea",
            name: "description_en",
            rows: 9,
            tooltip: t("createProposalDescriptionTooltip") as string,
            limit: ABOUT_CHARS_LIMIT,
            isMarkdown: true,
            required: true,
          },
        ],
      },
      {
        title: t("votingParameters"),
        inputs: [
          {
            label: "Voting power strategy",
            type: "custom",
            name: "strategy",
            tooltip:
              "How is the voting power of each member counted when calculating the vote result. [Read more about strategies](https://github.com/orbs-network/ton-vote/blob/main/STRATEGIES.md)",
            required: true,
          },
          {
            label: "Voting choices",
            type: "list",
            name: "votingChoices",
            required: true,
            disabled: true,
            tooltip:
              "The different options each voting member needs to choose from when submitting their vote.",
          },
        ],
      },
      {
        title: "Voting Period",
        inputsInRow: 2,
        bottomText: `Proposal duration is ${duration}`,
        subTitle:
          "All timestamps are given in UTC (GMT+0). The UTC time 15:00 is a good choice for when most of the world is awake. The current vote duration is 4 days and 10 hours.",
        inputs: [
          {
            label: "Start time ",
            type: "date",
            name: "proposalStartTime",
            required: true,
            tooltip:
              "The UTC time when the vote goes live and members can start submitting their votes. Must be in the future.",
          },
          {
            label: "End time ",
            type: "date",
            name: "proposalEndTime",
            required: true,
            tooltip:
              "The UTC time when the vote terminates and members would no longer be able to submit votes. Must be after start time but no more than 10 days after.",
          },
          {
            label: "Snapshot time ",
            type: "date",
            name: "proposalSnapshotTime",
            required: true,
            tooltip:
              "To protect against manipulation, every member's voting power will be calculated on this snapshot UTC date. Must be before vote start time but no more than 14 days before.",
          },
        ],
      },
    ];
  }, [proposalStartTime, proposalEndTime, t]);
};

/// validation

export const FormSchema = Yup.object().shape({
  title_en: Yup.string()
    .required("Title is Required")
    .test(
      "",
      `Title must be less than or equal to ${TITLE_LIMIT} characters`,
      (value) => {
        return _.size(value) <= TITLE_LIMIT;
      }
    ),
  description_en: Yup.string()
    .required("Description is required")
    .test(
      "",
      `About must be less than or equal to ${ABOUT_CHARS_LIMIT} characters`,
      (value) => {
        return _.size(value) <= ABOUT_CHARS_LIMIT;
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
