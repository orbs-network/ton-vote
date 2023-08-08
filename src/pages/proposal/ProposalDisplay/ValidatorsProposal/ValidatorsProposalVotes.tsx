import { Chip, styled } from "@mui/material";
import {
  AppTooltip,
  LoadingContainer,
  NumberDisplay,
  TitleContainer,
} from "components";
import { StyledFlexRow } from "styles";
import { nFormatter, parseLanguage } from "utils";
import { fromNano } from "ton";
import { useMemo, useState } from "react";
import _ from "lodash";
import { CSVLink } from "react-csv";
import { GrDocumentCsv } from "react-icons/gr";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import {
  useAppParams,
  useGetProposalSymbol,
  useIsOneWalletOneVote,
} from "hooks/hooks";
import { useProposalQuery } from "query/getters";
import { Votes } from "../Components/Votes";
import { useShowComponents, useCsvData } from "../hooks";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

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

export function ValidatorsProposalVotes() {
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const cycles = [
  {
    status: "Done",
    votes: [],
  },
  {
    status: "Active",
    votes: [],
  },
];

const BasicTabs = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          {cycles.map((it, index) => {
            return <Tab label={index} {...a11yProps(index)} />;
          })}
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        Item One
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        Item Two
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel>
    </Box>
  );
};
