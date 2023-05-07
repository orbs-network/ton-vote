import { ABOUT_CHARS_LIMIT, TITLE_LIMIT } from "consts";
import _ from "lodash";
import moment from "moment";
import { VotingPowerStrategyType } from "ton-vote-contracts-sdk";
import { getVoteStrategyType, validateAddress } from "utils";
import * as Yup from "yup";
import { CreateProposalForm } from "../types";

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
      const parent = context.parent as CreateProposalForm;
      return getVoteStrategyType(parent.votingPowerStrategies) ===
        VotingPowerStrategyType.JettonBalance
        ? validateAddress(value)
        : true;
    })
    .test("", "Jetton address requird", (value, context) => {
      const parent = context.parent as CreateProposalForm;
      return getVoteStrategyType(parent.votingPowerStrategies) ===
        VotingPowerStrategyType.JettonBalance
        ? !!value
        : true;
    }),
  nft: Yup.string()
    .test("", "Invalid NFT address", (value, context) => {
      const parent = context.parent as CreateProposalForm;

      return getVoteStrategyType(parent.votingPowerStrategies) ===
        VotingPowerStrategyType.NftCcollection
        ? validateAddress(value)
        : true;
    })
    .test("", "NFT address requird", (value, context) => {
      const parent = context.parent as CreateProposalForm;

      return getVoteStrategyType(parent.votingPowerStrategies) ===
        VotingPowerStrategyType.NftCcollection
        ? !!value
        : true;
    }),
  proposalStartTime: Yup.number()
    .required("Proposal start time is required")
    .test(
      "",
      "Proposal start time must be greater than current time",
      (value = 0) => {
        return moment().isBefore(moment(value));
      }
    )
    .test(
      "",
      "Proposal start time can be up to 10 days in the future",
      (value = 0) => {
        return moment(value).isBefore(moment().add("10", "days"));
      }
    ),
  proposalEndTime: Yup.number()
    .required("Proposal end time is required")
    .test(
      "",
      "Proposal end time must be greater than proposal start time",
      (value = 0, context) => {
        return moment(value).isAfter(moment(context.parent.proposalStartTime));
      }
    )
    .test(
      "",
      "Proposal end time must be at least 1 day after proposal start time",
      (value = 0, context) => {
        const diff = moment(value).diff(
          moment(context.parent.proposalStartTime),
          "days"
        );
        console.log(diff);

        return diff > 0;
      }
    )
    .test(
      "",
      "Proposal end time can be up to 10 days after proposal start time",
      (value = 0, context) => {
        const diff = moment(value).diff(
          moment(context.parent.proposalStartTime),
          "days"
        );
        return diff <= 10;
      }
    ),

  proposalSnapshotTime: Yup.number()

    .test("", "Snaphot time must be smaller than current time", (value = 0) => {
      return moment().isAfter(moment(value));
    })
    .required("Proposal snapshot time is required"),
});
