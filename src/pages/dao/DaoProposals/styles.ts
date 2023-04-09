import { Box, styled, Typography } from "@mui/material";
import { BorderContainer, Container } from "components";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";



export const StyledProposalsContainer = styled(Container)({
  flex: 1,
  gap: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  ".container-header":{
    alignItems:'center'
  }
});

export const StyledProposalContent = styled(BorderContainer)({
  display:'flex',
  flexDirection:'column',
  ".title": {
    fontSize: 18,
    fontWeight: 700,
  },
})

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

export const StyledProposal = styled(Box)({
  width: "100%",
  cursor: "pointer",
  ".description": {
    fontSize: 16,
  },
  ".time-left": {
    fontSize: 14,
  },
});


export const StyledDescription = styled(Typography)({
  display: "-webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
});


export const StyledLoader = styled(StyledSkeletonLoader)({
  width: "100%",
  height: 100,
});