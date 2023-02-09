import { useMediaQuery, Typography, styled } from "@mui/material";
import { GITHUB_URL } from "config";
import { StyledFlexRow } from "styles";
import GithubLogo from "assets/github.svg";

interface Props{
    hideText?: boolean;
}

export const Github = ({hideText}: Props) => {

  return (
    <StyledGithub href={GITHUB_URL} target="_blank">
      <StyledFlexRow gap={7}>
        <img src={GithubLogo} />
        {!hideText && <Typography>GitHub</Typography>}
      </StyledFlexRow>
    </StyledGithub>
  );
};
const StyledGithub = styled("a")({
  fontSize: 18,
  textDecoration: "unset",
  marginLeft: 10,

  p: {
    fontSize: "inherit",
    color: "black",
    fontWeight: 700,
  },
});
