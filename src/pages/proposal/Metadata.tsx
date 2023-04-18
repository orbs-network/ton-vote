import { Box, styled, Typography } from "@mui/material";
import { AddressDisplay, Container, Link, LoadingContainer, TitleContainer } from "components";
import { ReactNode } from "react";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import moment from "moment";
import { ProposalMetadata } from "ton-vote-sdk";


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
        </StyledFlexColumn>
      )}
    </StyledInformation>
  );
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
