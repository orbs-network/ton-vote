import { Chip, styled, Typography } from "@mui/material";
import { LoadingContainer, TitleContainer } from "components";
import { nFormatter, parseValidatorVotes } from "utils";
import { ReactNode, useState } from "react";
import _ from "lodash";

import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { useAppParams } from "hooks/hooks";
import { useProposalQuery } from "query/getters";
import { Votes } from "../Components/Votes";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { fromNano } from "ton-core";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { ValidatorProposalRoundDetails } from "types";
import moment from "moment";

export function ValidatorsProposalVotes() {
  const { proposalAddress } = useAppParams();

  const { data, isLoading } = useProposalQuery(proposalAddress);
  console.log({ data });

  if (isLoading) {
    return <LoadingContainer />;
  }

  return (
    <StyledContainer title="Cycles">
      <BasicTabs />
    </StyledContainer>
  );
}

const StyledContainer = styled(TitleContainer)({
  ".title-container-children": {},
});
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <StyledCustomTabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </StyledCustomTabPanel>
  );
}

const StyledCustomTabPanel = styled(Box)({
  marginTop: 10,
});

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const BasicTabs = () => {
  const [value, setValue] = useState(0);
  const { proposalAddress } = useAppParams();
  const { data, dataUpdatedAt } = useProposalQuery(proposalAddress);

  const roundsDetails = data?.validatorsVotingData?.roundsDetails;
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <StyledTabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
      >
        {roundsDetails?.map((it, index: number) => {
          return (
            <Tab
              key={index}
              label={`Round ${index + 1}`}
              {...a11yProps(index)}
            />
          );
        })}
      </StyledTabs>
      {roundsDetails?.map((it, index) => {
        const votes = parseValidatorVotes(it.votersList);
        return (
          <CustomTabPanel key={index} value={value} index={index}>
            <StyledFlexColumn>
              <Summary details={it} />
              <Votes
                small={true}
                dataUpdatedAt={dataUpdatedAt}
                hideVotingPower={true}
                votes={votes || []}
                isLoading={false}
                totalWeight={it.totalWeight}
              />
            </StyledFlexColumn>
          </CustomTabPanel>
        );
      })}
    </Box>
  );
};

const StyledTabs = styled(Tabs)(({ theme }) => ({
  border:
    theme.palette.mode === "light"
      ? "1px solid #e0e0e0"
      : "1px solid rgba(255,255,255, 0.2)",
  borderRadius: 8,
}));

export function Summary({
  details,
}: {
  details: ValidatorProposalRoundDetails;
}) {
  return (
    <TitleContainer
      small={true}
      title="Summary"
      headerComponent={<Status status={details.result} />}
    >
      <Section label="Total weight">
        <Typography>{nFormatter(fromNano(details.totalWeight))}</Typography>
      </Section>
      <Section label="Start time">
        <Typography>
          {moment.unix(details.cycleStartTime).format("DD/MM/YY HH:mm")}
        </Typography>
      </Section>
      <Section label="End time">
        <Typography>
          {moment.unix(details.cycleEndTime).format("DD/MM/YY HH:mm")}
        </Typography>
      </Section>

      <Section label="Voted">
        <Typography>{_.size(details.votersList)}</Typography>
      </Section>
    </TitleContainer>
  );
}

const Section = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  return (
    <StyledSection>
      <Typography className="title">{label}</Typography>
      <StyledSectionChildren>{children}</StyledSectionChildren>
    </StyledSection>
  );
};

const StyledSection = styled(StyledFlexRow)({
  justifyContent: "flex-start",
  "*":{
    fontSize: 14
  }
});

const StyledSectionChildren = styled("div")({});

const Status = ({ status }: { status?: string }) => {
  return <Chip label={status} />;
};
