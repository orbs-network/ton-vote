import React, { useMemo, useState } from "react";
import { Container } from "components";
import { Chip, Fade, Link, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { StyledFlexColumn } from "styles";
import AnimateHeight from "react-animate-height";
import { useVoteTimeline } from "hooks";
import { Box } from "@mui/system";
import { PROJECT_NAMES } from "config";

export function MainLayout() {
  const [showMore, setShowMore] = useState(false);
  return (
    <StyledContainer
      title="Hack-a-TONx: Choose your winners!"
      headerChildren={<VoteEndedChip />}
    >
      <StyledFlexColumn alignItems="flex-start">
        <Typography>
          The grand finale of the Hack-a-TONx w/ DoraHacks is finally here -
        </Typography>
        <Typography>
          <strong>
            It is now time for the community to vote on the winning projects and
            distribute the $300,000 pool prize!
          </strong>
        </Typography>
        <Typography>
          2 months have passed since the launch of the first ever TON global
          hackathon. During this time, 234 submissions have been received from
          top-quality teams who chose to Build-on-TON. After a thorough review
          process, the panel if Hack-a-TONx judges chose 10 projects to proceed
          to the grand finale.
        </Typography>
        <AnimateHeight height={showMore ? "auto" : 0} duration={400}>
          <ShowMorePart />
        </AnimateHeight>
        <StyledShowMore onClick={() => setShowMore(!showMore)}>
          <Typography>{showMore ? "Show less" : "Show more"}</Typography>
        </StyledShowMore>
      </StyledFlexColumn>
    </StyledContainer>
  );
}

const VoteEndedChip = () => {
  const { voteStarted, voteInProgress, isLoading } = useVoteTimeline();
  const label = useMemo(() => {
    if (!voteStarted) {
      return "Not Started";
    }
    if (voteInProgress) {
      return "Active";
    }
    return "Ended";
  }, [voteStarted, voteInProgress]);

  return (
    <Fade in={!isLoading}>
      <StyledVoteEnded label={label} variant="filled" color="primary" />
    </Fade>
  );
};

const StyledVoteEnded = styled(Chip)({
  fontWeight: 700,
  fontSize: 12,
});

const ShowMorePart = () => {
  return (
    <StyledShowMoreText>
      <Typography>
        Each voter can vote for his top 5 favorite projects, in no particular
        order and the voting power will be splitted equally between the
        projects. All in all, 5 winning projects will be chosen, ranked by the
        total amount of votes they receive.
      </Typography>
      <Typography>
        The community vote will account for 20% of the decision on the final
        winning teams, so choose wisely!
      </Typography>
      <StyledFirstList>
        <Typography className="list-title">
          Before you cast your vote, be sure to check out the following:
        </Typography>
        <Styledlist>
          <li>
            Demo day 1 live judging (Tsunami Exchange, 1ton, Genlock, Tonic
            Lounge, DeDust):{" "}
            <Link
              href="https://www.youtube.com/watch?v=kZWvJCGJ9Js"
              target="_blank"
            >
              Link
            </Link>
          </li>

          <li>
            Demo day 2 live judging (Nujan IDE, TonEase, Evaa Protocol,
            re:doubt, Punk City):{" "}
            <Link
              href="https://www.youtube.com/watch?v=hgcKkpvGDp0"
              target="_blank"
            >
              Link
            </Link>
          </li>
        </Styledlist>
      </StyledFirstList>
      <StyledSecondList>
        <Typography className="list-title">And the finalists are…</Typography>
        <Styledlist>
          {list.map((item, index) => {
            return (
              <li key={index} className="item">
                <strong>{PROJECT_NAMES[index + 1]}:</strong> {item.text}{" "}
                <Link href={item.link} target="_blank">
                  Learn more
                </Link>
              </li>
            );
          })}
        </Styledlist>
      </StyledSecondList>
      <Typography>
        Any holder of TONCoin is eligible to vote. The vote will open on March
        29, 2023 at 2:00 PM GMT and close on March 30, 2023 at 5:00 PM.
      </Typography>
    </StyledShowMoreText>
  );
};

const Styledlist = styled("ul")({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 10,
  padding: 0,
  listStylePosition: "inside",
});

const StyledFirstList = styled(Box)({
  alignItems: "flex-start",
  ul: {
    // listStyleType: "decimal",
  },
});

const StyledSecondList = styled(Box)({
  alignItems: "flex-start",
  ul: {
    listStyleType: "decimal",
  },
});

const StyledShowMoreText = styled(StyledFlexColumn)({
  gap: 10,
  alignItems: "flex-start",
  p: {
    textAlign: "left",
  },
  small: {
    fontSize: 14,
    fontStyle: "italic",
  },
});

const StyledShowMore = styled("div")(({ theme }) => ({
  cursor: "pointer",
  p: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
}));

const StyledContainer = styled(Container)({});

interface ListInterace {
  text: string;
  link: string;
}

const list: ListInterace[] = [
  {
    text: "Tsunami - Trade Everything on TON including Crypto, Stock, Commodities & Forex! ",
    link: "https://dorahacks.io/buidl/4511",
  },
  {
    text: "1TON Finance empowers unbanked creators to achieve their financial goals and thrive in their businesses.",
    link: "https://dorahacks.io/buidl/4580",
  },
  {
    text: "Web service that uses Generative AI technologies to generate unique game assets as NFT.",
    link: "https://dorahacks.io/buidl/4562",
  },
  {
    text: "Build and Find Your Token Gated Telegram Community with Tonic Lounge and Tonic Wallet.",
    link: "https://dorahacks.io/buidl/4521",
  },
  {
    text: "Hub for managing DeFi assets",
    link: "https://dorahacks.io/buidl/4158",
  },
  {
    text: "To make the development process on TON smooth, frictionless, and convenient. We aim to minimize the barrier to entry for developers who are coming on a TON.",
    link: "https://dorahacks.io/buidl/4473",
  },
  {
    text: "Streamline your payments with TonEase - the all-in-one solution for batch, date-specific, and recurring payments.",
    link: "https://dorahacks.io/buidl/4492",
  },
  {
    text: "he first decentralized lending protocol on TON that lets users lend or borrow native and wrapper assets without going to a centralized intermediary.",
    link: " https://dorahacks.io/buidl/4093",
  },
  {
    text: "Real-time security & operational monitoring.",
    link: "https://dorahacks.io/buidl/4157",
  },
  {
    text: " A metaverse of Play-2-Earn games in telegram.",
    link: "https://dorahacks.io/buidl/4557",
  },
];
