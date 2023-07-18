import { Chip, styled, Typography } from "@mui/material";
import { AddressDisplay, Button, Popup, TitleContainer } from "components";
import _ from "lodash";
import { useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import { BsCheckCircle, BsFillCheckCircleFill } from "react-icons/bs";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useAirdrop, useAirdropAssetMetadata, useTransfer } from "./hooks";
import { StyledButton } from "./styles";

export const SelectedWallets = () => {
  const { airdropExist, wallets, currentWalletIndex, walletsCountUI } = useAirdrop();

  const wallet = wallets[currentWalletIndex];

  if (!airdropExist) return null;

  return (
    <TitleContainer
      title={`Selected Wallets (${_.size(wallets)})`}
      headerComponent={<List />}
    >
      <StyledFlexColumn alignItems="flex-start" gap={20}>
        <StyledChip
          label={`Sent to ${currentWalletIndex} out of ${walletsCountUI} wallets`}
        />
        {wallet && <AddressDisplay full={true} address={wallet} />}
        <SendButton />
        {/* <Finished /> */}
      </StyledFlexColumn>
    </TitleContainer>
  );
};

const Finished = () => {
  const { data } = useAirdropAssetMetadata();
  const { wallets, amountPerWalletUI, amountUI, walletsCountUI, walletCount } =
    useAirdrop();
  const symbol = data?.metadata?.symbol;

  const csv = useMemo(() => {
    if (!amountPerWalletUI || !symbol) return [];
    const result = wallets.map((it) => {
      return [it, `${amountPerWalletUI} ${symbol}`];
    });

    return [["address", "amount"], ...result];
  }, [walletCount, amountPerWalletUI, symbol]);

  return (
    <StyledFinished>
      <BsCheckCircle />
      <Typography className="text">
        Successfully sent {amountUI} {data?.metadata?.symbol} to{" "}
        {walletsCountUI} the wallets
      </Typography>
      <CSVLink data={csv} filename={`${symbol} Airdrop`}>
        <StyledButton>Download CSV</StyledButton>
      </CSVLink>
    </StyledFinished>
  );
};

const StyledFinished = styled(StyledFlexColumn)(({ theme }) => ({
  gap: 20,
  svg: {
    width: 50,
    height: 50,
    color: theme.palette.primary.main,
  },
  ".text": {
    fontSize: 18,
    fontWeight: 600,
  },
}));

const SendButton = () => {
  const { amountPerWalletUI } = useAirdrop();
  const { data, isLoading } = useAirdropAssetMetadata();
  const {mutate} = useTransfer();
  if (isLoading) return null;
  return (
    <StyledSend
      onClick={mutate}
    >{`Send ${amountPerWalletUI} ${data?.metadata?.symbol}`}</StyledSend>
  );
};

const StyledSend = styled(StyledButton)({
  marginLeft: "auto",
  marginRight: "auto",
});

const StyledChip = styled(Chip)({
  fontSize: 14,
  fontWeight: 500,
});

const List = () => {
  const { wallets, currentWalletIndex } = useAirdrop();
  const [open, setOpen] = useState(false);

  return (
    <>
      <StyledShowAll onClick={() => setOpen(true)}>Show all</StyledShowAll>
      <StyledPopup
        open={open}
        onClose={() => setOpen(false)}
        title="Airdrop Wallets"
      >
        <StyledList>
          {wallets.map((it, index) => {
            return (
              <StyledListItem key={it}>
                <StyledAddressDisplay full address={it} />
                {currentWalletIndex > index ? (
                  <BsFillCheckCircleFill />
                ) : (
                  <Typography>Not sent</Typography>
                )}
              </StyledListItem>
            );
          })}
        </StyledList>
      </StyledPopup>
    </>
  );
};

const StyledShowAll = styled(Button)({
  padding: "5px 10px",
  height: "auto",
  "*": {
    fontSize: 14,
  },
});

const StyledList = styled(StyledFlexColumn)({
  gap: 20,
});

const StyledAddressDisplay = styled(AddressDisplay)({
  flex: 1,
  maxWidth: "60%",
});

const StyledListItem = styled(StyledFlexRow)({
  justifyContent: "space-between",
});

const StyledPopup = styled(Popup)({
  maxWidth: 600,
  maxHeight: "70vh",
  display: "flex",
  flexDirection: "column",
  ".title-container-children": {
    overflowY: "auto",
    flex: 1,
  },
});
