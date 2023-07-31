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
import { useAirdropPersistStore } from "./store";

const NFTFinished = () => {
  const { voters } = useAirdropPersistStore();

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
  const { reset } = useAirdropPersistStore();
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
  const { jettonAddress } = useAirdropPersistStore();
  const { data, isLoading } = useReadJettonWalletMedata(jettonAddress);
  const { amountPerWalletUI } = useAmountPerWallet();
  const { voters } = useAirdropPersistStore();
  const { amountUI } = useAmount();

  const symbol = data?.metadata?.symbol;

  const csv = useMemo(() => {
    if (!amountPerWalletUI || !symbol || !voters) return [];
    const result = voters.map((it) => {
      return [it, amountPerWalletUI];
    });

    return [["address", symbol], ...result];
  }, [_.size(voters), amountPerWalletUI, symbol]);

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
      text={`Successfully sent ${amountUI} ${symbol} to ${_.size(
        voters
      ).toLocaleString()} voters`}
      filename={`${symbol} airdrop`}
    />
  );
};

export const AirdropFinished = () => {
  const { assetType } = useAirdropPersistStore();

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
