import { Box, Link, styled, Typography } from "@mui/material";
import { Container } from "components";
import { useProposalInfoQuery } from "queries";
import { ReactNode } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import moment from 'moment'
import { fromUnixToString } from "utils";

const title = "Information";
export const InformationLayout = () => {
  const {data: proposalInformation, isLoading}  = useProposalInfoQuery()

  if (isLoading || !proposalInformation) {
    return (
      <StyledInformation title={title}>
        <Typography>loading</Typography>
      </StyledInformation>
    );
  }
 
    return (
      <StyledInformation title={title}>
        <StyledFlexColumn gap={12}>
          <InformationRow label="Start date">
            <Typography>
              {fromUnixToString(proposalInformation.startDate)}
            </Typography>
          </InformationRow>
          <InformationRow label="End date">
            <Typography>
              {fromUnixToString(proposalInformation.endDate)}
            </Typography>
          </InformationRow>

          <InformationRow label="Snapshot">
            <Link href="/">{proposalInformation.snapshot}</Link>
          </InformationRow>
        </StyledFlexColumn>
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
      "*": {
        fontSize: 14,
        fontWeight: 400,
      },
    },
  },
});
