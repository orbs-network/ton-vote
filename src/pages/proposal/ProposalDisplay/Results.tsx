import { Chip, Typography } from "@mui/material";
import { styled } from "@mui/material";
import {
  Button,
  LoadingContainer,
  Markdown,
  OverflowWithTooltip,
  Progress,
  TitleContainer,
} from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { AiFillCloseCircle } from "react-icons/ai";
import { useEffect, useState } from "react";
import { nFormatter } from "utils";
import _ from "lodash";
import {  useShowComponents, useVerifyProposalResults } from "./hooks";
import { EndpointPopup } from "./EndpointPopup";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import { mock } from "mock/mock";
import { errorToast } from "toasts";
import {  useAppParams, useProposalResults } from "hooks/hooks";
import {  shouldHideVerify } from "data/foundation/data";
import { useProposalQuery } from "query/getters";
const LIMIT = 5;

export const Results = () => {
    const { proposalAddress } = useAppParams();

  const { isLoading } = useProposalQuery(proposalAddress);
  
  const [showAllResults, setShowAllResults] = useState(false);
  const translations = useProposalPageTranslations();

  const hideVerify = shouldHideVerify(proposalAddress);
  
  const results = useProposalResults(proposalAddress);
  const show = useShowComponents().results;

  


  if (!show) return null;
    if (isLoading) {
      return <LoadingContainer />;
    }

  return (
    <StyledResults title={translations.results}>
      <StyledFlexColumn gap={15}>
        {results.map((result, index) => {
          if (index >= LIMIT && !showAllResults) return null;

          return (
            <ResultRow
              key={result.choice}
              name={result.choice}
              percent={result.percent}
              amount={result.amount}
              votes={result.votesCount}
            />
          );
        })}

        {_.size(results) > LIMIT && (
          <ToggleResultsButton
            toggle={setShowAllResults}
            value={showAllResults}
          />
        )}
      </StyledFlexColumn>
      {!hideVerify && <VerifyResults />}
    </StyledResults>
  );
};

const ToggleResultsButton = ({
  toggle,
  value,
}: {
  toggle: (value: boolean) => void;
  value: boolean;
}) => {
  const translations = useProposalPageTranslations();
  return (
    <StyledToggleResultsButton onClick={() => toggle(!value)}>
      {value ? translations.showLess : translations.showMore}
    </StyledToggleResultsButton>
  );
};

const StyledToggleResultsButton = styled(Button)({
  padding: "6px 10px",
  height: "unset",
  marginLeft: "auto",
  "*": {
    fontSize: 12,
  },
});

const ResultRow = ({
  name,
  percent = 0,
  amount = "",
  votes,
}: {
  name: string;
  percent?: number;
  amount?: string;
  votes: number;
}) => {

  const translations = useProposalPageTranslations();
  return (
    <StyledResultRow>
      <StyledFlexRow justifyContent="space-between" width="100%">
        <StyledFlexRow style={{ width: "fit-content" }}>
          <div>
            <StyledTitle text={name} />
          </div>
          <StyledChip label={`${nFormatter(votes, 2)} ${translations.votes}`} />
        </StyledFlexRow>

        <StyledResultRowRight justifyContent="flex-end">
          {amount && (
            <Typography fontSize={13} style={{ whiteSpace: "nowrap" }}>
              {amount}
            </Typography>
          )}

          <Typography className="percent">{percent}%</Typography>
        </StyledResultRowRight>
      </StyledFlexRow>
      <Progress progress={percent} />
    </StyledResultRow>
  );
};

const StyledTitle = styled(OverflowWithTooltip)({
  textTransform: "capitalize",
});

const StyledChip = styled(Chip)({
  fontSize: 11,
  height: 25,
  ".MuiChip-label": {
    paddingLeft: 10,
    paddingRight: 10,
  },
});

const StyledResultRowRight = styled(StyledFlexRow)({
  flex: 1,
});

const StyledResultRow = styled(StyledFlexColumn)({
  gap: 5,
  fontWeight: 600,
  p: {
    fontWeight: "inherit",
  },
  ".percent": {
    fontSize: 14,
  },
});

const StyledResults = styled(TitleContainer)({
  width: "100%",
});

export function VerifyResults() {
  const {
    mutate: verify,
    isLoading,
    error,
    isSuccess,
    reset,
  } = useVerifyProposalResults();
  const translations = useProposalPageTranslations();
  const {proposalAddress} = useAppParams();
  useEffect(() => {
    if (isSuccess || error) {
      setTimeout(() => {
        reset();
      }, 5_000);
    }
  }, [isSuccess, reset, error]);

  const [open, setOpen] = useState(false);

  const onClick = () => {
    if (mock.isMockProposal(proposalAddress)) {
      errorToast("This is a mock proposal. You can not verify it.");
    } else {
      setOpen(true);
    }
  };

  return (
    <StyledVerifyContainer>
      <StyledVerifyText>{translations.verifyInfo}</StyledVerifyText>
      <EndpointPopup
        onSubmit={verify}
        open={open}
        onClose={() => setOpen(false)}
      />
      {isSuccess ? (
        <StyledButton>
          <StyledFlexRow>
            <Typography>Verified</Typography>
            <BsFillCheckCircleFill className="icon" />
          </StyledFlexRow>
        </StyledButton>
      ) : error ? (
        <StyledButton>
          <StyledFlexRow>
            <Typography>Not Verified</Typography>
            <AiFillCloseCircle className="icon" />
          </StyledFlexRow>
        </StyledButton>
      ) : (
        <StyledButton onClick={onClick} isLoading={isLoading}>
          <Typography>{translations.verifyResults}</Typography>
        </StyledButton>
      )}
    </StyledVerifyContainer>
  );
}

const StyledVerifyContainer = styled(StyledFlexColumn)(({ theme }) => ({
  marginTop: 30,
  justifyContent: "center",
  width: "100%",
  gap: 15,
}));

const StyledVerifyText = styled(Markdown)({
  fontWeight: 500,
  a: {
    textDecoration: "unset",
  },
});

const StyledButton = styled(Button)({
  height: 40,
  minWidth: 180,
  "*": {
    fontSize: 15,
  },
  ".icon": {
    width: 18,
    height: 18,
    position: "relative",
    top: -1,
  },
  ".loader": {
    maxWidth: 20,
    maxHeight: 20,
  },
});
