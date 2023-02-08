import styled from "@emotion/styled";
import { Typography, IconButton, Button, Box } from "@mui/material";
import { style } from "@mui/system";
import { voteOptions } from "config";
import moment from "moment";
import { VariantType, SnackbarOrigin, useSnackbar } from "notistack";
import { useProposalInfoQuery } from "queries";
import { ReactNode, useMemo } from "react";
import { useVoteStore, useWalletStore } from "store";
import { Vote } from "types";

export const useWalletVote = () => {
  const { setVote } = useVoteStore();

  return (votes: Vote[], walletAddress = useWalletStore.getState().address) => {
    if (!walletAddress) return votes;
    let vote = votes.find((it) => it.address === walletAddress);
   
    
    if (!vote) return votes;
    const index = votes.findIndex((it) => it.address === walletAddress);
    votes.splice(index, 1);
    votes.unshift(vote);

    const value = voteOptions.find((it) => it.name === vote?.vote)?.value;
    setVote(value);

    return votes;
  };
};



export const useIsVoteEnded = () => {
  const endDate = useProposalInfoQuery().data?.endDate;

  return useMemo(() => {
    if (!endDate) {
      return false;
    }
    return moment.unix(Number(endDate)).utc().valueOf() < moment().valueOf();
  }, [endDate]);
};
