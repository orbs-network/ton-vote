import _ from "lodash";
import moment from "moment";
import { ProposalMetadata, VotingPowerStrategy, VotingPowerStrategyType } from "ton-vote-contracts-sdk";
import { Dao } from "types";
import { isZeroAddress, utcMoment } from "utils";
import { CreateProposalForm, CreateProposalInputArgs } from "./types";

export const prepareMetadata = (
  formValues: CreateProposalForm
): Partial<ProposalMetadata> => {
  return {
    proposalStartTime: Math.floor(
      utcMoment(formValues.proposalStartTime).valueOf() / 1_000
    ),
    proposalEndTime: Math.floor(
      utcMoment(formValues.proposalEndTime).valueOf() / 1_000
    ),
    proposalSnapshotTime: Math.floor(
      utcMoment(formValues.proposalSnapshotTime).valueOf() / 1_000
    ),
    votingSystem: {
      votingSystemType: formValues.votingSystemType,
      choices: formValues.votingChoices,
    },
    title: JSON.stringify({ en: formValues.title_en }),
    description: JSON.stringify({ en: formValues.description_en }),
    votingPowerStrategies: formValues.votingPowerStrategies,
  };
};


export const getInitialValues = (
  formData: CreateProposalForm,
  dao?: Dao
): CreateProposalForm => {
  const { proposalEndTime, proposalSnapshotTime, proposalStartTime } =
    getInitialTimestamps();

  return {
    proposalStartTime,
    proposalEndTime,
    proposalSnapshotTime,
    votingChoices: formData.votingChoices || initialChoices,
    description_en: formData.description_en,
    description_ru: formData.description_ru,
    votingSystemType: formData.votingSystemType || 0,
    title_en: formData.title_en,
    votingPowerStrategies: handleInitialVotingPowerStrategies(
      formData.votingPowerStrategies,
      dao
    ),
  };
};

const handleInitialVotingPowerStrategies = (
  votingPowerStrategies?: VotingPowerStrategy[],
  dao?: Dao
): VotingPowerStrategy[] => {
  if (votingPowerStrategies && _.size(votingPowerStrategies)) {
    return votingPowerStrategies;
  }

  const jetton =
    dao?.daoMetadata.jetton && !isZeroAddress(dao?.daoMetadata.jetton)
      ? dao?.daoMetadata.jetton
      : "";
  const nft =
    dao?.daoMetadata.nft && !isZeroAddress(dao?.daoMetadata.nft)
      ? dao?.daoMetadata.nft
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


const initialChoices = ["Yes", "No", "Abstain"];

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
  input: CreateProposalInputArgs,
  dao?: Dao
): CreateProposalInputArgs => {
  const nftAddress =
    dao?.daoMetadata.nft && !isZeroAddress(dao?.daoMetadata.nft)
      ? dao?.daoMetadata.nft
      : "";
  const jettonAddress =
    dao?.daoMetadata.jetton && !isZeroAddress(dao?.daoMetadata.jetton)
      ? dao?.daoMetadata.jetton
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