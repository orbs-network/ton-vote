import { Box, styled, Typography } from "@mui/material";
import { Container, Link } from "components";
import { ReactNode } from "react";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import moment from "moment";
import { TONSCAN_ADDRESS_URL } from "config";
import { makeElipsisAddress } from "utils";
import { useProposalAddress } from "hooks";
import { useProposalState } from "./hooks";

 const fromUnixToString = (
  time: number,
  format = "MMM DD, YYYY HH:mm"
) => {
  return `${moment.unix(time).utc().format(format)} UTC`;
};


export const Metadata = () => {
  const proposalAddress = useProposalAddress();

  const {
    data,
    isLoading,
  } = useProposalState();

  const proposalMetadata = data?.metadata;

  return (
    <StyledInformation title="Information" loaderAmount={3} loading={isLoading}>
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
            <Link href={`${TONSCAN_ADDRESS_URL}/${proposalAddress}`}>
              {makeElipsisAddress(proposalAddress, 8)}
            </Link>
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
    <StyledFlexRow className="row" justifyContent="space-between">
      <Typography className="row-label">{label}</Typography>
      <Box className="row-children">{children}</Box>
    </StyledFlexRow>
  );
};


const StyledInformation = styled(Container)({
  width: "100%",
  ".row": {
    width: "100%",
    ".row-label": {
      fontSize: 14,
      fontWeight: 700,
    },
    ".row-children": {
      ...textOverflow,
      maxWidth: '60%',
      "*": {
        fontSize: 14,
        fontWeight: 400,
      },
    },
  },
});
