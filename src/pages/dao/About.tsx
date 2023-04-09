import { Fade, Typography } from "@mui/material";
import { Container, FadeElement, Link, Page } from "components";
import { useDaoAddress } from "hooks";
import { useDaoRolesQuery } from "query/queries";
import React from "react";
import { StyledFlexRow } from "styles";
import { getTonScanContractUrl } from "utils";

export function About() {
  const daoAddress = useDaoAddress();
  const {data} = useDaoRolesQuery(daoAddress);
  return (
    <FadeElement>
      <Container title="About">
        <StyledFlexRow>
          <Typography>Dao Owner:</Typography>
          {data && (
            <Link href={getTonScanContractUrl(data.owner)}>{data.owner} </Link>
          )}
        </StyledFlexRow>
        <StyledFlexRow>
          <Typography>Proposal Owner:</Typography>
          <Typography>{data?.proposalOwner}</Typography>
        </StyledFlexRow>
      </Container>
    </FadeElement>
  );
}



