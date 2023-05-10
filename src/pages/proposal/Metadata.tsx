import { styled, Typography } from "@mui/material";
import { AddressDisplay, LoadingContainer, TitleContainer } from "components";
import { ReactNode } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import moment from "moment";
import { VotingPowerStrategyType } from "ton-vote-contracts-sdk";
import { useProposalPageQuery } from "./query";
import { useProposalAddress } from "hooks";
import { getStrategyArgument, getVoteStrategyType } from "utils";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";

const fromUnixToString = (time: number, format = "MMM DD, YYYY HH:mm") => {
  return `${moment.unix(time).format(format)} UTC`;
};

export const Metadata = () => {
  const proposalAddress = useProposalAddress();
  const { isLoading, data } = useProposalPageQuery(false);
  const translations = useProposalPageTranslations();
  const proposalMetadata = data?.metadata;
  const votingPowerStrategies = data?.metadata?.votingPowerStrategies;

  const nftAddress = getStrategyArgument("nft-address", votingPowerStrategies);
  const jettonAddress = getStrategyArgument(
    "jetton-address",
    votingPowerStrategies
  );



    if (isLoading) {
      return <LoadingContainer />;
    }

  return (
    <StyledInformation title={translations.information}>
      {proposalMetadata && (
        <StyledFlexColumn gap={12}>
          <InformationRow label={translations.startDate}>
            <Typography>
              {fromUnixToString(Number(proposalMetadata.proposalStartTime))}
            </Typography>
          </InformationRow>
          <InformationRow label={translations.endDate}>
            <Typography>
              {fromUnixToString(Number(proposalMetadata.proposalEndTime))}
            </Typography>
          </InformationRow>

          <InformationRow label={translations.snapshot}>
            <Typography>
              {fromUnixToString(Number(proposalMetadata.proposalSnapshotTime))}
            </Typography>
          </InformationRow>
          <InformationRow label={translations.contract}>
            <AddressDisplay address={proposalAddress} />
          </InformationRow>
          <InformationRow label={translations.votingStrategy}>
            <ProposalStrategyLabel
              strategy={Number(
                getVoteStrategyType(proposalMetadata.votingPowerStrategies)
              )}
            />
          </InformationRow>
          {jettonAddress && (
            <InformationRow label="Jetton Address">
              <AddressDisplay address={jettonAddress} />
            </InformationRow>
          )}
          {nftAddress && (
            <InformationRow label="NFT collection">
              <AddressDisplay address={nftAddress} />
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
  strategy: VotingPowerStrategyType;
}) => {
  const commonTranslations = useCommonTranslations();
  switch (strategy) {
    case VotingPowerStrategyType.TonBalance:
      return <Typography>{commonTranslations.tonBalance}</Typography>;

    case VotingPowerStrategyType.JettonBalance:
      return <Typography>{commonTranslations.jettonBalance}</Typography>;

    case VotingPowerStrategyType.NftCcollection:
      return <Typography>{commonTranslations.nftCollection}</Typography>;

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
