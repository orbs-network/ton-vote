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
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import { getSymbol, nFormatter } from "utils";
import { PAGE_SIZE } from "config";
import { Proposal, Vote } from "types";
import { fromNano } from "ton";
import { useMemo, useState } from "react";
import moment from "moment";
import _ from "lodash";
import { useConnection } from "ConnectionProvider";
import { CSVLink } from "react-csv";
import { BsFiletypeCsv } from "react-icons/bs";
import { VotingPowerStrategy } from "ton-vote-contracts-sdk";



interface Props {
  state?: Proposal | null;
  isLoading: boolean;
  dataUpdatedAt?: number;
}

const ContainerHeader = (props: Props) => {
  const totalTonAmount = props.state?.proposalResult?.totalWeight || "0";
  const votesLength = _.size(props.state?.votes);

  const tonAmount = useMemo(() => {
    return nFormatter(Number(fromNano(totalTonAmount)));
  }, [totalTonAmount]);
  const isNFT =
    props.state?.metadata?.votingPowerStrategy ===
    VotingPowerStrategy.NftCcollection;

  return (
    <Fade in={!props.isLoading}>
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
              {tonAmount}{" "}
              {getSymbol(props.state?.metadata?.votingPowerStrategy)}
            </Typography>
          )}
          <DownloadCSV {...props} />
        </StyledFlexRow>
      </StyledContainerHeader>
    </Fade>
  );
};

const ConnectedWalletVote = (props: Props) => {
  const { address } = useConnection();

  const walletVote = useMemo(() => {
    return _.find(props.state?.votes, (it) => it.address === address);
  }, [props.dataUpdatedAt, address]);

  return (
    <VoteComponent
      votingPowerStrategy={props.state?.metadata?.votingPowerStrategy}
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

export function Votes(props: Props) {
  const connectedAddress = useConnection().address;
  const [votesShowAmount, setShowVotesAMount] = useState(PAGE_SIZE);
  const showMoreVotes = () => {
    setShowVotesAMount((prev) => prev + PAGE_SIZE);
  };

  if (props.isLoading) {
    return <LoadingContainer />;
  }

  return (
    <StyledContainer
      title="Recent votes"
      headerComponent={<ContainerHeader {...props} />}
    >
      <List
        isLoading={props.isLoading}
        isEmpty={!props.isLoading && !_.size(props.state?.votes)}
        emptyComponent={<Empty />}
      >
        <StyledList gap={0}>
          <ConnectedWalletVote {...props} />
          {props.state?.votes?.map((vote, index) => {
            if (index >= votesShowAmount || vote.address === connectedAddress)
              return null;
            return (
              <VoteComponent
                votingPowerStrategy={props.state?.metadata?.votingPowerStrategy}
                data={vote}
                key={vote.address}
              />
            );
          })}
        </StyledList>
      </List>

      <LoadMore
        totalItems={_.size(props.state?.votes)}
        amountToShow={votesShowAmount}
        showMore={showMoreVotes}
        limit={PAGE_SIZE}
      />
    </StyledContainer>
  );
}

const Empty = () => {
  return (
    <StyledNoVotes>
      <Typography>No votes yet</Typography>
    </StyledNoVotes>
  );
};

const DownloadCSV = (props: Props) => {
  const theme = useTheme();
  const votes = props.state?.votes;
  const size = _.size(votes);

  const csvData = useMemo(() => {
    const values = _.map(votes, (vote) => {
      return [
        vote.address,
        vote.vote,
        vote.votingPower,
        moment.unix(vote.timestamp).format("DD/MM/YY HH:mm:ss"),
      ];
    });
    values.unshift(["Address", "Vote", "Voting Power", "Date"]);
    return values;
  }, [size]);

  return (
    <CSVLink data={csvData} filename={props.state?.metadata?.title}>
      <AppTooltip text="Download CSV" placement="top">
        <BsFiletypeCsv
          style={{ width: 18, height: 18, color: theme.palette.text.primary }}
        />
      </AppTooltip>
    </CSVLink>
  );
};

const StyledCsv = styled(Button)({
  width: 36,
  height: 36,
  padding: 0,
  svg: {
    width: 15,
    height: 15,
  },
});

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
    <StyledAppTooltip text={`${moment.unix(timestamp).utc().fromNow()}`}>
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
          {vote}
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
      ...textOverflow,
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
