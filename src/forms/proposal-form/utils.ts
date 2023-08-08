import _ from "lodash";
import moment from "moment";
import {
  ProposalMetadata,
  VotingPowerStrategy,
  VotingPowerStrategyType,
} from "ton-vote-contracts-sdk";
import { Dao, ProposalForm, ProposalInputArgs } from "types";
import {
  fromUtcMoment,
  getVoteStrategyType,
  isZeroAddress,
  utcMoment,
} from "utils";

const initialChoices = ["Yes", "No", "Abstain"];

export const getInitialValues = (
  formData: ProposalForm,
  dao?: Dao,
  editMode?: boolean
): ProposalForm => {
  const { proposalEndTime, proposalSnapshotTime, proposalStartTime } =
    getInitialTimestamps();

  return {
    proposalStartTime: editMode
      ? fromUtcMoment(formData.proposalStartTime).valueOf()
      : proposalStartTime,
    proposalEndTime: editMode
      ? fromUtcMoment(formData.proposalEndTime).valueOf()
      : proposalEndTime,
    proposalSnapshotTime: editMode
      ? fromUtcMoment(formData.proposalSnapshotTime).valueOf()
      : proposalSnapshotTime,
    votingChoices: formData.votingChoices || initialChoices,
    description_en: formData.description_en,
    description_ru: formData.description_ru,
    votingSystemType: formData.votingSystemType || 0,
    title_en: formData.title_en,
    votingPowerStrategies: handleInitialVotingPowerStrategies(
      formData.votingPowerStrategies,
      dao
    ),
    hide: formData.hide || false,
  };
};

const handleInitialVotingPowerStrategies = (
  votingPowerStrategies?: VotingPowerStrategy[],
  dao?: Dao
): VotingPowerStrategy[] => {
  const metadataArgs = dao?.daoMetadata.metadataArgs;
  if (votingPowerStrategies && _.size(votingPowerStrategies)) {
    return votingPowerStrategies;
  }

  const jetton =
    metadataArgs?.jetton && !isZeroAddress(metadataArgs?.jetton)
      ? metadataArgs.jetton
      : "";
  const nft =
    metadataArgs?.nft && !isZeroAddress(metadataArgs?.nft)
      ? metadataArgs?.nft
      : "";

  if (jetton) {
    return [
      {
        type: VotingPowerStrategyType.JettonBalance,
        arguments: [{ name: "jetton-address", value: jetton }],
      },
    ];
  }
  if (nft) {
    return [
      {
        type: VotingPowerStrategyType.NftCcollection,
        arguments: [{ name: "nft-address", value: nft }],
      },
    ];
  }

  return [{ type: VotingPowerStrategyType.TonBalance, arguments: [] }];
};

const getInitialTimestamps = () => {
  const now = moment().valueOf();

  let proposalStartTime = moment(now)
    .add("1", "day")
    .set("h", 15)
    .set("s", 0)
    .set("minute", 0)
    .valueOf();

  if (moment(now).utc().hour() < 15) {
    proposalStartTime = moment(proposalStartTime)
      .subtract("1", "day")
      .valueOf();
  }

  return {
    proposalStartTime,
    proposalEndTime: moment(proposalStartTime).add("7", "days").valueOf(),
    proposalSnapshotTime: moment(proposalStartTime)
      .subtract("1", "day")
      .set("h", 0)
      .set("minute", 0)
      .valueOf(),
  };
};

export const handleDefaults = (
  input: ProposalInputArgs,
  dao?: Dao | null
): ProposalInputArgs => {
  const metadataArgs = dao?.daoMetadata.metadataArgs;
  const nftAddress =
    metadataArgs?.nft && !isZeroAddress(metadataArgs?.nft)
      ? metadataArgs?.nft
      : "";
  const jettonAddress =
    metadataArgs?.jetton && !isZeroAddress(metadataArgs?.jetton)
      ? metadataArgs?.jetton
      : "";

  switch (input.name) {
    case "nft-address":
      return {
        ...input,
        default: nftAddress,
      };
    case "jetton-address":
      return {
        ...input,
        default: jettonAddress,
      };

    default:
      return input;
  }
};

export const prepareMetadata = (
  formValues: ProposalForm
): Partial<ProposalMetadata> => {
  const validatorsVote =
    getVoteStrategyType(formValues.votingPowerStrategies) ===
    VotingPowerStrategyType.ValidatorsVote;

  return {
    proposalStartTime: Math.floor(
      utcMoment(formValues.proposalStartTime).valueOf() / 1_000
    ),
    proposalEndTime: validatorsVote
      ? 0
      : Math.floor(utcMoment(formValues.proposalEndTime).valueOf() / 1_000),
    proposalSnapshotTime: validatorsVote
      ? 0
      : Math.floor(
          utcMoment(formValues.proposalSnapshotTime).valueOf() / 1_000
        ),
    votingSystem: {
      votingSystemType: formValues.votingSystemType,
      choices: formValues.votingChoices,
    },
    title: JSON.stringify({ en: formValues.title_en }),
    description: JSON.stringify({ en: formValues.description_en }),
    votingPowerStrategies: formValues.votingPowerStrategies,
    quorum: "",
    hide: formValues.hide,
  };
};
