import axios from "axios";
import _ from "lodash";
import { ProposalInfo, RawVotes, Results, Vote } from "types";

const axiosInstance = axios.create({
  baseURL: "https://one-wallet-one-vote.herokuapp.com/",
});



const getLastFetchUpdate = async (): Promise<number> => {
  return (await axiosInstance.get("/fetchUpdateTime")).data;
};

const getStateUpdateTime = async (): Promise<number> => {
  return (await axiosInstance.get("/stateUpdateTime")).data;
};

const getProposalInfo = async (): Promise<ProposalInfo> => {
  return (await axiosInstance.get("/info")).data;
};

const getState = async (): Promise<GetStateApiPayload> => {
  return  (await axiosInstance.get("/state")).data;
};

const getMaxLt = async (): Promise<string> => {
  return (await axiosInstance.get("/maxLt")).data;
};

export const api = {
  getLastFetchUpdate,
  getStateUpdateTime,
  getProposalInfo,
  getState,
  getMaxLt,
};


export interface GetStateApiPayload {
  votes: RawVotes;
  votingPower: VotingPower;
  proposalResults: Results;
  maxLt: string;
}



export interface VotingPower {
  [voter: string]: string;
}

