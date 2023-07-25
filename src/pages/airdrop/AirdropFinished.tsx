import { styled, Typography } from "@mui/material";
import { TitleContainer } from "components";
import _ from "lodash";
import { useReadNftItemMetadata } from "query/getters";
import { useMemo } from "react";
import { CSVLink } from "react-csv";
import { BsCheckCircle } from "react-icons/bs";
import { StyledFlexColumn, StyledSkeletonLoader } from "styles";
import { useAmountPerWallet, useAmount } from "./hooks";
import { useAirdropStore } from "./store";
import { StyledButton } from "./styles";

const NFTFinished = () => {
  const { voters } = useAirdropStore();

  const csv = useMemo(() => {
    if (!voters) return [];
    const result = voters?.map((it) => {
      return [it];
    });

    return [["address"], ...result];
  }, [_.size(voters)]);

  return (
    <FinishedLayout
      csv={csv}
      text="Succesfully sent NFT to all voters"
      filename="Airdrop"
    />
  );
};

interface FinishedProps {
  csv: any;
  filename: string;
  text: string;
}

const FinishedLayout = ({ csv, filename, text }: FinishedProps) => {
  return (
    <StyledFinished>
      <BsCheckCircle />
      <StyledFlexColumn>
        <Typography variant="h3">Congratulations!</Typography>
        <Typography className="text">{text}</Typography>
      </StyledFlexColumn>
      <CSVLink data={csv} filename={filename}>
        <StyledButton>Download CSV</StyledButton>
      </CSVLink>
    </StyledFinished>
  );
};

const JettonFinished = () => {
  const { jettonAddress } = useAirdropStore();
  const { data, isLoading } = useReadNftItemMetadata(jettonAddress);
  const { amountPerWalletUI } = useAmountPerWallet();
  const { voters } = useAirdropStore();
  const { amountUI } = useAmount();

  const symbol = data?.metadata?.symbol;

  const csv = useMemo(() => {
    if (!amountPerWalletUI || !symbol || !voters) return [];
    const result = voters.map((it) => {
      return [it, `${amountPerWalletUI} ${symbol}`];
    });

    return [["address", "jettons"], ...result];
  }, [_.size(voters), amountPerWalletUI, symbol]);

  if (isLoading) {
    return (
      <StyledFlexColumn>
        <StyledSkeletonLoader />
        <StyledSkeletonLoader />
        <StyledSkeletonLoader />
      </StyledFlexColumn>
    );
  }
  return (
    <FinishedLayout
      csv={csv}
      text={`Successfully sent ${amountUI} ${symbol} to ${_.size(
        voters
      )} voters`}
      filename={`${symbol} airdrop`}
    />
  );
};

export const AirdropFinished = () => {
  const { type } = useAirdropStore();

  return (
    <TitleContainer title="Airdrop finished">
      {type === "nft" ? <NFTFinished /> : <JettonFinished />}
    </TitleContainer>
  );
};

const StyledFinished = styled(StyledFlexColumn)(({ theme }) => ({
  gap: 30,
  svg: {
    width: 50,
    height: 50,
    color: theme.palette.primary.main,
  },
  h3: {
    fontSize: 22,
    fontWeight: 600,
  },
  ".text": {
    fontSize: 18,
    fontWeight: 500,
  },
}));
