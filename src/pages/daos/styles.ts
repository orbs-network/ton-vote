import { Box, styled } from "@mui/material";
import { Button, Img } from "components";
import { StyledFlexRow, StyledHoverContainer, StyledSkeletonLoader, textOverflow } from "styles";


export const StyledDaoContent = styled(StyledHoverContainer)({
  display: "flex",
  flexDirection: "column",
  borderRadius: 13,
});
 
export const StyledJoinDao = styled(Button)({
  minWidth: "60%",
});

export const StyledDaoAvatar = styled(Img)({
  width: 80,
  height: 80,
  borderRadius: "50%",
  overflow: "hidden",
  marginBottom: 20,
});


export const StyledDao = styled(Box)({
  width: "calc(100% / 4 - 12px)",
  height: 280,

  cursor: "pointer",
  ".container": {
    height: "100%",
  },
  ".title": {
    fontSize: 18,
    fontWeight: 700,
    width: "100%",
    ...textOverflow,
    textAlign: "center",
  },
  ".members": {
    fontWeight: 700,
  },
  ".address": {
    width: "100%",
    textAlign: "center",
    fontSize: 14
  },
});


export const StyledLoader = styled(StyledSkeletonLoader)({
  width: "100%",
  height: "100%",
});


export const StyledDaosList = styled(StyledFlexRow)({
  marginLeft: "auto",
  marginRight: "auto",
  flexWrap: "wrap",
  gap: 15,
  justifyContent:'flex-start'
});
