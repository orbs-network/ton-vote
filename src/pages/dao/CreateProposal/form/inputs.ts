import { ABOUT_CHARS_LIMIT, TITLE_LIMIT } from "consts";
import _ from "lodash";
import moment from "moment";
import { FormArgs } from "types";
import { CreateProposalForm } from "../types";
import { useMemo } from "react";
import { useCreateProposalTranslations } from "i18n/hooks/useCreateProposalTranslations";
export const useCreateProposalForm = (
  formData: CreateProposalForm
): FormArgs<CreateProposalForm>[] => {
  const translations = useCreateProposalTranslations();
  const { proposalStartTime, proposalEndTime } = formData;

  return useMemo(() => {
    const start = moment(formData.proposalStartTime);
    const end = moment(formData.proposalEndTime);

    const diff = moment.duration(moment(end).diff(moment(start)));
    const days = diff.days();
    const hours = diff.hours();
    const invalidDuration = days < 0 || hours < 0;

    const duration = invalidDuration
      ? ""
      : `${days} days ${hours ? `and ${hours} hours` : ""} `;
    return [
      {
        title: translations.formTitle,
        subTitle: translations.subTitle,
        inputs: [
          {
            label: translations.title,
            type: "text",
            name: "title_en",
            required: true,
            limit: TITLE_LIMIT,
            tooltip: translations.tooltips.title,
          },
          {
            label: translations.description,
            type: "textarea",
            name: "description_en",
            rows: 9,
            tooltip: translations.tooltips.description,
            limit: ABOUT_CHARS_LIMIT,
            isMarkdown: true,
            required: true,
          },
        ],
      },
      {
        title: translations.votingParameters,
        inputs: [
          {
            label: translations.votingPowerStrategy,
            type: "custom",
            name: "votingPowerStrategies",
            tooltip: translations.tooltips.votingPowerStrategy,
            required: true,
          },
          {
            label: translations.votingChoices,
            type: "list",
            name: "votingChoices",
            required: true,
            disabled: true,
            tooltip: translations.tooltips.votingChoices,
          },
        ],
      },
      {
        title: translations.votingPeroid,
        inputsInRow: 2,
        bottomText: duration
          ? `${translations.proposalDuration} ${duration}`
          : "",
        subTitle: translations.votingPeriodInfo,
        inputs: [
          {
            label: translations.startTime,
            type: "date",
            name: "proposalStartTime",
            required: true,
            tooltip: translations.tooltips.startTime,
          },
          {
            label: translations.endTime,
            type: "date",
            name: "proposalEndTime",
            required: true,
            tooltip: translations.tooltips.endTime,
          },
          {
            label: translations.snaphotTime,
            type: "date",
            name: "proposalSnapshotTime",
            required: true,
            tooltip: translations.tooltips.snapshotTime,
          },
        ],
      },
    ];
  }, [proposalStartTime, proposalEndTime, translations]);
};
