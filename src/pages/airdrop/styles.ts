import { styled } from "@mui/material";
import { Button, Popup, Search, TitleContainer, VirtualList } from "components";
import { StyledContainer, StyledFlexRow } from "styles";

export const StyledButton = styled(Button)({
  minWidth: 200,
});

export const StyledAirdropList = styled(VirtualList)({
  height: "100%",
});

export const StyledVirtualListContainer = styled(StyledContainer)({
  width: "100%",
  padding: "13px 13px",
});

export const StyledListTitleContainer = styled(TitleContainer)({
  ".title-container-header": {
    padding: "10px 20px",
    "*": {
      fontSize: 14,
    },
  },
});

export const StyledSelectPopup = styled(Popup)({
  maxWidth: 500,
  height: 700,

  ".search-input": {
    height: 40,
  },
  ".virtual-list": {},
  ".title-container-children": {
    gap: 20,
    display: "flex",
    flexDirection: "column",
  },
  ".not-selected": {},
  ".empty-list": {
    flex: 1,
    alignItems: "flex-start",
    paddingTop: 20,
    p: {
      fontSize: 16,
      fontWeight: 600,
    },
  },
});

export const StyledSelectedList = styled(StyledFlexRow)({
  justifyContent: "flex-start",
  gap: 10,
  flexWrap: "wrap",
  ".selected-chip": {
    width: "calc(100% / 3 - 7px)",
    padding: "0px 40px 0px 16px",
  },
  ".show-all": {
    width: "100%",
    marginTop: 20,
    button:{
        height: 40,
        minWidth: 200,
    },
    "*":{
      fontSize: 14,
    }
  },
});
