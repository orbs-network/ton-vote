import { ABOUT_CHARS_LIMIT, TITLE_LIMIT } from "consts";
import { useCreateProposalTranslations } from "i18n/hooks/useCreateProposalTranslations";
import _ from "lodash";
import moment from "moment";
import { VotingPowerStrategyType } from "ton-vote-contracts-sdk";
import { ProposalForm } from "types";
import { getVoteStrategyType, utcMoment, validateAddress } from "utils";
import * as Yup from "yup";

const getVotingPowerStrategyArgument = (parent: ProposalForm) => {
  try {
    return parent.votingPowerStrategies[0].arguments[0].value;
  } catch (error) {
    return "";
  }
};

export const useFormSchema = () => {
  const translations = useCreateProposalTranslations();

  return Yup.object().shape({
    title_en: Yup.string()
      .required(translations.errors.isRequired(translations.title))
      .test("", translations.errors.titleLength, (value) => {
        return _.size(value) <= TITLE_LIMIT;
      }),
    description_en: Yup.string()
      .required(translations.errors.isRequired(translations.description))
      .test("", translations.errors.aboutLength, (value) => {
        return _.size(value) <= ABOUT_CHARS_LIMIT;
      }),
    "jetton-address": Yup.string()
      .test("", translations.errors.invalidJettonAddress, (_, context) => {
        const parent = context.parent as ProposalForm;
        return getVoteStrategyType(parent.votingPowerStrategies) ==
          VotingPowerStrategyType.JettonBalance
          ? validateAddress(getVotingPowerStrategyArgument(parent))
          : true;
      })
      .test(
        "",
        translations.errors.isRequired(translations.jettonAddress),
        (value, context) => {
          const parent = context.parent as ProposalForm;
          return getVoteStrategyType(parent.votingPowerStrategies) ==
            VotingPowerStrategyType.JettonBalance
            ? !!getVotingPowerStrategyArgument(parent)
            : true;
        }
      ),
    "nft-address": Yup.string()
      .test("", translations.errors.invalidNFTAddress, (_, context) => {
        const parent = context.parent as ProposalForm;

        return getVoteStrategyType(parent.votingPowerStrategies) ==
          VotingPowerStrategyType.NftCcollection
          ? validateAddress(getVotingPowerStrategyArgument(parent))
          : true;
      })
      .test(
        "",
        translations.errors.isRequired(translations.nftAddress),
        (_, context) => {
          const parent = context.parent as ProposalForm;

          return getVoteStrategyType(parent.votingPowerStrategies) ==
            VotingPowerStrategyType.NftCcollection
            ? !!getVotingPowerStrategyArgument(parent)
            : true;
        }
      ),
    proposalStartTime: Yup.number()
      .required(translations.errors.isRequired(translations.startTime))
      .test("", translations.errors.startTime1, (value = 0) => {   
             
        return moment().add(1, "hours").isBefore(utcMoment(value));
      })
      .test("", translations.errors.startTime2, (value = 0) => {
        return moment(value).isBefore(moment().add("10", "days"));
      }),
    proposalEndTime: Yup.number()
      .required(translations.errors.isRequired(translations.endTime))
      .test("", translations.errors.endTime1, (value = 0, context) => {
        return moment(value).isAfter(moment(context.parent.proposalStartTime));
      })
      .test("", translations.errors.endTime2, (value = 0, context) => {
        const diff = moment(value).diff(
          moment(context.parent.proposalStartTime),
          "days"
        );

        return diff > 0;
      })
      .test("", translations.errors.endTime3, (value = 0, context) => {
        const diff = moment(value).diff(
          moment(context.parent.proposalStartTime),
          "days"
        );

        return diff <= 10;
      }),

    proposalSnapshotTime: Yup.number()

      .test("", translations.errors.snapshotTime1, (value = 0) => {
        return utcMoment().isAfter(moment(value));
      })
      .required(translations.errors.isRequired(translations.snaphotTime)),
  });
};
