import { ABOUT_CHARS_LIMIT, TITLE_LIMIT } from "consts";
import _ from "lodash";
import moment from "moment";
import { FormArgs, ProposalForm, ProposalStatus } from "types";
import { useMemo } from "react";
import { useCreateProposalTranslations } from "i18n/hooks/useCreateProposalTranslations";
export const useCreateProposalForm = (
  formData: ProposalForm,
  editMode?: boolean,
  status?: ProposalStatus
): FormArgs<ProposalForm>[] => {
  const translations = useCreateProposalTranslations();
  const { proposalStartTime, proposalEndTime } = formData;

  return useMemo(() => {
    const start = moment(formData.proposalStartTime);
    const end = moment(formData.proposalEndTime);

    const diff = moment.duration(moment(end).diff(moment(start)));
    const days = diff.days();
    const hours = diff.hours();
    const invalidDuration = days < 0 || hours < 0;

    const baseDetails: FormArgs<ProposalForm> = {
      title: "",
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
    };

    const votingParameters: FormArgs<ProposalForm> = {
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
          tooltip: translations.tooltips.votingChoices,
        },
      ],
    };

    const duration = invalidDuration
      ? ""
      : `${days} days ${hours ? `and ${hours} hours` : ""} `;

    const votingPeriod: FormArgs<ProposalForm> = {
      title: translations.votingPeroid,
      inputsInRow: 2,
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
        {
          style: { width: "100%" },
          label: "",
          type: "display-text",
          name: "",
          text: duration ? `${translations.proposalDuration} ${duration}` : "",
        },
        {
          label: "Hide",
          type: "checkbox",
          name: "hide",
          tooltip: "Hide proposal from public view",
        },
      ],
    };

    if (!editMode) {
      return [baseDetails, votingParameters, votingPeriod];
    }

    if (status === ProposalStatus.NOT_STARTED) {
      return [baseDetails, votingParameters, votingPeriod];
    }

    return [baseDetails];
  }, [proposalStartTime, proposalEndTime, translations]);
};
