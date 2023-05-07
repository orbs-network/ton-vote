import { ABOUT_CHARS_LIMIT, TITLE_LIMIT } from "consts";
import _ from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { FormArgs } from "types";
import { CreateProposalForm } from "../types";
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
            name: "votingPowerStrategies",
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
          "All timestamps are given in UTC (GMT+0). The UTC time 15:00 is a good choice for when most of the world is awake.",
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
