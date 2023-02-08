import { Box, styled, Typography } from "@mui/material";
import { Container } from "components";
import { ReactNode } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { fromUnixToString } from "utils";
import { useProposalInfoQuery } from "queries";

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
      "*": {
        fontSize: 14,
        fontWeight: 400,
      },
    },
  },
});
