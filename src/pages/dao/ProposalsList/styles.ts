import { Box, styled, Typography } from "@mui/material";
import { Container } from "components";
import { StyledContainer, StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";



export const StyledProposalsHeader = styled(Box)({
  width:'100%',
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  ".container-header":{
    alignItems:'center',
  },
 
});



export const StyledProposalResultProgress = styled("div")(({ theme }) => ({
  height: "100%",
  background: "black",
  position: "absolute",
  top: 0,
  left: 0,
  borderRadius: 5,
  opacity: 0.05,
}));

export const StyledProposalResultContent = styled(StyledFlexRow)({
  position: "relative",
  justifyContent: "space-between",
});

export const StyledProposalResult = styled(StyledFlexRow)({
  position: "relative",
  justifyContent: "flex-start",
  height: 40,
  paddingLeft: 10,
});

export const StyledProposalOwner = styled(Typography)({
});

export const StyledProposal = styled(StyledContainer)(({ theme }) => ({
  ".title": {
    fontSize: 18,
  },
  transition: "0.2s all",
  width: "100%",
  cursor: "pointer",
  ".description": {
    fontSize: 16,
  },
  ".time-left": {
    fontSize: 14,
  },
  "&:hover": {
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));


export const StyledDescription = styled(Typography)({
  display: "-webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
});


