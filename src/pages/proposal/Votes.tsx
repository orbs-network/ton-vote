import { Chip, Fade, styled, Typography } from "@mui/material";
import {
  AppTooltip,
  Container,
  Link,
  List,
  LoadMore,
  NumberDisplay,
} from "components";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import { makeElipsisAddress, nFormatter } from "utils";
import { PAGE_SIZE, TONSCAN } from "config";
import { Vote } from "types";
import { fromNano } from "ton";
import { useMemo, useState } from "react";
import moment from "moment";
import _ from "lodash";
import { useProposalState } from "./hooks";
import { useConnection } from "ConnectionProvider";

const ContainerHeader = () => {
  const { data, isLoading } = useProposalState();

  const totalTonAmount = data?.proposalResult?.totalWeight || "0";
  const votesLength = _.size(data?.votes);

  const tonAmount = useMemo(() => {
    return nFormatter(Number(fromNano(totalTonAmount)));
  }, [totalTonAmount]);

  return (
    <Fade in={!isLoading}>
      <StyledContainerHeader>
        <StyledChip
          label={
            <>
              <NumberDisplay value={votesLength} /> votes
            </>
          }
        />
        <Typography className="total" style={{ fontWeight: 600 }}>
          {tonAmount} TON
        </Typography>
      </StyledContainerHeader>
    </Fade>
  );
};

const ConnectedWalletVote = () => {
  const { data, dataUpdatedAt } = useProposalState();
  const { address } = useConnection();

  const walletVote = useMemo(() => {
    return _.find(data?.votes, (it) => it.address === address);
  }, [dataUpdatedAt, address]);

  return <VoteComponent data={walletVote} />;
};

const StyledContainerHeader = styled(StyledFlexRow)({
  flex: 1,
  justifyContent: "space-between",
  "@media (max-width: 600px)": {
    ".total": {
      fontSize: 13,
    },
  },
});

export function Votes() {
  const { data, isLoading } = useProposalState();
  const connectedAddress = useConnection().address;
  const [votesShowAmount, setShowVotesAMount] = useState(PAGE_SIZE);
  const showMoreVotes = () => {
    setShowVotesAMount((prev) => prev + PAGE_SIZE);
  };

  return (
    <StyledContainer
      title="Recent votes"
      loading={isLoading}
      loaderAmount={3}
      headerChildren={<ContainerHeader />}
    >
      <List
        isLoading={isLoading}
        isEmpty={!isLoading && !_.size(data?.votes)}
        emptyComponent={<StyledNoVotes>No votes yet</StyledNoVotes>}
      >
        <StyledList gap={15}>
          <ConnectedWalletVote />
          {data?.votes?.map((vote, index) => {
            if (index >= votesShowAmount || vote.address === connectedAddress)
              return null;
            return <VoteComponent data={vote} key={vote.address} />;
          })}
        </StyledList>
      </List>

      <LoadMore
        totalItems={_.size(data?.votes)}
        amountToShow={votesShowAmount}
        showMore={showMoreVotes}
        limit={PAGE_SIZE}
      />

    </StyledContainer>
  );
}

const VoteComponent = ({ data }: { data?: Vote }) => {
  const connectedAddress = useConnection().address;

  if (!data) return null;
  const { address, votingPower, vote, hash, timestamp } = data;

  return (
    <StyledVote justifyContent="flex-start">
      <AppTooltip text={`${moment.unix(timestamp).utc().fromNow()}`}>
        <Link className="address" href={`${TONSCAN}/tx/${hash}`}>
          {connectedAddress === address
            ? "You"
            : makeElipsisAddress(address, 5)}
        </Link>
      </AppTooltip>
      <Typography className="vote">{vote}</Typography>
      <Typography className="voting-power">
        {nFormatter(Number(votingPower))} TON
      </Typography>
    </StyledVote>
  );
};

const StyledNoVotes = styled(Typography)({
  textAlign: "center",
  fontSize: 17,
  fontWeight: 600,
});

const StyledVote = styled(StyledFlexRow)({
  borderBottom: "0.5px solid rgba(114, 138, 150, 0.16)",
  paddingBottom: 10,
  gap: 10,
  ".address": {
    width: 160,
  },
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

const StyledContainer = styled(Container)({
  paddingBottom: 30,
  ".container-header": {
    alignItems: "center",
    gap: 13,
    h4: {
      width: "fit-content",
    },
  },
});

const StyledChip = styled(Chip)({
  height: 28,
  "*": {
    fontWeight: 600,
    fontSize: 13,
  },
});
