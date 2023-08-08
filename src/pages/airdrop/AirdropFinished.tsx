import { styled, Typography } from "@mui/material";
import { Button, TitleContainer } from "components";
import _ from "lodash";
import {
  useReadJettonWalletMedata,
  useReadNftItemMetadata,
} from "query/getters";
import { useMemo } from "react";
import { CSVLink } from "react-csv";
import { BsCheckCircle } from "react-icons/bs";
import { useAppNavigation } from "router/navigation";
import { StyledFlexColumn, StyledSkeletonLoader } from "styles";
import { useAmountPerWallet, useAmount } from "./hooks";
import { useAirdropStore } from "./store";

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
      text={`Succesfully sent NFT to ${_.size(voters).toLocaleString()} voters`}
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
  const { reset } = useAirdropStore();
  const { daosPage } = useAppNavigation();

  const onFinished = () => {
    reset();
    daosPage.root();
  };
  return (
    <StyledFinished>
      <BsCheckCircle />
      <StyledFlexColumn>
        <Typography variant="h3">Congratulations!</Typography>
        <Typography className="text">{text}</Typography>
      </StyledFlexColumn>
      <StyledFlexColumn gap={20}>
        <CSVLink data={csv} filename={filename}>
          <Button variant="text">Download CSV</Button>
        </CSVLink>
        <FinishBtn onClick={onFinished}>Finish</FinishBtn>
      </StyledFlexColumn>
    </StyledFinished>
  );
};

const FinishBtn = styled(Button)({
  minWidth: 200,
});

const JettonFinished = () => {
  const { jettonAddress } = useAirdropStore();
  const { data, isLoading } = useReadJettonWalletMedata(jettonAddress);
  const { amountPerWalletUI } = useAmountPerWallet();
  const { voters } = useAirdropStore();
  const { amountUI } = useAmount();

  const symbol = data?.metadata?.symbol;

  const votersSize = _.size(voters);

  const prefix = votersSize > 1 ? "s" : "";

  const csv = useMemo(() => {
    if (!amountPerWalletUI || !symbol || !voters) return [];
    const result = voters.map((it) => {
      return [it, amountPerWalletUI];
    });

    return [["address", symbol], ...result];
  }, [votersSize, amountPerWalletUI, symbol]);

  if (isLoading) {
    return (
      <StyledFlexColumn style={{ alignItems: "flex-start" }}>
        <StyledSkeletonLoader style={{ width: "40%" }} />
        <StyledSkeletonLoader style={{ width: "70%" }} />
        <StyledSkeletonLoader />
      </StyledFlexColumn>
    );
  }
  return (
    <FinishedLayout
      csv={csv}
      text={`Successfully sent ${amountUI} ${symbol} to ${votersSize.toLocaleString()} voter${prefix}`}
      filename={`${symbol} airdrop`}
    />
  );
};

export const AirdropFinished = () => {
  const { assetType } = useAirdropStore();

  return (
    <TitleContainer title="Airdrop finished">
      {assetType === "nft" ? <NFTFinished /> : <JettonFinished />}
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
    fontSize: 16,
    fontWeight: 500,
  },
}));
