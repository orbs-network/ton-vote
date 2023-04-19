import { TONSCAN_ADDRESS_URL } from "config";
import _ from "lodash";
import moment from "moment";
import { Address, fromNano } from "ton";
import { DaoRoles, ProposalMetadata } from "ton-vote-sdk";
import { ProposalStatus, RawVote, RawVotes, Vote, VotingPower } from "types";
import * as TonVoteSDK from 'ton-vote-sdk'


export const makeElipsisAddress = (address?: string, padding = 6): string => {
  if (!address) return "";
  return `${address.substring(0, padding)}...${address.substring(
    address.length - padding
  )}`;
};

export const Logger = (log: any) => {
  if (import.meta.env.DEV) {
    console.log(log);
  }
};

export const parseVotes = (rawVotes: TonVoteSDK.Votes, votingPower: VotingPower) => {
  let votes: Vote[] = _.map(rawVotes, (v: RawVote, key: string) => {
    const _votingPower = votingPower[key];

    return {
      address: key,
      vote: v.vote,
      votingPower: _votingPower ? fromNano(_votingPower) : "0",
      timestamp: v.timestamp,
      hash: v.hash,
    };
  });

  const sortedVotes = _.orderBy(votes, "timestamp", ["desc", "asc"]);
  return sortedVotes;
};

export function nFormatter(num: number, digits = 2) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  if (num < 1) {
    return num.toFixed(5).replace(rx, "$1");
  }
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
}

export const getTimeDiff = (value: number) => {
  var a = moment(unixToMilliseconds(value));
  var b = moment();
  const days = a.diff(b, "days");
  const hours = a.diff(b, "hours");
  const minutes = a.diff(b, "minutes");

  if (days > 0) {
    return days === 1 ? "1 day" : `${days} days`;
  }
  if (hours > 0) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }

  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
};

export const getProposalStatus = (proposalMetadata?: ProposalMetadata): ProposalStatus | null => {
  
  if (!proposalMetadata) return null;
    const { proposalStartTime, proposalEndTime } = proposalMetadata;
  
  const now = moment.utc().valueOf();
  const voteStarted = unixToMilliseconds(Number(proposalStartTime)) <= now;
  const finished = unixToMilliseconds(Number(proposalEndTime)) <= now;

  return finished
    ? ProposalStatus.CLOSED
    : voteStarted && !finished
    ? ProposalStatus.ACTIVE
    : !voteStarted
    ? ProposalStatus.NOT_STARTED
    : null;
};

export const unixToMilliseconds = (value: Number) => {
  return moment.unix(Number(value)).utc().valueOf();
};

export const urlPatternValidation = (URL: string) => {
  const regex = new RegExp(
    "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?"
  );
  return regex.test(URL);
};

export const getProposalStatusText = (status: ProposalStatus | null) => {
  switch (status) {
    case ProposalStatus.CLOSED:
      return "Ended";
    case ProposalStatus.ACTIVE:
      return "Ongoing";
    case ProposalStatus.NOT_STARTED:
      return "Not started";
    default:
      break;
  }
};



export const getTonScanContractUrl = (address?: string) => {
  if (!address)  return ''
   return `${TONSCAN_ADDRESS_URL}/${address}`;
};

export const calculateTonAmount = (percent?: number, total?: string) => {
  if (!percent || !total) return;
  const result = (Number(fromNano(total)) * percent) / 100;
  return nFormatter(result, 2);
};


export const validateAddress = (value?: string) => {
  if (!value) {
    return true;
  }
  try {
    return Address.isAddress(Address.parse(value));
  } catch (error) {
    return false;
  }
};


export const isOwner = (address?: string, roles?: DaoRoles) => {
  if(!address || !roles) return false
  return address === roles.owner || address === roles.proposalOwner
}