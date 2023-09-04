import { Box, Chip, styled, Typography } from "@mui/material";
import {
  AddressDisplay,
  AppTooltip,
  List,
  LoadingContainer,
  LoadMore,
  NumberDisplay,
  TitleContainer,
} from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { nFormatter, parseLanguage } from "utils";
import { PAGE_SIZE } from "config";
import { Vote } from "types";
import { useMemo, useState } from "react";
import moment from "moment";
import _ from "lodash";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useTonAddress } from "@tonconnect/ui-react";
import {
  useAppParams,
  useGetProposalSymbol,
  useIsOneWalletOneVote,
  useWalletVote,
} from "hooks/hooks";
import { useProposalQuery } from "query/getters";
import { useCsvData, useShowComponents } from "../hooks";
import { GrDocumentCsv } from "react-icons/gr";
import { CSVLink } from "react-csv";
import { fromNano } from "ton-core";

const ConnectedWalletVote = ({
  hideVotingPower,
  votes,
  dataUpdatedAt,
}: {
  hideVotingPower?: boolean;
  votes: Vote[];
  dataUpdatedAt: number;
}) => {
  const { proposalAddress } = useAppParams();
  const walletVote = useWalletVote(proposalAddress);
  const symbol = useGetProposalSymbol(proposalAddress);
  const isOneWalletOneVote = useIsOneWalletOneVote(proposalAddress);

  return (
    <VoteComponent
      hideVotingPower={!!isOneWalletOneVote || hideVotingPower}
      symbol={symbol}
      data={walletVote}
    />
  );
};

const ContainerHeader = ({
  votes,
  totalWeight = "0",
  dataUpdatedAt,
}: {
  votes: Vote[];
  totalWeight?: string;
  dataUpdatedAt: number;
}) => {
  const { proposalAddress } = useAppParams();
  const votesLength = _.size(votes);
  const isOneWalletOneVote = useIsOneWalletOneVote(proposalAddress);
  const tonAmount = useMemo(() => {
    return nFormatter(Number(fromNano(totalWeight)));
  }, [totalWeight]);

  const symbol = useGetProposalSymbol(proposalAddress);
  const show = useShowComponents().votes;
  const hideSymbol = isOneWalletOneVote;

  if (!show) return null;
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
        {!hideSymbol && (
          <Typography className="total" style={{ fontWeight: 600 }}>
            {tonAmount} {symbol}
          </Typography>
        )}
        <DownloadCSV dataUpdatedAt={dataUpdatedAt} votes={votes} />
      </StyledFlexRow>
    </StyledContainerHeader>
  );
};

const StyledChip = styled(Chip)({
  height: 28,
  "*": {
    fontWeight: 600,
    fontSize: 13,
  },
});

const DownloadCSV = ({
  votes,
  dataUpdatedAt,
}: {
  votes: Vote[];
  dataUpdatedAt: number;
}) => {
  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);
  const csvData = useCsvData(votes, dataUpdatedAt);
  const translations = useProposalPageTranslations();

  return (
    <CSVLink data={csvData} filename={parseLanguage(data?.metadata?.title)}>
      <AppTooltip text={translations.downloadCsv} placement="top">
        <StyledIcon style={{ width: 18, height: 18 }} />
      </AppTooltip>
    </CSVLink>
  );
};

const StyledIcon = styled(GrDocumentCsv)(({ theme }) => ({
  "*": {
    stroke: theme.palette.text.primary,
  },
}));

const StyledNoVotes = styled(Box)({
  padding: "20px",
  p: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: 600,
  },
});

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

export function Votes({
  votes,
  isLoading,
  hideVotingPower,
  totalWeight,
  dataUpdatedAt,
  small,
}: {
  votes: Vote[];
  isLoading: boolean;
  hideVotingPower?: boolean;
  totalWeight?: string;
  dataUpdatedAt: number;
  small?: boolean;
}) {
  const connectedAddress = useTonAddress();
  const [votesShowAmount, setShowVotesAMount] = useState(PAGE_SIZE);
  const { proposalAddress } = useAppParams();
  const isOneWalletOneVote = useIsOneWalletOneVote(proposalAddress);
  const symbol = useGetProposalSymbol(proposalAddress);
  const translations = useProposalPageTranslations();

  const showMoreVotes = () => {
    setShowVotesAMount((prev) => prev + PAGE_SIZE);
  };

  if (isLoading) {
    return <LoadingContainer />;
  }

  return (
    <StyledContainer
      small={small}
      title={translations.recentVotes}
      headerComponent={
        <ContainerHeader
          dataUpdatedAt={dataUpdatedAt}
          totalWeight={totalWeight}
          votes={votes}
        />
      }
    >
      <List
        isLoading={isLoading}
        isEmpty={!isLoading && !_.size(votes)}
        emptyComponent={<Empty />}
      >
        <StyledList gap={0}>
          <ConnectedWalletVote
            dataUpdatedAt={dataUpdatedAt}
            hideVotingPower={hideVotingPower}
            votes={votes}
          />
          {votes.map((vote, index) => {
            if (index >= votesShowAmount || vote.address === connectedAddress)
              return null;
            return (
              <VoteComponent
                hideVotingPower={!!isOneWalletOneVote || hideVotingPower}
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
    </StyledContainer>
  );
}

const StyledContainer = styled(TitleContainer)({
  ".title-container-children": {
    padding: 0,
  },
});

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
  hideVotingPower?: boolean;
}) => {
  const connectedAddress = useTonAddress();
  const translations = useProposalPageTranslations();
  if (!data) return null;
  const { address, votingPower, vote, hash, timestamp } = data;

  const isYou = connectedAddress === address;

  return (
    <StyledAppTooltip
      text={
        !timestamp ? undefined : `${moment.unix(timestamp).utc().fromNow()}`
      }
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
