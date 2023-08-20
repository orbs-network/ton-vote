import { Box, styled, Typography } from "@mui/material";
import {
  AddressDisplay,
  AppTooltip,
  List,
  LoadingContainer,
  LoadMore,
} from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { nFormatter } from "utils";
import { PAGE_SIZE } from "config";
import { Vote } from "types";
import { useState } from "react";
import moment from "moment";
import _ from "lodash";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useTonAddress } from "@tonconnect/ui-react";
import {
  useAppParams,
  useGetProposalSymbol,
  useIsOneWalletOneVote,
} from "hooks/hooks";
import { useWalletVote } from "../hooks";

const ConnectedWalletVote = () => {
  const { proposalAddress } = useAppParams();
  const walletVote = useWalletVote(proposalAddress);
  const symbol = useGetProposalSymbol(proposalAddress);
  const isOneWalletOneVote = useIsOneWalletOneVote(proposalAddress);
  
  return (
    <VoteComponent
      hideVotingPower={!!isOneWalletOneVote}
      symbol={symbol}
      data={walletVote}
    />
  );
};

export function Votes({
  votes,
  isLoading,
}: {
  votes: Vote[];
  isLoading: boolean;
}) {
  const connectedAddress = useTonAddress();
  const [votesShowAmount, setShowVotesAMount] = useState(PAGE_SIZE);
  const { proposalAddress } = useAppParams();
  const isOneWalletOneVote = useIsOneWalletOneVote(proposalAddress);
  const symbol = useGetProposalSymbol(proposalAddress);
  const showMoreVotes = () => {
    setShowVotesAMount((prev) => prev + PAGE_SIZE);
  };

  if (isLoading) {
    return <LoadingContainer />;
  }

  return (
    <>
      <List
        isLoading={isLoading}
        isEmpty={!isLoading && !_.size(votes)}
        emptyComponent={<Empty />}
      >
        <StyledList gap={0}>
          <ConnectedWalletVote />
          {votes.map((vote, index) => {
            if (index >= votesShowAmount || vote.address === connectedAddress)
              return null;
            return (
              <VoteComponent
                hideVotingPower={!!isOneWalletOneVote}
                symbol={symbol}
                data={vote}
                key={vote.address}
              />
            );
          })}
        </StyledList>
      </List>

      <StyledLoadMore
        totalItems={_.size(votes)}
        amountToShow={votesShowAmount}
        showMore={showMoreVotes}
        limit={PAGE_SIZE}
      />
    </>
  );
}

const StyledLoadMore = styled(LoadMore)({
  marginTop: 20,
  width: "90%",
  marginLeft: "auto",
  marginRight: "auto",
  marginBottom: 20,
});

const Empty = () => {
  const translations = useProposalPageTranslations();
  return (
    <StyledNoVotes>
      <Typography>{translations.noVotes}</Typography>
    </StyledNoVotes>
  );
};

const VoteComponent = ({
  data,
  symbol,
  hideVotingPower,
}: {
  data?: Vote;
  symbol?: string;
  hideVotingPower: boolean;
}) => {
  const connectedAddress = useTonAddress();
  const translations = useProposalPageTranslations();
  if (!data) return null;
  const { address, votingPower, vote, hash, timestamp } = data;

  const isYou = connectedAddress === address;

  return (
    <StyledAppTooltip
      text={`${moment.unix(timestamp).utc().fromNow()}`}
      placement="top"
    >
      <StyledVote justifyContent="flex-start">
        <StyledAddressDisplay
          address={address}
          displayText={isYou ? translations.you : ""}
        />
        <Typography
          className="vote"
          style={{ textAlign: hideVotingPower ? "right" : "center" }}
        >
          {_.isArray(vote) ? vote.join(", ") : vote}
        </Typography>
        {!hideVotingPower && (
          <Typography className="voting-power">
            {nFormatter(Number(votingPower))} {symbol}
          </Typography>
        )}
      </StyledVote>
    </StyledAppTooltip>
  );
};

const StyledAppTooltip = styled(AppTooltip)({
  width: "100%",
});

const StyledAddressDisplay = styled(AddressDisplay)({
  justifyContent: "flex-start",
  width: 160,
});

const StyledNoVotes = styled(Box)({
  padding: "20px",
  p: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: 600,
  },
});

const StyledVote = styled(StyledFlexRow)({
  borderBottom: "0.5px solid rgba(114, 138, 150, 0.16)",
  padding: "15px 25px",
  gap: 10,
  ".vote": {
    flex: 1,
    textAlign: "center",
  },
  ".voting-power": {
    width: 160,
    textAlign: "right",
    gap: 5,
    ".number-display": {
      flex: 1,
    },
  },

  "@media (max-width: 850px)": {
    alignItems: "flex-start",
    flexWrap: "wrap",

    ".address": {
      maxWidth: "60%",
    },
    ".date": {},
    ".vote": {
      flex: "unset",
      marginLeft: "auto",
    },
    ".voting-power": {
      width: "100%",
      textAlign: "left",
      justifyContent: "flex-start",
      ".number-display ": {
        flex: "unset",
        maxWidth: "70%",
      },
    },
  },
});

const StyledList = styled(StyledFlexColumn)({});
