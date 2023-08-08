import { Box, Chip, styled, Typography } from "@mui/material";
import {
  AppTooltip,
  LoadingContainer,
  NumberDisplay,
  TitleContainer,
} from "components";
import { StyledFlexRow } from "styles";
import { nFormatter, parseLanguage } from "utils";
import { fromNano } from "ton";
import { useMemo } from "react";
import _ from "lodash";
import { CSVLink } from "react-csv";
import { GrDocumentCsv } from "react-icons/gr";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useCsvData, useShowComponents } from "./hooks";
import {
  useAppParams,
  useGetProposalSymbol,
  useIsOneWalletOneVote,
} from "hooks/hooks";
import { useProposalQuery } from "query/getters";
import { Votes } from "./Components/Votes";

const ContainerHeader = () => {
  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);

  const totalTonAmount =
    data?.proposalResult?.totalWeight ||
    data?.proposalResult?.totalWeights ||
    "0";

  const votesLength = _.size(data?.votes);
  const isOneWalletOneVote = useIsOneWalletOneVote(proposalAddress);
  const tonAmount = useMemo(() => {
    return nFormatter(Number(fromNano(totalTonAmount)));
  }, [totalTonAmount]);

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
        <DownloadCSV />
      </StyledFlexRow>
    </StyledContainerHeader>
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

export function ProposalVotes() {
  const translations = useProposalPageTranslations();
  const { proposalAddress } = useAppParams();

  const { data, isLoading } = useProposalQuery(proposalAddress);

  if (isLoading) {
    return <LoadingContainer />;
  }

  return (
    <StyledContainer
      title={translations.recentVotes}
      headerComponent={<ContainerHeader />}
    >
      <Votes votes={data?.votes || []} isLoading={isLoading} />
    </StyledContainer>
  );
}

const DownloadCSV = () => {
  const { proposalAddress } = useAppParams();
  const { data } = useProposalQuery(proposalAddress);
  const csvData = useCsvData();
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
