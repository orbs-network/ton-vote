import { Box, styled, Typography } from "@mui/material";
import {
  AddressDisplay,
  Container,
  Link,
  LoadingContainer,
  TitleContainer,
} from "components";
import { ReactNode } from "react";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import moment from "moment";
import { ProposalMetadata, VotingPowerStrategy } from "ton-vote-sdk";
import { useTranslation } from "react-i18next";

const fromUnixToString = (time: number, format = "MMM DD, YYYY HH:mm") => {
  return `${moment.unix(time).utc().format(format)} UTC`;
};

export const Metadata = ({
  proposalMetadata,
  isLoading,
  proposalAddress,
}: {
  proposalMetadata?: ProposalMetadata;
  isLoading: boolean;
  proposalAddress?: string;
}) => {
  if (isLoading) {
    return <LoadingContainer />;
  }

  return (
    <StyledInformation title="Information">
      {proposalMetadata && (
        <StyledFlexColumn gap={12}>
          <InformationRow label="Start date">
            <Typography>
              {fromUnixToString(Number(proposalMetadata.proposalStartTime))}
            </Typography>
          </InformationRow>
          <InformationRow label="End date">
            <Typography>
              {fromUnixToString(Number(proposalMetadata.proposalEndTime))}
            </Typography>
          </InformationRow>

          <InformationRow label="Snapshot">
            <Typography>
              {fromUnixToString(Number(proposalMetadata.proposalSnapshotTime))}
            </Typography>
          </InformationRow>
          <InformationRow label="Contract">
            <AddressDisplay address={proposalAddress} />
          </InformationRow>
          <InformationRow label="Voting strategy">
            <ProposalStrategyLabel
              strategy={proposalMetadata.votingPowerStrategy}
            />
          </InformationRow>
          {proposalMetadata.votingPowerStrategy ===
            VotingPowerStrategy.JettonBalance && (
            <InformationRow label="Jetton">
              <AddressDisplay address={proposalMetadata.jetton} />
            </InformationRow>
          )}
          {proposalMetadata.votingPowerStrategy ===
            VotingPowerStrategy.NftCcollection && (
            <InformationRow label="NFT collection">
              <AddressDisplay address={proposalMetadata.nft} />
            </InformationRow>
          )}
        </StyledFlexColumn>
      )}
    </StyledInformation>
  );
};

const ProposalStrategyLabel = ({
  strategy,
}: {
  strategy: VotingPowerStrategy;
}) => {
  const { t } = useTranslation();

  switch (strategy) {
    case VotingPowerStrategy.TonBalance:
      return <Typography>{t("tonBalance")}</Typography>;

    case VotingPowerStrategy.JettonBalance:
      return <Typography>{t("jettonBalance")}</Typography>;

    case VotingPowerStrategy.NftCcollection:
      return <Typography>{t("nftCollection")}</Typography>;

    default:
      return null;
  }
};

const InformationRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  return (
    <StyledRow justifyContent="space-between">
      <Typography className="row-label">{label}</Typography>
      <div className="row-children">{children}</div>
    </StyledRow>
  );
};

const StyledRow = styled(StyledFlexRow)({
  width: "100%",
  ".row-label": {
    fontSize: 14,
    fontWeight: 700,
  },
  ".row-children": {
    ...textOverflow,
    maxWidth: "60%",
    "*": {
      fontSize: 14,
      fontWeight: 400,
    },
  },
});

const StyledInformation = styled(TitleContainer)({
  width: "100%",
});
