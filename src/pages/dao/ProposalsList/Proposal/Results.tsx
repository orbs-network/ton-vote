import { styled, Typography } from "@mui/material";
import { useGetProposalSymbol, useProposalResults, useWalletVote } from "hooks/hooks";
import { useDaoPageTranslations } from "i18n/hooks/useDaoPageTranslations";
import _ from "lodash";
import { useProposalQuery } from "query/getters";
import { BsCheck2, BsFillCheckCircleFill } from "react-icons/bs";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { StyledAlert, StyledProposalPercent, StyledProposalResult, StyledProposalResultContent, StyledProposalResultProgress, StyledResultName, StyledTonAmount } from "../styles";


const isSelected = (choice: string, walletVote?: string | string[]) => {
  if (!walletVote) return;
  return _.isEqual(walletVote, choice) || walletVote.includes(choice);
};
export const Results = ({
  proposalAddress,
}: {
  proposalAddress: string;
}) => {
  const { data: proposal } = useProposalQuery(proposalAddress);

  const totalWeight = proposal?.proposalResult.totalWeights;
  const translations = useDaoPageTranslations();
  const results = useProposalResults(proposalAddress);
  const walletVote = useWalletVote(proposalAddress)?.vote
  
  if (Number(totalWeight) === 0) {
    return (
      <StyledAlert severity="warning">
        <Typography>{translations.endedAndDidntPassedQuorum}</Typography>
      </StyledAlert>
    );
  }

  return (
    <StyledResults gap={10}>
      {results.map((result) => {


        return (
          <Result
            selected={isSelected(result.choice, walletVote)}
            key={result.choice}
            title={result.choice}
            percent={result.percent}
            amount={result.amount}
          />
        );
      })}
    </StyledResults>
  );
};

const Result = ({
  title,
  percent = 0,
  amount = "",
  selected,
}: {
  title: string;
  percent?: number;
  amount?: string;
  selected?: boolean;
}) => {
  
  return (
    <StyledProposalResult>
      <StyledProposalResultProgress style={{ width: `${percent}%` }} />
      <StyledProposalResultContent>
        <StyledFlexRow justifyContent="flex-start">
          <StyledResultName text={title} />
          <StyledTonAmount>{amount}</StyledTonAmount>
        </StyledFlexRow>
        <StyledFlexRow style={{ width: "auto" }}>
          {selected && <BsCheck2 style={{width:20, height: 20}} />}
          <StyledProposalPercent>{percent}%</StyledProposalPercent>
        </StyledFlexRow>
      </StyledProposalResultContent>
    </StyledProposalResult>
  );
};

const StyledResults = styled(StyledFlexColumn)({
  width: "100%",
});
