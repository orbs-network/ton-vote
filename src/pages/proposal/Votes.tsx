import { Box, Chip, Fade, styled, Typography, useTheme } from "@mui/material";
import {
  AddressDisplay,
  AppTooltip,
  Button,
  List,
  LoadingContainer,
  LoadMore,
  NumberDisplay,
  TitleContainer,
} from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { getSymbol, nFormatter, parseLanguage } from "utils";
import { PAGE_SIZE } from "config";
import { Proposal, Vote } from "types";
import { fromNano } from "ton";
import { useMemo, useState } from "react";
import moment from "moment";
import _ from "lodash";
import { useConnection } from "ConnectionProvider";
import { CSVLink } from "react-csv";
import { VotingPowerStrategy } from "ton-vote-contracts-sdk";
import { useProposalPageQuery } from "./query";
import { GrDocumentCsv } from "react-icons/gr";
import { useTranslation } from "react-i18next";

const ContainerHeader = () => {
  const { data, isLoading } = useProposalPageQuery();

  const totalTonAmount = data?.proposalResult?.totalWeight || "0";
  const votesLength = _.size(data?.votes);

  const tonAmount = useMemo(() => {
    return nFormatter(Number(fromNano(totalTonAmount)));
  }, [totalTonAmount]);
  const isNFT =
    data?.metadata?.votingPowerStrategy === VotingPowerStrategy.NftCcollection;

  return (
    <StyledContainerHeader>
      <StyledChip
        label={
          <>
            <NumberDisplay value={votesLength} /> votes
          </>
        }
      />
      <StyledFlexRow style={{ width: "unset" }} gap={10}>
        {!isNFT && (
          <Typography className="total" style={{ fontWeight: 600 }}>
            {tonAmount} {getSymbol(data?.metadata?.votingPowerStrategy)}
          </Typography>
        )}
        <DownloadCSV />
      </StyledFlexRow>
    </StyledContainerHeader>
  );
};

const ConnectedWalletVote = () => {
  const { address } = useConnection();

  const { data, dataUpdatedAt } = useProposalPageQuery();

  const walletVote = useMemo(() => {
    return _.find(data?.votes, (it) => it.address === address);
  }, [dataUpdatedAt, address]);

  return (
    <VoteComponent
      votingPowerStrategy={data?.metadata?.votingPowerStrategy}
      data={walletVote}
    />
  );
};

const StyledContainerHeader = styled(StyledFlexRow)({
  flex: 1,
  justifyContent: "space-between",
  ".total": {
    fontSize: 14,
  },
  "@media (max-width: 600px)": {
    ".total": {
      fontSize: 13,
    },
  },
});

export function Votes() {
  const connectedAddress = useConnection().address;
  const [votesShowAmount, setShowVotesAMount] = useState(PAGE_SIZE);

  const { data, isLoading } = useProposalPageQuery();

  const votingPowerStrategy = data?.metadata?.votingPowerStrategy;
  const showMoreVotes = () => {
    setShowVotesAMount((prev) => prev + PAGE_SIZE);
  };

  if (isLoading) {
    return <LoadingContainer />;
  }

  return (
    <StyledContainer title="Recent votes" headerComponent={<ContainerHeader />}>
      <List
        isLoading={isLoading}
        isEmpty={!isLoading && !_.size(data?.votes)}
        emptyComponent={<Empty />}
      >
        <StyledList gap={0}>
          <ConnectedWalletVote />
          {data?.votes?.map((vote, index) => {
            if (index >= votesShowAmount || vote.address === connectedAddress)
              return null;
            return (
              <VoteComponent
                votingPowerStrategy={votingPowerStrategy}
                data={vote}
                key={vote.address}
              />
            );
          })}
        </StyledList>
      </List>

      <StyledLoadMore
        totalItems={_.size(data?.votes)}
        amountToShow={votesShowAmount}
        showMore={showMoreVotes}
        limit={PAGE_SIZE}
      />
    </StyledContainer>
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
  return (
    <StyledNoVotes>
      <Typography>No votes</Typography>
    </StyledNoVotes>
  );
};

const DownloadCSV = () => {
  const theme = useTheme();
  const { data, dataUpdatedAt } = useProposalPageQuery(false);
  const {t} = useTranslation()

  const csvData = useMemo(() => {
    const values = _.map(data?.votes, (vote) => {
      return [
        vote.address,
        vote.vote,
        vote.votingPower,
        moment.unix(vote.timestamp).format("DD/MM/YY HH:mm:ss"),
      ];
    });
    values.unshift([
      t("address") as string,
      t("vote") as string,
      t("votingPower") as string,
      t("date") as string,
    ]);
    return values;
  }, [dataUpdatedAt]);

  return (
    <CSVLink data={csvData} filename={parseLanguage(data?.metadata?.title)}>
      <AppTooltip text="Download CSV" placement="top">
        <GrDocumentCsv
          style={{ width: 18, height: 18, color: theme.palette.text.primary }}
        />
      </AppTooltip>
    </CSVLink>
  );
};

const VoteComponent = ({
  data,
  votingPowerStrategy,
}: {
  data?: Vote;
  votingPowerStrategy?: VotingPowerStrategy;
}) => {
  const connectedAddress = useConnection().address;

  if (!data) return null;
  const { address, votingPower, vote, hash, timestamp } = data;

  const isYou = connectedAddress === address;

  const isNFT = votingPowerStrategy === VotingPowerStrategy.NftCcollection;

  return (
    <StyledAppTooltip
      text={`${moment.unix(timestamp).utc().fromNow()}`}
      placement="top"
    >
      <StyledVote justifyContent="flex-start">
        <StyledAddressDisplay
          address={address}
          displayText={isYou ? "You" : ""}
        />
        <Typography
          style={{
            textAlign: isNFT ? "right" : "center",
          }}
          className="vote"
        >
          {_.isArray(vote) ? vote.join(", ") : vote}
        </Typography>
        {!isNFT && (
          <Typography className="voting-power">
            {nFormatter(Number(votingPower))} {getSymbol(votingPowerStrategy)}
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

const StyledContainer = styled(TitleContainer)({
  ".title-container-children": {
    padding: 0,
  },
});

const StyledChip = styled(Chip)({
  height: 28,
  "*": {
    fontWeight: 600,
    fontSize: 13,
  },
});
