import { Box, styled } from "@mui/material";
import { Button, Container, Img } from "components";
import { StyledFlexRow } from "styles";


export const StyledDaoContent = styled(Container)({
  display: "flex",
  flexDirection: "column",
  borderRadius: 13,
  height:'100%',
  padding: 20,
  position:'relative'
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
    paddingTop: 30,
  },
  ".title": {
    fontSize: 18,
    fontWeight: 800,
    width: "100%",
    textAlign: "center",
  },
  ".address": {
    width: "100%",
    textAlign: "center",
    fontSize: 14,
    opacity: 0.6,
  },
  ".members": {
    fontSize: 14,
    fontWeight: 700,
    padding: "5px 20px",
    borderRadius: 20,
    marginTop: 20,
    p: {
      fontSize: 12,
    },
  },
});




export const StyledDaosList = styled(StyledFlexRow)({
  marginLeft: "auto",
  marginRight: "auto",
  flexWrap: "wrap",
  gap: 20,
  justifyContent:'flex-start'
});
