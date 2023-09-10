import { Box, Chip, styled, Typography } from "@mui/material";
import { Button, Container, Img, Search } from "components";
import { MOBILE_WIDTH } from "consts";
import { StyledFlexRow } from "styles";


export const StyledJoinDao = styled(Button)({
  minWidth: "60%",
});



export const StyledHeader = styled(StyledFlexRow)(({ theme }) => ({
  justifyContent: "space-between",
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
}));

export const StyledWebsiteChip = styled(Chip)(({ theme }) => ({
  cursor: "pointer",
  "&:hover": {
    background: theme.palette.primary.main,
    "*": {
      color: "white",
    },
  },
}));

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

export const StyledHiddenIcon = styled(Box)({
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
    width: "100%",
    fontSize: 13,
  },
});

export const StyledSearch = styled(Search)({
  maxWidth: 450,
  width: "100%",
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    maxWidth: "unset",
  },
});


export const StyledDesktopDao = styled(Container)({
  width: "calc(100% / 4 - 15px)",
  height: 270,
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  borderRadius: 13,
  padding: 20,
  paddingTop: 30,

  position: "relative",
  "@media (max-width: 1050px)": {
    width: "calc(100% / 3 - 15px)",
  },
});

export const StyledMobileDao = styled(Container)<{ isSelected?: number }>(
  ({ isSelected, theme }) => ({
    position: "relative",
    width: "100%",
    height: "auto",
    padding: "10px 10px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    border: isSelected ? `1px solid ${theme.palette.primary.main}` : "",
  })
);