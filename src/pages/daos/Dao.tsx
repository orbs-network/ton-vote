import { Typography } from "@mui/material";
import { Loader } from "components";
import { useDaoMetadataQuery } from "query/queries";
import { useIntersectionObserver } from "react-intersection-observer-hook";
import { useAppNavigation } from "router";
import { StyledFlexColumn } from "styles";
import { Address } from "ton-core";
import { makeElipsisAddress } from "utils";
import {
  StyledDao,
  StyledDaoAvatar,
  StyledDaoContent,
  StyledJoinDao,
} from "./styles";

export const Dao = ({ address }: { address: Address }) => {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;
  const { spacePage } = useAppNavigation();
  const { data: daoMetadata, isLoading } = useDaoMetadataQuery(
    address.toString()
  );

  const navigate = () => spacePage.root(address.toString());

  return (
    <StyledDao ref={ref} onClick={navigate}>
      <StyledDaoContent className="container">
        {isVisible ? (
          <StyledFlexColumn>
            <StyledDaoAvatar src={daoMetadata?.avatar} />
            <StyledFlexColumn>
              <Loader
                isLoading={isLoading}
                component={
                  <Typography className="title">{makeElipsisAddress(daoMetadata?.name, 6)}</Typography>
                }
              />
              {!isLoading && <StyledJoinDao>Join</StyledJoinDao>}
            </StyledFlexColumn>
          </StyledFlexColumn>
        ) : null}
      </StyledDaoContent>
    </StyledDao>
  );
};
