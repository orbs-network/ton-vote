import { Box, styled } from "@mui/material";
import { BorderContainer, Button, Img } from "components";
import { StyledFlexRow, StyledSkeletonLoader } from "styles";


export const StyledDaoContent = styled(BorderContainer)({
  display: "flex",
  flexDirection: "column",
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
  },
  ".members": {
    fontWeight: 700,
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
