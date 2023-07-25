import { styled } from "@mui/material";
import { Search, TitleContainer } from "components";

export const StyledAirdropSearch = styled(Search)({
  height: "70%",
  flex: 1,
  maxWidth: 250,
});

export const StyledAirdropTitleContainer = styled(TitleContainer)({
  ".title-container-header": {
    padding: "0px 20px",
    height: 57,
  },
});
