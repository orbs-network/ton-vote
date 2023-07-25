import { styled } from "@mui/material";
import { Search, TitleContainer } from "components";
import { Img } from "components";
import { useReadNftItemMetadata, useReadJettonWalletMedata } from "query/getters";


export const StyledAirdropSearch = styled(Search)({
  height: "70%",
  flex: 1,
  maxWidth: 250,
});

export const StyledAirdropTitleContainer = styled(TitleContainer)({
  ".title-container-header": {
    padding: "0px 20px",
    height: 57,
  },
});


export function NFTImg({ address }: { address?: string }) {
  const { data } = useReadJettonWalletMedata(address);
  if (!data) return null;

  return <StyledImg src={data?.metadata?.image} />;
}

export function JettonImg({ address }: { address?: string }) {
  const { data } = useReadNftItemMetadata(address);
  if (!data) return null;

  return <StyledImg src={data?.metadata?.image} />;
}

const StyledImg = styled(Img)({
  width: 32,
  height: 32,
  borderRadius: "50%",
});
