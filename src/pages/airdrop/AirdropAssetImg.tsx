import { styled } from "@mui/material";
import { Img } from "components";
import { useReadNftItemMetadata } from "query/getters";

export function AirdropAssetImg({ address }: { address?: string }) {
  const { data } = useReadNftItemMetadata(address);
  if (!data) return null;

  return <StyledImg src={data?.metadata?.image} />;
}

const StyledImg = styled(Img)({
  width: 32,
  height: 32,
  borderRadius: "50%",
});
