import { styled, Typography } from "@mui/material";
import { AddressDisplay, Img, OverflowWithTooltip, VerifiedDao } from "components";
import { MOBILE_WIDTH } from "consts";
import { useAppParams } from "hooks/hooks";
import { useDaoQuery } from "query/getters";
import { StyledFlexRow } from "styles";
import { parseLanguage } from "utils";

export const Logo = () => {
  const { daoAddress } = useAppParams();

  const dao = useDaoQuery(daoAddress).data;
  return <StyledLogo src={dao?.daoMetadata?.metadataArgs.avatar} />;
};

export const Title = () => {
  const { daoAddress } = useAppParams();

  const dao = useDaoQuery(daoAddress).data;

  return (
    <StyledTitle
      placement="top"
      text={parseLanguage(dao?.daoMetadata?.metadataArgs.name)}
    />
  );
};

export const DNS = () => {
  const { daoAddress } = useAppParams();

  const dao = useDaoQuery(daoAddress).data;

  if (!dao?.daoMetadata.metadataArgs?.dns) {
    return null;
  }

  return (
    <StyledDNS>
      <Typography>{dao?.daoMetadata.metadataArgs.dns}</Typography>
      <VerifiedDao daoAddress={dao?.daoAddress} />
    </StyledDNS>
  );
};

export const Address = () => {
  const { daoAddress } = useAppParams();

  const dao = useDaoQuery(daoAddress).data;
  return <StyledAddressDisplay address={dao?.daoAddress} padding={8} />;
};

export const StyledAddressDisplay = styled(AddressDisplay)({
  p: {
    fontSize: 15,
    fontWeight: 700,
  },
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    p: {
      fontSize: 14,
    },
  },
});


export const StyledTitle = styled(OverflowWithTooltip)(({ theme }) => ({
  color: theme.typography.h2.color,
  fontWeight: 800,
  fontSize: 21,
  flex: 1,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    fontSize: 16,
  },
}));

export const StyledDNS = styled(StyledFlexRow)({
  a: {
    textDecoration: "unset",
  },
  p: {
    fontSize: 16,
    fontWeight: 700,
  },
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    justifyContent: "flex-start",
    p: {
      fontSize: 14,
    },
  },
});



export const StyledLogo = styled(Img)({
  width: 70,
  height: 70,
  borderRadius: "50%",
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    width: 44,
    height: 44,
  },
});
