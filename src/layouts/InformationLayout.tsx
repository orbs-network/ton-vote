import { Box, styled, Typography } from "@mui/material";
import { Container, Link } from "components";
import { ReactNode } from "react";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import { useProposalInfoQuery } from "queries";
import moment from "moment";
import { CONTRACT_ADDRESS, TONSCAN_ADDRESS_URL } from "config";
import { makeElipsisAddress } from "utils";

 const fromUnixToString = (
  time: number,
  format = "MMM DD, YYYY HH:mm"
) => {
  return `${moment.unix(time).utc().format(format)} UTC`;
};


export const InformationLayout = () => {
  const { data: proposalInfo, isLoading } = useProposalInfoQuery();

  
    return (
      <StyledInformation
        title="Information"
        loaderAmount={3}
        loading={isLoading}
      >
        {proposalInfo && (
          <StyledFlexColumn gap={12}>
            <InformationRow label="Start date">
              <Typography>
                {fromUnixToString(Number(proposalInfo.startTime))}
              </Typography>
            </InformationRow>
            <InformationRow label="End date">
              <Typography>
                {fromUnixToString(Number(proposalInfo.endTime))}
              </Typography>
            </InformationRow>

            <InformationRow label="Snapshot">
              <Typography>
                {fromUnixToString(Number(proposalInfo.snapshot.snapshotTime))}
              </Typography>
            </InformationRow>
            <InformationRow label="Contract">
              <Link
                href={`${TONSCAN_ADDRESS_URL}/${CONTRACT_ADDRESS.toFriendly()}`}
              >
                {makeElipsisAddress(CONTRACT_ADDRESS.toFriendly(), 8)}
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
