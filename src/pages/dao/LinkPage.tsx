import { styled, Typography } from "@mui/material";
import { Container, Link } from "components";
import { useDaoFromQueryParam } from "query/getters";
import React from "react";
import { LayoutSection } from "./components";

function LinkPage({
  title,
  link,
  linkText,
}: {
  title: string;
  link?: string;
  linkText?: string;
}) {
  if (!link) return null;
  return (
    <LayoutSection title={title}>
      <StyledContainer>
        <Link href={link} target="_blank">
          <Typography>{linkText}</Typography>
        </Link>
      </StyledContainer>
    </LayoutSection>
  );
}


const StyledContainer = styled(Container)({
    width: "100%",
})



export const ProjectWebsite = () => {
  const dao = useDaoFromQueryParam().data;
  return (
    <LinkPage
      title="Project Website"
      link={dao?.daoMetadata.metadataArgs.website}
      linkText={dao?.daoMetadata.metadataArgs.website}
    />
  );
};

export default LinkPage;
