import { Alert, Box, styled, Typography } from "@mui/material";
import {
  AddressDisplay,
  Container,
  Header,
  OverflowWithTooltip,
  Search,
} from "components";
import { MOBILE_WIDTH } from "consts";
import { StyledContainer, StyledFlexColumn, StyledFlexRow } from "styles";
import { getBorderColor } from "theme";
import { LayoutSection } from "../components";

export const StyledProposalResultProgress = styled("div")(({ theme }) => ({
  height: "100%",
  background: theme.palette.primary.main,
  position: "absolute",
  top: 0,
  left: 0,
  borderRadius: 5,
  opacity: 0.07,
}));

export const StyledProposalResultContent = styled(StyledFlexRow)({
  position: "relative",
  justifyContent: "space-between",
});

export const StyledProposalResult = styled(StyledFlexRow)(({ theme }) => ({
  position: "relative",
  justifyContent: "flex-start",
  padding: 10,
  background: theme.palette.mode === "light" ? "#F8F9FB" : "#2B303B",
  boxShadow:
    theme.palette.mode === "light"
      ? "rgb(114 138 150 / 8%) 0px 2px 16px"
      : "unset",
  borderRadius: 10,
}));

export const StyledProposalOwner = styled(Typography)({
  fontSize: 15,
  fontWeight: 600,
});

export const StyledProposal = styled(StyledContainer)(({ theme }) => ({
  ".title": {
    fontSize: 18,
  },
  transition: "border-color 0.2s",
  width: "100%",
  cursor: "pointer",
  ".description": {
    fontSize: 16,
  },
}));

export const StyledTime = styled(Typography)({
  fontSize: 14,
  fontWeight: 600,
  opacity: 0.7,
  marginTop: 10,
});

export const StyledDescription = styled(Typography)({
  display: "-webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
});

export const StyledMarkdown = styled(Typography)({
  fontWeight: 600,
  fontSize: 16,
  marginBottom: 10,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    fontSize: 15,
  },
});

export const StyledProposalTitle = styled(Typography)({
  fontSize: 20,
  fontWeight: 800,
  lineHeight: "28px",
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    fontSize: 17,
    lineHeight: "26px",
  },
});

export const StyledAlert = styled(Alert)({
  width: "100%",
  borderRadius: 10,
});

export const StyledProposalsHeader = styled(StyledFlexRow)({
  ".header": {
    marginBottom: 0,
  },
});

export const StyledSearch = styled(Search)(({ theme }) => ({
  maxWidth: 360,
  width: "100%",
  input: {
    borderRight: `1px solid ${getBorderColor(theme.palette.mode)}`
  },
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    maxWidth: "unset"
  },
}));

export const StyledEmptyList = styled(Container)({
  position: "absolute",
  width: "100%",
  top: 0,
});

export const StyledAddressDisplay = styled(AddressDisplay)({
  p: {
    fontWeight: 600,
  },
});

export const StyledProposalsContainer = styled(LayoutSection)({
  ".header": {
    marginBottom: 16,
  }
});

export const StyledTonAmount = styled(Typography)({
  fontSize: 13,
  whiteSpace: "nowrap",
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    fontSize: 11,
  },
});

export const StyledResultName = styled(OverflowWithTooltip)({
  fontSize: 16,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    fontSize: 14,
  },
});

export const StyledProposalPercent = styled(Typography)({
  fontSize: 14,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    fontSize: 12,
  },
});
