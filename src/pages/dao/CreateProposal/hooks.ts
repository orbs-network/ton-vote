import { useDaoAddressFromQueryParam } from "hooks";
import _ from "lodash";
import moment from "moment";
import { useDaoQuery } from "query/queries";
import { useMemo } from "react";
import {
  VotingPowerStrategy,
  VotingPowerStrategyType,
} from "ton-vote-contracts-sdk";
import { InputArgs, Dao } from "types";
import { isZeroAddress } from "utils";
import { STRATEGIES } from "./strategies";
import { CreateProposalForm, CreateProposalInputArgs } from "./types";
const initialChoices = ["Yes", "No", "Abstain"];

const getInitialTimestamps = () => {
  const now = moment().valueOf();

  let proposalStartTime = moment()
    .add("1", "day")
    .set("h", 15)
    .set("minute", 0)
    .valueOf();
  if (moment(now).hour() < 15) {
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

const handleDefaults = (
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

export const useStrategies = () => {
  const daoAddress = useDaoAddressFromQueryParam();
  const { data, dataUpdatedAt } = useDaoQuery(daoAddress);

  return useMemo(() => {
    return _.mapValues(STRATEGIES, (strategy) => {
      return {
        ...strategy,
        args: _.map(strategy.args, (it) => handleDefaults(it, data)),
      };
    });
  }, [dataUpdatedAt]);
};

export const useFormInitialValues = (
  formData: CreateProposalForm,
  dao?: Dao
): CreateProposalForm => {
  const { proposalEndTime, proposalSnapshotTime, proposalStartTime } = useMemo(
    () => getInitialTimestamps(),
    []
  );

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
