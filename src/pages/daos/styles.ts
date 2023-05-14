import { Box, styled, Typography } from "@mui/material";
import { Button, Container, Img, Search } from "components";
import { MOBILE_WIDTH } from "consts";
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
  width: 55,
  height: 55,
  borderRadius: "50%",
  overflow: "hidden",
  marginBottom: 20,
});


export const StyledDao = styled(Box)(({ theme }) => ({
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
    color: theme.typography.h2.color,
  },
  ".address-value": {
    textAlign: "center",
    fontSize: 16,
  },
  ".members": {
    fontWeight: 700,
    padding: "5px 20px",
    borderRadius: 20,
    marginTop: 20,
    p: {
      fontSize: 12,
    },
  },
  "@media (max-width: 1050px)": {
    width: "calc(100% / 3 - 15px)",
  },
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    width: "calc(100% / 2 - 5px)",
    height: 260,
    ".title": {
      fontSize: 16,
    },
    ".address-value": {
      fontSize: 14,
    },
    ".members": {
      padding: "5px 10px",
      marginTop: 15,
      p: {
        fontSize: 11,
      },
    },
  },
  "@media (max-width: 420px)": {
    width: "100%",
  },
}));

export const StyledHeader = styled(StyledFlexRow)({
  justifyContent: "space-between",
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
   flexDirection:'column',
   alignItems:'flex-start',
  },
});


export const StyledDaosList = styled(StyledFlexRow)({
  marginLeft: "auto",
  marginRight: "auto",
  flexWrap: "wrap",
  gap: 20,
  justifyContent: "flex-start",

  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    gap: 10,
  },
});


export  const StyledHiddenIcon = styled(Box)({
  position: "absolute",
  left: 10,
  top: 10,
});


export const StyledEmptyList = styled(Container)({
  width: "100%",
});

export const StyledDaosAmount = styled(Typography)({
  fontSize: 15,
  fontWeight: 700,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    textAlign: "right",
    width:'100%'
  },
});

export const StyledSearch = styled(Search)({
  maxWidth: 400,
  width: "100%",
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    maxWidth: 'unset',
  },
});
