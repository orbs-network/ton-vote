import { styled } from "@mui/material";
import { Button, TitleContainer, VirtualList } from "components";
import { StyledContainer } from "styles";

export const StyledButton = styled(Button)({
  minWidth: 200,
});


export const StyledAirdropList = styled(VirtualList)({
  height: '100%',
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