import { Box, styled } from "@mui/material";
import { Button, Container, Img } from "components";
import { StyledFlexRow, StyledSkeletonLoader, textOverflow } from "styles";


export const StyledDaoContent = styled(Container)({
  display: "flex",
  flexDirection: "column",
  borderRadius: 13,
  height:'100%'
});
 
export const StyledJoinDao = styled(Button)({
  minWidth: "60%",
});

export const StyledDaoAvatar = styled(Img)({
  width: 65,
  height: 65,
  borderRadius: "50%",
  overflow: "hidden",
  marginBottom: 20,
});


export const StyledDao = styled(Box)({
  width: "calc(100% / 4 - 15px)",
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




export const StyledDaosList = styled(StyledFlexRow)({
  marginLeft: "auto",
  marginRight: "auto",
  flexWrap: "wrap",
  gap: 20,
  justifyContent:'flex-start'
});
